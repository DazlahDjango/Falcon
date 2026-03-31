from django.db import models
from apps.core.models import BaseModel
from .organisation import Organisation

class Branding(BaseModel):
    """
    Handles organization-specific visual identity and branding.
    """
    organisation = models.OneToOneField(
        Organisation,
        on_delete=models.CASCADE,
        related_name='branding_details'
    )
    
    # Visual Identity
    logo = models.ImageField(upload_to='organisation_logos/', null=True, blank=True)
    favicon = models.ImageField(upload_to='organisation_favicons/', null=True, blank=True)
    
    # Primary Colors
    theme_color = models.CharField(max_length=7, default="#3B82F6")
    secondary_color = models.CharField(max_length=7, default="#10B981")
    accent_color = models.CharField(max_length=7, default="#F59E0B")
    
    # Custom CSS/Assets
    custom_css = models.TextField(blank=True, null=True)
    font_family = models.CharField(max_length=100, default="Inter", blank=True)
    
    # White labeling
    is_white_labeled = models.BooleanField(default=False)
    powered_by_falcon = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Branding"
        verbose_name_plural = "Branding"

    def __str__(self):
        return f"Branding for {self.organisation.name}"