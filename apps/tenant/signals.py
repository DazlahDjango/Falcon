"""
Django signals for Tenant app.
"""
import logging
from django.db.models.signals import post_save, post_delete, pre_save, pre_delete
from django.dispatch import receiver
from django.db import transaction
from django.core.cache import cache

logger = logging.getLogger(__name__)


# ============================================================================
# TENANT SIGNALS
# ============================================================================

@receiver(post_save, sender='tenant.Tenant')
def tenant_post_save_handler(sender, instance, created, **kwargs):
    """
    Handle tenant creation and updates.

    When tenant is created:
        - Start async provisioning task
        - Clear tenant cache

    When tenant is updated:
        - Clear tenant cache
        - Handle status changes
    """
    logger.info(f"Tenant {instance.id} saved. Created: {created}")

    # Clear cache for this tenant
    cache_key = f"tenant_{instance.id}"
    cache.delete(cache_key)

    if created:
        # New tenant created - start provisioning
        from apps.tenant.tasks import provision_tenant_task

        # Use transaction.on_commit to ensure task runs after DB commit
        transaction.on_commit(
            lambda: provision_tenant_task.delay(str(instance.id)))

        logger.info(f"Provisioning task queued for tenant {instance.id}")

    else:
        # Existing tenant updated - check for status change
        if hasattr(instance, '_previous_status'):
            old_status = instance._previous_status
            new_status = instance.status

            if old_status != new_status:
                logger.info(
                    f"Tenant {instance.id} status changed: {old_status} -> {new_status}")

                # Handle specific status changes
                if new_status == 'suspended':
                    from apps.tenant.tasks import suspend_tenant_task
                    transaction.on_commit(
                        lambda: suspend_tenant_task.delay(str(instance.id)))

                elif new_status == 'deleted':
                    from apps.tenant.tasks import cleanup_tenant_task
                    transaction.on_commit(
                        lambda: cleanup_tenant_task.delay(str(instance.id)))


@receiver(pre_save, sender='tenant.Tenant')
def tenant_pre_save_handler(sender, instance, **kwargs):
    """
    Store previous status before save to detect changes.
    """
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._previous_status = old.status
        except sender.DoesNotExist:
            instance._previous_status = None


@receiver(post_delete, sender='tenant.Tenant')
def tenant_post_delete_handler(sender, instance, **kwargs):
    """
    Handle tenant deletion.

    When tenant is deleted:
        - Clean up all tenant data
        - Clear cache
    """
    logger.info(f"Tenant {instance.id} deleted")

    # Clear cache
    cache_key = f"tenant_{instance.id}"
    cache.delete(cache_key)

    # Queue cleanup task (runs after transaction)
    from apps.tenant.tasks import cleanup_tenant_task
    transaction.on_commit(lambda: cleanup_tenant_task.delay(str(instance.id)))


# ============================================================================
# DOMAIN SIGNALS
# ============================================================================

@receiver(post_save, sender='tenant.CustomDomain')
def domain_post_save_handler(sender, instance, created, **kwargs):
    """
    Handle domain creation and updates.

    When domain is created:
        - Start DNS verification
        - Clear domain cache

    When domain is verified:
        - Update tenant routing
    """
    logger.info(f"Domain {instance.id} saved. Created: {created}")

    # Clear domain cache
    cache_key = f"domain_{instance.domain}"
    cache.delete(cache_key)

    if created:
        # New domain added - start verification
        from apps.tenant.tasks import verify_domain_task
        transaction.on_commit(
            lambda: verify_domain_task.delay(str(instance.id)))

        logger.info(f"Verification task queued for domain {instance.domain}")

    else:
        # Existing domain updated - check for verification
        if instance.status == 'active' and not instance.verified_at:
            logger.info(f"Domain {instance.domain} became active")

            # If this is primary domain, update tenant
            if instance.is_primary and instance.tenant:
                logger.info(
                    f"Domain {instance.domain} set as primary for tenant {instance.tenant.id}")


@receiver(pre_delete, sender='tenant.CustomDomain')
def domain_pre_delete_handler(sender, instance, **kwargs):
    """
    Handle domain deletion.

    When domain is deleted:
        - Remove from routing
        - Clear cache
    """
    logger.info(f"Domain {instance.domain} being deleted")

    # Clear domain cache
    cache_key = f"domain_{instance.domain}"
    cache.delete(cache_key)


# ============================================================================
# BACKUP SIGNALS
# ============================================================================

