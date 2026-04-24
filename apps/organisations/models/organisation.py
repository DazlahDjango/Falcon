"""
Organisation model - Core tenant model
"""

from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from apps.organisations.models.base import BaseTenantModel
from apps.organisations.constants import SectorType, OrganisationStatus
from apps.organisations.validators import validate_organisation_slug, validate_subdomain
from apps.organisations.managers.organisation import OrganisationManager
from apps.organisations.managers.organisation import OrganisationManager


class Organisation(BaseTenantModel):
    """
    Represents a client or tenant organization in the Falcon PMS.
    Each organisation is isolated with its own users, data, and configuration.
    """
    objects = OrganisationManager()
    # Basic identifiers
    name = models.CharField(max_length=255, db_index=True,
                            help_text="Full legal name of the organization")
    slug = models.SlugField(
        max_length=100,
        unique=True,
        validators=[validate_organisation_slug],
        help_text="URL-friendly identifier (e.g., 'acme-corporation')"
    )
    subdomain = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        validators=[validate_subdomain],
        help_text="Subdomain for tenant access (e.g., 'acme')"
    )

    # Classification
    sector = models.CharField(
        max_length=20,
        choices=SectorType.choices,
        default=SectorType.COMMERCIAL,
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=OrganisationStatus.choices,
        default=OrganisationStatus.PENDING,
        db_index=True
    )

    # Logo and branding (moved to Branding model, but keep for backward compatibility)
    logo = models.ImageField(
        upload_to='organisation_logos/', null=True, blank=True)

    # Status flags
    is_active = models.BooleanField(default=True, db_index=True)
    is_verified = models.BooleanField(
        default=False, help_text="Whether the organisation has been verified by an admin")
    is_demo = models.BooleanField(
        default=False, help_text="Is this a demo account?")

    # Legal & Registration
    registration_number = models.CharField(
        max_length=100, blank=True, null=True, help_text="Legal registration number")
    tax_id = models.CharField(max_length=100, blank=True, null=True,
                              help_text="Tax identification number (VAT/PIN)")

    # Contact Information
    website = models.URLField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(
        max_length=255, blank=True, null=True, help_text="Primary contact email")
    contact_phone = models.CharField(
        max_length=50, blank=True, null=True, help_text="Primary contact phone number")

    # Address
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    # Organisation details
    date_established = models.DateField(null=True, blank=True)
    employee_count = models.PositiveIntegerField(null=True, blank=True)

    # Classification (industry and size)
    INDUSTRY_CHOICES = [
        ('TECH', 'Technology'),
        ('FINANCE', 'Finance'),
        ('HEALTH', 'Healthcare'),
        ('EDU', 'Education'),
        ('MANUF', 'Manufacturing'),
        ('RETAIL', 'Retail'),
        ('GOVT', 'Government'),
        ('NONPROFIT', 'Non-Profit'),
        ('OTHER', 'Other'),
    ]
    COMPANY_SIZE_CHOICES = [
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-500', '201-500 employees'),
        ('501-1000', '501-1000 employees'),
        ('1000+', '1000+ employees'),
    ]
    industry = models.CharField(
        max_length=20, choices=INDUSTRY_CHOICES, default='OTHER')
    company_size = models.CharField(
        max_length=20, choices=COMPANY_SIZE_CHOICES, default='1-10')

    # Falcon internal
    notes = models.TextField(
        blank=True, help_text="Internal notes for Falcon staff")
    suspended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Organisation"
        verbose_name_plural = "Organisations"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['sector', 'status']),
            models.Index(fields=['slug']),
            models.Index(fields=['subdomain']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided and handle suspension timestamps"""
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = base_slug

            # Ensure uniqueness
            counter = 1
            while Organisation.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1

        # Handle suspension timestamps
        if self.status == OrganisationStatus.SUSPENDED and not self.suspended_at:
            self.suspended_at = timezone.now()
        elif self.status != OrganisationStatus.SUSPENDED:
            self.suspended_at = None

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        """Get URL for this organisation"""
        from django.urls import reverse
        return reverse('organisations:detail', args=[self.slug])

    def get_full_domain(self):
        """Get the full domain for this organisation"""
        if self.subdomain:
            return f"{self.subdomain}.falconpms.com"
        return None

    def get_active_users_count(self):
        """Get count of active users in this organisation"""
        from apps.accounts.models.user import User
        return User.objects.filter(organisation=self, is_active=True).count()

    def is_trialing(self):
        """Check if organisation is in trial period"""
        if hasattr(self, 'subscription'):
            return self.subscription.is_trialing()
        return False

    def has_feature(self, feature_name):
        """Check if a feature is enabled for this organisation"""
        # Check feature flags first
        if hasattr(self, 'feature_flags'):
            flags = {
                flag.feature_name: flag.is_enabled for flag in self.feature_flags.all()}
            if feature_name in flags:
                return flags[feature_name]

        # Check plan features
        if hasattr(self, 'subscription') and self.subscription.plan:
            return self.subscription.plan.features.get(feature_name, False)

        return False

    def can_add_user(self):
        """Check if organisation can add more users"""
        if not hasattr(self, 'subscription') or not self.subscription.plan:
            return True

        plan = self.subscription.plan
        current_users = self.get_active_users_count()
        return current_users < plan.max_users
