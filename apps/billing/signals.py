from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Subscription, Transaction, Invoice, WebhookEventLog, BillingAuditLog, FailedPaymentRetry, UsageRecord, TenantSubscriptionOverride
from .utils import serialize_for_audit

@receiver(post_save, sender=Subscription)
def subscription_post_save(sender, instance, created, **kwargs):
    BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='create' if created else 'update', resource_type='subscription', resource_id=instance.id, after=serialize_for_audit(instance), metadata={'subscription_code': instance.subscription_code})
    if created and instance.status == instance.STATUS_ACTIVE:
        _send_subscription_welcome_email(instance)
    if instance.is_on_trial and instance.trial_days_remaining <= 3:
        _send_trial_ending_reminder(instance)
    if instance.is_expiring_soon and instance.days_until_expiry <= 7:
        _send_expiring_reminder(instance)

@receiver(pre_save, sender=Subscription)
def subscription_pre_save(sender, instance, **kwargs):
    if instance.id:
        try:
            old = Subscription.objects.get(id=instance.id)
            if old.status != instance.status and instance.status == instance.STATUS_PAST_DUE and not instance.grace_period_ends_at:
                from datetime import timedelta
                instance.grace_period_ends_at = timezone.now() + timedelta(days=7)
        except Subscription.DoesNotExist:
            pass

@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='payment', resource_type='transaction', resource_id=instance.id, after=serialize_for_audit(instance), success=(instance.status == 'success'), error_message=instance.error_message if instance.status == 'failed' else None, metadata={'reference': instance.reference})
    if instance.status == 'success' and not getattr(instance, '_processed', False):
        instance._processed = True
        if instance.subscription:
            if instance.transaction_type in ['subscription', 'renewal', 'upgrade']:
                if instance.subscription.status == instance.subscription.STATUS_PAST_DUE:
                    instance.subscription.activate()
                instance.subscription.last_payment_date = timezone.now()
                instance.subscription.grace_period_ends_at = None
                instance.subscription.save(update_fields=['last_payment_date', 'status', 'grace_period_ends_at'])
        if instance.invoice and instance.invoice.status != 'paid':
            instance.invoice.mark_paid()
        _send_payment_confirmation(instance)

@receiver(pre_save, sender=Invoice)
def invoice_pre_save(sender, instance, **kwargs):
    if not instance.invoice_number:
        from .utils import generate_invoice_number
        instance.invoice_number = generate_invoice_number(instance.tenant_id)
    if instance.status == 'pending' and instance.due_date < timezone.now():
        instance.status = 'overdue'

@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, instance, created, **kwargs):
    if created:
        BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='create', resource_type='invoice', resource_id=instance.id, after=serialize_for_audit(instance), metadata={'invoice_number': instance.invoice_number})
        _send_invoice_email(instance)
    if instance.status != 'draft' and not instance.pdf_url:
        from .tasks import generate_invoice_pdf
        generate_invoice_pdf.delay(instance.id)

@receiver(post_save, sender=WebhookEventLog)
def webhook_post_save(sender, instance, created, **kwargs):
    if not created:
        return
    BillingAuditLog.log_action(user=None, tenant_id=None, action='webhook', resource_type='webhook', resource_id=instance.id, after={'event_type': instance.event_type, 'status': instance.processing_status}, success=(instance.processing_status != 'failed'), error_message=instance.processing_error, metadata={'event_idempotency_key': instance.event_idempotency_key})
    if instance.processing_status == 'failed':
        _send_webhook_failure_alert(instance)
    if instance.processing_status == 'pending' and instance.retry_count < instance.max_retries:
        from .tasks import process_webhook
        process_webhook.delay(str(instance.id))

@receiver(post_save, sender=FailedPaymentRetry)
def failed_payment_retry_post_save(sender, instance, created, **kwargs):
    if instance.status == 'success' and instance.subscription:
        instance.subscription.status = Subscription.STATUS_ACTIVE
        instance.subscription.grace_period_ends_at = None
        instance.subscription.save(update_fields=['status', 'grace_period_ends_at'])
        BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='update', resource_type='subscription', resource_id=instance.subscription.id, after={'status': 'active'}, metadata={'retry_id': str(instance.id)})

@receiver(post_save, sender=UsageRecord)
def usage_record_post_save(sender, instance, created, **kwargs):
    alerts = instance.check_alerts()
    for alert in alerts:
        BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='alert', resource_type='usage', resource_id=instance.id, after={'usage_type': instance.usage_type, 'percentage': str(instance.percentage_used)}, metadata={'alert_level': alert['level'], 'alert_message': alert['message']})
        if alert['level'] >= 90:
            _send_usage_alert_email(instance, alert)

