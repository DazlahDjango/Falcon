"""
Custom managers for Subscription and Plan models
"""
from django.db import models
from ..utils import TenantManagerMixin
from django.utils import timezone
from ..constants import SubscriptionStatus


class SubscriptionManager(TenantManagerMixin, models.Manager):
    """
    Custom manager for Subscription model
    """
    
    def active(self):
        """Get active subscriptions"""
        return self.filter(
            status=SubscriptionStatus.ACTIVE,
            end_date__gt=timezone.now()
        )
    
    def trialing(self):
        """Get subscriptions in trial period"""
        return self.filter(
            status=SubscriptionStatus.TRIALING,
            trial_end_date__gt=timezone.now()
        )
    
    def expired(self):
        """Get expired subscriptions"""
        return self.filter(
            models.Q(status=SubscriptionStatus.EXPIRED) |
            models.Q(end_date__lte=timezone.now())
        )
    
    def expiring_soon(self, days=30):
        """Get subscriptions expiring in X days"""
        threshold = timezone.now() + timezone.timedelta(days=days)
        return self.filter(
            status=SubscriptionStatus.ACTIVE,
            end_date__lte=threshold,
            end_date__gt=timezone.now()
        )
    
    def past_due(self):
        """Get past due subscriptions"""
        return self.filter(status=SubscriptionStatus.PAST_DUE)
    
    def cancelled(self):
        """Get cancelled subscriptions"""
        return self.filter(status=SubscriptionStatus.CANCELLED)
    
    def for_organisation(self, organisation):
        """Get subscription for a specific organisation"""
        return self.filter(organisation=organisation)
    
    def with_plan(self, plan_code):
        """Get subscriptions with a specific plan"""
        return self.filter(plan__code=plan_code)
    
    def renewing_today(self):
        """Get subscriptions that should renew today"""
        today = timezone.now().date()
        return self.filter(
            end_date__date=today,
            auto_renew=True,
            status=SubscriptionStatus.ACTIVE
        )


class PlanManager(TenantManagerMixin, models.Manager):
    """
    Custom manager for Plan model
    """
    
    def active(self):
        """Get active plans"""
        return self.filter(is_active=True)
    
    def basic(self):
        """Get basic plan"""
        return self.filter(code='basic', is_active=True)
    
    def professional(self):
        """Get professional plan"""
        return self.filter(code='professional', is_active=True)
    
    def enterprise(self):
        """Get enterprise plan"""
        return self.filter(code='enterprise', is_active=True)
    
    def popular(self):
        """Get popular plans"""
        return self.filter(is_popular=True, is_active=True)
    
    def by_price_range(self, min_price, max_price):
        """Get plans within price range (monthly)"""
        return self.filter(
            price_monthly__gte=min_price,
            price_monthly__lte=max_price,
            is_active=True
        )
