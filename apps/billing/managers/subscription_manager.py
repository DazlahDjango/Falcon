# billing/managers/subscription_manager.py
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager

class SubscriptionManager(BaseBillingManager):
    def active(self):
        """Get all active subscriptions (trialing or active status)."""
        return self.get_queryset().filter(
            status__in=['trialing', 'active'],
            is_deleted=False
        )
    
    def trialing(self):
        """Get subscriptions in trial period."""
        return self.get_queryset().filter(
            status='trialing',
            is_deleted=False
        )
    
    def expired(self):
        """Get subscriptions where current_period_end has passed."""
        return self.get_queryset().filter(
            current_period_end__lt=timezone.now(),
            status__in=['active', 'past_due'],
            is_deleted=False
        )
    
    def expiring_soon(self, days_ahead=7):
        """Get subscriptions expiring within N days."""
        now = timezone.now()
        expiry_cutoff = now + timedelta(days=days_ahead)
        return self.get_queryset().filter(
            current_period_end__gte=now,
            current_period_end__lte=expiry_cutoff,
            status='active',
            cancel_at_period_end=True,
            is_deleted=False
        )
    
    def trial_ending_soon(self, days_ahead=3):
        """Get subscriptions with trial ending within N days."""
        now = timezone.now()
        trial_cutoff = now + timedelta(days=days_ahead)
        return self.get_queryset().filter(
            trial_end__gte=now,
            trial_end__lte=trial_cutoff,
            status='trialing',
            is_deleted=False
        )
    
    def past_due(self):
        """Get subscriptions with past due payment."""
        return self.get_queryset().filter(
            status='past_due',
            is_deleted=False
        )
    
    def canceled(self):
        """Get canceled subscriptions."""
        return self.get_queryset().filter(
            status='canceled',
            is_deleted=False
        )
    
    def by_plan(self, plan_id):
        """Get subscriptions by plan ID."""
        return self.get_queryset().filter(plan_id=plan_id, is_deleted=False)
    
    def by_stripe_customer(self, stripe_customer_id):
        """Get subscription by Stripe customer ID."""
        return self.get_queryset().filter(
            stripe_customer_id=stripe_customer_id,
            is_deleted=False
        )
    
    def get_or_create_for_tenant(self, tenant, defaults=None):
        """Get or create a subscription for a tenant."""
        subscription, created = self.get_queryset().get_or_create(
            tenant=tenant,
            defaults=defaults or {}
        )
        return subscription, created
    
    def needs_sync(self):
        """Get subscriptions that need sync with Stripe."""
        stale_threshold = timezone.now() - timedelta(hours=24)
        return self.get_queryset().filter(
            updated_at__lt=stale_threshold,
            stripe_subscription_id__isnull=False,
            status__in=['active', 'past_due', 'trialing'],
            is_deleted=False
        )
    
    def get_tenant_active_subscription(self, tenant):
        """Get active subscription for a specific tenant."""
        return self.get_queryset().filter(
            tenant=tenant,
            status__in=['trialing', 'active'],
            is_deleted=False
        ).first()
    
    def get_expired_tenants(self):
        """Get all tenants with expired subscriptions."""
        return self.get_queryset().filter(
            current_period_end__lt=timezone.now(),
            status__in=['active', 'past_due'],
            is_deleted=False
        ).select_related('tenant')
    
    def count_by_plan(self):
        """Count subscriptions grouped by plan."""
        from django.db.models import Count
        return self.get_queryset().values('plan__name', 'plan__plan_type').annotate(
            count=Count('id')
        ).order_by('-count')
    
    def count_by_status(self):
        """Count subscriptions grouped by status."""
        from django.db.models import Count
        return self.get_queryset().values('status').annotate(
            count=Count('id')
        ).order_by('status')