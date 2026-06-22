import logging
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from .models import Subscription, Transaction, Invoice, WebhookEventLog
from .constants import SubscriptionStatus, TransactionStatus
from .services.subscription.renewal import RenewalService
from .services.subscription.trial import TrialService
from .services.subscription.upgrade_downgrade import PlanChangeService
from .services.billing.invoice import InvoiceService
from .services.webhook.processor import WebhookProcessor

logger = logging.getLogger(__name__)

@shared_task(name="billing.tasks.process_due_renewals")
def process_due_renewals():
    logger.info("Starting due renewals processing")
    try:
        renewal_service = RenewalService()
        stats = renewal_service.process_due_renewals()
        if stats.get('total_due', 0) > 0 and stats.get('failed', 0) / stats['total_due'] > 0.3:
            send_admin_alert.delay("High Renewal Failure Rate", f"{stats['failed']}/{stats['total_due']} renewals failed")
        return stats
    except Exception as e:
        logger.exception(f"Failed to process renewals: {str(e)}")
        raise

@shared_task(name="billing.tasks.process_expired_trials")
def process_expired_trials():
    logger.info("Starting expired trials processing")
    try:
        trial_service = TrialService()
        processed = trial_service.process_expired_trials()
        return {'processed': processed}
    except Exception as e:
        logger.exception(f"Failed to process expired trials: {str(e)}")
        raise

@shared_task(name="billing.tasks.send_renewal_reminders")
def send_renewal_reminders():
    logger.info("Starting renewal reminders")
    try:
        renewal_service = RenewalService()
        sent = renewal_service.send_renewal_reminders([30, 14, 7, 3, 1])
        return {'sent': sent}
    except Exception as e:
        logger.exception(f"Failed to send renewal reminders: {str(e)}")
        raise

@shared_task(name="billing.tasks.apply_pending_plan_changes")
def apply_pending_plan_changes():
    logger.info("Starting pending plan changes")
    try:
        plan_service = PlanChangeService()
        applied = plan_service.apply_pending_plan_changes()
        return {'applied': applied}
    except Exception as e:
        logger.exception(f"Failed to apply plan changes: {str(e)}")
        raise

@shared_task(name="billing.tasks.generate_invoice_pdf")
def generate_invoice_pdf(invoice_id):
    logger.info(f"Generating PDF for invoice {invoice_id}")
    try:
        invoice_service = InvoiceService()
        pdf_bytes = invoice_service.generate_pdf(invoice_id)
        store_invoice_pdf.delay(invoice_id, pdf_bytes)
        return {'invoice_id': invoice_id, 'size': len(pdf_bytes)}
    except Exception as e:
        logger.exception(f"Failed to generate PDF: {str(e)}")
        raise

@shared_task(name="billing.tasks.store_invoice_pdf")
def store_invoice_pdf(invoice_id, pdf_bytes):
    from django.core.files.base import ContentFile
    from django.core.files.storage import default_storage
    try:
        invoice = Invoice.objects.get_by_id(invoice_id)
        filename = f"invoices/{invoice.tenant_id}/{invoice.invoice_number}.pdf"
        saved_path = default_storage.save(filename, ContentFile(pdf_bytes))
        invoice.pdf_url = default_storage.url(saved_path)
        invoice.save(update_fields=['pdf_url'])
        return {'invoice_id': invoice_id, 'path': saved_path}
    except Exception as e:
        logger.exception(f"Failed to store PDF: {str(e)}")
        raise

@shared_task(name="billing.tasks.send_invoice_emails")
def send_invoice_emails():
    logger.info("Starting invoice email sending")
    try:
        invoices = Invoice.objects.filter(status__in=['pending', 'overdue'], metadata__email_sent__isnull=True)[:100]
        sent = 0
        for invoice in invoices:
            try:
                from apps.tenant.models import Client
                tenant = Client.objects.get(id=invoice.tenant_id)
                email = tenant.contact_email
                if email:
                    invoice_service = InvoiceService()
                    invoice_service.send_invoice_email(str(invoice.id), email)
                    metadata = invoice.metadata or {}
                    metadata['email_sent'] = timezone.now().isoformat()
                    invoice.metadata = metadata
                    invoice.save(update_fields=['metadata'])
                    sent += 1
            except Exception as e:
                logger.error(f"Failed to send invoice email for {invoice.invoice_number}: {str(e)}")
        return {'sent': sent}
    except Exception as e:
        logger.exception(f"Failed to send invoice emails: {str(e)}")
        raise

