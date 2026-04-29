"""
Retention Policy Service - Manages backup retention and cleanup.

Handles:
- Backup expiry based on retention policies
- Automated cleanup of old backups
- Policy enforcement per tenant/plan
"""

import logging
from datetime import timedelta
from django.utils import timezone
from apps.tenant.constants import BackupStatus



logger = logging.getLogger(__name__)


class RetentionPolicy:
    """
    Manages backup retention policies.

    What it does:
        - Sets expiry dates for backups
        - Identifies expired backups
        - Deletes expired backups
        - Enforces retention by tenant plan

    Usage:
        policy = RetentionPolicy()
        policy.set_backup_expiry(backup)
        policy.cleanup_expired_backups()
        policy.get_tenant_policy(tenant_id)
    """

    def __init__(self):
        """Initialize retention policy."""
        self.logger = logging.getLogger(__name__)

    def set_backup_expiry(self, backup):
        """
        Set expiry date for a backup based on retention policy.

        Args:
            backup: TenantBackup object

        Returns:
            datetime: Expiry date
        """
        # Get retention days based on tenant plan
        retention_days = self._get_retention_days(backup.tenant)

        expiry_date = backup.created_at + timedelta(days=retention_days)
        backup.expires_at = expiry_date
        backup.save(update_fields=['expires_at'])

        self.logger.info(
            f"Backup {backup.id} expires on {expiry_date} "
            f"({retention_days} days retention)"
        )

        return expiry_date

    def _get_retention_days(self, tenant):
        """
        Get retention days based on tenant subscription plan.

        Args:
            tenant: Tenant object

        Returns:
            int: Number of days to retain backups
        """
        plan_defaults = {
            'trial': 7,      # 7 days for trial
            'basic': 14,     # 14 days for basic
            'professional': 30,  # 30 days for professional
            'enterprise': 90,    # 90 days for enterprise
        }

        plan = getattr(tenant, 'subscription_plan', 'trial')
        return plan_defaults.get(plan, 30)

    def get_expired_backups(self):
        """
        Get all expired backups.

        Returns:
            QuerySet: Expired backups
        """
        from apps.tenant.models import TenantBackup

        return TenantBackup.objects.filter(
            expires_at__lt=timezone.now(),
            status=BackupStatus.COMPLETED,
            is_deleted=False
        )

    def cleanup_expired_backups(self):
        """
        Delete all expired backups.

        Returns:
            dict: Cleanup results
        """
        self.logger.info("Cleaning up expired backups")

        expired = self.get_expired_backups()
        count = expired.count()

        deleted_count = 0
        failed_count = 0

        for backup in expired:
            try:
                from .backup_manager import BackupManager
                manager = BackupManager()
                manager.delete_backup(backup.id)
                deleted_count += 1
            except Exception as e:
                self.logger.error(
                    f"Failed to delete backup {backup.id}: {str(e)}")
                failed_count += 1

        self.logger.info(
            f"Cleaned up {deleted_count} expired backups, {failed_count} failed")

        return {
            'expired_found': count,
            'deleted': deleted_count,
            'failed': failed_count,
        }

    def get_tenant_backup_summary(self, tenant_id):
        """
        Get backup retention summary for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Backup summary
        """
        from apps.tenant.models import TenantBackup

        now = timezone.now()

        backups = TenantBackup.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )

        active = backups.filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=now)
        )

        expiring_soon = backups.filter(
            expires_at__gt=now,
            expires_at__lt=now + timedelta(days=7)
        )

        expired = backups.filter(expires_at__lt=now)

        return {
            'tenant_id': str(tenant_id),
            'total_backups': backups.count(),
            'active_backups': active.count(),
            'expiring_soon_7days': expiring_soon.count(),
            'expired_backups': expired.count(),
            'retention_days': self._get_retention_days(
                Tenant.objects.get(id=tenant_id)
            ) if hasattr(Tenant, 'objects') else 30,
        }

    def update_retention_policy(self, tenant_id, new_retention_days):
        """
        Update retention policy for a tenant.

        Args:
            tenant_id: UUID of tenant
            new_retention_days: New retention period in days

        Returns:
            int: Number of backups updated
        """
        from apps.tenant.models import TenantBackup, Tenant

        self.logger.info(
            f"Updating retention policy for tenant {tenant_id} to {new_retention_days} days")

        # Update tenant's plan or custom setting
        try:
            tenant = Tenant.objects.get(id=tenant_id)
            # Store custom retention in tenant settings
            tenant.settings = tenant.settings or {}
            tenant.settings['backup_retention_days'] = new_retention_days
            tenant.save()
        except Exception as e:
            self.logger.warning(f"Could not update tenant settings: {str(e)}")

        # Update expiry dates for existing backups
        from datetime import timedelta

        backups = TenantBackup.objects.filter(
            tenant_id=tenant_id,
            status=BackupStatus.COMPLETED,
            is_deleted=False
        )

        updated_count = 0
        for backup in backups:
            new_expiry = backup.created_at + timedelta(days=new_retention_days)
            backup.expires_at = new_expiry
            backup.retention_days = new_retention_days
            backup.save(update_fields=['expires_at', 'retention_days'])
            updated_count += 1

        self.logger.info(f"Updated expiry for {updated_count} backups")
        return updated_count

    def should_cleanup(self, tenant_id):
        """
        Check if tenant backups need cleanup.

        Args:
            tenant_id: UUID of tenant

        Returns:
            bool: True if cleanup needed
        """
        expired_count = self.get_tenant_backup_summary(
            tenant_id).get('expired_backups', 0)
        return expired_count > 0

    def get_cleanup_recommendations(self):
        """
        Get recommendations for backup cleanup.

        Returns:
            dict: Cleanup recommendations
        """
        expired_count = self.get_expired_backups().count()

        return {
            'expired_backups_count': expired_count,
            # Rough estimate
            'estimated_space_free_gb': round(expired_count * 0.1, 2),
            'recommendation': 'Run cleanup immediately' if expired_count > 100 else 'Scheduled cleanup sufficient',
            'suggested_schedule': 'daily' if expired_count > 50 else 'weekly',
        }
