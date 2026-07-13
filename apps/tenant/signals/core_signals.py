"""
apps/tenant/signals/core_signals.py

Receivers for Organization, Domain, Schema, and OrganizationResource
model events.
"""
import logging
from django.db.models.signals import post_save, post_delete, pre_save, pre_delete
from django.dispatch import receiver
from django.db import transaction
from django.core.cache import cache
from apps.tenant.constants import OrganizationStatus

logger = logging.getLogger(__name__)


@receiver(post_save, sender='tenant.Organization')
def organization_post_save_handler(sender, instance, created, **kwargs):
    logger.info("Organization %s saved (created=%s)", instance.id, created)
    cache.delete(f"organization_{instance.id}")

    if not created:
        return

    meta = instance.metadata or {}
    if meta.get('provisioning', {}).get('auto_dispatch') is False:
        logger.info("Skipping auto-provision for organization %s (auto_dispatch=False)", instance.id)
        return

    from apps.tenant.tasks import provision_organization
    transaction.on_commit(lambda: provision_organization.delay(str(instance.id)))


@receiver(pre_save, sender='tenant.Organization')
def organization_pre_save_handler(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        instance._previous_status = old.status
    except sender.DoesNotExist:
        instance._previous_status = None


@receiver(post_save, sender='tenant.Organization')
def organization_status_change_handler(sender, instance, created, **kwargs):
    """Invalidate caches and broadcast status changes after provisioning lifecycle updates."""
    if created:
        return

    previous = getattr(instance, '_previous_status', None)
    if previous and previous != instance.status:
        cache.delete(f"organization_{instance.id}")
        _broadcast_status_change(instance)


@receiver(post_delete, sender='tenant.Organization')
def organization_post_delete_handler(sender, instance, **kwargs):
    logger.info("Organization %s deleted", instance.id)
    cache.delete(f"organization_{instance.id}")


@receiver(post_save, sender='tenant.OrganizationDomain')
def domain_post_save_handler(sender, instance, created, **kwargs):
    logger.info("Domain %s saved (created=%s)", instance.id, created)
    cache.delete(f"domain_{instance.domain}")
    if created:
        from apps.tenant.tasks import verify_domain
        transaction.on_commit(lambda: verify_domain.delay(str(instance.id)))


@receiver(pre_delete, sender='tenant.OrganizationDomain')
def domain_pre_delete_handler(sender, instance, **kwargs):
    logger.info("Domain %s being deleted", instance.domain)
    cache.delete(f"domain_{instance.domain}")


@receiver(post_save, sender='tenant.OrganizationSchema')
def schema_post_save_handler(sender, instance, created, **kwargs):
    if not created:
        return

    logger.info(
        "Schema %s created for organization %s",
        instance.schema_name, instance.organization_id,
    )

    # ProvisioningService provisions schemas inline — skip duplicate async init.
    try:
        org = instance.organization
        if org.status == OrganizationStatus.PROVISIONING:
            return
    except Exception:
        pass

    from apps.tenant.tasks import initialize_schema
    transaction.on_commit(lambda: initialize_schema.delay(str(instance.id)))


@receiver(pre_save, sender='tenant.OrganizationResource')
def resource_pre_save_handler(sender, instance, **kwargs):
    """Log when a resource crosses its limit for the first time on a save."""
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        if (
            instance.current_value >= instance.limit_value
            and old.current_value < instance.limit_value
        ):
            logger.warning(
                "Resource %s exceeded limit for org %s",
                instance.resource_type, instance.organization_id,
            )
    except sender.DoesNotExist:
        pass


def _broadcast_status_change(org):
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from django.utils import timezone

        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        async_to_sync(channel_layer.group_send)(
            f"org_{org.id}_status",
            {
                'type': 'status_update',
                'organization_id': str(org.id),
                'status': org.status,
                'is_active': org.is_active,
                'is_onboarded': org.is_onboarded,
                'timestamp': timezone.now().isoformat(),
            },
        )
    except Exception as exc:
        logger.warning("Failed to broadcast status change for org %s: %s", org.id, exc)
