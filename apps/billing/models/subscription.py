from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from .base import BaseBillingModel
from .plan import SubscriptionPlan
from ..managers import SubscriptionManager

class Subscription(BaseBillingModel):
    objects = SubscriptionManager()
    STATUS_ACTIVE = 'active'
    STATUS_TRIALING = 'trialing'
    STATUS_PAST_DUE = 'past_due'
    STATUS_CANCELLED = 'cancelled'
    STATUS_EXPIRED = 'expired'
    STATUS_PENDING_CANCELLATION = 'pending_cancellation'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_TRIALING, 'Trialing'),
        (STATUS_PAST_DUE, 'Past Due'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_EXPIRED, 'Expired'),
        (STATUS_PENDING_CANCELLATION, 'Pending Cancellation'),
    ]
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)  # Reference to Client model
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        verbose_name=_('plan')
    )
    subscription_code = models.CharField(_('subscription code'), max_length=100, unique=True, db_index=True, help_text="PayStack subscription code")
    email_token = models.CharField(_('email token'), max_length=100, blank=True, help_text="Token for email notifications")
    status = models.CharField(_('status'), max_length=30, choices=STATUS_CHOICES, default=STATUS_TRIALING, db_index=True)
    start_date = models.DateTimeField(_('start date'), default=timezone.now, db_index=True)
    trial_end_date = models.DateTimeField(_('trial end date'), null=True, blank=True, db_index=True)
    current_period_start = models.DateTimeField(_('current period start'), default=timezone.now)
    current_period_end = models.DateTimeField(_('current period end'), db_index=True)
    cancel_at_period_end = models.BooleanField(_('cancel at period end'), default=False)
    cancelled_at = models.DateTimeField(_('cancelled at'), null=True, blank=True)
    ended_at = models.DateTimeField(_('ended at'), null=True, blank=True)
    billing_interval = models.CharField(_('billing interval'), max_length=10, choices=SubscriptionPlan.INTERVAL_CHOICES, default=SubscriptionPlan.INTERVAL_MONTHLY)
    amount = models.PositiveIntegerField(_('amount'), help_text="Amount in smallest currency unit")
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    paystack_subscription_code = models.CharField(_('PayStack subscription code'), max_length=100, blank=True, db_index=True)
    paystack_authorization_code = models.CharField(_('PayStack authorization code'), max_length=100, blank=True)
    paystack_customer_code = models.CharField(_('PayStack customer code'), max_length=100, blank=True)
    auto_renew = models.BooleanField(_('auto renew'), default=True)
    next_payment_date = models.DateTimeField(_('next payment date'), null=True, blank=True)
    last_payment_date = models.DateTimeField(_('last payment date'), null=True, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_subscription'
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['subscription_code']),
            models.Index(fields=['paystack_subscription_code']),
            models.Index(fields=['current_period_end']),
            models.Index(fields=['status', 'cancel_at_period_end']),
        ]

    def __str__(self):
        return f"Subscription {self.subscription_code} - {self.status}"

    @property
    def is_active(self):
        """Check if subscription is currently active."""
        return self.status in [self.STATUS_ACTIVE, self.STATUS_TRIALING]

    @property
    def is_on_trial(self):
        """Check if subscription is in trial period."""
        if not self.trial_end_date:
            return False
        return self.status == self.STATUS_TRIALING and timezone.now() < self.trial_end_date

    @property
    def trial_days_remaining(self):
        """Get remaining trial days."""
        if not self.is_on_trial:
            return 0
        delta = self.trial_end_date - timezone.now()
        return max(0, delta.days)

    @property
    def days_until_expiry(self):
        """Get days until current period ends."""
        delta = self.current_period_end - timezone.now()
        return max(0, delta.days)

    @property
    def is_expiring_soon(self, days_threshold=7):
        """Check if subscription expires within threshold."""
        return self.days_until_expiry <= days_threshold and self.status == self.STATUS_ACTIVE

    @property
    def needs_renewal(self):
        """Check if subscription needs renewal."""
        return self.current_period_end <= timezone.now() and self.status == self.STATUS_ACTIVE

    def activate(self):
        """Activate subscription."""
        self.status = self.STATUS_ACTIVE
        self.current_period_start = timezone.now()
        self.save(update_fields=['status', 'current_period_start', 'updated_at'])

    def cancel(self, at_period_end=True):
        """Cancel subscription."""
        self.cancel_at_period_end = at_period_end
        self.cancelled_at = timezone.now() if not at_period_end else None
        self.status = self.STATUS_PENDING_CANCELLATION if at_period_end else self.STATUS_CANCELLED
        self.save(update_fields=['cancel_at_period_end', 'cancelled_at', 'status', 'updated_at'])

    def expire(self):
        """Expire subscription."""
        self.status = self.STATUS_EXPIRED
        self.ended_at = timezone.now()
        self.save(update_fields=['status', 'ended_at', 'updated_at'])

    def mark_past_due(self):
        """Mark subscription as past due."""
        self.status = self.STATUS_PAST_DUE
        self.save(update_fields=['status', 'updated_at'])

    def renew(self, new_period_end=None):
        """Renew subscription for next period."""
        from datetime import timedelta
        
        if new_period_end:
            self.current_period_end = new_period_end
        else:
            if self.billing_interval == self.plan.INTERVAL_MONTHLY:
                self.current_period_end = timezone.now() + timedelta(days=30)
            else:
                self.current_period_end = timezone.now() + timedelta(days=365)
        
        self.current_period_start = timezone.now()
        self.status = self.STATUS_ACTIVE
        self.last_payment_date = timezone.now()
        self.save(update_fields=['current_period_start', 'current_period_end', 'status', 'last_payment_date', 'updated_at'])

    def extend_trial(self, extra_days=14):
        """Extend trial period."""
        if self.status == self.STATUS_TRIALING:
            self.trial_end_date = timezone.now() + timedelta(days=extra_days)
            self.save(update_fields=['trial_end_date', 'updated_at'])