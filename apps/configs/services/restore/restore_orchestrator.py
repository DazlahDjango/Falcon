from apps.configs.services.security.access_enforcer import AccessEnforcer
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.services.restore.full_system_restore import FullSystemRestore
from apps.configs.services.restore.point_in_time_restore import PointInTimeRestore
from apps.configs.models import BackupJob
from apps.configs.exceptions import RestoreError

class RestoreOrchestrator:
    def __init__(self):
        self.access_enforcer = AccessEnforcer()
        self.audit_logger = AuditLogger()
        self.single_restore = SingleAppRestore()
        self.full_restore = FullSystemRestore()
        self.pitr_restore = PointInTimeRestore()
    def restore_from_backup(self, backup_job_id, triggered_by, triggered_by_role, target_app_only=False):
        self.access_enforcer.enforce_config_access(triggered_by_role)
        backup_job = BackupJob.objects.select_related('app').get(id=backup_job_id)
        if backup_job.status != 'completed':
            raise RestoreError(f"Cannot restore from backup with status {backup_job.status}")
        result = self.single_restore.execute(backup_job.app.name, backup_job_id)
        self.audit_logger.log_success('restore_backup', triggered_by, triggered_by_role, target_app=backup_job.app, target_id=str(backup_job_id))
        return result
    def full_system_restore(self, backup_timestamp, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_super_admin(triggered_by_role)
        result = self.full_restore.execute(backup_timestamp)
        self.audit_logger.log_success('restore_backup', triggered_by, triggered_by_role, target_id=backup_timestamp)
        return result
    def pitr_restore(self, app_name, target_time, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_config_access(triggered_by_role)
        result = self.pitr_restore.execute(app_name, target_time)
        self.audit_logger.log_success('restore_backup', triggered_by, triggered_by_role, target_id=f"{app_name}_{target_time}")
        return result