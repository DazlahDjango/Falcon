"""
Billing signals.

Signal handlers for subscription, invoice, and payment lifecycle events.
Handles automatic quota initialization, history tracking, and notifications.
"""
import logging
from decimal import Decimal
from django.db.models.signals import (
    post_save, pre_save, post_delete, pre_delete,
    m2m_changed
)
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone

from apps.billing.models import (
    Subscription, SubscriptionHistory, Invoice, Payment,
    QuotaLimit, QuotaUsage, WebhookEvent
)
from apps.billing.services.quota_service import QuotaService
from apps.billing.services.audit_service import BillingAuditService
from apps.billing.tasks import sync_subscription_with_stripe
logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Subscription)
def subscription_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._original_status = sender.objects.get(pk=instance.pk).status
            instance._original_plan_id = sender.objects.get(pk=instance.pk).plan_id
        except sender.DoesNotExist:
            instance._original_status = None
            instance._original_plan_id = None
    else:
        instance._original_status = None
        instance._original_plan_id = None

@receiver(post_save, sender=Subscription)
def subscription_post_save(sender, created, instance, **kwargs):
    if created:
        QuotaService().initialize_limits(instance)
        logger.info(f"Created quota limits for subscription {instance.id}")
        SubscriptionHistory.objects.create(
            subscription=instance,
            previous_status=None,
            new_status=instance.status,
            change_reason="Subscription created"
        )
    if hasattr(instance, '_original_status') and instance._original_status != instance.status:
        SubscriptionHistory.objects.create(
            subscription=instance,
            previous_plan_id=instance._original_plan_id,
            new_plan_id=instance.plan_id,
            previous_status=instance._original_status,
            new_status=instance.status,
            change_reason=f"Status changed from {instance._original_status} to {instance.status}"
        )
        logger.info(f"Subscription {instance.id} status changed: {instance._original_status} -> {instance.status}")
        if instance.status in ['past_due', 'canceled', 'suspended']:
            from apps.billing.services.notification_service import BillingNotificationService
            transaction.on_commit(
                lambda: BillingNotificationService().send_subscription_status_alert(instance)
            )
    if hasattr(instance, '_original_plan_id') and instance._original_plan_id != instance.plan_id:
        SubscriptionHistory.objects.create(
            subscription=instance,
            previous_plan_id=instance._original_plan_id,
            new_plan_id=instance.plan_id,
            previous_status=instance.status,
            new_status=instance.status,
            change_reason=f"Plan changed"
        )
        logger.info(f"Subscription {instance.id} plan changed")
        QuotaService().update_limits_for_subscription(instance)
    if not created and instance.stripe_subscription_id:
        transaction.on_commit(
            lambda: sync_subscription_with_stripe.delay(str(instance.id))
        )

@receiver(pre_delete, sender=Subscription)
def subscription_pre_delete(sender, instance, **kwargs):
    logger.warning(f"Subscription {instance.id} for tenant {instance.tenant_id} is being deleted")
    SubscriptionHistory.objects.create(
        subscription=instance,
        previous_status=instance.status,
        new_status='deleted',
        change_reason="Subscription deleted",
        metadata={'deleted_at': timezone.now().isoformat()}
    )

@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, created, instance, **kwargs):
    if created:
        logger.info(f"Invoice {instance.invoice_number} created for tenant {instance.tenant_id}")
        if instance.status == 'paid' and instance.subscription:
            QuotaService().refresh_usage(instance.tenant)
            if instance.subscription.status in ['past_due', 'unpaid']:
                instance.subscription.status = 'active'
                instance.subscription.save(update_fields=['status'])
                logger.info(f"Subscription {instance.subscription.id} reactivated after payment")

@receiver(pre_save, sender=Invoice)
def invoice_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._original_status = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._original_status = None
    else:
        instance._original_status = None

@receiver(post_save, sender=Invoice)
def invoice_status_changed(sender, created, instance, **kwargs):
    if not created and hasattr(instance, '_original_status'):
        if instance._original_status != instance.status:
            logger.info(f"Invoice {instance.invoice_number} status: {instance._original_status} -> {instance.status}")
            if instance.status == 'open' and instance.is_overdue:
                from apps.billing.services.notification_service import BillingNotificationService
                transaction.on_commit(
                    lambda: BillingNotificationService().send_overdue_invoice_alert(instance)
                )

