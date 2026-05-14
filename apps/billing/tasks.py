import logging
from decimal import Decimal
from datetime import timedelta
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from celery import shared_task
from celery.exceptions import Retry
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.subscription_service import SubscriptionService
from apps.billing.services.quota_service import QuotaService
from apps.billing.exceptions import SubscriptionError, PaymentError, WebhookError
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_subscription_with_stripe(self, subscription_id: str):
    from billing.models import Subscription
    try:
        subscription = Subscription.objects.get(id=subscription_id, is_deleted=False)
        if not subscription.stripe_subscription_id:
            logger.warning(f"Subscription {subscription_id} has no Stripe ID")
            return
        stripe = StripeClient()
        stripe_sub = stripe.get_subscription(subscription.stripe_subscription_id)
        subscription.status = stripe_sub.status
        subscription.current_period_start = timezone.fromtimestamp(stripe_sub.current_period_start)
        subscription.current_period_end = timezone.fromtimestamp(stripe_sub.current_period_end)
        subscription.cancel_at_period_end = stripe_sub.cancel_at_period_end
        if stripe_sub.trial_start and stripe_sub.trial_end:
            subscription.trial_start = timezone.fromtimestamp(stripe_sub.trial_start)
            subscription.trial_end = timezone.fromtimestamp(stripe_sub.trial_end)
        subscription.save()
        logger.info(f"Synced subscription {subscription_id}: status={subscription.status}")
    except Subscription.DoesNotExist:
        logger.error(f"Subscription {subscription_id} not found")
    except Exception as e:
        logger.error(f"Failed to sync subscription {subscription_id}: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))

@shared_task(bind=True, max_retries=3)
def process_webhook_event(self, event_id: str):
    from billing.models import WebhookEvent
    from billing.services.webhook_service import WebhookService
    try:
        event = WebhookEvent.objects.get(id=event_id, is_processed=False)
        service = WebhookService()
        result = service.process_event(event)
        if result.get('success'):
            event.mark_processed()
            logger.info(f"Processed webhook event {event.stripe_event_id}: {event.event_type}")
        else:
            error = result.get('error', 'Unknown error')
            event.mark_processed(error=error)
            logger.error(f"Failed to process webhook {event.stripe_event_id}: {error}")     
    except WebhookEvent.DoesNotExist:
        logger.warning(f"Webhook event {event_id} not found or already processed")
    except Exception as e:
        logger.error(f"Error processing webhook event {event_id}: {str(e)}")
        event.increment_retry()
        if event.retry_count < 3:
            raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))

@shared_task
def check_expired_subscriptions():
    from billing.models import Subscription
    now = timezone.now()
    expired = Subscription.objects.filter(
        status__in=['trialing', 'active'],
        current_period_end__lt=now,
        is_deleted=False
    )
    count = 0
    for subscription in expired:
        subscription.status = Subscription.STATUS_EXPIRED if hasattr(Subscription, 'STATUS_EXPIRED') else 'expired'
        subscription.save()
        count += 1
        logger.info(f"Marked subscription {subscription.id} as expired")
    expired_trials = Subscription.objects.filter(
        status='trialing',
        trial_end__lt=now,
        is_deleted=False
    )
    trial_count = 0
    for subscription in expired_trials:
        subscription.status = 'expired'
        subscription.save()
        trial_count += 1
        logger.info(f"Trial expired for subscription {subscription.id}")
    return {
        'expired_subscriptions': count,
        'expired_trials': trial_count
    }

@shared_task
def send_upcoming_invoice_reminder(days_before: int = 3):
    from billing.models import Subscription, Invoice
    cutoff_date = timezone.now() + timedelta(days=days_before)
    subscriptions = Subscription.objects.filter(
        status='active',
        current_period_end__date=cutoff_date.date(),
        cancel_at_period_end=False,
        is_deleted=False
    ).select_related('tenant')
    sent_count = 0
    for subscription in subscriptions:
        tenant = subscription.tenant
        if tenant.contact_email:
            send_mail(
                subject=f"Upcoming Invoice for {tenant.name}",
                message=f"Your subscription will be renewed on {subscription.current_period_end.date()}. "
                       f"Amount: {subscription.plan.price_monthly} {subscription.plan.currency}",
                from_email=None,
                recipient_list=[tenant.contact_email],
                fail_silently=True,
            )
            sent_count += 1
    logger.info(f"Sent {sent_count} upcoming invoice reminders")
    return {'reminders_sent': sent_count}

