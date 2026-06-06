import logging
from typing import List, Dict, Optional
from decimal import Decimal
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.cache import cache
from django.conf import settings
from apps.kpi.models import MonthlyActual, TrafficLight, Score
from apps.accounts.models import User

logger = logging.getLogger(__name__)

CACHE_TTL = 300
CACHE_PREFIX = "kpi_notifications"

RED_ALERT_THRESHOLD = getattr(settings, 'KPI_RED_ALERT_CONSECUTIVE_MONTHS', 2)
VALIDATION_REMINDER_HOURS = getattr(settings, 'KPI_VALIDATION_REMINDER_HOURS', 48)
MISSING_DATA_DAY = getattr(settings, 'KPI_MISSING_DATA_DAY', 5)


class NotificationTrigger:
    def send_email(self, to: str, subject: str, template: str, context: Dict) -> bool:
        try:
            html_content = render_to_string(f"kpi/email/{template}.html", context)
            send_mail(
                subject=subject,
                message="",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to],
                html_message=html_content,
                fail_silently=False
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {str(e)}")
            return False

    def send_in_app(self, user_id: str, title: str, message: str, data: Dict = None) -> None:
        try:
            from ..models import Notification
            Notification.objects.create(
                user_id=user_id,
                title=title,
                message=message,
                data=data or {},
                created_at=timezone.now(),
                is_read=False
            )
        except Exception as e:
            logger.error(f"Failed to create in-app notification: {str(e)}")


class RedAlertService:
    def __init__(self):
        self.notifier = NotificationTrigger()

    def check_and_alert(self, tenant_id: str, year: int, month: int) -> List[Dict]:
        cache_key = f"{CACHE_PREFIX}:red_alerts:{tenant_id}:{year}:{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        red_entries = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED',
            consecutive_red_count__gte=RED_ALERT_THRESHOLD
        ).select_related('score__kpi', 'score__user')

        alerts_sent = []
        for entry in red_entries:
            supervisor = self._get_supervisor(entry.score.user_id)

            context = {
                'user_name': entry.score.user.get_full_name(),
                'kpi_name': entry.score.kpi.name,
                'consecutive_months': entry.consecutive_red_count,
                'current_score': float(entry.score_value),
                'period': f"{year}-{month:02d}",
                'tenant_id': tenant_id
            }

            self.notifier.send_email(
                entry.score.user.email,
                f"Alert: Your KPI {entry.score.kpi.name} is Off Track",
                'red_alert_user',
                context
            )

            if supervisor:
                self.notifier.send_email(
                    supervisor.email,
                    f"Alert: Team Member KPI {entry.score.kpi.name} is Off Track",
                    'red_alert_manager',
                    {**context, 'user_email': entry.score.user.email}
                )

            self.notifier.send_in_app(
                entry.score.user_id,
                "KPI Performance Alert",
                f"Your KPI {entry.score.kpi.name} has been RED for {entry.consecutive_red_count} consecutive months",
                {'kpi_id': str(entry.score.kpi_id), 'score': float(entry.score_value)}
            )

            alerts_sent.append({
                'user': entry.score.user.email,
                'kpi': entry.score.kpi.name,
                'consecutive_months': entry.consecutive_red_count
            })

        cache.set(cache_key, alerts_sent, CACHE_TTL)
        return alerts_sent

    def _get_supervisor(self, user_id: str) -> Optional[User]:
        cache_key = f"{CACHE_PREFIX}:supervisor:{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            user = User.objects.get(id=user_id)
            supervisor = user.manager
            cache.set(cache_key, supervisor, CACHE_TTL)
            return supervisor
        except User.DoesNotExist:
            return None


class MissingDataReminder:
    def __init__(self):
        self.notifier = NotificationTrigger()

    def send_reminders(self, tenant_id: str, year: int, month: int) -> Dict:
        cache_key = f"{CACHE_PREFIX}:missing_reminders:{tenant_id}:{year}:{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        submitted = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values_list('user_id', flat=True).distinct()

        missing_users = users.exclude(id__in=submitted)

        reminders_sent = []
        for user in missing_users:
            context = {
                'user_name': user.get_full_name(),
                'period': f"{year}-{month:02d}",
                'deadline_day': MISSING_DATA_DAY,
                'tenant_id': tenant_id
            }

            self.notifier.send_email(
                user.email,
                f"Reminder: KPI Data Submission Required for {year}-{month:02d}",
                'missing_data_reminder',
                context
            )

            self.notifier.send_in_app(
                str(user.id),
                "KPI Data Reminder",
                f"Please submit your KPI data for {year}-{month:02d} by day {MISSING_DATA_DAY}",
                {'period': f"{year}-{month:02d}"}
            )

            supervisor = self._get_supervisor(str(user.id))
            if supervisor:
                self.notifier.send_email(
                    supervisor.email,
                    f"Reminder: Team Member {user.get_full_name()} Has Not Submitted KPI Data",
                    'supervisor_reminder',
                    {**context, 'user_email': user.email}
                )

            reminders_sent.append(user.email)

        result = {'reminders_sent': len(reminders_sent), 'total_missing': missing_users.count()}
        cache.set(cache_key, result, CACHE_TTL)
        return result

    def _get_supervisor(self, user_id: str) -> Optional[User]:
        cache_key = f"{CACHE_PREFIX}:supervisor:{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            user = User.objects.get(id=user_id)
            supervisor = user.manager
            cache.set(cache_key, supervisor, CACHE_TTL)
            return supervisor
        except User.DoesNotExist:
            return None


