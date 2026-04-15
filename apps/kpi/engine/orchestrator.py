import time
import logging
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.db.models import Q, F
from apps.kpi.models import KPI, MonthlyActual, KPIWeight, MonthlyPhasing, Score, TrafficLight, CalculationLog
from .calculators import NumericCalculator, PercentageCalculator, FinancialCalculator, MilestoneCalculator, TimeCalculator, ImpactCalculator
from .traffic_light import TrafficLightEvaluator
from .aggregator import HierarchyAggregator
logger = logging.getLogger(__name__)

class CalculationOrchestrator:
    CALCULATOR_MAP = {
        'COUNT': NumericCalculator,
        'PERCENTAGE': PercentageCalculator,
        'FINANCIAL': FinancialCalculator,
        'MILESTONE': MilestoneCalculator,
        'TIME': TimeCalculator,
        'IMPACT': ImpactCalculator,
    }
    def __init__(self):
        self.traffic_light = TrafficLightEvaluator()
        self.aggregator = HierarchyAggregator()
    def calculate_all_for_period(self, tenant_id: str, year: int, month: int, force: bool = False, user_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        start_time = time.time()
        log_entry = None
        try:
            log_entry = CalculationLog.objects.create(
                tenant_id=tenant_id,
                calculation_type='SCORE',
                period_year=year,
                period_month=month,
                status='PROCESSING',
                triggered_by='system',
                triggered_at=timezone.now()
            )
            users = self._get_users_to_calculate(tenant_id, user_ids)
            lock_key = f"calc_lock:{tenant_id}:{year}:{month}"
            if not self._acquire_lock(lock_key):
                return {'status': 'SKIPPED', 'reason': 'Another calculation in progress'}
            try:
                results = []
                with transaction.atomic():
                    for user in users:
                        user_result = self.calculate_user_period(user.id, year, month, force)
                        results.append(user_result)
                    self._aggregate_period_scores(tenant_id, year, month, force)
                elapsed_ms = int((time.time() - start_time) * 1000)
                log_entry.status = 'SUCCESS'
                log_entry.duration_ms = elapsed_ms
                log_entry.records_affected = len(results)
                log_entry.save()
                return {
                    'status': 'SUCCESS',
                    'users_processed': len(results),
                    'duration_ms': elapsed_ms,
                    'results': results
                }
            finally:
                self._release_lock(lock_key)
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            if log_entry:
                log_entry.status = 'FAILED'
                log_entry.duration_ms = elapsed_ms
                log_entry.error_message = str(e)
                log_entry.traceback = self._get_traceback()
                log_entry.save()
            
            logger.exception(f"Calculation failed for period {year}-{month}")
            return {'status': 'FAILED', 'error': str(e)}
    
    def calculate_user_period(self, user_id: str, year: int, month: int, force: bool = False) -> Dict[str, Any]:
        if not force:
            existing_scores = Score.objects.filter(
                user_id=user_id,
                year=year,
                month=month
            ).count()
            if existing_scores > 0:
                return {'user_id': user_id, 'status': 'ALREADY_CALCULATED', 'score_count': existing_scores}
        # Get user's KPIs with weights
        kpis_with_weights = self._get_user_kpis_with_weights(user_id, year, month)
        if not kpis_with_weights:
            return {'user_id': user_id, 'status': 'NO_KPIS', 'score_count': 0}
        scores_created = []
        for kpi_data in kpis_with_weights:
            kpi = kpi_data['kpi']
            weight = kpi_data['weight']
            # Get target and actual
            target = self._get_target_for_period(kpi, user_id, year, month)
            actual = self._get_actual_for_period(kpi, user_id, year, month)
            if actual is None or target is None:
                continue
            # Calculate score
            calculator_class = self.CALCULATOR_MAP.get(kpi.kpi_type)
            if not calculator_class:
                logger.warning(f"No calculator for KPI type: {kpi.kpi_type}")
                continue
            calculator = calculator_class(kpi)
            score_value = calculator.calculate(actual.actual_value, target.target_value)
            # Store score
            score, created = Score.objects.update_or_create(
                tenant_id=kpi.tenant_id,
                kpi=kpi,
                user_id=user_id,
                year=year,
                month=month,
                defaults={
                    'score': score_value,
                    'actual_value': actual.actual_value,
                    'target_value': target.target_value,
                    'formula_used': kpi.calculation_logic,
                    'calculated_by': 'orchestrator'
                }
            )
            # Calculate traffic light
            traffic = self.traffic_light.evaluate(score)
            TrafficLight.objects.update_or_create(
                score=score,
                defaults={
                    'status': traffic['status'],
                    'score_value': score_value,
                    'green_threshold': traffic['green_threshold'],
                    'yellow_threshold': traffic['yellow_threshold'],
                    'consecutive_red_count': self._get_consecutive_red_count(kpi, user_id, year, month)
                }
            )
            scores_created.append({
                'kpi_id': str(kpi.id),
                'score': float(score_value),
                'status': traffic['status']
            })
        return {
            'user_id': user_id,
            'status': 'SUCCESS',
            'score_count': len(scores_created),
            'scores': scores_created
        }
    
    def _get_user_kpis_with_weights(self, user_id: str, year: int, month: int) -> List[Dict]:
        effective_date = f"{year}-{month:02d}-01"
        weights = KPIWeight.objects.filter(
            user_id=user_id,
            is_active=True,
            effective_from__lte=effective_date
        ).filter(
            Q(effective_to__isnull=True) | Q(effective_to__gte=effective_date)
        ).select_related('kpi')
        return [
            {'kpi': weight.kpi, 'weight': weight.weight}
            for weight in weights
            if weight.kpi.is_active
        ]
    
    def _get_target_for_period(self, kpi: KPI, user_id: str, year: int, month: int) -> Optional[MonthlyPhasing]:
        try:
            return MonthlyPhasing.objects.select_related('annual_target').get(
                annual_target__kpi=kpi,
                annual_target__user_id=user_id,
                annual_target__year=year,
                month=month,
                is_locked=True
            )
        except MonthlyPhasing.DoesNotExist:
            logger.debug(f"No target found for {kpi.id} user {user_id} period {year}-{month}")
            return None
    
    def _get_actual_for_period(self, kpi: KPI, user_id: str, year: int, month: int) -> Optional[MonthlyActual]:
        try:
            return MonthlyActual.objects.get(
                kpi=kpi,
                user_id=user_id,
                year=year,
                month=month,
                status='APPROVED'
            )
        except MonthlyActual.DoesNotExist:
            return None
    
    def _aggregate_period_scores(self, tenant_id: str, year: int, month: int, force: bool = False):
        self.aggregator.aggregate_for_teams(tenant_id, year, month, force)
        self.aggregator.aggregate_for_departments(tenant_id, year, month, force)
        self.aggregator.aggregate_for_organization(tenant_id, year, month, force)
    
    def _get_consecutive_red_count(self, kpi: KPI, user_id: str, year: int, month: int) -> int:
        previous_months = Score.objects.filter(
            kpi=kpi,
            user_id=user_id,
            year=year,
            month__lt=month
        ).order_by('-year', '-month')[:3]
        red_count = 0
        for score in previous_months:
            traffic = TrafficLight.objects.filter(score=score).first()
            if traffic and traffic.status == 'RED':
                red_count += 1
            else:
                break
        return red_count
    
    def _get_users_to_calculate(self, tenant_id: str, user_ids: Optional[List[str]] = None) -> List:
        from apps.accounts.models import User
        queryset = User.objects.filter(tenant_id=tenant_id, is_active=True)
        if user_ids:
            queryset = queryset.filter(id__in=user_ids)
        return list(queryset)
    
    def _acquire_lock(self, key: str, timeout: int = 300) -> bool:
        return cache.add(key, 'locked', timeout)
    
    def _release_lock(self, key: str):
        cache.delete(key)
    
    def _get_traceback(self) -> str:
        import traceback
        return traceback.format_exc()
