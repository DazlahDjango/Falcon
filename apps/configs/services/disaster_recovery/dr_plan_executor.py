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
        import os
        completed_backups = BackupJob.objects.filter(
            app=plan.app,
            status='completed',
            backup_type='full'
        ).order_by('-completed_at')

        latest_backup = None
        for job in completed_backups:
            from apps.configs.models import BackupArtifact
            artifact = BackupArtifact.objects.filter(backup_job=job).first()
            if artifact and artifact.storage_path and os.path.exists(artifact.storage_path):
                latest_backup = job
                break

        if not latest_backup:
            from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator
            orchestrator = BackupOrchestrator()
            new_job = orchestrator.trigger_backup(
                app_name=plan.app.name,
                backup_type='full',
                triggered_by=execution.triggered_by,
                triggered_by_role=execution.triggered_by_role
            )
            orchestrator.execute_backup(new_job.id)
            latest_backup = BackupJob.objects.get(id=new_job.id)
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