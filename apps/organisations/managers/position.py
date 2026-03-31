"""
Custom manager for Position model
"""

from django.db import models


class PositionManager(models.Manager):
    """
    Custom manager for Position model
    """
    
    def active(self):
        """Get active positions"""
        return self.filter(is_deleted=False)
    
    def management(self):
        """Get management positions"""
        return self.filter(is_management=True)
    
    def non_management(self):
        """Get non-management positions"""
        return self.filter(is_management=False)
    
    def by_level(self, level):
        """Get positions by hierarchy level"""
        return self.filter(level=level)
    
    def for_department(self, department):
        """Get positions for a specific department"""
        return self.filter(department=department)
    
    def for_organisation(self, organisation):
        """Get positions for a specific organisation"""
        return self.filter(department__organisation=organisation)
    
    def reports_to(self, position):
        """Get positions that report to a specific position"""
        return self.filter(reports_to=position)
    
    def search(self, query):
        """Search positions by title or code"""
        return self.filter(
            models.Q(title__icontains=query) |
            models.Q(code__icontains=query)
        )