@shared_task
def send_payment_failed_notification():
    from billing.models import Payment, Subscription
    failed_payments = Payment.objects.filter(
        status='failed',
        created_at__gte=timezone.now() - timedelta(days=1),
        metadata__notification_sent__isnull=True,
        is_deleted=False
    ).select_related('tenant', 'subscription')
    sent_count = 0
    for payment in failed_payments:
        tenant = payment.tenant
        if tenant.contact_email:
            send_mail(
                subject=f"Payment Failed - {tenant.name}",
                message=f"Your payment of {payment.amount} {payment.currency} failed. "
                       f"Please update your payment method to avoid service interruption.",
                from_email=None,
                recipient_list=[tenant.contact_email],
                fail_silently=True,
            )
            metadata = payment.metadata or {}
            metadata['notification_sent'] = timezone.now().isoformat()
            payment.metadata = metadata
            payment.save(update_fields=['metadata'])
            sent_count += 1
    logger.info(f"Sent {sent_count} payment failure notifications")
    return {'notifications_sent': sent_count}

@shared_task
def reset_daily_api_quotas():
    quota_service = QuotaService()
    count = quota_service.reset_daily_api_usage()
    logger.info(f"Reset daily API quotas for {count} tenants")
    return {'tenants_reset': count}

@shared_task
def sync_invoices_for_tenant(tenant_id: str):
    from billing.engine.sync.invoice_sync import InvoiceSync
    from apps.tenant.models import Client
    try:
        tenant = Client.objects.get(id=tenant_id, is_deleted=False)
        invoice_sync = InvoiceSync()
        invoices = invoice_sync.sync_outstanding_invoices(tenant)
        logger.info(f"Synced {len(invoices)} invoices for tenant {tenant.name}")
        return {'invoices_synced': len(invoices)}
    except Client.DoesNotExist:
        logger.error(f"Tenant {tenant_id} not found")
        return {'error': 'Tenant not found'}
    except Exception as e:
        logger.error(f"Failed to sync invoices for tenant {tenant_id}: {str(e)}")
        raise

@shared_task
def generate_monthly_invoice_report():
    from billing.models import Invoice
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    paid_invoices = Invoice.objects.filter(
        status='paid',
        invoice_date__gte=start_of_month,
        is_deleted=False
    )
    total_revenue = paid_invoices.aggregate(total=models.Sum('amount_paid'))['total'] or Decimal('0.00')
    invoice_count = paid_invoices.count()
    logger.info(f"Monthly report: {invoice_count} invoices, {total_revenue} total revenue")
    return {
        'invoice_count': invoice_count,
        'total_revenue': str(total_revenue),
        'month': start_of_month.strftime('%Y-%m')
    }

@shared_task
def cleanup_old_webhook_events(days_to_keep: int = 30):
    from billing.models import WebhookEvent
    cutoff = timezone.now() - timedelta(days=days_to_keep)
    deleted_count = WebhookEvent.objects.filter(
        is_processed=True,
        created_at__lt=cutoff
    ).delete()[0]
    logger.info(f"Deleted {deleted_count} old webhook events")
    return {'deleted_count': deleted_count}

@shared_task
def handle_trial_ending_soon(days_before: int = 3):
    from billing.models import Subscription
    cutoff_date = timezone.now() + timedelta(days=days_before)
    trials_ending = Subscription.objects.filter(
        status='trialing',
        trial_end__date=cutoff_date.date(),
        is_deleted=False
    ).select_related('tenant')
    sent_count = 0
    for subscription in trials_ending:
        tenant = subscription.tenant
        if tenant.contact_email:
            send_mail(
                subject=f"Your Trial Ends in {days_before} Days - {tenant.name}",
                message=f"Your trial for Falcon PMS ends on {subscription.trial_end.date()}. "
                       f"To continue using the platform, please choose a subscription plan.",
                from_email=None,
                recipient_list=[tenant.contact_email],
                fail_silently=True,
            )
            sent_count += 1
    logger.info(f"Sent {sent_count} trial ending reminders")
    return {'reminders_sent': sent_count}