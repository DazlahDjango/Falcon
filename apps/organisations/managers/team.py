"""
Custom manager for Team model
"""

from django.db import models


class TeamManager(models.Manager):
    """
    Custom manager for Team model
    """
    
    def active(self):
        """Get active teams"""
        return self.filter(is_deleted=False)
    
    def with_leader(self):
        """Get teams that have a leader assigned"""
        return self.filter(team_lead__isnull=False)
    
    def without_leader(self):
        """Get teams without a leader"""
        return self.filter(team_lead__isnull=True)
    
    def for_department(self, department):
        """Get teams for a specific department"""
        return self.filter(department=department)
    
    def for_organisation(self, organisation):
        """Get teams for a specific organisation"""
        return self.filter(department__organisation=organisation)
    
    def search(self, query):
        """Search teams by name"""
        return self.filter(name__icontains=query)