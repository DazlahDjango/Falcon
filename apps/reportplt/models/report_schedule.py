# apps/reportplt/models/report_schedule.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import ScheduleManager

class ReportSchedule(BaseModel):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('biannual', 'Bi-Annual'),
        ('annual', 'Annual'),
        ('custom', 'Custom'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    DELIVERY_CHOICES = [
        ('email', 'Email'),
        ('download', 'Download Link'),
        ('s3', 'S3 Storage'),
        ('webhook', 'Webhook'),
        ('multiple', 'Multiple Methods'),
    ]
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, related_name='schedules')
    name = models.CharField(_('name'), max_length=255)
    frequency = models.CharField(_('frequency'), max_length=50, choices=FREQUENCY_CHOICES, db_index=True)
    status = models.CharField(_('status'), max_length=50, choices=STATUS_CHOICES, default='pending', db_index=True)
    is_active = models.BooleanField(_('is active'), default=True)
    is_paused = models.BooleanField(_('is paused'), default=False)
    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='schedule_owner')
    recipients = models.JSONField(_('recipients'), default=list, blank=True)
    cc_recipients = models.JSONField(_('cc recipients'), default=list, blank=True)
    bcc_recipients = models.JSONField(_('bcc recipients'), default=list, blank=True)
    delivery_method = models.JSONField(_('delivery method'), default=list, blank=True)
    webhook_url = models.URLField(_('webhook URL'), blank=True)
    s3_path = models.CharField(_('S3 path'), max_length=500, blank=True)
    next_run_at = models.DateTimeField(_('next run at'), db_index=True)
    last_run_at = models.DateTimeField(_('last run at'), null=True, blank=True)
    last_run_status = models.CharField(_('last run status'), max_length=50, blank=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)
    retry_count = models.PositiveIntegerField(_('retry count'), default=0)
    max_retries = models.PositiveIntegerField(_('max retries'), default=3)
    retry_delay = models.PositiveIntegerField(_('retry delay (seconds)'), default=300)
    cron_expression = models.CharField(_('cron expression'), max_length=100, blank=True)
    timezone = models.CharField(_('timezone'), max_length=50, default='Africa/Nairobi')
    custom_params = models.JSONField(_('custom parameters'), default=dict, blank=True)
    include_attachments = models.BooleanField(_('include attachments'), default=True)
    compress_attachments = models.BooleanField(_('compress attachments'), default=False)
    password_protect = models.BooleanField(_('password protect'), default=False)
    password = models.CharField(_('password'), max_length=128, blank=True)
    expiry_days = models.PositiveIntegerField(_('expiry days'), default=30)
    
    objects = ScheduleManager()
    
    class Meta:
        db_table = 'reportplt_schedule'
        verbose_name = _('report schedule')
        verbose_name_plural = _('report schedules')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'is_active']),
            models.Index(fields=['tenant_id', 'frequency', 'status']),
            models.Index(fields=['tenant_id', 'next_run_at', 'is_active']),
            models.Index(fields=['tenant_id', 'is_paused', 'is_active']),
            models.Index(fields=['tenant_id', 'expires_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.frequency}"
    
    def is_due(self):
        return timezone.now() >= self.next_run_at
    
    def is_expired(self):
        return self.expires_at and timezone.now() >= self.expires_at
    
    def mark_running(self):
        self.status = 'running'
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.last_run_at = timezone.now()
        self.last_run_status = 'success'
        self.save(update_fields=['status', 'completed_at', 'last_run_at', 'last_run_status'])
    
    def mark_failed(self):
        self.status = 'failed'
        self.last_run_status = 'failed'
        self.retry_count += 1
        self.save(update_fields=['status', 'last_run_status', 'retry_count'])
    
    def mark_cancelled(self):
        self.status = 'cancelled'
        self.is_active = False
        self.save(update_fields=['status', 'is_active'])
    
    def schedule_next_run(self):
        from datetime import timedelta
        if self.frequency == 'daily':
            delta = timedelta(days=1)
        elif self.frequency == 'weekly':
            delta = timedelta(weeks=1)
        elif self.frequency == 'biweekly':
            delta = timedelta(weeks=2)
        elif self.frequency == 'monthly':
            delta = timedelta(days=30)
        elif self.frequency == 'quarterly':
            delta = timedelta(days=90)
        elif self.frequency == 'biannual':
            delta = timedelta(days=180)
        elif self.frequency == 'annual':
            delta = timedelta(days=365)
        else:
            from croniter import croniter
            base = timezone.now()
            cron = croniter(self.cron_expression, base)
            delta = cron.get_next() - base
        self.next_run_at = timezone.now() + delta
        self.status = 'pending'
        self.save(update_fields=['next_run_at', 'status'])
    
    def can_retry(self):
        return self.retry_count < self.max_retries
    
    def get_recipient_list(self):
        return self.recipients + self.cc_recipients + self.bcc_recipients