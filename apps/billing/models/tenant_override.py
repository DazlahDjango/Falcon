from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class TenantSubscriptionOverride(BaseBillingModel):
    OVERRIDE_TYPE_PRICING = 'pricing'
    OVERRIDE_TYPE_LIMITS = 'limits'
    OVERRIDE_TYPE_FEATURES = 'features'
    OVERRIDE_TYPE_ALL = 'all'
    OVERRIDE_TYPE_CHOICES = [
        (OVERRIDE_TYPE_PRICING, 'Pricing Only'),
        (OVERRIDE_TYPE_LIMITS, 'Limits Only'),
        (OVERRIDE_TYPE_FEATURES, 'Features Only'),
        (OVERRIDE_TYPE_ALL, 'All'),
    ]

    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    subscription = models.ForeignKey('billing.Subscription', on_delete=models.CASCADE, related_name='overrides', verbose_name=_('subscription'))
    plan = models.ForeignKey('billing.SubscriptionPlan', on_delete=models.PROTECT, related_name='tenant_overrides', verbose_name=_('base plan'))
    override_type = models.CharField(_('override type'), max_length=20, choices=OVERRIDE_TYPE_CHOICES, default=OVERRIDE_TYPE_ALL)
    custom_price_monthly = models.PositiveIntegerField(_('custom monthly price'), null=True, blank=True)
    custom_price_yearly = models.PositiveIntegerField(_('custom yearly price'), null=True, blank=True)
    override_features = models.JSONField(_('override features'), default=dict, blank=True)
    approved_by = models.UUIDField(_('approved by'), db_index=True)
    approval_notes = models.TextField(_('approval notes'), blank=True)
    valid_from = models.DateTimeField(_('valid from'), auto_now_add=True)
    valid_until = models.DateTimeField(_('valid until'), null=True, blank=True)
    is_negotiated = models.BooleanField(_('is negotiated'), default=True)
    negotiation_notes = models.TextField(_('negotiation notes'), blank=True)
    original_price_monthly = models.PositiveIntegerField(_('original monthly price'), null=True, blank=True)
    discount_percentage = models.DecimalField(_('discount percentage'), max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'billing_tenant_subscription_override'
        verbose_name = _('tenant subscription override')
        verbose_name_plural = _('tenant subscription overrides')
        indexes = [
            models.Index(fields=['tenant_id', 'valid_until']),
            models.Index(fields=['subscription']),
            models.Index(fields=['approved_by']),
        ]

    def __str__(self):
        return f"Override for {self.tenant_id} - {self.plan.name}"

    @property
    def is_active(self):
        if self.valid_until:
            from django.utils import timezone
            return timezone.now() <= self.valid_until
        return True