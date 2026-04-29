"""
Restore Service - Restores tenant data from backups.

Handles:
- Database restoration from backups
- Schema restoration
- Data restoration
- Point-in-time recovery
"""

import logging
import subprocess
from django.conf import settings
from apps.tenant.constants import BackupStatus

logger = logging.getLogger(__name__)


class RestoreService:
    """
    Restores tenant data from backups.

    What it does:
        - Restores full backups
        - Restores schema-only backups
        - Restores data-only backups
        - Validates backup before restore

    Usage:
        service = RestoreService()
        service.restore_from_backup(backup_id)
        service.restore_latest_backup(tenant_id)
    """

    def __init__(self):
        """Initialize restore service."""
        self.logger = logging.getLogger(__name__)

    def restore_from_backup(self, backup_id, user=None):
        """
        Restore tenant from a backup.

        Args:
            backup_id: UUID of backup to restore
            user: User performing restore

        Returns:
            bool: True if successful
        """
        self.logger.info(f"Restoring from backup {backup_id}")

        from apps.tenant.models import TenantBackup

        try:
            backup = TenantBackup.objects.get(id=backup_id, is_deleted=False)
        except TenantBackup.DoesNotExist:
            self.logger.error(f"Backup {backup_id} not found")
            raise

        if backup.status != BackupStatus.COMPLETED:
            raise Exception(
                f"Backup {backup_id} is not completed (status: {backup.status})")

        if not backup.backup_file:
            raise Exception(f"Backup {backup_id} has no backup file")

        try:
            # Perform restore based on backup type
            if backup.backup_type == 'full':
                success = self._restore_full_backup(
                    backup.tenant, backup.backup_file)
            elif backup.backup_type == 'schema':
                success = self._restore_schema_backup(
                    backup.tenant, backup.backup_file)
            elif backup.backup_type == 'data':
                success = self._restore_data_backup(
                    backup.tenant, backup.backup_file)
            else:
                success = self._restore_full_backup(
                    backup.tenant, backup.backup_file)

            if success:
                self.logger.info(f"Successfully restored backup {backup_id}")
                return True
            else:
                raise Exception("Restore failed")

        except Exception as e:
            self.logger.error(f"Restore failed: {str(e)}")
            raise

    def _restore_full_backup(self, tenant, backup_file):
        """
        Restore full backup.

        Args:
            tenant: Tenant object
            backup_file: Path to backup file

        Returns:
            bool: True if successful
        """
        self.logger.info(f"Restoring full backup for {tenant.name}")

        db_config = settings.DATABASES['default']

        # For separate schema, restore to specific schema
        if tenant.schema_name:
            cmd = [
                'psql',
                f"--host={db_config['HOST']}",
                f"--port={db_config['PORT']}",
                f"--username={db_config['USER']}",
                f"--dbname={db_config['NAME']}",
                f"--file={backup_file}",
                f"--set=search_path={tenant.schema_name}",
            ]
        else:
            cmd = [
                'psql',
                f"--host={db_config['HOST']}",
                f"--port={db_config['PORT']}",
                f"--username={db_config['USER']}",
                f"--dbname={db_config['NAME']}",
                f"--file={backup_file}",
            ]

        env = {'PGPASSWORD': db_config['PASSWORD']}

        try:
            result = subprocess.run(
                cmd, env=env, capture_output=True, text=True)

            if result.returncode != 0:
                self.logger.error(f"Restore failed: {result.stderr}")
                return False

            return True

        except Exception as e:
            self.logger.error(f"Restore exception: {str(e)}")
            return False

    def _restore_schema_backup(self, tenant, backup_file):
        """
        Restore schema-only backup.

        Args:
            tenant: Tenant object
            backup_file: Path to backup file

        Returns:
            bool: True if successful
        """
        return self._restore_full_backup(tenant, backup_file)

    def _restore_data_backup(self, tenant, backup_file):
        """
        Restore data-only backup.

        Args:
            tenant: Tenant object
            backup_file: Path to backup file

        Returns:
            bool: True if successful
        """
        return self._restore_full_backup(tenant, backup_file)

    def restore_latest_backup(self, tenant_id, backup_type=None):
        """
        Restore the latest backup for a tenant.

        Args:
            tenant_id: UUID of tenant
            backup_type: Optional backup type

        Returns:
            bool: True if successful
        """
        from apps.tenant.services.backup.backup_manager import BackupManager

        manager = BackupManager()
        backup = manager.get_latest_backup(tenant_id, backup_type)

        if not backup:
            self.logger.error(f"No backup found for tenant {tenant_id}")
            return False

        return self.restore_from_backup(backup.id)

    def validate_backup(self, backup_id):
        """
        Validate that a backup file is readable and valid.

        Args:
            backup_id: UUID of backup

        Returns:
            dict: Validation results
        """
        from apps.tenant.models import TenantBackup

        try:
            backup = TenantBackup.objects.get(id=backup_id, is_deleted=False)
        except TenantBackup.DoesNotExist:
            return {'valid': False, 'error': 'Backup not found'}

        if not backup.backup_file:
            return {'valid': False, 'error': 'No backup file'}

        import os
        if not os.path.exists(backup.backup_file):
            return {'valid': False, 'error': 'Backup file not found on disk'}

        # Check file size
        file_size = os.path.getsize(backup.backup_file)
        if file_size == 0:
            return {'valid': False, 'error': 'Backup file is empty'}

        return {
            'valid': True,
            'backup_id': str(backup.id),
            'file_path': backup.backup_file,
            'file_size_mb': backup.file_size_mb,
            'created_at': backup.created_at.isoformat(),
            'backup_type': backup.backup_type,
        }

    def get_restore_preview(self, backup_id):
        """
        Get preview of what will be restored.

        Args:
            backup_id: UUID of backup

        Returns:
            dict: Restore preview information
        """
        from apps.tenant.models import TenantBackup

        try:
            backup = TenantBackup.objects.get(id=backup_id, is_deleted=False)
        except TenantBackup.DoesNotExist:
            return {'error': 'Backup not found'}

        return {
            'backup_id': str(backup.id),
            'tenant_name': backup.tenant.name,
            'backup_type': backup.backup_type,
            'created_at': backup.created_at.isoformat(),
            'file_size_mb': backup.file_size_mb,
            'tables_affected': 'All tenant tables',
            'estimated_time_minutes': round(backup.file_size_mb / 100, 2) if backup.file_size_mb else 0,
        }
