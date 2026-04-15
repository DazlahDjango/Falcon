from typing import List, Dict
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from ..models import MonthlyActual, TrafficLight, Score
from ..constants import RED_ALERT_CONSECUTIVE_MONTHS, VALIDATION_REMINDER_HOURS, MISSING_DATA_DAY

class NotificationTrigger:
    def __init__(self):
        self.channel = None
    
    def send_email(self, to: str, subject: str, template: str, context: Dict):
        html_content = render_to_string(f"email/{template}.html", context)
        send_mail(
            subject=subject,
            message="",
            from_email=None,
            recipient_list=[to],
            html_message=html_content,
            fail_silently=True
        )
    def send_in_app(self, user_id: str, title: str, message: str, data: Dict = None):
        """Send in-app notification"""
        from ..tasks import create_in_app_notification
        create_in_app_notification.delay(user_id, title, message, data)

class RedAlertService:
    def check_and_alert(self, tenant_id: str, year: int, month: int):
        red_entries = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED',
            consecutive_red_count__gte=RED_ALERT_CONSECUTIVE_MONTHS
        ).select_related('score__kpi', 'score__user')
        alerts_sent = []
        for entry in red_entries:
            supervisor = self._get_supervisor(entry.score.user_id)
            context = {
                'user_name': entry.score.user.get_full_name(),
                'kpi_name': entry.score.kpi.name,
                'consecutive_months': entry.consecutive_red_count,
                'current_score': entry.score_value,
                'period': f"{year}-{month:02d}"
            }
            if supervisor:
                self._send_red_alert_email(supervisor.email, context)
            self._send_red_alert_email(entry.score.user.email, context, to_user=True)
            alerts_sent.append({
                'user': entry.score.user.email,
                'kpi': entry.score.kpi.name,
                'consecutive_months': entry.consecutive_red_count
            })
        return alerts_sent
    
    def _get_supervisor(self, user_id: str):
        from apps.organisations.models import Hierarchy
        supervisor = Hierarchy.objects.filter(employee_id=user_id).first()
        return supervisor.manager if supervisor else None
    def _send_red_alert_email(self, to: str, context: Dict, to_user: bool = False):
        subject = f"Alert: KPI Performance at Risk - {context['kpi_name']}"
        if to_user:
            subject = f"Action Required: Your KPI {context['kpi_name']} is Off Track"
        from ..tasks import send_red_alert_email
        send_red_alert_email.delay(to, subject, context)

class MissingDataReminder:
    def send_reminders(self, tenant_id: str, year: int, month: int):
        from apps.accounts.models import User
        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        submitted_users = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values_list('user_id', flat=True).distinct()
        missing_users = users.exclude(id__in=submitted_users)
        reminders_sent = []
        for user in missing_users:
            context = {
                'user_name': user.get_full_name(),
                'period': f"{year}-{month:02d}",
                'deadline_day': MISSING_DATA_DAY
            }
            self._send_reminder_email(user.email, context)
            supervisor = self._get_supervisor(str(user.id))
            if supervisor:
                self._send_supervisor_reminder_email(supervisor.email, user.get_full_name(), context)
            reminders_sent.append(user.email)
        return {'reminders_sent': len(reminders_sent)}
    def _get_supervisor(self, user_id: str):
        from apps.organisations.models import Hierarchy
        supervisor = Hierarchy.objects.filter(employee_id=user_id).first()
        return supervisor.manager if supervisor else None
    
    def _send_reminder_email(self, to: str, context: Dict):
        from ..tasks import send_missing_data_reminder
        send_missing_data_reminder.delay(to, context)
    def _send_supervisor_reminder_email(self, to: str, user_name: str, context: Dict):
        context['user_name'] = user_name
        from ..tasks import send_supervisor_reminder
        send_supervisor_reminder.delay(to, context)

class PendingValidationAlert:
    def check_pending_validations(self, tenant_id: str, hours_threshold: int = VALIDATION_REMINDER_HOURS):
        cutoff = timezone.now() - timezone.timedelta(hours=hours_threshold)
        pending = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            status='PENDING',
            submitted_at__lte=cutoff
        ).select_related('user')
        supervisor_entries = {}
        for actual in pending:
            supervisor = self._get_supervisor(str(actual.user_id))
            if supervisor:
                if supervisor.id not in supervisor_entries:
                    supervisor_entries[supervisor.id] = {
                        'supervisor': supervisor,
                        'entries': []
                    }
                supervisor_entries[supervisor.id]['entries'].append(actual)
        alerts_sent = []
        for data in supervisor_entries.values():
            context = {
                'pending_count': len(data['entries']),
                'entries': [
                    {
                        'user': e.user.get_full_name(),
                        'kpi': e.kpi.name,
                        'submitted_at': e.submitted_at,
                        'actual_value': e.actual_value
                    }
                    for e in data['entries']
                ]
            }
            self._send_validation_alert_email(data['supervisor'].email, context)
            alerts_sent.append({
                'supervisor': data['supervisor'].email,
                'pending_count': len(data['entries'])
            })
        return alerts_sent
    def _get_supervisor(self, user_id: str):
        from apps.organisations.models import Hierarchy
        supervisor = Hierarchy.objects.filter(employee_id=user_id).first()
        return supervisor.manager if supervisor else None
    def _send_validation_alert_email(self, to: str, context: Dict):
        from ..tasks import send_validation_alert
        send_validation_alert.delay(to, context)

class ThresholdBreachService:
    def check_threshold_breaches(self, tenant_id: str, year: int, month: int):
        scores = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).select_related('kpi', 'user')
        breaches = []
        for score in scores:
            if score.kpi.target_min and score.score < score.kpi.target_min:
                breaches.append({
                    'type': 'MIN_BREACH',
                    'user': score.user.email,
                    'kpi': score.kpi.name,
                    'score': score.score,
                    'threshold': score.kpi.target_min
                })
            if score.kpi.target_max and score.score > score.kpi.target_max:
                breaches.append({
                    'type': 'MAX_BREACH',
                    'user': score.user.email,
                    'kpi': score.kpi.name,
                    'score': score.score,
                    'threshold': score.kpi.target_max
                })
        for breach in breaches:
            self._send_breach_alert(breach)
        return {'breaches': len(breaches), 'details': breaches}
    def _send_breach_alert(self, breach: Dict):
        from ..tasks import send_threshold_breach_alert
        send_threshold_breach_alert.delay(breach)