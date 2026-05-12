from celery import shared_task
from celery.signals import task_prerun, task_postrun, task_failure
import logging
logger = logging.getLogger(__name__)

@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, **extra):
    """Log task start."""
    logger.info(f"Task starting: {task.name}[{task_id}]")

@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, state=None, **extra):
    """Log task completion."""
    logger.info(f"Task completed: {task.name}[{task_id}] state={state}")

@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, einfo=None, **extra):
    logger.error(f"Task failed: {sender.name if sender else 'unknown'}[{task_id}] error={str(exception)}")

from apps.billing.tasks import (
    sync_subscription_with_stripe,
    process_webhook_event,
    check_expired_subscriptions,
    send_upcoming_invoice_reminder,
    send_payment_failed_notification,
    reset_daily_api_quotas,
    sync_invoices_for_tenant,
    generate_monthly_invoice_report,
    cleanup_old_webhook_events,
    handle_trial_ending_soon,
)

__all__ = [
    'sync_subscription_with_stripe',
    'process_webhook_event',
    'check_expired_subscriptions',
    'send_upcoming_invoice_reminder',
    'send_payment_failed_notification',
    'reset_daily_api_quotas',
    'sync_invoices_for_tenant',
    'generate_monthly_invoice_report',
    'cleanup_old_webhook_events',
    'handle_trial_ending_soon',
]