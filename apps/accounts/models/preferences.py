"""
Preferences model — User and tenant preferences.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .user import User

class UserPreference(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences', verbose_name=_('user'))
    # Notification preferences
    NOTIFY_EMAIL = 'email'
    NOTIFY_IN_APP = 'in_app'
    NOTIFY_PUSH = 'push'
    NOTIFY_SMS = 'sms'
    
    NOTIFICATION_CHANNELS = [
        (NOTIFY_EMAIL, 'Email'),
        (NOTIFY_IN_APP, 'In-App'),
        (NOTIFY_PUSH, 'Push'),
        (NOTIFY_SMS, 'SMS'),
    ]
    
    # Notification settings per event type
    notification_settings = models.JSONField(_('notification settings'), default=dict, help_text='Per event type notification preferences')
    # Dashboard preferences
    dashboard_preferences = models.JSONField(_('dashboard preferences'), default=dict, help_text='Dashboard layout, widgets, etc.')
    # Display preferences
    items_per_page = models.PositiveSmallIntegerField(_('items per page'), default=50)
    default_dashboard = models.CharField(_('default dashboard'), max_length=100, default='overview')
    collapsed_sidebar = models.BooleanField(_('collapsed sidebar'), default=False)
    # Privacy preferences
    public_profile = models.BooleanField(_('public profile'), default=False)
    show_email = models.BooleanField(_('show email'), default=False)
    show_phone = models.BooleanField(_('show phone'), default=False)
    # Working preferences
    work_start_time = models.TimeField(_('work start time'), null=True, blank=True)
    work_end_time = models.TimeField(_('work end time'), null=True, blank=True)
    working_days = models.JSONField(_('working days'), default=list, help_text='List of working days (0=Monday, 6=Sunday)')
    
    class Meta:
        db_table = 'accounts_user_preference'
        verbose_name = _('user preference')
        verbose_name_plural = _('user preferences')
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
    
    def get_notification_channel(self, event_type):
        """Get preferred notification channel for an event type."""
        return self.notification_settings.get(event_type, [self.NOTIFY_IN_APP, self.NOTIFY_EMAIL])
    
    def should_notify(self, event_type, channel):
        """Check if user should be notified for an event via specific channel."""
        channels = self.get_notification_channel(event_type)
        return channel in channels


class TenantPreference(BaseModel):
    """
    Tenant-wide preferences and settings.
    """
    # Tenant reference (FK to Client model in tenant app)
    client_id = models.UUIDField(_('client ID'), db_index=True, unique=True)
    # Branding
    logo_url = models.URLField(_('logo URL'), blank=True)
    favicon_url = models.URLField(_('favicon URL'), blank=True)
    primary_color = models.CharField(_('primary color'), max_length=7, default='#2563eb')
    secondary_color = models.CharField(_('secondary color'), max_length=7, default='#7c3aed')
    # Features enabled
    features = models.JSONField(_('features'), default=dict, help_text='Enabled features per module')
    # Performance settings
    kpi_validation_required = models.BooleanField(_('KPI validation required'), default=True)
    supervisor_approval_required = models.BooleanField(_('supervisor approval required'), default=True)
    review_cycles = models.JSONField(_('review cycles'), default=dict, help_text='Mid-year, end-year schedule')
    # Security settings
    mfa_required_roles = models.JSONField(_('MFA required roles'), default=list, help_text='Roles that require MFA')
    password_expiry_days = models.PositiveSmallIntegerField(_('password expiry days'), default=90)
    session_timeout_minutes = models.PositiveSmallIntegerField(_('session timeout minutes'), default=480)
    # Localization
    default_language = models.CharField(_('default language'), max_length=10, default='en')
    available_languages = models.JSONField(_('available languages'), default=list)
    default_timezone = models.CharField(_('default timezone'), max_length=50, default='Africa/Nairobi')
    # Data retention
    audit_log_retention_days = models.PositiveSmallIntegerField(_('audit log retention days'), default=365)
    session_retention_days = models.PositiveSmallIntegerField(_('session retention days'), default=90)
    # API settings
    api_rate_limit = models.PositiveSmallIntegerField(_('API rate limit'), default=100, help_text='Requests per minute')
    webhook_url = models.URLField(_('webhook URL'), blank=True)
    class Meta:
        db_table = 'accounts_tenant_preference'
        verbose_name = _('tenant preference')
        verbose_name_plural = _('tenant preferences')
    
    def __str__(self):
        return f"Preferences for client {self.client_id}"
    
    def is_feature_enabled(self, feature_name):
        """Check if a feature is enabled for this tenant."""
        return self.features.get(feature_name, False)
    
    def requires_mfa(self, role):
        """Check if role requires MFA for this tenant."""
        return role in self.mfa_required_roles