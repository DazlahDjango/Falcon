"""
Subscription model for organisation subscriptions
"""

from django.db import models
from django.utils import timezone
from .base import BaseTenantModel
from apps.organisations.constants import SubscriptionStatus, PlanCode
from .organisation import Organisation
from .plan import Plan


class Subscription(BaseTenantModel):
    """
    Manages the subscription status and plan for an organization.
    """
    objects = models.Manager()  # Use default manager temporarily

    organisation = models.OneToOneField(
        Organisation,
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        null=True,
        blank=True
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.TRIALING,
        db_index=True
    )

    # Dates
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    # Settings
    auto_renew = models.BooleanField(default=True)

    # Billing integration
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    paypal_subscription_id = models.CharField(max_length=100, blank=True)

    # Legacy fields (keeping for backward compatibility)
    plan_type = models.CharField(
        max_length=20, choices=PlanCode.choices, default=PlanCode.BASIC)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['plan']),
        ]

    def __str__(self):
        plan_name = self.plan.name if self.plan else self.get_plan_type_display()
        return f"{self.organisation.name} - {plan_name}"

    def is_active_subscription(self):
        """Check if subscription is currently active"""
        if self.status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
            return False

        if self.end_date and self.end_date <= timezone.now():
            return False

        return True

    def is_trialing(self):
        """Check if subscription is in trial period"""
        if self.status != SubscriptionStatus.TRIALING:
            return False

        if self.trial_end_date and self.trial_end_date > timezone.now():
            return True

        return False

    def days_until_expiry(self):
        """Get number of days until subscription expires"""
        if not self.end_date:
            return None

        delta = self.end_date - timezone.now()
        return max(0, delta.days)

    def days_left_in_trial(self):
        """Get number of days left in trial period"""
        if not self.is_trialing() or not self.trial_end_date:
            return 0

        delta = self.trial_end_date - timezone.now()
        return max(0, delta.days)

    def cancel(self):
        """Cancel the subscription"""
        self.status = SubscriptionStatus.CANCELLED
        self.cancelled_at = timezone.now()
        self.auto_renew = False
        self.save()

    def renew(self, new_end_date=None):
        """Renew the subscription"""
        from datetime import timedelta

        if new_end_date:
            self.end_date = new_end_date
        elif self.plan and self.plan.price_yearly > 0:
            self.end_date = timezone.now() + timedelta(days=365)
        else:
            self.end_date = timezone.now() + timedelta(days=30)

        self.status = SubscriptionStatus.ACTIVE
        self.save()
