from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.organisations.managers.structure import DepartmentManager
from .organisation import Organisation

class Department(BaseModel):
    """
    Represents a department within a tenant's organisation.
    """
    objects = DepartmentManager()

    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_departments')
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        unique_together = ('organisation', 'name')

    def __str__(self):
        return f"{self.name} ({self.organisation.name})"
