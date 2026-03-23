from django.db import models
from apps.core.models import BaseModel

class Organisation(BaseModel):
    """
    Represents a client or tenant organization in the Falcon PMS.
    """
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


class Subscription(BaseModel):
    """
    Manages the subscription status and plan for an organization.
    """
    PLAN_CHOICES = [
        ('STARTER', 'Starter'),
        ('PROFESSIONAL', 'Professional'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    organisation = models.OneToOneField(Organisation, on_delete=models.CASCADE, related_name='subscription')
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default='STARTER')
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.organisation.name} - {self.get_plan_type_display()}"


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


class Domain(BaseModel):
    """
    Manages URLs/subdomains for the organization.
    """
    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='domains')
    domain_name = models.CharField(max_length=255, unique=True)
    is_primary = models.BooleanField(default=True)

    def __str__(self):
        return self.domain_name
