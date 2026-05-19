import logging
from django.core.cache import cache
from apps.configs.services.disaster_recovery.failover import FailoverService
from django.utils import timezone
from apps.configs.models import RegisteredApp, DisasterRecoveryPlan, DisasterRecoveryExecution
from apps.configs.constants import DisasterRecoveryType, DisasterRecoveryStatus
from apps.configs.exceptions import FailoverError

class FailbackService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    def execute(self, app_name, triggered_by, triggered_by_role):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app:
            raise FailoverError(f"App {app_name} not found")
        plan = DisasterRecoveryPlan.objects.filter(app=app, status='active').first()
        if not plan:
            raise FailoverError(f"No active DR plan for app {app_name}")
        execution = DisasterRecoveryExecution.objects.create(
            dr_plan=plan,
            execution_type=DisasterRecoveryType.FAILBACK,
            status=DisasterRecoveryStatus.IN_PROGRESS,
            triggered_by=triggered_by,
            triggered_by_role=triggered_by_role,
            started_at=timezone.now(),
        )
        try:
            self._switch_to_primary(app)
            execution.status = DisasterRecoveryStatus.SUCCESS
            execution.completed_at = timezone.now()
            execution.save()
            return {'status': 'failback_complete', 'app': app_name}
        except Exception as e:
            execution.status = DisasterRecoveryStatus.FAILED
            execution.completed_at = timezone.now()
            execution.issues_encountered = [str(e)]
            execution.save()
            raise FailoverError(f"Failback failed: {str(e)}")
    def _switch_to_primary(self, app):
        cache.delete(f'failover_active_{app.name}')
        cache.delete(f'failover_endpoint_{app.name}')
        self.logger.info(f"FAILBACK COMPLETE for {app.name} - Returned to primary")