class PendingValidationAlert:
    def __init__(self):
        self.notifier = NotificationTrigger()

    def check_pending_validations(self, tenant_id: str, hours_threshold: int = VALIDATION_REMINDER_HOURS) -> List[Dict]:
        cutoff = timezone.now() - timezone.timedelta(hours=hours_threshold)

        pending = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            status='PENDING',
            submitted_at__lte=cutoff
        ).select_related('user', 'kpi')

        supervisor_entries = {}
        for actual in pending:
            supervisor = self._get_supervisor(str(actual.user_id))
            if supervisor:
                key = str(supervisor.id)
                if key not in supervisor_entries:
                    supervisor_entries[key] = {
                        'supervisor': supervisor,
                        'entries': []
                    }
                supervisor_entries[key]['entries'].append(actual)

        alerts_sent = []
        for data in supervisor_entries.values():
            context = {
                'pending_count': len(data['entries']),
                'entries': [
                    {
                        'user': e.user.get_full_name(),
                        'kpi': e.kpi.name,
                        'submitted_at': e.submitted_at.isoformat(),
                        'actual_value': float(e.actual_value)
                    }
                    for e in data['entries'][:10]
                ],
                'tenant_id': tenant_id
            }

            self.notifier.send_email(
                data['supervisor'].email,
                f"Pending Validations: {len(data['entries'])} KPI Entries Awaiting Review",
                'validation_pending',
                context
            )

            self.notifier.send_in_app(
                str(data['supervisor'].id),
                "Pending Validations",
                f"You have {len(data['entries'])} KPI entries pending validation",
                {'pending_count': len(data['entries'])}
            )

            alerts_sent.append({
                'supervisor': data['supervisor'].email,
                'pending_count': len(data['entries'])
            })

        return alerts_sent

    def _get_supervisor(self, user_id: str) -> Optional[User]:
        cache_key = f"{CACHE_PREFIX}:supervisor:{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            user = User.objects.get(id=user_id)
            supervisor = user.manager
            cache.set(cache_key, supervisor, CACHE_TTL)
            return supervisor
        except User.DoesNotExist:
            return None


class ThresholdBreachService:
    def __init__(self):
        self.notifier = NotificationTrigger()

    def check_threshold_breaches(self, tenant_id: str, year: int, month: int) -> Dict:
        cache_key = f"{CACHE_PREFIX}:threshold_breaches:{tenant_id}:{year}:{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

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
                    'user_id': str(score.user_id),
                    'kpi': score.kpi.name,
                    'kpi_id': str(score.kpi_id),
                    'score': float(score.score),
                    'threshold': float(score.kpi.target_min)
                })
            if score.kpi.target_max and score.score > score.kpi.target_max:
                breaches.append({
                    'type': 'MAX_BREACH',
                    'user': score.user.email,
                    'user_id': str(score.user_id),
                    'kpi': score.kpi.name,
                    'kpi_id': str(score.kpi_id),
                    'score': float(score.score),
                    'threshold': float(score.kpi.target_max)
                })

        for breach in breaches:
            self._send_breach_alert(breach)

        result = {'breaches': len(breaches), 'details': breaches}
        cache.set(cache_key, result, CACHE_TTL)
        return result

    def _send_breach_alert(self, breach: Dict) -> None:
        context = {
            'kpi_name': breach['kpi'],
            'score': breach['score'],
            'threshold': breach['threshold'],
            'breach_type': breach['type'],
            'tenant_id': breach.get('tenant_id', '')
        }

        self.notifier.send_email(
            breach['user'],
            f"Threshold Breach Alert: {breach['kpi']}",
            'threshold_breach',
            context
        )

        self.notifier.send_in_app(
            breach['user_id'],
            "KPI Threshold Breach",
            f"Your KPI {breach['kpi']} has exceeded the {breach['type'].lower()} threshold of {breach['threshold']}",
            {'kpi_id': breach['kpi_id'], 'score': breach['score']}
        )