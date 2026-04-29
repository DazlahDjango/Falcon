"""
Backup Manager Service - Manages tenant data backups.

Handles:
- Database backups for tenants
- Schema backups for separate schema tenants
- Backup scheduling
- Backup status tracking
"""

import logging
import subprocess
import json
from datetime import datetime
from django.utils import timezone
from django.conf import settings
from apps.tenant.constants import BackupType, BackupStatus

logger = logging.getLogger(__name__)


class BackupManager:
    """
    Manages database backups for tenants.

    What it does:
        - Creates full/database backups
        - Creates schema-only backups
        - Creates data-only backups
        - Tracks backup status
        - Stores backup metadata

    Usage:
        manager = BackupManager()
        manager.create_backup(tenant_id, backup_type='full')
        manager.list_backups(tenant_id)
        manager.delete_old_backups(tenant_id)
    """

    def __init__(self):
        """Initialize backup manager."""
        self.logger = logging.getLogger(__name__)

    def create_backup(self, tenant_id, backup_type=BackupType.FULL, user=None):
        """
        Create a backup for a tenant.

        Args:
            tenant_id: UUID of tenant
            backup_type: Type of backup (full, schema, data)
            user: User creating the backup

        Returns:
            TenantBackup object
        """
        self.logger.info(
            f"Creating {backup_type} backup for tenant {tenant_id}")

        from apps.tenant.models import Tenant, TenantBackup

        try:
            tenant = Tenant.objects.get(id=tenant_id, is_deleted=False)
        except Tenant.DoesNotExist:
            self.logger.error(f"Tenant {tenant_id} not found")
            raise

        # Create backup record
        backup = TenantBackup.objects.create(
            tenant=tenant,
            backup_type=backup_type,
            status=BackupStatus.PENDING,
            created_by=user,
            retention_days=30,
        )

        try:
            # Mark as running
            backup.status = BackupStatus.RUNNING
            backup.started_at = timezone.now()
            backup.save(update_fields=['status', 'started_at'])

            # Create actual backup based on type
            if backup_type == BackupType.FULL:
                backup_file = self._create_full_backup(tenant)
            elif backup_type == BackupType.SCHEMA:
                backup_file = self._create_schema_backup(tenant)
            elif backup_type == BackupType.DATA:
                backup_file = self._create_data_backup(tenant)
            else:
                backup_file = self._create_full_backup(tenant)

            # Mark as completed
            backup.status = BackupStatus.COMPLETED
            backup.completed_at = timezone.now()
            backup.backup_file = backup_file
            backup.file_size_mb = self._get_file_size_mb(backup_file)
            backup.save(update_fields=[
                        'status', 'completed_at', 'backup_file', 'file_size_mb'])

            # Set expiry
            from .retention_policy import RetentionPolicy
            policy = RetentionPolicy()
            policy.set_backup_expiry(backup)

            self.logger.info(f"Backup {backup.id} completed successfully")
            return backup

        except Exception as e:
            self.logger.error(f"Backup failed: {str(e)}")
            backup.status = BackupStatus.FAILED
            backup.error_message = str(e)
            backup.completed_at = timezone.now()
            backup.save(update_fields=[
                        'status', 'error_message', 'completed_at'])
            raise

    def _create_full_backup(self, tenant):
        """
        Create a full database backup for tenant.

        Args:
            tenant: Tenant object

        Returns:
            str: Path to backup file
        """
        self.logger.info(f"Creating full backup for {tenant.name}")

        # Generate backup filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"/tmp/backup_{tenant.id}_{timestamp}.sql"

        # Build pg_dump command
        db_config = settings.DATABASES['default']
        cmd = [
            'pg_dump',
            f"--host={db_config['HOST']}",
            f"--port={db_config['PORT']}",
            f"--username={db_config['USER']}",
            f"--dbname={db_config['NAME']}",
            f"--file={backup_file}",
            '--format=plain',
            '--no-owner',
            '--no-privileges',
        ]

        # Add schema filter if tenant has separate schema
        if tenant.schema_name:
            cmd.append(f"--schema={tenant.schema_name}")

        # Set password environment variable
        env = {'PGPASSWORD': db_config['PASSWORD']}

        try:
            result = subprocess.run(
                cmd, env=env, capture_output=True, text=True)

            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")

            return backup_file

        except Exception as e:
            self.logger.error(f"Full backup failed: {str(e)}")
            raise

    def _create_schema_backup(self, tenant):
        """
        Create schema-only backup (no data).

        Args:
            tenant: Tenant object

        Returns:
            str: Path to backup file
        """
        self.logger.info(f"Creating schema-only backup for {tenant.name}")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"/tmp/schema_backup_{tenant.id}_{timestamp}.sql"

        db_config = settings.DATABASES['default']
        cmd = [
            'pg_dump',
            f"--host={db_config['HOST']}",
            f"--port={db_config['PORT']}",
            f"--username={db_config['USER']}",
            f"--dbname={db_config['NAME']}",
            f"--file={backup_file}",
            '--schema-only',
            '--format=plain',
            '--no-owner',
        ]

        if tenant.schema_name:
            cmd.append(f"--schema={tenant.schema_name}")

        env = {'PGPASSWORD': db_config['PASSWORD']}

        try:
            result = subprocess.run(
                cmd, env=env, capture_output=True, text=True)

            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")

            return backup_file

        except Exception as e:
            self.logger.error(f"Schema backup failed: {str(e)}")
            raise

    def _create_data_backup(self, tenant):
        """
        Create data-only backup (no schema).

        Args:
            tenant: Tenant object

        Returns:
            str: Path to backup file
        """
        self.logger.info(f"Creating data-only backup for {tenant.name}")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"/tmp/data_backup_{tenant.id}_{timestamp}.sql"

        db_config = settings.DATABASES['default']
        cmd = [
            'pg_dump',
            f"--host={db_config['HOST']}",
            f"--port={db_config['PORT']}",
            f"--username={db_config['USER']}",
            f"--dbname={db_config['NAME']}",
            f"--file={backup_file}",
            '--data-only',
            '--format=plain',
            '--no-owner',
        ]

        if tenant.schema_name:
            cmd.append(f"--schema={tenant.schema_name}")

        env = {'PGPASSWORD': db_config['PASSWORD']}

        try:
            result = subprocess.run(
                cmd, env=env, capture_output=True, text=True)

            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")

            return backup_file

        except Exception as e:
            self.logger.error(f"Data backup failed: {str(e)}")
            raise

    def _get_file_size_mb(self, file_path):
        """Get file size in MB."""
        import os
        try:
            size_bytes = os.path.getsize(file_path)
            return round(size_bytes / (1024 * 1024), 2)
        except Exception:
            return 0

    def get_backup(self, backup_id):
        """
        Get backup by ID.

        Args:
            backup_id: UUID of backup

        Returns:
            TenantBackup object or None
        """
        from apps.tenant.models import TenantBackup

        try:
            return TenantBackup.objects.get(id=backup_id, is_deleted=False)
        except TenantBackup.DoesNotExist:
            return None

    def list_backups(self, tenant_id, limit=50):
        """
        List backups for a tenant.

        Args:
            tenant_id: UUID of tenant
            limit: Maximum number of backups to return

        Returns:
            QuerySet of TenantBackup objects
        """
        from apps.tenant.models import TenantBackup

        return TenantBackup.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('-created_at')[:limit]

    def get_latest_backup(self, tenant_id, backup_type=None):
        """
        Get latest backup for a tenant.

        Args:
            tenant_id: UUID of tenant
            backup_type: Optional backup type filter

        Returns:
            TenantBackup object or None
        """
        from apps.tenant.models import TenantBackup

        queryset = TenantBackup.objects.filter(
            tenant_id=tenant_id,
            status=BackupStatus.COMPLETED,
            is_deleted=False
        )

        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)

        return queryset.order_by('-created_at').first()

    def delete_backup(self, backup_id):
        """
        Delete a backup.

        Args:
            backup_id: UUID of backup
        """
        from apps.tenant.models import TenantBackup

        try:
            backup = TenantBackup.objects.get(id=backup_id, is_deleted=False)

            # Delete physical file if exists
            if backup.backup_file:
                import os
                try:
                    os.remove(backup.backup_file)
                except Exception as e:
                    self.logger.warning(
                        f"Failed to delete backup file: {str(e)}")

            backup.soft_delete()
            self.logger.info(f"Backup {backup_id} deleted")

        except TenantBackup.DoesNotExist:
            self.logger.warning(f"Backup {backup_id} not found")

    def get_backup_status(self, tenant_id):
        """
        Get backup status summary for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Backup status information
        """
        from apps.tenant.models import TenantBackup
        from django.db.models import Count

        stats = TenantBackup.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).aggregate(
            total=Count('id'),
            completed=Count('id', filter=models.Q(
                status=BackupStatus.COMPLETED)),
            failed=Count('id', filter=models.Q(status=BackupStatus.FAILED)),
            pending=Count('id', filter=models.Q(status=BackupStatus.PENDING)),
        )

        latest = self.get_latest_backup(tenant_id)

        return {
            'tenant_id': str(tenant_id),
            'total_backups': stats['total'],
            'completed_backups': stats['completed'],
            'failed_backups': stats['failed'],
            'pending_backups': stats['pending'],
            'latest_backup': {
                'id': str(latest.id) if latest else None,
                'type': latest.backup_type if latest else None,
                'created_at': latest.created_at.isoformat() if latest else None,
                'file_size_mb': latest.file_size_mb if latest else None,
            } if latest else None,
        }
