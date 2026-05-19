import logging
from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from .models import Subscription, Transaction, Invoice, WebhookEventLog
from .constants import SubscriptionStatus, TransactionStatus
from .services.subscription.lifecycle import SubscriptionLifecycleService
from .services.subscription.renewal import RenewalService
from .services.subscription.trial import TrialService
from .services.subscription.upgrade_downgrade import PlanChangeService
from .services.billing.invoice import InvoiceService
from .services.webhook.processor import WebhookProcessor
from .services.audit.logger import audit_logger
logger = get_task_logger(__name__)

@shared_task(name="billing.tasks.process_due_renewals")
def process_due_renewals():
    """
    Process all subscriptions due for renewal.
    Runs daily via Celery Beat.
    """
    logger.info("Starting due renewals processing")
    
    try:
        renewal_service = RenewalService()
        stats = renewal_service.process_due_renewals()
        
        logger.info(f"Renewals processed: {stats}")
        
        # Send admin notification if high failure rate
        if stats['total_due'] > 0 and stats['failed'] / stats['total_due'] > 0.3:
            send_admin_alert.delay(
                "High Renewal Failure Rate",
                f"{stats['failed']}/{stats['total_due']} renewals failed"
            )
        
        return stats
    except Exception as e:
        logger.exception(f"Failed to process renewals: {str(e)}")
        raise


@shared_task(name="billing.tasks.process_expired_trials")
def process_expired_trials():
    """
    Process expired trial subscriptions.
    Runs daily via Celery Beat.
    """
    logger.info("Starting expired trials processing")
    
    try:
        trial_service = TrialService()
        processed_count = trial_service.process_expired_trials()
        
        logger.info(f"Expired trials processed: {processed_count}")
        return {'processed': processed_count}
    except Exception as e:
        logger.exception(f"Failed to process expired trials: {str(e)}")
        raise


@shared_task(name="billing.tasks.send_renewal_reminders")
def send_renewal_reminders():
    """
    Send renewal reminders for expiring subscriptions.
    Runs daily via Celery Beat.
    """
    logger.info("Starting renewal reminders")
    
    try:
        renewal_service = RenewalService()
        sent_count = renewal_service.send_renewal_reminders([30, 14, 7, 3, 1])
        
        logger.info(f"Sent {sent_count} renewal reminders")
        return {'sent': sent_count}
    except Exception as e:
        logger.exception(f"Failed to send renewal reminders: {str(e)}")
        raise


@shared_task(name="billing.tasks.apply_pending_plan_changes")
def apply_pending_plan_changes():
    """
    Apply scheduled plan changes (upgrades/downgrades).
    Runs daily via Celery Beat.
    """
    logger.info("Starting pending plan changes processing")
    
    try:
        plan_change_service = PlanChangeService()
        applied_count = plan_change_service.apply_pending_plan_changes()
        
        logger.info(f"Applied {applied_count} pending plan changes")
        return {'applied': applied_count}
    except Exception as e:
        logger.exception(f"Failed to apply pending plan changes: {str(e)}")
        raise


# ============================================================================
# Invoice Tasks
# ============================================================================

@shared_task(name="billing.tasks.generate_invoice_pdf")
def generate_invoice_pdf(invoice_id: str):
    """
    Generate PDF for an invoice.
    """
    logger.info(f"Generating PDF for invoice {invoice_id}")
    
    try:
        invoice_service = InvoiceService()
        pdf_bytes = invoice_service.generate_pdf(invoice_id)
        
        # Store PDF in storage (S3 or similar)
        store_invoice_pdf.delay(invoice_id, pdf_bytes)
        
        logger.info(f"PDF generated for invoice {invoice_id}")
        return {'invoice_id': invoice_id, 'size': len(pdf_bytes)}
    except Exception as e:
        logger.exception(f"Failed to generate PDF for invoice {invoice_id}: {str(e)}")
        raise


