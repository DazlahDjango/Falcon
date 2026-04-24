"""
Custom manager for Contact model
"""
from django.db import models
from ..utils import TenantManagerMixin


class ContactManager(TenantManagerMixin, models.Manager):
    """
    Custom manager for Contact model
    """
    
    def active(self):
        """Get active contacts"""
        return self.filter(is_deleted=False)
    
    def primary(self):
        """Get primary contacts"""
        return self.filter(is_primary=True)
    
    def billing(self):
        """Get billing contacts"""
        return self.filter(contact_type='billing')
    
    def technical(self):
        """Get technical contacts"""
        return self.filter(contact_type='technical')
    
    def for_organisation(self, organisation):
        """Get contacts for a specific organisation"""
        return self.filter(organisation=organisation)
    
    def receives_notifications(self):
        """Get contacts that receive notifications"""
        return self.filter(receives_notifications=True)
    
    def search(self, query):
        """Search contacts by name or email"""
        return self.filter(
            models.Q(name__icontains=query) |
            models.Q(email__icontains=query)
        )
