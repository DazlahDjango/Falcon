from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .department import Department

class Team(BaseModel):
    """
    Represents a specific team within a department.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    team_lead = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_teams')

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        unique_together = ('department', 'name')

    def __str__(self):
        return f"{self.name} - {self.department.name}"
