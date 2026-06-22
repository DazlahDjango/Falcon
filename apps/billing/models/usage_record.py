from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class UsageRecord(BaseBillingModel):
    USAGE_TYPE_USERS = 'users'
    USAGE_TYPE_KPIS = 'kpis'
    USAGE_TYPE_API_CALLS = 'api_calls'
    USAGE_TYPE_STORAGE = 'storage'
    USAGE_TYPE_DEPARTMENTS = 'departments'
    USAGE_TYPE_CHOICES = [
        (USAGE_TYPE_USERS, 'Users'),
        (USAGE_TYPE_KPIS, 'KPIs'),
        (USAGE_TYPE_API_CALLS, 'API Calls'),
        (USAGE_TYPE_STORAGE, 'Storage (MB)'),
        (USAGE_TYPE_DEPARTMENTS, 'Departments'),
    ]

    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    subscription = models.ForeignKey('billing.Subscription', on_delete=models.CASCADE, related_name='usage_records', verbose_name=_('subscription'))
    usage_type = models.CharField(_('usage type'), max_length=20, choices=USAGE_TYPE_CHOICES, db_index=True)
    current_value = models.BigIntegerField(_('current value'), default=0)
    limit_value = models.BigIntegerField(_('limit value'), default=0)
    percentage_used = models.DecimalField(_('percentage used'), max_digits=5, decimal_places=2, default=0)
    alert_80_sent_at = models.DateTimeField(_('80% alert sent at'), null=True, blank=True)
    alert_90_sent_at = models.DateTimeField(_('90% alert sent at'), null=True, blank=True)
    alert_100_sent_at = models.DateTimeField(_('100% alert sent at'), null=True, blank=True)
    period_start = models.DateTimeField(_('period start'))
    period_end = models.DateTimeField(_('period end'))
    peak_value = models.BigIntegerField(_('peak value'), default=0)
    peak_reached_at = models.DateTimeField(_('peak reached at'), null=True, blank=True)

    class Meta:
        db_table = 'billing_usage_record'
        verbose_name = _('usage record')
        verbose_name_plural = _('usage records')
        unique_together = [['subscription', 'usage_type', 'period_start']]
        indexes = [
            models.Index(fields=['tenant_id', 'usage_type']),
            models.Index(fields=['subscription', 'usage_type']),
            models.Index(fields=['percentage_used']),
        ]

    def __str__(self):
        return f"{self.subscription.subscription_code} - {self.usage_type}: {self.current_value}/{self.limit_value}"

    def update_usage(self, new_value):
        self.current_value = new_value
        if self.limit_value > 0:
            self.percentage_used = (new_value / self.limit_value) * 100
        else:
            self.percentage_used = 0
        if new_value > self.peak_value:
            self.peak_value = new_value
            self.peak_reached_at = timezone.now()
        self.save()
        return self.check_alerts()

    def check_alerts(self):
        alerts = []
        if self.percentage_used >= 100 and not self.alert_100_sent_at:
            alerts.append({'level': 100, 'message': f'{self.usage_type} limit reached'})
            self.alert_100_sent_at = timezone.now()
        elif self.percentage_used >= 90 and not self.alert_90_sent_at:
            alerts.append({'level': 90, 'message': f'{self.usage_type} at 90% of limit'})
            self.alert_90_sent_at = timezone.now()
        elif self.percentage_used >= 80 and not self.alert_80_sent_at:
            alerts.append({'level': 80, 'message': f'{self.usage_type} at 80% of limit'})
            self.alert_80_sent_at = timezone.now()
        if alerts:
            self.save(update_fields=['alert_80_sent_at', 'alert_90_sent_at', 'alert_100_sent_at'])
        return alerts

    @property
    def remaining(self):
        if self.limit_value == -1:
            return -1
        return max(0, self.limit_value - self.current_value)