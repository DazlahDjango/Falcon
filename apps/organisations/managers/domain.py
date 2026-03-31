"""
Custom manager for Domain model
"""

from django.db import models
from ..constants import DomainVerificationStatus, SSLStatus


class DomainManager(models.Manager):
    """
    Custom manager for Domain model
    """
    
    def active(self):
        """Get active domains"""
        return self.filter(is_deleted=False)
    
    def verified(self):
        """Get verified domains"""
        return self.filter(verification_status=DomainVerificationStatus.VERIFIED)
    
    def pending(self):
        """Get pending domains"""
        return self.filter(verification_status=DomainVerificationStatus.PENDING)
    
    def failed(self):
        """Get failed domains"""
        return self.filter(verification_status=DomainVerificationStatus.FAILED)
    
    def primary(self):
        """Get primary domains"""
        return self.filter(is_primary=True)
    
    def ssl_active(self):
        """Get domains with active SSL"""
        return self.filter(ssl_status=SSLStatus.ACTIVE)
    
    def ssl_expiring_soon(self, days=30):
        """Get domains with SSL expiring soon"""
        from django.utils import timezone
        threshold = timezone.now() + timezone.timedelta(days=days)
        return self.filter(
            ssl_status=SSLStatus.ACTIVE,
            ssl_expiry_date__lte=threshold,
            ssl_expiry_date__gt=timezone.now()
        )
    
    def for_organisation(self, organisation):
        """Get domains for a specific organisation"""
        return self.filter(organisation=organisation)
    
    def search(self, query):
        """Search domains by name"""
        return self.filter(domain_name__icontains=query)