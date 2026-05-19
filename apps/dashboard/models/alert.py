from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class DashboardAlert(BaseDashboardModel):
    ALERT_TYPE_RED_KPI = 'red_kpi'
    ALERT_TYPE_MISSING_DATA = 'missing_data'
    ALERT_TYPE_PENDING_APPROVAL = 'pending_approval'
    ALERT_TYPE_SUBMISSION_DUE = 'submission_due'
    ALERT_TYPE_TARGET_ACHIEVED = 'target_achieved'
    ALERT_TYPE_KPI_TREND = 'kpi_trend'
    ALERT_TYPE_TENANT_EXPIRY = 'tenant_expiry'  # For Super Admin
    ALERT_TYPE_LOW_UTILIZATION = 'low_utilization'  # For Executive
    
    ALERT_TYPE_CHOICES = [
        (ALERT_TYPE_RED_KPI, 'KPI Red Status'),
        (ALERT_TYPE_MISSING_DATA, 'Missing Data'),
        (ALERT_TYPE_PENDING_APPROVAL, 'Pending Approval'),
        (ALERT_TYPE_SUBMISSION_DUE, 'Submission Due'),
        (ALERT_TYPE_TARGET_ACHIEVED, 'Target Achieved'),
        (ALERT_TYPE_KPI_TREND, 'KPI Trend Alert'),
        (ALERT_TYPE_TENANT_EXPIRY, 'Tenant Expiry'),
        (ALERT_TYPE_LOW_UTILIZATION, 'Low Utilization'),
    ]
    
    ALERT_SEVERITY_INFO = 'info'
    ALERT_SEVERITY_WARNING = 'warning'
    ALERT_SEVERITY_CRITICAL = 'critical'
    
    ALERT_SEVERITY_CHOICES = [
        (ALERT_SEVERITY_INFO, 'Info'),
        (ALERT_SEVERITY_WARNING, 'Warning'),
        (ALERT_SEVERITY_CRITICAL, 'Critical'),
    ]
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who configured this alert")
    alert_type = models.CharField(_('alert type'), max_length=30, choices=ALERT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(_('severity'), max_length=10, choices=ALERT_SEVERITY_CHOICES, default=ALERT_SEVERITY_WARNING)
    config = models.JSONField(_('configuration'), default=dict, help_text="Alert-specific config (KPI IDs, thresholds, etc.)")
    frequency = models.CharField(_('frequency'), max_length=20, default='daily',
                                 choices=[('realtime', 'Real-time'), ('hourly', 'Hourly'), ('daily', 'Daily'), ('weekly', 'Weekly')])
    send_email = models.BooleanField(_('send email'), default=True)
    send_in_app = models.BooleanField(_('send in-app'), default=True)
    send_sms = models.BooleanField(_('send SMS'), default=False)
    is_active = models.BooleanField(_('is active'), default=True)
    last_triggered_at = models.DateTimeField(_('last triggered at'), null=True, blank=True)
    trigger_count = models.PositiveIntegerField(_('trigger count'), default=0)
    suppress_until = models.DateTimeField(_('suppress until'), null=True, blank=True, help_text="Do not send alerts until this time")
    class Meta:
        db_table = 'dashboard_alert'
        verbose_name = _('dashboard alert')
        verbose_name_plural = _('dashboard alerts')
        indexes = [
            models.Index(fields=['user_id', 'is_active']),
            models.Index(fields=['alert_type', 'severity']),
            models.Index(fields=['user_id', 'last_triggered_at']),
        ]
    def __str__(self):
        return f"{self.get_alert_type_display()} alert for {self.user_id}"
    
    def should_trigger(self):
        if not self.is_active:
            return False
        if self.suppress_until and timezone.now() < self.suppress_until:
            return False
        return True