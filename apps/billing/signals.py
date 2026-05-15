from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Subscription, Transaction, Invoice, WebhookEventLog, BillingAuditLog
from .utils import get_tenant_billing_summary


@receiver(post_save, sender=Subscription)
def subscription_post_save(sender, instance, created, **kwargs):
    from .utils import serialize_for_audit
    
    # Log audit trail
    if created:
        BillingAuditLog.log_action(
            user=None,  # System action
            tenant_id=instance.tenant_id,
            action='create',
            resource_type='subscription',
            resource_id=instance.id,
            after=serialize_for_audit(instance),
            metadata={'subscription_code': instance.subscription_code}
        )
    else:
        # Log update (only if changed)
        BillingAuditLog.log_action(
            user=None,
            tenant_id=instance.tenant_id,
            action='update',
            resource_type='subscription',
            resource_id=instance.id,
            after=serialize_for_audit(instance),
            metadata={'subscription_code': instance.subscription_code}
        )
    
    # Send welcome email for new subscription
    if created and instance.status == instance.STATUS_ACTIVE:
        _send_subscription_welcome_email(instance)
    
    # Send trial ending reminder
    if instance.is_on_trial and instance.trial_days_remaining <= 3:
        _send_trial_ending_reminder(instance)
    
    # Send subscription expiring reminder
    if instance.is_expiring_soon and instance.days_until_expiry <= 7:
        _send_expiring_reminder(instance)


@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    """
    Handle post-save actions for transaction:
    - Update subscription status
    - Mark invoice as paid
    - Send confirmation email
    - Log audit trail
    """
    from .utils import serialize_for_audit
    
    # Log audit trail
    BillingAuditLog.log_action(
        user=None,
        tenant_id=instance.tenant_id,
        action='payment' if instance.status == 'success' else 'payment',
        resource_type='transaction',
        resource_id=instance.id,
        after=serialize_for_audit(instance),
        success=(instance.status == 'success'),
        error_message=instance.error_message if instance.status == 'failed' else None,
        metadata={'reference': instance.reference}
    )
    
    # If transaction is successful
    if instance.status == 'success' and not getattr(instance, '_processed', False):
        instance._processed = True
        
        # Update related subscription
        if instance.subscription:
            if instance.transaction_type in ['subscription', 'renewal', 'upgrade']:
                if instance.subscription.status == instance.subscription.STATUS_PAST_DUE:
                    instance.subscription.activate()
                instance.subscription.last_payment_date = timezone.now()
                instance.subscription.save(update_fields=['last_payment_date', 'status'])
        
        # Mark related invoice as paid
        if instance.invoice and instance.invoice.status != 'paid':
            instance.invoice.mark_paid()
        
        # Send payment confirmation
        _send_payment_confirmation(instance)


@receiver(pre_save, sender=Invoice)
def invoice_pre_save(sender, instance, **kwargs):
    """
    Handle pre-save actions for invoice:
    - Generate invoice number if not set
    - Check for overdue status
    """
    if not instance.invoice_number:
        from .utils import generate_invoice_number
        instance.invoice_number = generate_invoice_number(instance.tenant_id)
    
    # Check if invoice should be marked overdue
    if instance.status == 'pending' and instance.due_date < timezone.now():
        instance.status = 'overdue'


@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, instance, created, **kwargs):
    """
    Handle post-save actions for invoice:
    - Generate PDF
    - Send invoice email
    - Log audit trail
    """
    from .utils import serialize_for_audit
    
    if created:
        BillingAuditLog.log_action(
            user=None,
            tenant_id=instance.tenant_id,
            action='create',
            resource_type='invoice',
            resource_id=instance.id,
            after=serialize_for_audit(instance),
            metadata={'invoice_number': instance.invoice_number}
        )
        
        # Send invoice email
        _send_invoice_email(instance)
    
    # Generate PDF if not generated and status is not draft
    if instance.status != 'draft' and not instance.pdf_url:
        # Queue PDF generation task
        from .tasks import generate_invoice_pdf
        generate_invoice_pdf.delay(instance.id)


