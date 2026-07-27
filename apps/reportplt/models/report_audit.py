# apps/reportplt/models/report_audit.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportAudit(BaseModel):
    ACTION_CHOICES = [
        ('view', 'View'),
        ('create', 'Create'),
        ('edit', 'Edit'),
        ('delete', 'Delete'),
        ('export', 'Export'),
        ('share', 'Share'),
        ('schedule', 'Schedule'),
        ('generate', 'Generate'),
        ('refresh', 'Refresh'),
        ('archive', 'Archive'),
        ('restore', 'Restore'),
        ('permission_change', 'Permission Change'),
        ('config_change', 'Configuration Change'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs')
    dashboard = models.ForeignKey('reportplt.ReportDashboard', on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='report_audits')
    action = models.CharField(_('action'), max_length=50, choices=ACTION_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    session_id = models.CharField(_('session ID'), max_length=100, blank=True)
    details = models.JSONField(_('details'), default=dict)
    changes = models.JSONField(_('changes'), default=dict)
    previous_value = models.JSONField(_('previous value'), null=True, blank=True)
    new_value = models.JSONField(_('new value'), null=True, blank=True)
    success = models.BooleanField(_('success'), default=True)
    error_message = models.TextField(_('error message'), blank=True)
    duration = models.FloatField(_('duration (seconds)'), default=0)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_audit'
        verbose_name = _('report audit log')
        verbose_name_plural = _('report audit logs')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'action']),
            models.Index(fields=['tenant_id', 'user_id', 'action']),
            models.Index(fields=['tenant_id', 'created_at', 'action']),
            models.Index(fields=['tenant_id', 'ip_address']),
            models.Index(fields=['tenant_id', 'dashboard_id']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        user_name = self.user.email if self.user else 'Anonymous'
        return f"{user_name} - {self.action} - {self.created_at}"
    
    @classmethod
    def log_action(cls, user, action, report=None, dashboard=None, ip_address=None, user_agent=None, details=None, success=True, error_message=''):
        return cls.objects.create(
            tenant_id=report.tenant_id if report else (dashboard.tenant_id if dashboard else None),
            user=user,
            report=report,
            dashboard=dashboard,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {},
            success=success,
            error_message=error_message,
        )
    
    @classmethod
    def log_config_change(cls, user, report, previous_config, new_config, ip_address=None, user_agent=None):
        return cls.log_action(
            user=user,
            action='config_change',
            report=report,
            ip_address=ip_address,
            user_agent=user_agent,
            details={'previous': previous_config, 'new': new_config},
        )