@receiver(post_save, sender='tenant.TenantBackup')
def backup_post_save_handler(sender, instance, created, **kwargs):
    """
    Handle backup completion.

    When backup completes:
        - Send notification to tenant admins
        - Update backup metrics
    """
    logger.info(f"Backup {instance.id} saved. Created: {created}")

    if not created:
        # Backup status changed (completed/failed)
        if instance.status == 'completed':
            logger.info(f"Backup {instance.id} completed successfully")

            # Send notification (if notification app exists)
            try:
                from apps.notifications.services import NotificationService
                notification = NotificationService()
                notification.send_backup_complete(instance)
            except ImportError:
                logger.debug("Notification service not available")

        elif instance.status == 'failed':
            logger.error(
                f"Backup {instance.id} failed: {instance.error_message}")

            # Send failure alert
            try:
                from apps.notifications.services import NotificationService
                notification = NotificationService()
                notification.send_backup_failed(instance)
            except ImportError:
                logger.debug("Notification service not available")


# ============================================================================
# RESOURCE QUOTA SIGNALS
# ============================================================================

@receiver(pre_save, sender='tenant.TenantResource')
def resource_pre_save_handler(sender, instance, **kwargs):
    """
    Check resource quotas before saving.

    When resource usage is updated:
        - Check if limit exceeded
        - Send warning if near limit
    """
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            old_value = old.current_value
            new_value = instance.current_value

            # Check if limit was exceeded
            if new_value >= instance.limit_value and old_value < instance.limit_value:
                logger.warning(
                    f"Resource {instance.resource_type} exceeded limit "
                    f"for tenant {instance.tenant_id}: {new_value}/{instance.limit_value}"
                )

                # Send quota exceeded signal
                from django.dispatch import Signal
                quota_exceeded = Signal()
                quota_exceeded.send(
                    sender=sender,
                    tenant_id=instance.tenant_id,
                    resource_type=instance.resource_type,
                    current=instance.current_value,
                    limit=instance.limit_value
                )

            # Check if near limit (80%)
            elif new_value >= instance.limit_value * 0.8 and old_value < instance.limit_value * 0.8:
                logger.info(
                    f"Resource {instance.resource_type} near limit "
                    f"for tenant {instance.tenant_id}: {new_value}/{instance.limit_value}"
                )

                # Send quota warning
                try:
                    from apps.notifications.services import NotificationService
                    notification = NotificationService()
                    notification.send_quota_warning(instance)
                except ImportError:
                    logger.debug("Notification service not available")

        except sender.DoesNotExist:
            pass


# ============================================================================
# SCHEMA SIGNALS
# ============================================================================

@receiver(post_save, sender='tenant.TenantSchema')
def schema_post_save_handler(sender, instance, created, **kwargs):
    """
    Handle schema creation and updates.

    When schema is created:
        - Run initial migrations
        - Seed data
    """
    if created:
        logger.info(
            f"Schema {instance.schema_name} created for tenant {instance.tenant_id}")

        # Queue schema initialization
        from apps.tenant.tasks import initialize_schema_task
        transaction.on_commit(
            lambda: initialize_schema_task.delay(str(instance.id)))

    elif instance.status == 'active' and not instance.is_ready:
        logger.info(f"Schema {instance.schema_name} became active")

        # Mark tenant as ready
        if instance.tenant:
            instance.tenant.is_ready = True
            instance.tenant.save(update_fields=['is_ready'])


# ============================================================================
# CONNECTION SIGNALS
# ============================================================================

@receiver(post_delete, sender='tenant.ConnectionPool')
def connection_post_delete_handler(sender, instance, **kwargs):
    """
    Handle connection cleanup.

    When connection is deleted:
        - Close actual database connection
    """
    logger.info(f"Connection {instance.connection_id} deleted")

    # Close connection in pool
    from apps.tenant.services.isolation.connection_manager import ConnectionManager
    manager = ConnectionManager()
    manager.close_connection(instance.tenant_id)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def clear_all_tenant_cache(tenant_id):
    """
    Clear all cache entries for a tenant.

    Args:
        tenant_id: UUID of tenant
    """
    cache_keys = [
        f"tenant_{tenant_id}",
        f"tenant_config_{tenant_id}",
        f"tenant_limits_{tenant_id}",
        f"tenant_quota_{tenant_id}",
    ]

    for key in cache_keys:
        cache.delete(key)

    logger.debug(f"Cleared all cache for tenant {tenant_id}")
