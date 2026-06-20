from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class SubscriptionPlanFeature(BaseBillingModel):
    FEATURE_TYPE_INTEGER = 'integer'
    FEATURE_TYPE_BOOLEAN = 'boolean'
    FEATURE_TYPE_STRING = 'string'
    FEATURE_TYPE_JSON = 'json'
    FEATURE_TYPE_CHOICES = [
        (FEATURE_TYPE_INTEGER, 'Integer'),
        (FEATURE_TYPE_BOOLEAN, 'Boolean'),
        (FEATURE_TYPE_STRING, 'String'),
        (FEATURE_TYPE_JSON, 'JSON'),
    ]

    plan = models.ForeignKey('billing.SubscriptionPlan', on_delete=models.CASCADE, related_name='dynamic_features', verbose_name=_('plan'))
    feature_key = models.CharField(_('feature key'), max_length=100, db_index=True)
    feature_value = models.CharField(_('feature value'), max_length=255)
    feature_type = models.CharField(_('feature type'), max_length=20, choices=FEATURE_TYPE_CHOICES, default=FEATURE_TYPE_INTEGER)
    display_name = models.CharField(_('display name'), max_length=100, blank=True)
    display_icon = models.CharField(_('display icon'), max_length=50, blank=True)
    display_order = models.IntegerField(_('display order'), default=0)
    is_core_feature = models.BooleanField(_('is core feature'), default=False)
    min_value = models.IntegerField(_('minimum value'), null=True, blank=True)
    max_value = models.IntegerField(_('maximum value'), null=True, blank=True)
    allowed_values = models.JSONField(_('allowed values'), default=list, blank=True)

    class Meta:
        db_table = 'billing_subscription_plan_feature'
        verbose_name = _('subscription plan feature')
        verbose_name_plural = _('subscription plan features')
        ordering = ['display_order', 'feature_key']
        unique_together = [['plan', 'feature_key']]
        indexes = [
            models.Index(fields=['plan', 'feature_key']),
            models.Index(fields=['feature_key']),
        ]

    def __str__(self):
        return f"{self.plan.name} - {self.feature_key}: {self.feature_value}"

    @property
    def typed_value(self):
        if self.feature_type == self.FEATURE_TYPE_INTEGER:
            return int(self.feature_value) if self.feature_value != '-1' else -1
        elif self.feature_type == self.FEATURE_TYPE_BOOLEAN:
            return self.feature_value.lower() in ('true', '1', 'yes')
        elif self.feature_type == self.FEATURE_TYPE_JSON:
            import json
            try:
                return json.loads(self.feature_value)
            except:
                return {}
        return self.feature_value