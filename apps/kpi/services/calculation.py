# calculation.py
import time
import logging
from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Q, F
from django.core.exceptions import ValidationError
from apps.accounts.models import User
from apps.kpi.models import KPI, AggregatedScore, Score, CalculationLog, KPIWeight
from apps.kpi.engine import CalculationOrchestrator, HierarchyAggregator
from ..exceptions import CalculationError, ConcurrentCalculationError, LockAcquisitionError

logger = logging.getLogger(__name__)

CACHE_TTL = 300
CACHE_PREFIX = "kpi_calculation"


class ScoreCalculator:
    def __init__(self):
        self.orchestrator = CalculationOrchestrator()

    def calculate_period(
        self,
        tenant_id: str,
        year: int,
        month: int,
        force: bool = False,
        user_ids: List[str] = None
    ) -> Dict:
        return self.orchestrator.calculate_all_for_period(tenant_id, year, month, force, user_ids)

    def calculate_user(
        self,
        user_id: str,
        year: int,
        month: int,
        force: bool = False
    ) -> Dict:
        return self.orchestrator.calculate_user_period(user_id, year, month, force)

    def get_cached_score(
        self,
        kpi_id: str,
        user_id: str,
        year: int,
        month: int
    ) -> Optional[Score]:
        cache_key = f"{CACHE_PREFIX}:score_{kpi_id}_{user_id}_{year}_{month}"
        score_id = cache.get(cache_key)
        if score_id:
            return Score.objects.filter(id=score_id).first()
        return None

    def calculate_weighted_scores(
        self,
        user_id: str,
        year: int,
        month: int
    ) -> Dict:
        effective_date = f"{year}-{month:02d}-01"

        weights = KPIWeight.objects.filter(
            user_id=user_id,
            is_active=True,
            effective_from__lte=effective_date
        ).filter(
            Q(effective_to__isnull=True) | Q(effective_to__gte=effective_date)
        ).select_related('kpi')

        scores_data = []
        total_weighted_score = Decimal('0')
        total_weight = Decimal('0')

        for weight in weights:
            score = Score.objects.filter(
                kpi=weight.kpi,
                user_id=user_id,
                year=year,
                month=month
            ).first()

            if score:
                weighted_score = score.score * weight.weight / 100
                total_weighted_score += weighted_score
                total_weight += weight.weight
                scores_data.append({
                    'kpi_id': str(weight.kpi.id),
                    'kpi_name': weight.kpi.name,
                    'score': float(score.score),
                    'weight': float(weight.weight),
                    'weighted_score': float(weighted_score)
                })

        final_score = (total_weighted_score / total_weight * 100) if total_weight > 0 else Decimal('0')

        return {
            'user_id': user_id,
            'period': f"{year}-{month:02d}",
            'weighted_score': float(final_score),
            'total_weight': float(total_weight),
            'scores': scores_data
        }

    def get_score_trend(
        self,
        user_id: str,
        kpi_id: str = None,
        months: int = 6
    ) -> List[Dict]:
        scores = Score.objects.filter(user_id=user_id)
        if kpi_id:
            scores = scores.filter(kpi_id=kpi_id)

        cutoff = timezone.now() - timezone.timedelta(days=30 * months)
        scores = scores.filter(calculated_at__gte=cutoff).order_by('year', 'month')

        return [
            {
                'period': f"{score.year}-{score.month:02d}",
                'score': float(score.score),
                'kpi_id': str(score.kpi_id),
                'kpi_name': score.kpi.name
            }
            for score in scores
        ]


class ScoreAggregator:
    def __init__(self):
        self.aggregator = HierarchyAggregator()

    def aggregate_user(self, user_id: str, year: int, month: int, force: bool = False) -> Decimal:
        return self.aggregator.aggregate_for_user(user_id, year, month, force)

    def aggregate_team(self, team_id: str, year: int, month: int, force: bool = False) -> Decimal:
        from apps.structure.models import Unit, Employment

        unit = Unit.objects.filter(id=team_id, is_active=True).first()
        if not unit:
            raise ValidationError(f"Unit {team_id} not found")

        member_ids = list(Employment.objects.filter(
            position__unit=unit,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).values_list('user_id', flat=True))
        
        if not member_ids:
            return Decimal('0')

        return self.aggregator.unit.aggregate_for_unit(
            str(unit.id), unit.name, unit.tenant_id, [str(uid) for uid in member_ids], year, month, force
        )

    def aggregate_department(
        self,
        department_id: str,
        year: int,
        month: int,
        force: bool = False
    ) -> Decimal:
        from apps.structure.models import Department, Employment

        department = Department.objects.filter(id=department_id, is_active=True).first()
        if not department:
            raise ValidationError(f"Department {department_id} not found")

        member_ids = list(Employment.objects.filter(
            position__department=department,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).values_list('user_id', flat=True))
        
        if not member_ids:
            return Decimal('0')

        return self.aggregator.department.aggregate_for_department(
            str(department.id), department.name, department.tenant_id, [str(uid) for uid in member_ids], year, month, force
        )

    def aggregate_organization(
        self,
        tenant_id: str,
        year: int,
        month: int,
        force: bool = False
    ) -> Decimal:
        return self.aggregator.organization.aggregate_for_organization(tenant_id, year, month, "", force)

    def get_hierarchy_dashboard(self, user_id: str, year: int, month: int) -> Dict:
        return self.aggregator.get_hierarchy_dashboard(user_id, year, month)

    def get_org_hierarchy(self, tenant_id: str, year: int, month: int) -> Dict:
        return self.aggregator.get_full_org_hierarchy(tenant_id, year, month)


