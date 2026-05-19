from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class DashboardAccessLog(BaseDashboardModel):
    ACTION_VIEW = 'view'
    ACTION_EXPORT = 'export'
    ACTION_DRILL_DOWN = 'drill_down'
    ACTION_FILTER = 'filter'
    ACTION_SAVE_CONFIG = 'save_config'
    ACTION_ADD_WIDGET = 'add_widget'
    ACTION_REMOVE_WIDGET = 'remove_widget'
    ACTION_CHOICES = [
        (ACTION_VIEW, 'View Dashboard'),
        (ACTION_EXPORT, 'Export Dashboard'),
        (ACTION_DRILL_DOWN, 'Drill Down'),
        (ACTION_FILTER, 'Apply Filter'),
        (ACTION_SAVE_CONFIG, 'Save Configuration'),
        (ACTION_ADD_WIDGET, 'Add Widget'),
        (ACTION_REMOVE_WIDGET, 'Remove Widget'),
    ]
    
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who performed the action")
    dashboard_type = models.CharField(_('dashboard type'), max_length=20, db_index=True)
    action = models.CharField(_('action'), max_length=20, choices=ACTION_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    details = models.JSONField(_('details'), default=dict, blank=True, help_text="Additional context (filters applied, widget ID, etc.)")
    response_time_ms = models.PositiveIntegerField(_('response time ms'), null=True, blank=True)
    
    class Meta:
        db_table = 'dashboard_access_log'
        verbose_name = _('dashboard access log')
        verbose_name_plural = _('dashboard access logs')
        indexes = [
            models.Index(fields=['user_id', 'created_at']),
            models.Index(fields=['dashboard_type', 'action', 'created_at']),
            models.Index(fields=['tenant_id', 'user_id', 'action']),
        ]
    
    def __str__(self):
        return f"{self.user_id} - {self.get_action_display()} - {self.dashboard_type} at {self.created_at}"