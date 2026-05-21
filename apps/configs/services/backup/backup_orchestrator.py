import logging
from django.utils import timezone
from django.db import transaction
from apps.configs.models import BackupJob, BackupArtifact, RegisteredApp
from apps.configs.constants import BackupType, BackupStatus
from apps.configs.exceptions import BackupError, BackupQuotaExceededError
from apps.configs.services.security.access_enforcer import AccessEnforcer
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.services.backup.backup_strategy import BackupStrategy
from apps.configs.services.backup.single_app_backup import SingleAppBackup
from apps.configs.services.backup.multi_app_backup import MultiAppBackup
from apps.configs.services.realtime import ConfigProgressBroadcaster

class BackupOrchestrator:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def __init__(self):
        self.access_enforcer = AccessEnforcer()
        self.audit_logger = AuditLogger()
        self.single_backup = SingleAppBackup()
        self.multi_backup = MultiAppBackup()
    def trigger_backup(self, app_name, backup_type, triggered_by, triggered_by_role, ip_address=None, user_agent=None):
        self.access_enforcer.enforce_config_access(triggered_by_role)
        app = RegisteredApp.objects.filter(name=app_name, is_registered=True).first()
        if not app:
            raise BackupError(f"App {app_name} not registered")
        with transaction.atomic():
            job = BackupJob.objects.create(
                app=app,
                backup_type=backup_type,
                status=BackupStatus.PENDING,
                triggered_by=triggered_by,
                triggered_by_role=triggered_by_role,
            )
        self.audit_logger.log_success('trigger_backup', triggered_by, triggered_by_role, target_app=app, target_id=str(job.id))
        from apps.configs.tasks import execute_backup_task
        execute_backup_task.delay(str(job.id))
        return job
    def execute_backup(self, job_id):
        job = BackupJob.objects.select_related('app').get(id=job_id)
        broadcaster = ConfigProgressBroadcaster()
        try:
            job.status = BackupStatus.RUNNING
            job.started_at = timezone.now()
            job.save(update_fields=['status', 'started_at'])
            broadcaster.broadcast_backup_progress(
                job_id,
                status=BackupStatus.RUNNING,
                progress_percent=5,
                current_item=f'Preparing backup for {job.app.name}',
            )
            broadcaster.broadcast_backup_progress(
                job_id,
                status=BackupStatus.RUNNING,
                progress_percent=25,
                completed_items=0,
                total_items=4,
                current_item='Exporting application data',
            )
            result = self.single_backup.execute(job.app.name, job.backup_type)
            broadcaster.broadcast_backup_progress(
                job_id,
                status=BackupStatus.RUNNING,
                progress_percent=85,
                completed_items=3,
                total_items=4,
                current_item='Uploading and verifying artifact',
            )
            job.status = BackupStatus.COMPLETED
            job.completed_at = timezone.now()
            job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
            job.size_bytes = result.get('size_bytes')
            job.checksum = result.get('checksum')
            if 'compression_algorithm' in result:
                job.metadata['compression_algorithm'] = result.get('compression_algorithm')
            job.save()
            BackupArtifact.objects.create(
                backup_job=job,
                storage_location=result.get('storage_location', 's3'),
                storage_path=result.get('storage_path'),
                encrypted_key_id=result.get('encrypted_key_id'),
                iv_initialization_vector=result.get('iv'),
                status='uploaded',
            )
            broadcaster.broadcast_backup_progress(
                job_id,
                status=BackupStatus.COMPLETED,
                progress_percent=100,
                completed_items=4,
                total_items=4,
                size_bytes=job.size_bytes,
                duration_seconds=job.duration_seconds,
            )
            return job
        except Exception as e:
            job.status = BackupStatus.FAILED
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.save()
            broadcaster.broadcast_backup_progress(
                job_id,
                status=BackupStatus.FAILED,
                progress_percent=0,
                current_item=str(e),
            )
            raise BackupError(f"Backup failed: {str(e)}")
    def cancel_backup(self, job_id, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_config_access(triggered_by_role)
        job = BackupJob.objects.get(id=job_id)
        if job.status not in ['pending', 'running']:
            raise BackupError(f"Cannot cancel backup in status {job.status}")
        job.status = BackupStatus.CANCELLED
        job.completed_at = timezone.now()
        job.save()
        ConfigProgressBroadcaster.broadcast_backup_progress(
            job_id, status=BackupStatus.CANCELLED, progress_percent=0,
        )
        self.audit_logger.log_success('cancel_backup', triggered_by, triggered_by_role, target_id=str(job_id))
        return job