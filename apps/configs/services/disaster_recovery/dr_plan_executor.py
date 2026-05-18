import time
from django.utils import timezone
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.services.health.health_checker import HealthChecker
from apps.configs.models import BackupJob
from apps.configs.constants import DisasterRecoveryStatus

class DisasterRecoveryPlanExecutor:
    def __init__(self):
        self.restore = SingleAppRestore()
        self.health = HealthChecker()
    def execute(self, plan, execution):
        execution.status = DisasterRecoveryStatus.IN_PROGRESS
        execution.started_at = timezone.now()
        execution.save()
        start_time = time.time()
        latest_backup = BackupJob.objects.filter(
            app=plan.app,
            status='completed',
            backup_type='full'
        ).order_by('-completed_at').first()
        if not latest_backup:
            raise Exception(f"No backup found for app {plan.app.name}")
        self.restore.execute(plan.app.name, latest_backup.id)
        health_result = self.health.check_app(plan.app.name)
        rto_achieved = (time.time() - start_time) / 60
        return {
            'success': True,
            'rto_achieved': rto_achieved,
            'rpo_achieved': (timezone.now() - latest_backup.completed_at).total_seconds() / 60,
            'steps': [{'step': 'restore', 'status': 'success'}, {'step': 'validation', 'status': health_result.status}]
        }