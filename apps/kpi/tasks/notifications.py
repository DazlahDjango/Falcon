import logging
from celery import shared_task
from typing import Dict
from apps.kpi.models import MonthlyActual, Escalation
from apps.kpi.services import NotificationTrigger, RedAlertService, MissingDataReminder, ThresholdBreachService
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def send_validation_notification_task(self, actual_id: str, notification_type: str) -> None:
    try:
        actual = MonthlyActual.objects.select_related('user', 'kpi').get(id=actual_id)
        trigger = NotificationTrigger()
        supervisor = actual.user.manager
        if supervisor:
            context = {
                'employee_name': actual.user.get_full_name(),
                'kpi_name': actual.kpi.name,
                'actual_value': actual.actual_value,
                'period': f"{actual.year}-{actual.month:02d}",
                'submitted_at': actual.submitted_at
            }
            if notification_type == 'submitted':
                subject = f"KPI Data Pending Validation - {actual.user.get_full_name()}"
                trigger.send_email(
                    to=supervisor.manager.email,
                    subject=subject,
                    template='kpi_validation_pending',
                    context=context
                )
                trigger.send_in_app(
                    user_id=str(supervisor.manager_id),
                    title="KPI Data Pending",
                    message=f"{actual.user.get_full_name()} submitted data for {actual.kpi.name}",
                    data={'actual_id': actual_id}
                )
            elif notification_type == 'approved':
                trigger.send_in_app(
                    user_id=str(actual.user_id),
                    title="KPI Data Approved",
                    message=f"Your data for {actual.kpi.name} has been approved",
                    data={'actual_id': actual_id}
                )       
            elif notification_type == 'rejected':
                trigger.send_in_app(
                    user_id=str(actual.user_id),
                    title="KPI Data Rejected",
                    message=f"Your data for {actual.kpi.name} was rejected. Please review and resubmit.",
                    data={'actual_id': actual_id}
                )
    except MonthlyActual.DoesNotExist:
        logger.warning(f"Actual {actual_id} not found for validation notification")

@shared_task(bind=True)
def send_red_alert_check_task(self, tenant_id: str, year: int, month: int) -> None:
    logger.info(f"Checking red alerts for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        alert_service = RedAlertService()
        alerts = alert_service.check_and_alert(tenant_id, year, month)
        if alerts:
            logger.info(f"Sent {len(alerts)} red alerts")
        return {'alerts_sent': len(alerts)} 
    except Exception as e:
        logger.exception(f"Red alert check failed: {e}")
        raise

@shared_task(bind=True)
def send_missing_data_reminders_task(self, tenant_id: str, year: int, month: int) -> Dict:
    logger.info(f"Sending missing data reminders for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        reminder_service = MissingDataReminder()
        result = reminder_service.send_reminders(tenant_id, year, month) 
        return result 
    except Exception as e:
        logger.exception(f"Missing data reminders failed: {e}")
        raise

@shared_task(bind=True)
def send_threshold_breach_alerts_task(self, tenant_id: str, year: int, month: int) -> Dict:
    logger.info(f"Checking threshold breaches for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        breach_service = ThresholdBreachService()
        result = breach_service.check_threshold_breaches(tenant_id, year, month)
        return result   
    except Exception as e:
        logger.exception(f"Threshold breach check failed: {e}")
        raise

@shared_task(bind=True)
def send_escalation_notification_task(self, escalation_id: str, notification_type: str) -> None:
    try:
        escalation = Escalation.objects.select_related('actual__kpi', 'escalated_to').get(id=escalation_id)
        context = {
            'actual_value': escalation.actual.actual_value,
            'kpi_name': escalation.actual.kpi.name,
            'reason': escalation.reason,
            'period': f"{escalation.actual.year}-{escalation.actual.month:02d}"
        }
        if notification_type == 'created':
            trigger = NotificationTrigger()
            trigger.send_in_app(
                user_id=str(escalation.escalated_to_id),
                title="Escalation Assigned",
                message=f"Please review escalated KPI data: {escalation.actual.kpi.name}",
                data={'escalation_id': escalation_id}
            )
    except Escalation.DoesNotExist:
        logger.warning(f"Escalation {escalation_id} not found")