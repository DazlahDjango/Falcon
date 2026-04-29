import logging
from django.core.cache import cache
from celery import shared_task
from datetime import timedelta
from typing import Dict
from django.utils import timezone
from ..models import CalculationLog
from apps.tenant.models import Client
from .calculations import calculate_period_scores_task
from .notifications import send_missing_data_reminders_task, send_red_alert_check_task
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def scheduled_calculation_task(self) -> None:
    now = timezone.now()
    tenants = Client.objects.filter(is_active=True)
    for tenant in tenants:
        calculate_period_scores_task.delay(
            tenant_id=str(tenant.id),
            year=now.year,
            month=now.month
        )

@shared_task(bind=True)
def scheduled_reminder_task(self) -> None:
    now = timezone.now()
    if now.day >= 5:
        tenants = Client.objects.filter(is_active=True)
        for tenant in tenants:
            send_missing_data_reminders_task.delay(
                tenant_id=str(tenant.id),
                year=now.year,
                month=now.month
            )

@shared_task(bind=True)
def scheduled_red_alert_task(self) -> None:
    now = timezone.now()
    tenants = Client.objects.filter(is_active=True)
    for tenant in tenants:
        send_red_alert_check_task.delay(
            tenant_id=str(tenant.id),
            year=now.year,
            month=now.month
        )

@shared_task(bind=True)
def create_in_app_notification_task(self, user_id: str, title: str, message: str, data: Dict = None) -> None:
    try:
        from apps.accounts.models import User
        user = User.objects.get(id=user_id)
        # Check if user wants this type of notification
        # This would integrate with accounts preferences
        logger.info(f"Created in-app notification for user {user_id}: {title}")
    except User.DoesNotExist:
        logger.warning(f"User {user_id} not found for notification")