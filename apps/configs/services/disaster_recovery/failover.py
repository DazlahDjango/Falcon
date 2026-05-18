# apps/config/services/disaster_recovery/failover.py
import logging
from django.conf import settings
from django.utils import timezone
from apps.configs.models import RegisteredApp, DisasterRecoveryPlan, DisasterRecoveryExecution
from apps.configs.constants import DisasterRecoveryType, DisasterRecoveryStatus
from apps.configs.exceptions import FailoverError

class FailoverService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    def execute(self, app_name, triggered_by, triggered_by_role):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app:
            raise FailoverError(f"App {app_name} not found")
        plan = DisasterRecoveryPlan.objects.filter(app=app, status='active').first()
        if not plan:
            raise FailoverError(f"No active DR plan for app {app_name}")
        if not plan.standby_endpoint:
            raise FailoverError(f"No standby endpoint configured for app {app_name}")
        execution = DisasterRecoveryExecution.objects.create(
            dr_plan=plan,
            execution_type=DisasterRecoveryType.FAILOVER,
            status=DisasterRecoveryStatus.IN_PROGRESS,
            triggered_by=triggered_by,
            triggered_by_role=triggered_by_role,
            started_at=timezone.now(),
        )
        try:
            self._switch_to_standby(app, plan)
            execution.status = DisasterRecoveryStatus.SUCCESS
            execution.completed_at = timezone.now()
            execution.save()
            return {'status': 'failover_complete', 'app': app_name, 'standby_endpoint': plan.standby_endpoint}
        except Exception as e:
            execution.status = DisasterRecoveryStatus.FAILED
            execution.completed_at = timezone.now()
            execution.issues_encountered = [str(e)]
            execution.save()
            raise FailoverError(f"Failover failed: {str(e)}")
    def _switch_to_standby(self, app, plan):
        from django.core.cache import cache
        cache.set(f'failover_active_{app.name}', True, timeout=None)
        cache.set(f'failover_endpoint_{app.name}', plan.standby_endpoint, timeout=None)
        self.logger.warning(f"FAILOVER EXECUTED for {app.name} - Standby: {plan.standby_endpoint}")