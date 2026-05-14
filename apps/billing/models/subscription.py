# billing/models/subscription.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BillingBaseModel
from .plan import Plan

class Subscription(BillingBaseModel):
    """Tenant subscription to billing plans."""
    STATUS_TRIALING = 'trialing'
    STATUS_ACTIVE = 'active'
    STATUS_PAST_DUE = 'past_due'
    STATUS_CANCELED = 'canceled'
    STATUS_INCOMPLETE = 'incomplete'
    STATUS_INCOMPLETE_EXPIRED = 'incomplete_expired'
    STATUS_UNPAID = 'unpaid'
    STATUS_SUSPENDED = 'suspended'

    STATUS_CHOICES = [
        (STATUS_TRIALING, 'Trialing'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_PAST_DUE, 'Past Due'),
        (STATUS_CANCELED, 'Canceled'),
        (STATUS_INCOMPLETE, 'Incomplete'),
        (STATUS_INCOMPLETE_EXPIRED, 'Incomplete Expired'),
        (STATUS_UNPAID, 'Unpaid'),
        (STATUS_SUSPENDED, 'Suspended'),
    ]
    tenant = models.OneToOneField('tenant.Client', on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    stripe_customer_id = models.CharField(_('Stripe customer ID'), max_length=100, blank=True, db_index=True)
    stripe_subscription_id = models.CharField(_('Stripe subscription ID'), max_length=100, blank=True, db_index=True)
    stripe_price_id = models.CharField(_('Stripe price ID'), max_length=100, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_TRIALING, db_index=True)
    billing_interval = models.CharField(_('billing interval'), max_length=10, choices=Plan.BILLING_INTERVAL_CHOICES, default=Plan.BILLING_INTERVAL_MONTHLY)
    trial_start = models.DateTimeField(_('trial start'), null=True, blank=True)
    trial_end = models.DateTimeField(_('trial end'), null=True, blank=True)
    current_period_start = models.DateTimeField(_('current period start'), null=True, blank=True)
    current_period_end = models.DateTimeField(_('current period end'), null=True, blank=True)
    cancel_at_period_end = models.BooleanField(_('cancel at period end'), default=False)
    canceled_at = models.DateTimeField(_('canceled at'), null=True, blank=True)
    ended_at = models.DateTimeField(_('ended at'), null=True, blank=True)
    auto_renew = models.BooleanField(_('auto-renew'), default=True)
    features_snapshot = models.JSONField(_('features snapshot'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_subscription'
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['stripe_customer_id']),
            models.Index(fields=['stripe_subscription_id']),
            models.Index(fields=['status', 'current_period_end']),
            models.Index(fields=['trial_end']),
        ]

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name} ({self.status})"

    @property
    def is_active(self) -> bool:
        return self.status in [self.STATUS_TRIALING, self.STATUS_ACTIVE]

    @property
    def is_trialing(self) -> bool:
        return self.status == self.STATUS_TRIALING

    @property
    def is_canceled(self) -> bool:
        return self.status == self.STATUS_CANCELED

    @property
    def days_until_expiry(self) -> int:
        if not self.current_period_end:
            return 0
        delta = self.current_period_end - timezone.now()
        return max(0, delta.days)

    def cancel(self, at_period_end: bool = True):
        """Cancel subscription immediately or at period end."""
        self.cancel_at_period_end = at_period_end
        if at_period_end:
            self.status = self.STATUS_ACTIVE 
        else:
            self.status = self.STATUS_CANCELED
            self.ended_at = timezone.now()
        self.canceled_at = timezone.now()
        self.save(update_fields=['cancel_at_period_end', 'status', 'ended_at', 'canceled_at'])

    def suspend(self):
        """Suspend subscription due to payment issues."""
        self.status = self.STATUS_SUSPENDED
        self.save(update_fields=['status'])

    def activate(self):
        """Activate a suspended or paused subscription."""
        self.status = self.STATUS_ACTIVE
        self.save(update_fields=['status'])

class SubscriptionHistory(BillingBaseModel):
    """Historical record of subscription changes."""
    subscription = models.ForeignKey('billing.Subscription', on_delete=models.CASCADE, related_name='history', verbose_name=_('subscription'))
    previous_plan = models.ForeignKey('billing.Plan', on_delete=models.SET_NULL, null=True, related_name='+', verbose_name=_('previous plan'))
    new_plan = models.ForeignKey('billing.Plan', on_delete=models.SET_NULL, null=True, related_name='+', verbose_name=_('new plan'))
    previous_status = models.CharField( _('previous status'), max_length=20, null=True, blank=True)
    new_status = models.CharField(_('new status'), max_length=20)
    change_reason = models.CharField(_('change reason'), max_length=200, blank=True)
    previous_price = models.DecimalField(_('previous price'), max_digits=10, decimal_places=2, null=True, blank=True)
    new_price = models.DecimalField(_('new price'), max_digits=10, decimal_places=2, null=True, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    class Meta:
        db_table = 'billing_subscription_history'
        verbose_name = _('subscription history')
        verbose_name_plural = _('subscription histories')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subscription', '-created_at']),
            models.Index(fields=['previous_status', 'new_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        change = f"{self.previous_status or 'None'} → {self.new_status}"
        if self.previous_plan != self.new_plan:
            change += f" | Plan: {self.previous_plan.name if self.previous_plan else 'None'} → {self.new_plan.name if self.new_plan else 'None'}"
        return f"{self.subscription.tenant.name}: {change}"
    
    @property
    def is_status_change(self) -> bool:
        return self.previous_status != self.new_status
    
    @property
    def is_plan_change(self) -> bool:
        return self.previous_plan_id != self.new_plan_id