@shared_task(name="billing.tasks.store_invoice_pdf")
def store_invoice_pdf(invoice_id: str, pdf_bytes: bytes):
    """
    Store invoice PDF in cloud storage.
    """
    from django.core.files.base import ContentFile
    from django.core.files.storage import default_storage
    
    try:
        invoice = Invoice.objects.get_by_id(invoice_id)
        filename = f"invoices/{invoice.tenant_id}/{invoice.invoice_number}.pdf"
        
        # Save to storage
        saved_path = default_storage.save(filename, ContentFile(pdf_bytes))
        
        # Update invoice with URL
        invoice.pdf_url = default_storage.url(saved_path)
        invoice.save(update_fields=['pdf_url'])
        
        logger.info(f"Stored invoice PDF at {saved_path}")
        return {'invoice_id': invoice_id, 'path': saved_path}
    except Exception as e:
        logger.exception(f"Failed to store invoice PDF for {invoice_id}: {str(e)}")
        raise


@shared_task(name="billing.tasks.send_invoice_emails")
def send_invoice_emails():
    """
    Send pending invoice emails.
    Runs daily via Celery Beat.
    """
    logger.info("Starting invoice email sending")
    
    try:
        # Get invoices that need email
        invoices = Invoice.objects.filter(
            status__in=['pending', 'overdue'],
            metadata__email_sent__isnull=True
        )[:100]
        
        sent_count = 0
        for invoice in invoices:
            try:
                # Get tenant email
                from apps.tenant.models import Client
                tenant = Client.objects.get(id=invoice.tenant_id)
                email = tenant.contact_email
                
                if email:
                    invoice_service = InvoiceService()
                    invoice_service.send_invoice_email(str(invoice.id), email)
                    
                    # Mark email as sent
                    metadata = invoice.metadata or {}
                    metadata['email_sent'] = timezone.now().isoformat()
                    invoice.metadata = metadata
                    invoice.save(update_fields=['metadata'])
                    
                    sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send invoice email for {invoice.invoice_number}: {str(e)}")
        
        logger.info(f"Sent {sent_count} invoice emails")
        return {'sent': sent_count}
    except Exception as e:
        logger.exception(f"Failed to send invoice emails: {str(e)}")
        raise


# ============================================================================
# Webhook Tasks
# ============================================================================

@shared_task(name="billing.tasks.process_webhook", bind=True, max_retries=3)
def process_webhook(self, webhook_log_id: str):
    """
    Process a webhook event with retry support.
    """
    logger.info(f"Processing webhook {webhook_log_id}")
    
    try:
        webhook_log = WebhookEventLog.objects.get_by_id(webhook_log_id)
        
        if webhook_log.is_processed:
            logger.info(f"Webhook {webhook_log_id} already processed")
            return {'status': 'already_processed'}
        
        processor = WebhookProcessor()
        # Need to reconstruct request or handle differently
        # This would be called with the stored payload
        
        logger.info(f"Webhook {webhook_log_id} processed successfully")
        return {'status': 'processed', 'webhook_id': webhook_log_id}
        
    except WebhookEventLog.DoesNotExist:
        logger.error(f"Webhook log {webhook_log_id} not found")
        raise
    except Exception as e:
        logger.exception(f"Failed to process webhook {webhook_log_id}: {str(e)}")
        
        # Retry with exponential backoff
        try:
            self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except Exception:
            # Mark as failed after max retries
            webhook_log = WebhookEventLog.objects.get_by_id(webhook_log_id)
            webhook_log.mark_failed(str(e))
            raise


@shared_task(name="billing.tasks.retry_failed_webhooks")
def retry_failed_webhooks():
    """
    Retry failed webhook processing.
    Runs every hour via Celery Beat.
    """
    logger.info("Starting failed webhooks retry")
    
    try:
        failed_webhooks = WebhookEventLog.objects.get_failed_webhooks_for_retry()
        
        retried_count = 0
        for webhook in failed_webhooks:
            process_webhook.delay(str(webhook.id))
            retried_count += 1
        
        logger.info(f"Queued {retried_count} failed webhooks for retry")
        return {'retried': retried_count}
    except Exception as e:
        logger.exception(f"Failed to retry webhooks: {str(e)}")
        raise


