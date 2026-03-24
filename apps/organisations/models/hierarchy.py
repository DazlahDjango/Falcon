from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.organisations.managers.structure import HierarchyManager
from .organisation import Organisation

class Hierarchy(BaseModel):
    """
    Defines the reporting lines and supervisors for users in the organisation.
    Crucial for validations and KPI workflows.
    """
    objects = HierarchyManager()

    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='hierarchies')
    subordinate = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reporting_line')
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='subordinates')

    class Meta:
        verbose_name = "Hierarchy"
        verbose_name_plural = "Hierarchies"
        unique_together = ('subordinate', 'supervisor')

    def __str__(self):
        return f"Supervisor: {self.supervisor} -> Subordinate: {self.subordinate}"
