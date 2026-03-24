from django.db import models
from apps.core.models import BaseModel
from apps.organisations.managers.organisation import OrganisationManager

class Organisation(BaseModel):
    """
    Represents a client or tenant organization in the Falcon PMS.
    """
    objects = OrganisationManager()

    name = models.CharField(max_length=255, help_text="Full legal name of the organization")
    slug = models.SlugField(max_length=100, unique=True, help_text="Unique identifier for the tenant (e.g., 'company-name')")
    logo = models.ImageField(upload_to='organisation_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Organisation"
        verbose_name_plural = "Organisations"
        ordering = ['name']
