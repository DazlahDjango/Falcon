from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from .base import BillingBaseModel

class QuotaLimit(BillingBaseModel):
    subscription = models.OneToOneField('billing.Subscription', on_delete=models.CASCADE, related_name='quota_limits', verbose_name=_('subscription'))
    max_users = models.PositiveIntegerField(_('max users'), default=10)
    max_admins = models.PositiveIntegerField(_('max admins'), default=5)
    max_kpis = models.PositiveIntegerField(_('max KPIs'), default=50)
    max_kpi_frameworks = models.PositiveIntegerField(_('max KPI frameworks'), default=5)
    max_departments = models.PositiveIntegerField(_('max departments'), default=20)
    max_storage_mb = models.PositiveIntegerField(_('max storage (MB)'), default=10240)
    max_file_size_mb = models.PositiveIntegerField(_('max file size (MB)'), default=50)
    max_api_calls_per_day = models.PositiveIntegerField(_('max API calls per day'), default=10000)
    max_api_calls_per_minute = models.PositiveIntegerField(_('max API calls per minute'), default=100)
    max_concurrent_sessions = models.PositiveIntegerField(_('max concurrent sessions'), default=5)
    max_export_rows = models.PositiveIntegerField(_('max export rows'), default=100000)
    allow_custom_branding = models.BooleanField(_('allow custom branding'), default=False)
    allow_api_access = models.BooleanField(_('allow API access'), default=False)
    allow_sso = models.BooleanField(_('allow SSO'), default=False)
    allow_advanced_analytics = models.BooleanField(_('allow advanced analytics'), default=False)
    allow_audit_logs = models.BooleanField(_('allow audit logs'), default=True)
    allow_reports = models.BooleanField(_('allow reports'), default=True)
    allow_export = models.BooleanField(_('allow export'), default=True)
    allow_webhooks = models.BooleanField(_('allow webhooks'), default=False)
    allow_multi_currency = models.BooleanField(_('allow multi-currency'), default=False)
    allow_priority_support = models.BooleanField(_('allow priority support'), default=False)
    
    support_level = models.CharField(
        _('support level'),
        max_length=20,
        choices=[
            ('basic', 'Basic'),
            ('standard', 'Standard'),
            ('premium', 'Premium'),
            ('enterprise', 'Enterprise'),
        ],
        default='basic'
    )
    daily_subscription_changes = models.PositiveIntegerField(_('daily subscription changes'), default=5)
    monthly_invoice_limit = models.PositiveIntegerField(_('monthly invoice limit'), default=1000)
    custom_limits = models.JSONField(_('custom limits'), default=dict, blank=True)
    
    class Meta:
        db_table = 'billing_quota_limit'
        verbose_name = _('quota limit')
        verbose_name_plural = _('quota limits')
        indexes = [
            models.Index(fields=['subscription']),
            models.Index(fields=['max_users', 'max_kpis']),
        ]
    
    def __str__(self):
        return f"Quotas for {self.subscription.tenant.name}"
    
    def get_limit(self, limit_name: str, default=None):
        return getattr(self, limit_name, default)
    
    def is_feature_allowed(self, feature: str) -> bool:
        feature_map = {
            'custom_branding': self.allow_custom_branding,
            'api_access': self.allow_api_access,
            'sso': self.allow_sso,
            'advanced_analytics': self.allow_advanced_analytics,
            'audit_logs': self.allow_audit_logs,
            'reports': self.allow_reports,
            'export': self.allow_export,
            'webhooks': self.allow_webhooks,
            'multi_currency': self.allow_multi_currency,
            'priority_support': self.allow_priority_support,
        }
        return feature_map.get(feature, False)
    
    def to_dict(self) -> dict:
        return {
            'max_users': self.max_users,
            'max_admins': self.max_admins,
            'max_kpis': self.max_kpis,
            'max_storage_mb': self.max_storage_mb,
            'max_api_calls_per_day': self.max_api_calls_per_day,
            'features': {
                'custom_branding': self.allow_custom_branding,
                'api_access': self.allow_api_access,
                'sso': self.allow_sso,
                'advanced_analytics': self.allow_advanced_analytics,
                'audit_logs': self.allow_audit_logs,
                'reports': self.allow_reports,
                'export': self.allow_export,
            },
            'support_level': self.support_level,
        }

