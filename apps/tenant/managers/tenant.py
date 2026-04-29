# apps/tenant/managers/tenant.py
"""
Manager for Client/Tenant model.
Provides tenant-specific query methods for the Client model.
"""

from django.db import models
from django.utils import timezone
from .base import BaseManager


class TenantManager(BaseManager):
    """
    Manager for Client/Tenant model with tenant-specific queries.
    
    Provides methods like:
        - active_tenants()
        - by_slug()
        - by_domain()
        - by_subscription()
        - trial_expiring_soon()
    """
    
    def active_tenants(self):
        """Return only active tenants (not soft-deleted and is_active=True)"""
        return self.active().filter(is_active=True)
    
    def by_slug(self, slug):
        """Get tenant by slug (URL-friendly identifier)"""
        try:
            return self.get_queryset().get(slug=slug, is_deleted=False)
        except self.model.DoesNotExist:
            return None
    
    def by_domain(self, domain):
        """Get tenant by custom domain"""
        try:
            return self.get_queryset().get(domain=domain, is_deleted=False)
        except self.model.DoesNotExist:
            return None
    
    def by_subscription(self, plan):
        """Get tenants by subscription plan (trial, basic, professional, enterprise)"""
        return self.active().filter(subscription_plan=plan)
    
    def trial_expiring_soon(self, days=7):
        """Get tenants whose trial expires in X days (default 7 days)"""
        cutoff = timezone.now() + timezone.timedelta(days=days)
        return self.active().filter(
            subscription_plan='trial',
            subscription_expires_at__lte=cutoff,
            subscription_expires_at__gt=timezone.now()
        )
    
    def expired_subscriptions(self):
        """Get tenants with expired subscriptions"""
        return self.get_queryset().filter(
            subscription_expires_at__lt=timezone.now(),
            is_deleted=False
        )
    
    def verified_tenants(self):
        """Get tenants that are verified"""
        return self.active_tenants().filter(is_verified=True)
    
    def unverified_tenants(self):
        """Get tenants that are not verified"""
        return self.active_tenants().filter(is_verified=False)