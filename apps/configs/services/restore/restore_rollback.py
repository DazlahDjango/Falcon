from apps.configs.models import BackupJob
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction, AuditResult
from apps.configs.exceptions import RestoreError

class RestoreRollback:
    def __init__(self):
        self.single_restore = SingleAppRestore()
        self.audit_logger = AuditLogger()
    def rollback(self, original_backup_job_id, rollback_backup_job_id, triggered_by, triggered_by_role):
        original_job = BackupJob.objects.select_related('app').get(id=original_backup_job_id)
        rollback_job = BackupJob.objects.get(id=rollback_backup_job_id)
        if original_job.app_id != rollback_job.app_id:
            raise RestoreError("Rollback backup must be for the same app")
        try:
            result = self.single_restore.execute(original_job.app.name, rollback_job.id)
            self.audit_logger.log_success(
                AuditAction.RESTORE_BACKUP,
                triggered_by,
                triggered_by_role,
                target_app=original_job.app,
                target_id=str(rollback_job.id),
                details={'rollback_of': str(original_backup_job_id)}
            )
            return {'status': 'rolled_back', 'app': original_job.app.name, 'to_backup_id': str(rollback_job.id)}
        except Exception as e:
            self.audit_logger.log_failure(
                AuditAction.RESTORE_BACKUP,
                triggered_by,
                triggered_by_role,
                error_message=str(e),
                target_app=original_job.app
            )
            raise RestoreError(f"Rollback failed: {str(e)}")