class CalculationScheduler:
    def schedule_calculation(
        self,
        tenant_id: str,
        year: int,
        month: int,
        delay_seconds: int = 0
    ) -> Dict:
        try:
            from ..tasks import calculate_period_scores
            task = calculate_period_scores.apply_async(
                args=[tenant_id, year, month],
                countdown=delay_seconds
            )
            return {
                'task_id': task.id,
                'status': 'SCHEDULED',
                'tenant_id': tenant_id,
                'period': f"{year}-{month:02d}"
            }
        except ImportError:
            logger.warning("Celery not configured, running sync")
            calculator = ScoreCalculator()
            result = calculator.calculate_period(tenant_id, year, month)
            return {
                'task_id': None,
                'status': 'COMPLETED_SYNC',
                'result': result
            }

    def schedule_aggregations(self, tenant_id: str, year: int, month: int) -> Dict:
        try:
            from ..tasks import aggregate_scores_for_period
            task = aggregate_scores_for_period.apply_async(
                args=[tenant_id, year, month],
                queue='aggregation'
            )
            return {'task_id': task.id, 'status': 'SCHEDULED'}
        except ImportError:
            aggregator = ScoreAggregator()
            aggregator.aggregate_organization(tenant_id, year, month, force=True)
            return {'task_id': None, 'status': 'COMPLETED_SYNC'}


class IdempotentCalculator:
    def __init__(self):
        self.calculator = ScoreCalculator()

    def calculate_with_idempotency(
        self,
        tenant_id: str,
        year: int,
        month: int,
        calculation_id: str,
        force: bool = False
    ) -> Dict:
        lock_key = f"{CACHE_PREFIX}:idempotent_lock_{calculation_id}"
        processed_key = f"{CACHE_PREFIX}:idempotent_processed_{calculation_id}"

        if cache.get(processed_key) and not force:
            return {'status': 'ALREADY_PROCESSED', 'calculation_id': calculation_id}

        if not cache.add(lock_key, 'locked', 300):
            raise ConcurrentCalculationError("Calculation already in progress")

        try:
            result = self.calculator.calculate_period(tenant_id, year, month, force)
            cache.set(processed_key, result, 86400)
            return result
        finally:
            cache.delete(lock_key)


class ErrorHandler:
    def __init__(self, max_retries: int = 3, retry_delay: int = 60):
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    def calculate_with_retry(
        self,
        tenant_id: str,
        year: int,
        month: int,
        force: bool = False
    ) -> Dict:
        attempts = 0
        last_error = None

        while attempts < self.max_retries:
            try:
                calculator = ScoreCalculator()
                result = calculator.calculate_period(tenant_id, year, month, force)
                if result.get('status') == 'SUCCESS':
                    return result
                last_error = result.get('error', 'Unknown error')
                attempts += 1
                if attempts < self.max_retries:
                    time.sleep(self.retry_delay * attempts)
            except Exception as e:
                last_error = str(e)
                attempts += 1
                if attempts < self.max_retries:
                    time.sleep(self.retry_delay * attempts)

        return {
            'status': 'FAILED',
            'error': last_error,
            'attempts': attempts
        }

    def log_calculation_error(
        self,
        calculation_type: str,
        error: Exception,
        context: Dict
    ) -> CalculationLog:
        import traceback
        return CalculationLog.objects.create(
            calculation_type=calculation_type,
            status='FAILED',
            error_message=str(error),
            traceback=traceback.format_exc(),
            triggered_by=context.get('triggered_by', 'system'),
            **{k: v for k, v in context.items() if k in ['kpi', 'user', 'period_year', 'period_month']}
        )