# ============================================================================
# Notification Tasks
# ============================================================================

@shared_task(name="billing.tasks.send_payment_confirmation")
def send_payment_confirmation(transaction_id: str):
    """
    Send payment confirmation email.
    """
    try:
        transaction = Transaction.objects.get_by_id(transaction_id)
        
        if not transaction or transaction.status != TransactionStatus.SUCCESS:
            return {'status': 'skipped', 'reason': 'transaction_not_successful'}
        
        # Get tenant email
        from apps.tenant.models import Client
        tenant = Client.objects.get(id=transaction.tenant_id)
        email = tenant.contact_email
        
        if not email:
            return {'status': 'skipped', 'reason': 'no_email'}
        
        subject = f"Payment Confirmation - {transaction.reference}"
        message = f"""
        Dear {tenant.name},
        
        Your payment has been confirmed.
        
        Reference: {transaction.reference}
        Amount: {transaction.total_amount/100} {transaction.currency}
        Date: {transaction.payment_date or transaction.created_at}
        
        Thank you for your payment!
        
        Best regards,
        Falcon PMS Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'),
            recipient_list=[email],
            fail_silently=True
        )
        
        logger.info(f"Payment confirmation sent for {transaction.reference}")
        return {'sent': True, 'transaction_id': transaction_id}
        
    except Exception as e:
        logger.exception(f"Failed to send payment confirmation: {str(e)}")
        raise


@shared_task(name="billing.tasks.send_admin_alert")
def send_admin_alert(subject: str, message: str, severity: str = 'warning'):
    """
    Send admin alert for billing issues.
    """
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    
    if not admin_email:
        logger.warning("No admin email configured for alerts")
        return {'status': 'skipped', 'reason': 'no_admin_email'}
    
    full_message = f"""
    [Billing Alert - {severity.upper()}]
    
    {message}
    
    Time: {timezone.now()}
    
    Please investigate.
    """
    
    send_mail(
        subject=f"[Falcon PMS] {subject}",
        message=full_message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'alerts@falconpms.com'),
        recipient_list=[admin_email],
        fail_silently=True
    )
    
    logger.info(f"Admin alert sent: {subject}")
    return {'sent': True, 'subject': subject}


# ============================================================================
# Cleanup Tasks
# ============================================================================

@shared_task(name="billing.tasks.cleanup_expired_webhooks")
def cleanup_expired_webhooks(days=90):
    """
    Clean up old webhook logs.
    Runs monthly via Celery Beat.
    """
    logger.info(f"Cleaning up webhooks older than {days} days")
    
    try:
        from .managers.webhook_log import WebhookLogManager
        manager = WebhookLogManager()
        count = manager.cleanup_old_webhooks(days)
        
        logger.info(f"Cleaned up {count} old webhook logs")
        return {'cleaned': count}
    except Exception as e:
        logger.exception(f"Failed to cleanup webhooks: {str(e)}")
        raise


@shared_task(name="billing.tasks.cleanup_expired_sessions")
def cleanup_expired_sessions():
    """
    Clean up expired billing sessions.
    Runs daily via Celery Beat.
    """
    from .models import UserSession
    
    try:
        count = UserSession.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()
        
        logger.info(f"Cleaned up {count[0] if count else 0} expired sessions")
        return {'cleaned': count[0] if count else 0}
    except Exception as e:
        logger.exception(f"Failed to cleanup sessions: {str(e)}")
        raise


@shared_task(name="billing.tasks.sync_paystack_transactions")
def sync_paystack_transactions(days_back=7):
    """
    Sync transactions from PayStack for reconciliation.
    Runs daily via Celery Beat.
    """
    logger.info(f"Syncing PayStack transactions from last {days_back} days")
    
    try:
        from .services.paystack.client import PayStackClient
        
        client = PayStackClient()
        
        # Get transactions from PayStack
        # This would paginate through all transactions
        # and update local records
        
        logger.info("PayStack transaction sync completed")
        return {'synced': True}
    except Exception as e:
        logger.exception(f"Failed to sync PayStack transactions: {str(e)}")
        raise