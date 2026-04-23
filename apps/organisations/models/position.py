"""
Position model for job positions/titles
"""

from django.db import models
from .base import BaseTenantModel
from .department import Department
from apps.organisations.managers import PositionManager
from apps.organisations.constants import HierarchyLevel


class Position(BaseTenantModel):
    """
    Represents a job position title/role within the organisation.
    """
    objects = PositionManager()
    
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        related_name='positions'
    )
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True, help_text="Job position code")
    job_description = models.TextField(blank=True, null=True)
    level = models.PositiveSmallIntegerField(
        choices=HierarchyLevel.choices,
        default=HierarchyLevel.STAFF,
        help_text="Hierarchy level of this position"
    )
    is_management = models.BooleanField(default=False)
    reports_to = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='subordinates', 
        help_text="The position this title reports to"
    )

    class Meta:
        verbose_name = "Position"
        verbose_name_plural = "Positions"
        unique_together = ('department', 'title')
        ordering = ['level', 'title']
        indexes = [
            models.Index(fields=['department', 'level']),
            models.Index(fields=['department', 'is_management']),
        ]

    def __str__(self):
        return f"{self.title} ({self.department.name})"
