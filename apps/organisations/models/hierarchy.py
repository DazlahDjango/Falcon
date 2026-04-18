"""
Hierarchy model for reporting structure - DEPRECATED

This model is deprecated. Use the User.manager relationship instead.
The User model in accounts app has a manager field with related_name='direct_reports'
that should be used for all hierarchy operations.
"""

from django.db import models
from .base import BaseModel

class Hierarchy(BaseModel):
    """
    DEPRECATED: Represents reporting relationships between users

    This model is kept for backward compatibility but should not be used.
    All hierarchy operations should use User.manager relationships.
    """
    organisation = models.ForeignKey(
        'Organisation',
        on_delete=models.CASCADE,
        related_name='hierarchies',
        null=True,
        blank=True
    )
    employee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reporting_to_hierarchy',  # Changed to avoid conflict
        null=True,
        blank=True
    )
    supervisor = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='supervises_hierarchy',  # Changed to avoid conflict
        null=True,
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
        db_table = 'organisations_hierarchy_deprecated'

    def __str__(self):
        return f"{self.employee} reports to {self.supervisor} (DEPRECATED)"