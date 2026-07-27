# apps/reportplt/services/scheduler/schedule_manager.py
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from croniter import croniter
from apps.reportplt.models import ReportSchedule, Report
from apps.reportplt.constants import ScheduleFrequency
from apps.reportplt.exceptions import ReportScheduleError, ReportNotFoundError, ReportPermissionError
from apps.reportplt.validators import ScheduleValidator
from apps.accounts.models import User

class ScheduleManager:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.validator = ScheduleValidator()

    def _is_admin(self) -> bool:
        if not self.user:
            return False
        return self.user.is_superuser or self.user.role in ['super_admin', 'client_admin', 'dashboard_champion']

    def create_schedule(self, data: Dict[str, Any]) -> ReportSchedule:
        if not self.user:
            raise ReportPermissionError("User is required to create a schedule")
        report = data.get('report')
        if not report:
            report_id = data.get('report_id')
            try:
                report = Report.objects.get(id=report_id)
            except Report.DoesNotExist:
                raise ReportNotFoundError(f"Report with ID {report_id} not found")
        elif isinstance(report, (str, uuid.UUID)):
            try:
                report = Report.objects.get(id=report)
            except Report.DoesNotExist:
                raise ReportNotFoundError(f"Report with ID {report} not found")
        if report.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to schedule this report")
        errors = self.validator.validate()
        if errors:
            raise ValidationError(errors)
        frequency = data.get('frequency')
        next_run = self._calculate_next_run(frequency, data.get('cron_expression'))
        schedule = ReportSchedule(
            tenant_id=self.user.tenant_id,
            report=report,
            name=data.get('name', f"Schedule for {report.name}"),
            frequency=frequency,
            status='pending',
            is_active=data.get('is_active', True),
            is_paused=data.get('is_paused', False),
            owner=self.user,
            recipients=data.get('recipients', []),
            cc_recipients=data.get('cc_recipients', []),
            bcc_recipients=data.get('bcc_recipients', []),
            delivery_method=data.get('delivery_method', ['email']),
            webhook_url=data.get('webhook_url', ''),
            s3_path=data.get('s3_path', ''),
            next_run_at=next_run,
            expires_at=timezone.now() + timedelta(days=data.get('expiry_days', 30)),
            max_retries=data.get('max_retries', 3),
            retry_delay=data.get('retry_delay', 300),
            cron_expression=data.get('cron_expression', ''),
            timezone=data.get('timezone', 'Africa/Nairobi'),
            custom_params=data.get('custom_params', {}),
            include_attachments=data.get('include_attachments', True),
            compress_attachments=data.get('compress_attachments', False),
            password_protect=data.get('password_protect', False),
            password=data.get('password', ''),
            expiry_days=data.get('expiry_days', 30)
        )
        schedule.full_clean()
        schedule.save()
        return schedule

    def get_schedule(self, schedule_id: uuid.UUID) -> ReportSchedule:
        try:
            schedule = ReportSchedule.objects.get(id=schedule_id)
            if self.user and schedule.owner_id != self.user.id and not self._is_admin():
                raise ReportPermissionError("You do not have permission to view this schedule")
            return schedule
        except ReportSchedule.DoesNotExist:
            raise ReportScheduleError(f"Schedule with ID {schedule_id} not found")

    def get_schedules(self, filters: Optional[Dict] = None) -> List[ReportSchedule]:
        qs = ReportSchedule.objects.filter(tenant_id=self.user.tenant_id if self.user else None)
        if self.user and not self._is_admin():
            qs = qs.filter(owner=self.user)
        if filters:
            if filters.get('report_id'):
                qs = qs.filter(report_id=filters['report_id'])
            if filters.get('frequency'):
                qs = qs.filter(frequency=filters['frequency'])
            if filters.get('status'):
                qs = qs.filter(status=filters['status'])
            if filters.get('is_active') is not None:
                qs = qs.filter(is_active=filters['is_active'])
            if filters.get('is_paused') is not None:
                qs = qs.filter(is_paused=filters['is_paused'])
            if filters.get('search'):
                qs = qs.filter(name__icontains=filters['search'])
        return qs

    def update_schedule(self, schedule_id: uuid.UUID, data: Dict[str, Any]) -> ReportSchedule:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to update this schedule")
        for key, value in data.items():
            if hasattr(schedule, key) and key not in ['id', 'created_at', 'updated_at', 'last_run_at', 'started_at', 'completed_at']:
                setattr(schedule, key, value)
        if 'frequency' in data or 'cron_expression' in data:
            schedule.next_run_at = self._calculate_next_run(
                schedule.frequency,
                schedule.cron_expression
            )
        schedule.full_clean()
        schedule.save()
        return schedule

    def delete_schedule(self, schedule_id: uuid.UUID) -> bool:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to delete this schedule")
        schedule.soft_delete()
        return True

    def pause_schedule(self, schedule_id: uuid.UUID) -> ReportSchedule:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to pause this schedule")
        schedule.is_paused = True
        schedule.save(update_fields=['is_paused'])
        return schedule

    def resume_schedule(self, schedule_id: uuid.UUID) -> ReportSchedule:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to resume this schedule")
        schedule.is_paused = False
        schedule.next_run_at = self._calculate_next_run(schedule.frequency, schedule.cron_expression)
        schedule.save(update_fields=['is_paused', 'next_run_at'])
        return schedule

    def activate_schedule(self, schedule_id: uuid.UUID) -> ReportSchedule:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to activate this schedule")
        schedule.is_active = True
        schedule.next_run_at = self._calculate_next_run(schedule.frequency, schedule.cron_expression)
        schedule.save(update_fields=['is_active', 'next_run_at'])
        return schedule

    def deactivate_schedule(self, schedule_id: uuid.UUID) -> ReportSchedule:
        schedule = self.get_schedule(schedule_id)
        if self.user and schedule.owner_id != self.user.id and not self._is_admin():
            raise ReportPermissionError("You do not have permission to deactivate this schedule")
        schedule.is_active = False
        schedule.save(update_fields=['is_active'])
        return schedule

    def get_due_schedules(self) -> List[ReportSchedule]:
        now = timezone.now()
        return ReportSchedule.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_active=True,
            is_paused=False,
            next_run_at__lte=now,
            status__in=['pending', 'failed']
        )

    def get_overdue_schedules(self) -> List[ReportSchedule]:
        now = timezone.now()
        return ReportSchedule.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_active=True,
            is_paused=False,
            next_run_at__lt=now,
            status__in=['pending', 'failed']
        )

    def get_schedules_for_report(self, report_id: uuid.UUID) -> List[ReportSchedule]:
        return ReportSchedule.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            report_id=report_id,
            is_active=True
        )

    def _calculate_next_run(self, frequency: str, cron_expression: Optional[str] = None) -> datetime:
        now = timezone.now()
        if frequency == ScheduleFrequency.CUSTOM and cron_expression:
            try:
                cron = croniter(cron_expression, now)
                return cron.get_next(datetime)
            except:
                return now + timedelta(minutes=5)
        if frequency == ScheduleFrequency.DAILY:
            return now + timedelta(days=1)
        if frequency == ScheduleFrequency.WEEKLY:
            return now + timedelta(weeks=1)
        if frequency == ScheduleFrequency.BIWEEKLY:
            return now + timedelta(weeks=2)
        if frequency == ScheduleFrequency.MONTHLY:
            return now + timedelta(days=30)
        if frequency == ScheduleFrequency.QUARTERLY:
            return now + timedelta(days=90)
        if frequency == ScheduleFrequency.BIANNUAL:
            return now + timedelta(days=180)
        if frequency == ScheduleFrequency.ANNUAL:
            return now + timedelta(days=365)
        return now + timedelta(hours=1)

    def get_schedule_history(self, schedule_id: uuid.UUID, limit: int = 50) -> List:
        schedule = self.get_schedule(schedule_id)
        return schedule.executions.all().order_by('-created_at')[:limit]

    def get_upcoming_runs(self, schedule_id: uuid.UUID, count: int = 5) -> List[datetime]:
        schedule = self.get_schedule(schedule_id)
        runs = []
        next_run = schedule.next_run_at
        for _ in range(count):
            if next_run:
                runs.append(next_run)
                next_run = self._calculate_next_run_from_date(
                    schedule.frequency,
                    schedule.cron_expression,
                    next_run
                )
        return runs

    def _calculate_next_run_from_date(self, frequency: str, cron_expression: Optional[str], from_date: datetime) -> Optional[datetime]:
        if frequency == ScheduleFrequency.CUSTOM and cron_expression:
            try:
                cron = croniter(cron_expression, from_date)
                return cron.get_next(datetime)
            except:
                return None
        if frequency == ScheduleFrequency.DAILY:
            return from_date + timedelta(days=1)
        if frequency == ScheduleFrequency.WEEKLY:
            return from_date + timedelta(weeks=1)
        if frequency == ScheduleFrequency.BIWEEKLY:
            return from_date + timedelta(weeks=2)
        if frequency == ScheduleFrequency.MONTHLY:
            return from_date + timedelta(days=30)
        if frequency == ScheduleFrequency.QUARTERLY:
            return from_date + timedelta(days=90)
        if frequency == ScheduleFrequency.BIANNUAL:
            return from_date + timedelta(days=180)
        if frequency == ScheduleFrequency.ANNUAL:
            return from_date + timedelta(days=365)
        return None

    def validate_schedule_config(self, config: Dict) -> bool:
        required_keys = ['frequency', 'recipients']
        for key in required_keys:
            if key not in config:
                raise ValidationError(f"Missing required config key: {key}")
        if config.get('frequency') == ScheduleFrequency.CUSTOM and not config.get('cron_expression'):
            raise ValidationError("Cron expression is required for custom frequency")
        if config.get('recipients') and not isinstance(config['recipients'], list):
            raise ValidationError("Recipients must be a list")
        return True