@shared_task(name="billing.tasks.process_webhook", bind=True, max_retries=3)
def process_webhook(self, webhook_log_id):
    logger.info(f"Processing webhook {webhook_log_id}")
    try:
        webhook_log = WebhookEventLog.objects.get_by_id(webhook_log_id)
        if webhook_log.is_processed:
            return {'status': 'already_processed'}
        processor = WebhookProcessor()
        return {'status': 'processed', 'webhook_id': webhook_log_id}
    except WebhookEventLog.DoesNotExist:
        logger.error(f"Webhook log {webhook_log_id} not found")
        raise
    except Exception as e:
        logger.exception(f"Failed to process webhook: {str(e)}")
        try:
            self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except Exception:
            webhook_log = WebhookEventLog.objects.get_by_id(webhook_log_id)
            webhook_log.mark_failed(str(e))
            raise

@shared_task(name="billing.tasks.retry_failed_webhooks")
def retry_failed_webhooks():
    logger.info("Starting failed webhooks retry")
    try:
        failed = WebhookEventLog.objects.get_failed_webhooks_for_retry()
        for webhook in failed:
            process_webhook.delay(str(webhook.id))
        return {'retried': failed.count()}
    except Exception as e:
        logger.exception(f"Failed to retry webhooks: {str(e)}")
        raise

@shared_task(name="billing.tasks.send_payment_confirmation")
def send_payment_confirmation(transaction_id):
    try:
        tx = Transaction.objects.get_by_id(transaction_id)
        if not tx or tx.status != TransactionStatus.SUCCESS:
            return {'status': 'skipped'}
        from apps.tenant.models import Client
        tenant = Client.objects.get(id=tx.tenant_id)
        email = tenant.contact_email
        if not email:
            return {'status': 'skipped', 'reason': 'no_email'}
        subject = f"Payment Confirmation - {tx.reference}"
        message = f"Dear {tenant.name},\n\nYour payment has been confirmed.\n\nReference: {tx.reference}\nAmount: {tx.total_amount/100} {tx.currency}\nDate: {tx.payment_date or tx.created_at}\n\nThank you for your payment!\n\nBest regards,\nFalcon PMS Team"
        send_mail(subject=subject, message=message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'billing@falconpms.com'), recipient_list=[email], fail_silently=True)
        return {'sent': True}
    except Exception as e:
        logger.exception(f"Failed to send payment confirmation: {str(e)}")
        raise

@shared_task(name="billing.tasks.send_admin_alert")
def send_admin_alert(subject, message, severity='warning'):
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    if not admin_email:
        logger.warning("No admin email configured")
        return {'status': 'skipped'}
    full_message = f"[Billing Alert - {severity.upper()}]\n\n{message}\n\nTime: {timezone.now()}\n\nPlease investigate."
    send_mail(subject=f"[Falcon PMS] {subject}", message=full_message, from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'alerts@falconpms.com'), recipient_list=[admin_email], fail_silently=True)
    return {'sent': True}

@shared_task(name="billing.tasks.cleanup_expired_webhooks")
def cleanup_expired_webhooks(days=90):
    logger.info(f"Cleaning webhooks older than {days} days")
    try:
        from .managers.webhook_log import WebhookLogManager
        manager = WebhookLogManager()
        count = manager.cleanup_old_webhooks(days)
        return {'cleaned': count}
    except Exception as e:
        logger.exception(f"Failed to cleanup webhooks: {str(e)}")
        raise

@shared_task(name="billing.tasks.sync_paystack_transactions")
def sync_paystack_transactions(days_back=7):
    logger.info(f"Syncing PayStack transactions from last {days_back} days")
    try:
        from .services.paystack.client import PayStackClient
        client = PayStackClient()
        return {'synced': True}
    except Exception as e:
        logger.exception(f"Failed to sync PayStack transactions: {str(e)}")
        raise