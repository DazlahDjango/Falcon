from typing import Dict
import logging
from celery import shared_task
from django.utils import timezone
from apps.tenant.models import Organization
from .calculations import calculate_period_scores_task
from .notifications import send_missing_data_reminders_task, send_red_alert_check_task

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def scheduled_calculation_task(self) -> Dict:
    now = timezone.now()
    tenants = Organization.objects.filter(is_active=True)
    scheduled = 0

    for tenant in tenants:
        calculate_period_scores_task.delay(
            tenant_id=str(tenant.id),
            year=now.year,
            month=now.month
        )
        scheduled += 1

    logger.info(f"Scheduled calculations for {scheduled} tenants")
    return {'status': 'SUCCESS', 'scheduled': scheduled}


@shared_task(bind=True)
def scheduled_reminder_task(self) -> Dict:
    now = timezone.now()
    # Send reminders on the 5th day of the month
    if now.day >= 5:
        tenants = Organization.objects.filter(is_active=True)
        scheduled = 0

        for tenant in tenants:
            send_missing_data_reminders_task.delay(
                tenant_id=str(tenant.id),
                year=now.year,
                month=now.month
            )
            scheduled += 1

        logger.info(f"Scheduled reminders for {scheduled} tenants")
        return {'status': 'SUCCESS', 'scheduled': scheduled}

    logger.info("Reminder task skipped - not yet the 5th day of month")
    return {'status': 'SKIPPED', 'reason': 'Not yet the 5th day'}


@shared_task(bind=True)
def scheduled_red_alert_task(self) -> Dict:
    now = timezone.now()
    tenants = Organization.objects.filter(is_active=True)
    scheduled = 0

    for tenant in tenants:
        send_red_alert_check_task.delay(
            tenant_id=str(tenant.id),
            year=now.year,
            month=now.month
        )
        scheduled += 1

    logger.info(f"Scheduled red alert checks for {scheduled} tenants")
    return {'status': 'SUCCESS', 'scheduled': scheduled}


@shared_task(bind=True)
def create_in_app_notification_task(self, user_id: str, title: str, message: str, data: Dict = None) -> Dict:
    try:
        from apps.accounts.models import User
        user = User.objects.get(id=user_id)

        try:
            from apps.notifications.models import Notification
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                data=data or {},
                created_at=timezone.now(),
                is_read=False
            )
            notification_id = str(notification.id)
        except (ImportError, Exception):
            notification_id = "logged_only"

        logger.info(f"Created in-app notification for user {user_id}: {title}")
        return {'status': 'SUCCESS', 'notification_id': notification_id}
    except User.DoesNotExist:
        logger.warning(f"User {user_id} not found for notification")
        return {'status': 'FAILED', 'error': 'User not found'}
    except Exception as e:
        logger.exception(f"Create notification failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}