from django.db import models
from .base import BaseTenantModel
from apps.organisations.constants import ReviewCycle
from .organisation import Organisation


class OrganisationSettings(BaseTenantModel):
    """
    Stores tenant-specific configuration and branding.
    """
    organisation = models.OneToOneField(
        Organisation,
        on_delete=models.CASCADE,
        related_name='settings'
    )

    # Branding (moved from Organisation model)
    logo = models.ImageField(
        upload_to='organisation_logos/', null=True, blank=True)
    favicon = models.ImageField(
        upload_to='organisation_favicons/', null=True, blank=True)
    theme_color = models.CharField(
        max_length=7, default="#3B82F6", help_text="Primary Hex color code")
    secondary_color = models.CharField(
        max_length=7, default="#10B981", help_text="Secondary Hex color code")
    accent_color = models.CharField(
        max_length=7, default="#F59E0B", help_text="Accent Hex color code")

    # Localization & Regional
    from timezone_field import TimeZoneField
    timezone = TimeZoneField(default='UTC')
    language = models.CharField(
        max_length=10, default='en', help_text="Default system language (ISO code)")
    currency = models.CharField(max_length=3, default='USD',
                                help_text="Default currency code (e.g., USD, KES, EUR)")
    date_format = models.CharField(max_length=20, default='DD/MM/YYYY')

    # Review cycles
    review_cycle = models.CharField(
        max_length=20,
        choices=ReviewCycle.choices,
        default=ReviewCycle.ANNUAL
    )
    self_assessment_due_days = models.PositiveSmallIntegerField(default=7)
    supervisor_review_due_days = models.PositiveSmallIntegerField(default=14)

    # Rating scale configuration
    rating_scale = models.JSONField(
        default=dict,
        help_text="Rating scale configuration e.g., {'1': 'Poor', '5': 'Excellent'}"
    )

    # Module toggles (which features are enabled)
    modules_enabled = models.JSONField(
        default=dict,
        help_text="Enabled modules: {'pip': true, 'tasks': true, '360_reviews': false}"
    )

    # Data validation
    data_entry_deadline_day = models.PositiveSmallIntegerField(
        default=5, help_text="Day of month for data entry deadline")
    auto_approve_after_days = models.PositiveSmallIntegerField(
        null=True, blank=True)

    # Notification preferences
    notification_preferences = models.JSONField(default=dict)

    # Fiscal & Operational
    fiscal_year_start = models.PositiveSmallIntegerField(
        default=1, help_text="Month the fiscal year starts (1-12)")
    max_users = models.PositiveIntegerField(default=10)
    is_onboarding_complete = models.BooleanField(default=False)

    # Default templates
    default_kpi_template = models.CharField(
        max_length=100, blank=True, help_text="Default KPI template for new users")

    class Meta:
        verbose_name = "Organisation Settings"
        verbose_name_plural = "Organisation Settings"

    def __str__(self):
        return f"Settings for {self.organisation.name}"

    def get_branding_css(self):
        """Generate CSS variables for branding"""
        return f"""
        :root {{
            --primary: {self.theme_color};
            --secondary: {self.secondary_color};
            --accent: {self.accent_color};
        }}
        """

    def is_module_enabled(self, module_name):
        """Check if a specific module is enabled"""
        return self.modules_enabled.get(module_name, False)
