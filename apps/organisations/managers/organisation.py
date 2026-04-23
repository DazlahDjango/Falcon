"""
Custom manager for Organisation model
"""
from django.db import models
from ..utils import TenantManagerMixin
from django.utils import timezone
from ..constants import OrganisationStatus, SectorType


class OrganisationManager(TenantManagerMixin, models.Manager):
    """
    Custom manager for Organisation model with tenant-aware methods
    """
    
    def active(self):
        """Get only active organisations"""
        return self.filter(status=OrganisationStatus.ACTIVE, is_active=True)
    
    def pending(self):
        """Get pending organisations (awaiting setup)"""
        return self.filter(status=OrganisationStatus.PENDING)
    
    def suspended(self):
        """Get suspended organisations"""
        return self.filter(status=OrganisationStatus.SUSPENDED)
    
    def trialing(self):
        """Get organisations in trial period"""
        return self.filter(
            status=OrganisationStatus.TRIAL,
            subscription__trial_end_date__gt=timezone.now()
        )
    
    def by_sector(self, sector):
        """Filter organisations by sector"""
        return self.filter(sector=sector)
    
    def by_industry(self, industry):
        """Filter organisations by industry"""
        return self.filter(industry=industry)
    
    def with_active_subscription(self):
        """Get organisations with active subscriptions"""
        return self.filter(
            subscription__status='active',
            subscription__end_date__gt=timezone.now()
        )
    
    def trial_expiring_soon(self, days=7):
        """Get organisations with trial ending in X days"""
        threshold = timezone.now() + timezone.timedelta(days=days)
        return self.filter(
            status=OrganisationStatus.TRIAL,
            subscription__trial_end_date__lte=threshold,
            subscription__trial_end_date__gt=timezone.now()
        )
    
    def subscription_expiring_soon(self, days=30):
        """Get organisations with subscriptions expiring in X days"""
        threshold = timezone.now() + timezone.timedelta(days=days)
        return self.filter(
            status=OrganisationStatus.ACTIVE,
            subscription__end_date__lte=threshold,
            subscription__end_date__gt=timezone.now()
        )
    
    def verified(self):
        """Get verified organisations"""
        return self.filter(is_verified=True)
    
    def unverified(self):
        """Get unverified organisations"""
        return self.filter(is_verified=False)
    
    def search(self, query):
        """Search organisations by name, slug, or email"""
        return self.filter(
            models.Q(name__icontains=query) |
            models.Q(slug__icontains=query) |
            models.Q(contact_email__icontains=query) |
            models.Q(registration_number__icontains=query)
        )