@receiver(post_save, sender=WebhookEventLog)
def webhook_post_save(sender, instance, created, **kwargs):
    """
    Handle post-save actions for webhook events:
    - Log webhook receipt
    - Alert on failures
    """
    if not created:
        return
    
    # Log to audit
    BillingAuditLog.log_action(
        user=None,
        tenant_id=None,  # Webhooks may not have tenant context initially
        action='webhook',
        resource_type='webhook',
        resource_id=instance.id,
        after={'event_type': instance.event_type, 'status': instance.processing_status},
        success=(instance.processing_status != 'failed'),
        error_message=instance.processing_error,
        metadata={'event_idempotency_key': instance.event_idempotency_key}
    )
    
    # Alert on failed webhooks
    if instance.processing_status == 'failed':
        _send_webhook_failure_alert(instance)


# ============================================================================
# Notification Helpers
# ============================================================================

def _send_subscription_welcome_email(subscription):
    """Send welcome email for new subscription."""
    subject = f"Welcome to {subscription.plan.name} Plan"
    message = f"""
    Your subscription has been activated successfully!
    
    Plan: {subscription.plan.name}
    Amount: {subscription.amount/100} {subscription.currency}
    Next billing date: {subscription.current_period_end}
    
    Thank you for choosing Falcon PMS!
    """
    
    # Get tenant contact email
    from apps.tenant.models import Client
    try:
        client = Client.objects.get(id=subscription.tenant_id)
        recipient_email = client.contact_email or client.email if hasattr(client, 'email') else None
        
        if recipient_email:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                fail_silently=True
            )
    except Client.DoesNotExist:
        pass


def _send_trial_ending_reminder(subscription):
    """Send trial ending reminder email."""
    subject = "Your Trial is Ending Soon"
    message = f"""
    Your trial period for Falcon PMS ends in {subscription.trial_days_remaining} days.
    
    To continue using the platform, please upgrade to a paid plan.
    
    Visit your billing portal to upgrade: {settings.BASE_URL}/billing
    """
    
    # Send email logic here


def _send_expiring_reminder(subscription):
    """Send subscription expiring reminder."""
    subject = "Subscription Expiring Soon"
    message = f"""
    Your subscription will expire in {subscription.days_until_expiry} days.
    
    Please ensure your payment method is up to date to avoid service interruption.
    
    Visit your billing portal: {settings.BASE_URL}/billing
    """


def _send_payment_confirmation(transaction):
    """Send payment confirmation email."""
    subject = "Payment Confirmation"
    message = f"""
    Your payment of {transaction.amount/100} {transaction.currency} has been confirmed.
    
    Reference: {transaction.reference}
    Date: {transaction.payment_date}
    
    Thank you for your payment!
    """


def _send_invoice_email(invoice):
    """Send invoice email with PDF attachment."""
    subject = f"Invoice {invoice.invoice_number}"
    message = f"""
    Please find your invoice attached.
    
    Invoice Number: {invoice.invoice_number}
    Amount: {invoice.total_amount/100} {invoice.currency}
    Due Date: {invoice.due_date}
    
    View and pay online: {settings.BASE_URL}/invoices/{invoice.id}
    """


def _send_webhook_failure_alert(webhook_event):
    """Send alert for webhook processing failure."""
    subject = f"Webhook Processing Failed: {webhook_event.event_type}"
    message = f"""
    Webhook processing failed:
    
    Event Type: {webhook_event.event_type}
    Event ID: {webhook_event.paystack_event_id}
    Error: {webhook_event.processing_error}
    Retry Count: {webhook_event.retry_count}
    
    Please investigate immediately.
    """
    
    # Send to admin email
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    if admin_email:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [admin_email],
            fail_silently=True
        )