import time
from django.utils import timezone
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.services.health.health_checker import HealthChecker
from apps.configs.models import BackupJob
from apps.configs.constants import DisasterRecoveryStatus
from apps.configs.services.realtime import ConfigProgressBroadcaster

class DisasterRecoveryPlanExecutor:
    def __init__(self):
        self.restore = SingleAppRestore()
        self.health = HealthChecker()
    def execute(self, plan, execution):
        broadcaster = ConfigProgressBroadcaster()
        execution_id = str(execution.id)
        execution.status = DisasterRecoveryStatus.IN_PROGRESS
        execution.started_at = timezone.now()
        execution.save()
        broadcaster.broadcast_dr_progress(
            execution_id,
            status=DisasterRecoveryStatus.IN_PROGRESS,
            progress_percent=10,
            current_step='Locating latest backup',
            total_steps=3,
        )
        start_time = time.time()
        latest_backup = BackupJob.objects.filter(
            app=plan.app,
            status='completed',
            backup_type='full'
        ).order_by('-completed_at').first()
        if not latest_backup:
            broadcaster.broadcast_dr_progress(
                execution_id, status=DisasterRecoveryStatus.FAILED, progress_percent=0,
                current_step='No backup found',
            )
            raise Exception(f"No backup found for app {plan.app.name}")
        broadcaster.broadcast_dr_progress(
            execution_id,
            status=DisasterRecoveryStatus.IN_PROGRESS,
            progress_percent=40,
            completed_steps=1,
            total_steps=3,
            current_step='Restoring application data',
        )
        self.restore.execute(plan.app.name, latest_backup.id)
        broadcaster.broadcast_dr_progress(
            execution_id,
            status=DisasterRecoveryStatus.IN_PROGRESS,
            progress_percent=75,
            completed_steps=2,
            total_steps=3,
            current_step='Running health validation',
        )
        health_result = self.health.check_app(plan.app.name)
        rto_achieved = (time.time() - start_time) / 60
        steps = [
            {'step': 'restore', 'status': 'success'},
            {'step': 'validation', 'status': health_result.status},
        ]
        broadcaster.broadcast_dr_progress(
            execution_id,
            status=DisasterRecoveryStatus.SUCCESS,
            progress_percent=100,
            completed_steps=3,
            total_steps=3,
            steps=steps,
            rto_achieved_minutes=rto_achieved,
            rpo_achieved_minutes=(timezone.now() - latest_backup.completed_at).total_seconds() / 60,
        )
        return {
            'success': True,
            'rto_achieved': rto_achieved,
            'rpo_achieved': (timezone.now() - latest_backup.completed_at).total_seconds() / 60,
            'steps': steps,
        }