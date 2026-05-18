from django.utils import timezone
from datetime import timedelta
from apps.configs.models import BackupJob, BackupArtifact, BackupPolicy
from apps.configs.services.backup.backup_storage import BackupStorage
import logging

class BackupRetention:
    def __init__(self):
        self.storage = BackupStorage()
    def apply_retention_policy(self, app_id=None):
        if app_id:
            policies = BackupPolicy.objects.filter(app_id=app_id, status='enabled')
        else:
            policies = BackupPolicy.objects.filter(status='enabled')
        deleted_count = 0
        for policy in policies:
            cutoff_date = timezone.now() - timedelta(days=policy.retention_days)
            old_jobs = BackupJob.objects.filter(
                app_id=policy.app_id,
                status='completed',
                completed_at__lt=cutoff_date
            )
            for job in old_jobs:
                artifact = BackupArtifact.objects.filter(backup_job=job).first()
                if artifact:
                    self.storage.delete(artifact.storage_path)
                    artifact.status = 'deleted'
                    artifact.save(update_fields=['status'])
                deleted_count += 1
            old_jobs.delete()
        return deleted_count
    def apply_weekly_retention(self, app_id, weeks=4):
        cutoff = timezone.now() - timedelta(weeks=weeks)
        old_full_backups = BackupJob.objects.filter(
            app_id=app_id,
            backup_type='full',
            status='completed',
            completed_at__lt=cutoff
        )
        for job in old_full_backups:
            artifact = BackupArtifact.objects.filter(backup_job=job).first()
            if artifact:
                self.storage.delete(artifact.storage_path)
            job.delete()
    def archive_to_glacier(self, days=90):
        cutoff = timezone.now() - timedelta(days=days)
        old_artifacts = BackupArtifact.objects.filter(
            created_at__lt=cutoff,
            status='verified',
            storage_location='s3'
        )
        for artifact in old_artifacts:
            artifact.status = 'archived'
            artifact.archived_at = timezone.now()
            artifact.archive_tier = 'Glacier'
            artifact.save(update_fields=['status', 'archived_at', 'archive_tier'])