"""
Department model for organisation structure
"""

from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .organisation import Organisation
from apps.organisations.managers import DepartmentManager


class Department(BaseModel):
    """
    Represents a department within a tenant's organisation.
    """
    objects = DepartmentManager()

    organisation = models.ForeignKey(
        Organisation, 
        on_delete=models.CASCADE, 
        related_name='departments'
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True, help_text="Department code (e.g., 'HR', 'IT')")
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sub_departments'
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_departments'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        unique_together = ('organisation', 'name')
        ordering = ['name']
        indexes = [
            models.Index(fields=['organisation', 'name']),
            models.Index(fields=['organisation', 'parent']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organisation.name})"
    
    def get_full_path(self):
        """Get the full department path"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name