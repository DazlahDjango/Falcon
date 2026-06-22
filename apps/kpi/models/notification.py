from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseKPIModel

class NotificationPreference(BaseKPIModel):
    NOTIFICATION_TYPES = [
        ('kpi_approved', 'KPI Entry Approved'),
        ('kpi_rejected', 'KPI Entry Rejected'),
        ('kpi_submitted', 'KPI Entry Submitted'),
        ('validation_pending', 'Validation Pending'),
        ('validation_overdue', 'Validation Overdue'),
        ('red_alert', 'Red Alert'),
        ('target_assigned', 'Target Assigned'),
        ('target_cascaded', 'Target Cascaded'),
        ('escalation_created', 'Escalation Created'),
        ('escalation_resolved', 'Escalation Resolved'),
        ('report_ready', 'Report Ready'),
        ('pip_initiated', 'PIP Initiated'),
        ('pip_updated', 'PIP Updated'),
        ('pip_completed', 'PIP Completed'),
        ('system_alert', 'System Alert'),
    ]

    CHANNELS = [
        ('email', 'Email'),
        ('in_app', 'In-App'),
        ('push', 'Push Notification'),
    ]

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='kpi_notification_preferences')
    push_enabled = models.BooleanField(_('push notifications enabled'), default=True)
    email_enabled = models.BooleanField(_('email notifications enabled'), default=True)
    in_app_enabled = models.BooleanField(_('in-app notifications enabled'), default=True)
    types = models.JSONField(_('notification type preferences'), default=dict, help_text=_("Per-type enable/disable settings"))

    email_digest_frequency = models.CharField(
        _('email digest frequency'),
        max_length=20,
        choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('never', 'Never')],
        default='daily'
    )

    quiet_hours_start = models.TimeField(_('quiet hours start'), null=True, blank=True)
    quiet_hours_end = models.TimeField(_('quiet hours end'), null=True, blank=True)
    quiet_hours_enabled = models.BooleanField(_('quiet hours enabled'), default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kpi_notification_preferences'
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')
        unique_together = [['tenant_id', 'user']]
        indexes = [
            models.Index(fields=['user', 'tenant_id']),
        ]

    def __str__(self):
        return f"Notification preferences for {self.user.email}"

    def get_enabled_types(self) -> list:
        """Get list of enabled notification types"""
        if not self.types:
            return [t[0] for t in self.NOTIFICATION_TYPES]

        return [t for t, enabled in self.types.items() if enabled]

    def is_type_enabled(self, notification_type: str) -> bool:
        """Check if a specific notification type is enabled"""
        if not self.types:
            return True
        return self.types.get(notification_type, True)

    def is_in_quiet_hours(self) -> bool:
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_enabled:
            return False

        from django.utils import timezone
        now = timezone.now().time()

        if self.quiet_hours_start and self.quiet_hours_end:
            if self.quiet_hours_start <= self.quiet_hours_end:
                return self.quiet_hours_start <= now <= self.quiet_hours_end
            else:
                # Quiet hours span midnight
                return now >= self.quiet_hours_start or now <= self.quiet_hours_end

        return False