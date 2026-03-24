from django.db import models
from apps.core.models import BaseModel
from .organisation import Organisation

class OrganisationSettings(BaseModel):
    """
    Stores tenant-specific configuration and branding.
    """
    organisation = models.OneToOneField(Organisation, on_delete=models.CASCADE, related_name='settings')
    theme_color = models.CharField(max_length=7, default="#007bff", help_text="Hex color code for branding")
    fiscal_year_start = models.DateField(null=True, blank=True)
    max_users = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"Settings for {self.organisation.name}"

    class Meta:
        verbose_name = "Organisation Settings"
        verbose_name_plural = "Organisation Settings"