class QuotaUsage(BillingBaseModel):
    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='quota_usage', verbose_name=_('tenant'))
    snapshot_date = models.DateField(_('snapshot date'), db_index=True)
    current_users = models.PositiveIntegerField(_('current users'), default=0)
    current_admins = models.PositiveIntegerField(_('current admins'), default=0)
    current_kpis = models.PositiveIntegerField(_('current KPIs'), default=0)
    current_kpi_frameworks = models.PositiveIntegerField(_('current KPI frameworks'), default=0)
    current_departments = models.PositiveIntegerField(_('current departments'), default=0)
    current_storage_mb = models.PositiveIntegerField(_('current storage (MB)'), default=0)
    api_calls_today = models.PositiveIntegerField(_('API calls today'), default=0)
    last_api_reset = models.DateTimeField(_('last API reset'), auto_now_add=True)
    api_calls_this_minute = models.PositiveSmallIntegerField(_('API calls this minute'), default=0)
    last_minute_reset = models.DateTimeField(_('last minute reset'), auto_now_add=True)
    subscription_changes_today = models.PositiveSmallIntegerField(_('subscription changes today'), default=0)
    active_sessions = models.PositiveIntegerField(_('active sessions'), default=0)
    pending_invitations = models.PositiveIntegerField(_('pending invitations'), default=0)
    
    class Meta:
        db_table = 'billing_quota_usage'
        verbose_name = _('quota usage')
        verbose_name_plural = _('quota usages')
        ordering = ['-snapshot_date']
        unique_together = [['tenant', 'snapshot_date']]
        indexes = [
            models.Index(fields=['tenant', 'snapshot_date']),
            models.Index(fields=['snapshot_date']),
            models.Index(fields=['current_users', 'current_kpis']),
        ]
    
    def __str__(self):
        return f"Usage for {self.tenant.name} - {self.snapshot_date}"
    
    def reset_api_counter(self):
        self.api_calls_today = 0
        self.last_api_reset = timezone.now()
        self.save(update_fields=['api_calls_today', 'last_api_reset'])
    
    def reset_minute_counter(self):
        self.api_calls_this_minute = 0
        self.last_minute_reset = timezone.now()
        self.save(update_fields=['api_calls_this_minute', 'last_minute_reset'])
    
    def reset_subscription_changes(self):
        self.subscription_changes_today = 0
        self.save(update_fields=['subscription_changes_today'])
    
    def increment_api_calls(self, count: int = 1):
        self.api_calls_today += count
        self.api_calls_this_minute += count
        self.save(update_fields=['api_calls_today', 'api_calls_this_minute'])
    
    def increment_subscription_changes(self, count: int = 1):
        self.subscription_changes_today += count
        self.save(update_fields=['subscription_changes_today'])
    
    def update_from_counts(self, users: int = None, admins: int = None, kpis: int = None):
        if users is not None:
            self.current_users = users
        if admins is not None:
            self.current_admins = admins
        if kpis is not None:
            self.current_kpis = kpis
        self.save()
    
    def get_usage_percentage(self, limit_field: str, limit_value: int) -> float:
        current = getattr(self, limit_field, 0)
        if limit_value <= 0:
            return 0.0
        return round((current / limit_value) * 100, 2)
    
    def is_nearing_limit(self, limit_field: str, limit_value: int, threshold: float = 0.9) -> bool:
        percentage = self.get_usage_percentage(limit_field, limit_value)
        return percentage >= threshold * 100