@receiver(post_save, sender=Payment)
def payment_post_save(sender, created, instance, **kwargs):
    if created:
        logger.info(f"Payment {instance.id} of {instance.amount} {instance.currency} created")
        if instance.invoice and instance.status == 'succeeded':
            instance.invoice.status = 'paid'
            instance.invoice.amount_paid = instance.amount
            instance.invoice.amount_remaining = max(
                Decimal('0.00'),
                instance.invoice.amount_due - instance.amount
            )
            instance.invoice.save(update_fields=['status', 'amount_paid', 'amount_remaining'])
            logger.info(f"Invoice {instance.invoice.invoice_number} marked as paid")
        if instance.status == 'succeeded':
            QuotaService().refresh_usage(instance.tenant)

@receiver(pre_save, sender=Payment)
def payment_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._original_status = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._original_status = None
    else:
        instance._original_status = None

@receiver(post_save, sender=Payment)
def payment_status_changed(sender, created, instance, **kwargs):
    if not created and hasattr(instance, '_original_status'):
        if instance._original_status != instance.status:
            logger.info(f"Payment {instance.id} status: {instance._original_status} -> {instance.status}")
            if instance.status == 'failed':
                from apps.billing.services.notification_service import BillingNotificationService
                transaction.on_commit(
                    lambda: BillingNotificationService().send_payment_failure_alert(instance)
                )

@receiver(post_save, sender=QuotaUsage)
def quota_usage_post_save(sender, created, instance, **kwargs):
    if created:
        logger.debug(f"Quota usage created for tenant {instance.tenant_id}")
    else:
        # Get limits to check if nearing them
        limits = QuotaService().get_limits(instance.tenant)
        if limits:
            if instance.current_users >= limits.max_users * 0.9:
                logger.warning(f"Tenant {instance.tenant_id} nearing user limit: {instance.current_users}/{limits.max_users}")

@receiver(post_save, sender=WebhookEvent)
def webhook_event_post_save(sender, created, instance, **kwargs):
    if created:
        logger.info(f"Webhook event {instance.event_type} received: {instance.stripe_event_id}")
        priority_events = [
            'invoice.paid',
            'invoice.payment_failed',
            'customer.subscription.deleted',
            'customer.subscription.updated'
        ]
        if instance.event_type in priority_events:
            from apps.billing.tasks import process_webhook_event
            transaction.on_commit(
                lambda: process_webhook_event.delay(str(instance.id))
            )

@receiver(post_save, sender='tenant.Client')
def tenant_post_save(sender, created, instance, **kwargs):
    if created:
        from apps.billing.models import Plan
        from apps.billing.models import Subscription as BillingSubscription
        trial_plan = Plan.objects.filter(
            plan_type='trial',
            is_active=True,
            is_deleted=False
        ).first()
        if trial_plan:
            subscription = BillingSubscription.objects.create(
                tenant=instance,
                plan=trial_plan,
                status='trialing',
                trial_start=timezone.now(),
                trial_end=timezone.now() + timezone.timedelta(days=trial_plan.trial_days),
                features_snapshot={}
            )
            logger.info(f"Created trial subscription for new tenant {instance.name}")
        else:
            logger.warning(f"No trial plan found for new tenant {instance.name}")

@receiver(post_save, sender='accounts.User')
def user_post_save(sender, created, instance, update_fields, **kwargs):
    # Only refresh if it's a new user or if relevant fields changed
    # During login, we update last_login etc. which shouldn't trigger quota refresh
    should_refresh = created
    if update_fields:
        relevant_fields = {'is_active', 'is_deleted', 'role', 'tenant_id'}
        if any(field in update_fields for field in relevant_fields):
            should_refresh = True
            
    if should_refresh and instance.tenant_id:
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=instance.tenant_id)
            # Defer refresh to after transaction commit to avoid recursion issues during save
            transaction.on_commit(lambda: QuotaService().refresh_usage(tenant))
            logger.debug(f"Queued quota usage refresh for tenant {tenant.name} after user change")
        except Client.DoesNotExist:
            logger.warning(f"Tenant not found for user {instance.id}")

@receiver(post_delete, sender='accounts.User')
def user_post_delete(sender, instance, **kwargs):
    if instance.tenant_id:
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=instance.tenant_id)
            QuotaService().refresh_usage(tenant)
            logger.debug(f"Updated quota usage for tenant {tenant.name} after user deletion")
        except Client.DoesNotExist:
            logger.warning(f"Tenant not found for deleted user {instance.id}")