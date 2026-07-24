# apps/reportplt/models/report_execution.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportExecution(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('timeout', 'Timeout'),
    ]
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, related_name='executions')
    schedule = models.ForeignKey('reportplt.ReportSchedule', on_delete=models.SET_NULL, null=True, blank=True, related_name='executions')
    triggered_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='triggered_executions')
    status = models.CharField(_('status'), max_length=50, choices=STATUS_CHOICES, default='pending', db_index=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    duration = models.FloatField(_('duration (seconds)'), default=0)
    result_summary = models.TextField(_('result summary'), blank=True)
    error_message = models.TextField(_('error message'), blank=True)
    error_traceback = models.TextField(_('error traceback'), blank=True)
    parameters_used = models.JSONField(_('parameters used'), default=dict)
    filters_used = models.JSONField(_('filters used'), default=dict)
    row_count = models.IntegerField(_('row count'), default=0)
    data_size = models.BigIntegerField(_('data size (bytes)'), default=0)
    execution_log = models.JSONField(_('execution log'), default=list)
    retry_count = models.PositiveIntegerField(_('retry count'), default=0)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_execution'
        verbose_name = _('report execution')
        verbose_name_plural = _('report executions')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'status']),
            models.Index(fields=['tenant_id', 'schedule_id', 'status']),
            models.Index(fields=['tenant_id', 'started_at', 'status']),
            models.Index(fields=['tenant_id', 'triggered_by_id']),
        ]
    
    def __str__(self):
        return f"Execution {self.id} - {self.report.name} ({self.status})"
    
    def mark_running(self):
        self.status = 'running'
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])
    
    def mark_completed(self, row_count=0, data_size=0):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.duration = (self.completed_at - self.started_at).total_seconds() if self.started_at else 0
        self.row_count = row_count
        self.data_size = data_size
        self.save(update_fields=['status', 'completed_at', 'duration', 'row_count', 'data_size'])
    
    def mark_failed(self, error_message, error_traceback=''):
        self.status = 'failed'
        self.completed_at = timezone.now()
        self.duration = (self.completed_at - self.started_at).total_seconds() if self.started_at else 0
        self.error_message = error_message
        self.error_traceback = error_traceback
        self.save(update_fields=['status', 'completed_at', 'duration', 'error_message', 'error_traceback'])
    
    def mark_cancelled(self):
        self.status = 'cancelled'
        self.completed_at = timezone.now()
        self.duration = (self.completed_at - self.started_at).total_seconds() if self.started_at else 0
        self.save(update_fields=['status', 'completed_at', 'duration'])
    
    def mark_timeout(self):
        self.status = 'timeout'
        self.completed_at = timezone.now()
        self.duration = (self.completed_at - self.started_at).total_seconds() if self.started_at else 0
        self.save(update_fields=['status', 'completed_at', 'duration'])
    
    def add_log_entry(self, message, level='info'):
        self.execution_log.append({
            'timestamp': timezone.now().isoformat(),
            'level': level,
            'message': message
        })
        self.save(update_fields=['execution_log'])