@receiver(post_save, sender=TenantSubscriptionOverride)
def tenant_override_post_save(sender, instance, created, **kwargs):
    if created:
        BillingAuditLog.log_action(user=None, tenant_id=instance.tenant_id, action='create', resource_type='tenant_override', resource_id=instance.id, after={'plan_id': str(instance.plan_id), 'discount': str(instance.discount_percentage) if instance.discount_percentage else None}, metadata={'approved_by': str(instance.approved_by)})
        if instance.subscription and instance.custom_price_monthly:
            instance.subscription.amount = instance.custom_price_monthly
            instance.subscription.custom_pricing = {'monthly': instance.custom_price_monthly, 'yearly': instance.custom_price_yearly, 'discount': float(instance.discount_percentage) if instance.discount_percentage else None}
            instance.subscription.save(update_fields=['amount', 'custom_pricing'])

@receiver(post_delete, sender=Subscription)
def subscription_post_delete(sender, instance, **kwargs):
    cache_key = f"subscription_valid_{instance.tenant_id}"
    from django.core.cache import cache
    cache.delete(cache_key)
    cache.delete(f"tenant_billing_context_{instance.tenant_id}")

def _send_subscription_welcome_email(subscription):
    subject = f"Welcome to {subscription.plan.name} Plan"
    message = f"Your subscription has been activated successfully!\n\nPlan: {subscription.plan.name}\nAmount: {subscription.amount/100} {subscription.currency}\nNext billing date: {subscription.current_period_end}\n\nThank you for choosing Falcon PMS!"
    _send_email_to_tenant(subscription.tenant_id, subject, message)

def _send_trial_ending_reminder(subscription):
    subject = "Your Trial is Ending Soon"
    message = f"Your trial period for Falcon PMS ends in {subscription.trial_days_remaining} days.\n\nTo continue using the platform, please upgrade to a paid plan.\n\nVisit your billing portal to upgrade: {getattr(settings, 'BASE_URL', '')}/billing"
    _send_email_to_tenant(subscription.tenant_id, subject, message)

def _send_expiring_reminder(subscription):
    subject = "Subscription Expiring Soon"
    message = f"Your subscription will expire in {subscription.days_until_expiry} days.\n\nPlease ensure your payment method is up to date to avoid service interruption.\n\nVisit your billing portal: {getattr(settings, 'BASE_URL', '')}/billing"
    _send_email_to_tenant(subscription.tenant_id, subject, message)

def _send_payment_confirmation(transaction):
    subject = "Payment Confirmation"
    message = f"Your payment of {transaction.amount/100} {transaction.currency} has been confirmed.\n\nReference: {transaction.reference}\nDate: {transaction.payment_date}\n\nThank you for your payment!"
    _send_email_to_tenant(transaction.tenant_id, subject, message)

def _send_invoice_email(invoice):
    subject = f"Invoice {invoice.invoice_number}"
    message = f"Please find your invoice attached.\n\nInvoice Number: {invoice.invoice_number}\nAmount: {invoice.total_amount/100} {invoice.currency}\nDue Date: {invoice.due_date}\n\nView and pay online: {getattr(settings, 'BASE_URL', '')}/invoices/{invoice.id}"
    _send_email_to_tenant(invoice.tenant_id, subject, message)

def _send_webhook_failure_alert(webhook_event):
    subject = f"Webhook Processing Failed: {webhook_event.event_type}"
    message = f"Webhook processing failed:\n\nEvent Type: {webhook_event.event_type}\nEvent ID: {webhook_event.paystack_event_id}\nError: {webhook_event.processing_error}\nRetry Count: {webhook_event.retry_count}\n\nPlease investigate immediately."
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    if admin_email:
        send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), [admin_email], fail_silently=True)

def _send_usage_alert_email(usage_record, alert):
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    if admin_email:
        subject = f"Usage Alert: {usage_record.usage_type} at {alert['level']}%"
        message = f"Usage alert for tenant {usage_record.tenant_id}:\n\nType: {usage_record.usage_type}\nCurrent: {usage_record.current_value}\nLimit: {usage_record.limit_value}\nPercentage: {usage_record.percentage_used}%\nAlert: {alert['message']}\n\nPlease review and consider upgrading."
        send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), [admin_email], fail_silently=True)

def _send_email_to_tenant(tenant_id, subject, message):
    try:
        from apps.tenant.models import Organization
        organization = Organization.objects.get(id=tenant_id)
        recipient_email = organization.contact_email or (organization.email if hasattr(organization, 'email') else None)
        if recipient_email:
            send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), [recipient_email], fail_silently=True)
    except Exception:
        pass