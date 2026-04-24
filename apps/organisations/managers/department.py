"""
Custom manager for Department model
"""
from django.db import models
from ..utils import TenantManagerMixin


class DepartmentManager(TenantManagerMixin, models.Manager):
    """
    Custom manager for Department model
    """
    
    def active(self):
        """Get active departments"""
        return self.filter(is_deleted=False)
    
    def root(self):
        """Get root departments (no parent)"""
        return self.filter(parent__isnull=True)
    
    def with_manager(self):
        """Get departments that have a manager assigned"""
        return self.filter(manager__isnull=False)
    
    def without_manager(self):
        """Get departments without a manager"""
        return self.filter(manager__isnull=True)
    
    def for_organisation(self, organisation):
        """Get departments for a specific organisation"""
        return self.filter(organisation=organisation)
    
    def search(self, query):
        """Search departments by name or code"""
        return self.filter(
            models.Q(name__icontains=query) |
            models.Q(code__icontains=query)
        )
