"""
Hierarchy model for reporting structure
"""

from django.db import models
from .base import BaseModel


class Hierarchy(BaseModel):
    """
    Represents reporting relationships between users
    """
    organisation = models.ForeignKey(
        'Organisation',
        on_delete=models.CASCADE,
        related_name='hierarchies',
        null=True,  # Temporary for migration
        blank=True
    )
    employee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reporting_to',
        null=True,  # Temporary for migration
        blank=True
    )
    supervisor = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='supervises',
        null=True,  # Temporary for migration
        blank=True
    )
    level = models.PositiveSmallIntegerField(default=1, help_text="Level in hierarchy (1=CEO, higher numbers are deeper)")
    
    class Meta:
        unique_together = [['organisation', 'employee', 'supervisor']]
        ordering = ['level', 'employee__email']
        indexes = [
            models.Index(fields=['organisation', 'employee']),
            models.Index(fields=['organisation', 'supervisor']),
        ]
    
    def __str__(self):
        return f"{self.employee} reports to {self.supervisor}"