from django.db import models
from apps.core.models import BaseModel
from .department import Department

class Position(BaseModel):
    """
    Represents a job position title/role within the organisation.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    title = models.CharField(max_length=255)
    job_description = models.TextField(blank=True, null=True)
    is_management = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Position"
        verbose_name_plural = "Positions"
        unique_together = ('department', 'title')

    def __str__(self):
        return f"{self.title} ({self.department.name})"
