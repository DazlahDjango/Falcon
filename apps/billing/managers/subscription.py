from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager, TenantAwareManager

class SubscriptionManager(TenantAwareManager):
    """
    Custom manager for Subscription model.
    Provides subscription-specific queryset methods including tenant filtering.
    """
    
    def __init__(self, tenant_id=None, *args, **kwargs):
        super().__init__(tenant_id, *args, **kwargs)
    
    def active(self):
        """Return active subscriptions (active or trialing)."""
        return self.get_queryset().filter(
            status__in=['active', 'trialing']
        )
    
    def active_only(self):
        """Return only fully active subscriptions (not trialing)."""
        return self.get_queryset().filter(status='active')
    
    def trialing(self):
        """Return subscriptions in trial period."""
        return self.get_queryset().filter(status='trialing')
    
    def past_due(self):
        """Return past due subscriptions."""
        return self.get_queryset().filter(status='past_due')
    
    def cancelled(self):
        """Return cancelled subscriptions."""
        return self.get_queryset().filter(status='cancelled')
    
    def expired(self):
        """Return expired subscriptions."""
        return self.get_queryset().filter(status='expired')
    
    def pending_cancellation(self):
        """Return subscriptions pending cancellation at period end."""
        return self.get_queryset().filter(status='pending_cancellation')
    
    def expiring_soon(self, days_threshold=7):
        """Return subscriptions expiring within threshold days."""
        threshold_date = timezone.now() + timedelta(days=days_threshold)
        return self.get_queryset().filter(
            status='active',
            current_period_end__lte=threshold_date,
            current_period_end__gte=timezone.now()
        )
    
    def expired_subscriptions(self):
        """Return subscriptions that have passed their end date."""
        return self.get_queryset().filter(
            status='active',
            current_period_end__lt=timezone.now()
        )
    
    def trial_ending_soon(self, days_threshold=3):
        """Return trials ending within threshold days."""
        threshold_date = timezone.now() + timedelta(days=days_threshold)
        return self.get_queryset().filter(
            status='trialing',
            trial_end_date__lte=threshold_date,
            trial_end_date__gte=timezone.now()
        )
    
    def expired_trials(self):
        """Return trials that have expired."""
        return self.get_queryset().filter(
            status='trialing',
            trial_end_date__lt=timezone.now()
        )
    
    def renewable(self):
        """Return subscriptions that are eligible for renewal."""
        return self.get_queryset().filter(
            status='active',
            auto_renew=True,
            cancel_at_period_end=False
        )
    
    def by_plan(self, plan_id):
        """Return subscriptions for a specific plan."""
        return self.get_queryset().filter(plan_id=plan_id)
    
    def by_plan_type(self, plan_type):
        """Return subscriptions for a specific plan type."""
        return self.get_queryset().filter(plan__plan_type=plan_type)
    
    def get_by_subscription_code(self, subscription_code):
        """Get subscription by subscription code."""
        return self.get_queryset().filter(subscription_code=subscription_code).first()
    
    def get_by_paystack_subscription_code(self, paystack_subscription_code):
        """Get subscription by PayStack subscription code."""
        return self.get_queryset().filter(paystack_subscription_code=paystack_subscription_code).first()
    
    def get_by_tenant(self, tenant_id):
        """Get all subscriptions for a tenant (ordered by latest)."""
        return self.get_queryset().filter(tenant_id=tenant_id).order_by('-created_at')
    
    def get_current_for_tenant(self, tenant_id):
        """Get current active subscription for a tenant."""
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            status__in=['active', 'trialing']
        ).order_by('-created_at').first()
    
    def get_active_subscription_count(self):
        """Get count of active subscriptions."""
        return self.get_queryset().filter(status='active').count()
    
    def get_total_monthly_recurring_revenue(self):
        """Calculate total monthly recurring revenue."""
        active_subs = self.get_queryset().filter(
            status='active',
            billing_interval='monthly'
        )
        total = active_subs.aggregate(total=models.Sum('amount'))['total'] or 0
        return total
    
    def get_total_yearly_recurring_revenue(self):
        """Calculate total yearly recurring revenue."""
        active_subs = self.get_queryset().filter(
            status='active',
            billing_interval='yearly'
        )
        total = active_subs.aggregate(total=models.Sum('amount'))['total'] or 0
        return total
    
    def get_total_mrr(self):
        """Calculate total Monthly Recurring Revenue (convert yearly to monthly)."""
        monthly = self.get_total_monthly_recurring_revenue()
        yearly = self.get_total_yearly_recurring_revenue()
        return monthly + (yearly / 12)
    
    def subscriptions_due_for_renewal(self):
        """Return subscriptions that need renewal today."""
        today = timezone.now().date()
        return self.get_queryset().filter(
            status='active',
            auto_renew=True,
            current_period_end__date=today
        )
    
    def recently_created(self, days=30):
        """Return subscriptions created in last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def get_tenant_subscription_history(self, tenant_id):
        """Get complete subscription history for a tenant."""
        return self.get_queryset().filter(
            tenant_id=tenant_id
        ).order_by('-created_at').select_related('plan')