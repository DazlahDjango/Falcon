from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class ExportSchedule(BaseDashboardModel):
    EXPORT_FORMAT_PDF = 'pdf'
    EXPORT_FORMAT_EXCEL = 'excel'
    EXPORT_FORMAT_CSV = 'csv'
    
    EXPORT_FORMAT_CHOICES = [
        (EXPORT_FORMAT_PDF, 'PDF'),
        (EXPORT_FORMAT_EXCEL, 'Excel'),
        (EXPORT_FORMAT_CSV, 'CSV'),
    ]
    
    SCHEDULE_TYPE_DAILY = 'daily'
    SCHEDULE_TYPE_WEEKLY = 'weekly'
    SCHEDULE_TYPE_MONTHLY = 'monthly'
    SCHEDULE_TYPE_QUARTERLY = 'quarterly'
    
    SCHEDULE_TYPE_CHOICES = [
        (SCHEDULE_TYPE_DAILY, 'Daily'),
        (SCHEDULE_TYPE_WEEKLY, 'Weekly'),
        (SCHEDULE_TYPE_MONTHLY, 'Monthly'),
        (SCHEDULE_TYPE_QUARTERLY, 'Quarterly'),
    ]
    
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who owns this export schedule")
    dashboard_type = models.CharField(_('dashboard type'), max_length=20, help_text="Type of dashboard to export")
    format = models.CharField(_('format'), max_length=10, choices=EXPORT_FORMAT_CHOICES, default=EXPORT_FORMAT_PDF)
    schedule_type = models.CharField(_('schedule type'), max_length=20, choices=SCHEDULE_TYPE_CHOICES)
    schedule_config = models.JSONField(_('schedule config'), default=dict, help_text="Day of week, day of month, etc.")
    filters = models.JSONField(_('filters'), default=dict, blank=True, help_text="Period, department, KPI filters")
    recipients = models.JSONField(_('recipients'), default=list, help_text="List of email addresses to send to")
    is_active = models.BooleanField(_('is active'), default=True)
    last_run_at = models.DateTimeField(_('last run at'), null=True, blank=True)
    last_run_status = models.CharField(_('last run status'), max_length=20, blank=True)
    next_run_at = models.DateTimeField(_('next run at'), db_index=True)
    
    class Meta:
        db_table = 'dashboard_export_schedule'
        verbose_name = _('export schedule')
        verbose_name_plural = _('export schedules')
        indexes = [
            models.Index(fields=['user_id', 'is_active']),
            models.Index(fields=['next_run_at']),
            models.Index(fields=['dashboard_type', 'schedule_type']),
        ]
    
    def __str__(self):
        return f"{self.get_schedule_type_display()} export of {self.dashboard_type} for {self.user_id}"