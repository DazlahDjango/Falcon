import time
import logging
from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.core.cache import cache
from django.utils import timezone
from apps.accounts.models import User
from apps.kpi.models import KPI, AggregatedScore, Score, CalculationLog
from apps.kpi.engine import CalculationOrchestrator, HierarchyAggregator
from ..exceptions import CalculationError, ConcurrentCalculationError, LockAcquisitionError
logger = logging.getLogger(__name__)

class ScoreCalculator:
    def __init__(self):
        self.orchestrator = CalculationOrchestrator()
    def calculate_period(self, tenant_id: str, year: int, month: int, force: bool = False, user_ids: List[str] = None) -> Dict:
        return self.orchestrator.calculate_all_for_period(tenant_id, year, month, force, user_ids)
    def calculate_user(self, user_id: str, year: int, month: int, force: bool = False) -> Dict:
        return self.orchestrator.calculate_user_period(user_id, year, month, force)
    def get_cached_score(self, kpi_id: str, user_id: str, year: int, month: int) -> Optional[Score]:
        cache_key = f"score_{kpi_id}_{user_id}_{year}_{month}"
        score_id = cache.get(cache_key)
        if score_id:
            return Score.objects.filter(id=score_id).first()
        return None
    
class ScoreAggregator:
    def __init__(self):
        self.aggregator = HierarchyAggregator()
    def aggregate_user(self, user_id: str, year: int, month: int, force: bool = False) -> Decimal:
        return self.aggregator.aggregate_for_user(user_id, year, month, force)
    def aggregate_team(self, team_id: str, year: int, month: int, force: bool = False) -> Decimal:
        from apps.organisations.models import Team
        team = Team.objects.get(id=team_id)
        member_ids = team.members.values_list('id', flat=True)
        return self.aggregator.team.aggregate_for_team(
            str(team.id), team.name, team.tenant_id, member_ids, year, month, force
        )
    def aggregate_department(self, department_id: str, year: int, month: int, force: bool = False) -> Decimal:
        from apps.organisations.models import Department
        department = Department.objects.get(id=department_id)
        member_ids = department.members.values_list('id', flat=True)
        return self.aggregator.department.aggregate_for_department(
            str(department.id), department.name, department.tenant_id, member_ids, year, month, force
        )
    def aggregate_organization(self, tenant_id: str, year: int, month: int, force: bool = False) -> Decimal:
        return self.aggregator.organization.aggregate_for_organization(tenant_id, year, month, "", force)
    def get_hierarchy_dashboard(self, user_id: str, year: int, month: int) -> Dict:
        return self.aggregator.get_hierarchy_dashboard(user_id, year, month)
    def get_org_hierarchy(self, tenant_id: str, year: int, month: int) -> Dict:
        return self.aggregator.get_full_org_hierarchy(tenant_id, year, month)

class CalculationScheduler:
    def schedule_calculation(self, tenant_id: str, year: int, month: int, delay_seconds: int = 0) -> Dict:
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
    def schedule_aggregations(self, tenant_id: str, year: int, month: int) -> Dict:
        from ..tasks import aggregate_scores_for_period
        task = aggregate_scores_for_period.apply_async(
            args=[tenant_id, year, month],
            queue='aggregation'
        )
        return {'task_id': task.id, 'status': 'SCHEDULED'}

class IdempotentCalculator:
    def __init__(self):
        self.calculator = ScoreCalculator()
    def calculate_with_idempotency(self, tenant_id: str, year: int, month: int, calculation_id: str, force: bool = False) -> Dict:
        lock_key = f"calc_idempotent_{calculation_id}"
        processed_key = f"calc_processed_{calculation_id}"
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
    def calculate_with_retry(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
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
    def log_calculation_error(self, calculation_type: str, error: Exception, context: Dict) -> CalculationLog:
        return CalculationLog.objects.create(
            calculation_type=calculation_type,
            status='FAILED',
            error_message=str(error),
            traceback=self._get_traceback(),
            triggered_by=context.get('triggered_by', 'system'),
            **{k: v for k, v in context.items() if k in ['kpi', 'user', 'period_year', 'period_month']}
        )
    def _get_traceback(self) -> str:
        import traceback
        return traceback.format_exc()