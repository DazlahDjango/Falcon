from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from .base import BaseModel
import uuid


class Client(BaseModel):
    """
    Client (Tenant) model - represents an organization using the platform.
    This is the core of multi-tenancy - every user and data belongs to a client.
    """

    # Core fields
    tenant_id = models.UUIDField(default=uuid.uuid4, primary_key=True, unique=True, editable=False)
    name = models.CharField(_('company name'), max_length=255, db_index=True)
    slug = models.CharField(
        _('slug'), max_length=100, unique=True, db_index=True,
        validators=[RegexValidator(
            r'^[a-z0-9-]+$', 'Only lowercase letters, numbers, and hyphens allowed.')],
        help_text='URL-friendly identifier (e.g., acme-corp)'
    )

    # Domain & branding
    domain = models.CharField(
        _('custom domain'), max_length=255, blank=True, unique=True, null=True)
    logo = models.ImageField(
        _('logo'), upload_to='tenant_logos/%Y/%m/', blank=True, null=True)
    favicon = models.ImageField(
        _('favicon'), upload_to='tenant_favicons/', blank=True, null=True)
    primary_color = models.CharField(
        _('primary color'), max_length=7, default='#2563eb')
    secondary_color = models.CharField(
        _('secondary color'), max_length=7, default='#7c3aed')

    # Subscription
    SUBSCRIPTION_TRIAL = 'trial'
    SUBSCRIPTION_BASIC = 'basic'
    SUBSCRIPTION_PROFESSIONAL = 'professional'
    SUBSCRIPTION_ENTERPRISE = 'enterprise'

    SUBSCRIPTION_CHOICES = [
        (SUBSCRIPTION_TRIAL, 'Trial'),
        (SUBSCRIPTION_BASIC, 'Basic'),
        (SUBSCRIPTION_PROFESSIONAL, 'Professional'),
        (SUBSCRIPTION_ENTERPRISE, 'Enterprise'),
    ]

    subscription_plan = models.CharField(
        _('subscription plan'), max_length=20,
        choices=SUBSCRIPTION_CHOICES, default=SUBSCRIPTION_TRIAL
    )
    subscription_expires_at = models.DateTimeField(
        _('subscription expires'), null=True, blank=True)

    # Status
    is_active = models.BooleanField(_('active'), default=True)
    is_verified = models.BooleanField(
        _('verified'), default=False, help_text='Email/domain verified')

    # Contact information
    contact_email = models.EmailField(_('contact email'), blank=True)
    contact_phone = models.CharField(
        _('contact phone'), max_length=20, blank=True)
    address = models.TextField(_('address'), blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)

    # Settings
    settings = models.JSONField(_('settings'), default=dict, blank=True)
    features = models.JSONField(_('features'), default=dict, blank=True)

    # Metadata
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)

    class Meta:
        db_table = 'tenant_client'
        verbose_name = _('client')
        verbose_name_plural = _('clients')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['domain']),
            models.Index(fields=['is_active', 'subscription_plan']),
        ]

    def __str__(self):
        return self.name

    @property
    def is_trial(self):
        """Check if client is on trial."""
        return self.subscription_plan == self.SUBSCRIPTION_TRIAL

    @property
    def is_subscription_active(self):
        """Check if subscription is active."""
        if self.subscription_expires_at is None:
            return True
        return timezone.now() < self.subscription_expires_at

    @property
    def can_create_users(self):
        """Check if client can create more users."""
        max_users = self.get_feature('max_users', 10)
        from apps.accounts.models import User
        user_count = User.objects.filter(
            tenant_id=self.id, is_deleted=False).count()
        return user_count < max_users

    def get_feature(self, feature_name, default=None):
        """Get a feature value."""
        return self.features.get(feature_name, default)

    def get_setting(self, setting_name, default=None):
        """Get a setting value."""
        return self.settings.get(setting_name, default)

    def get_branding(self):
        """Get branding information."""
        return {
            'logo': self.logo.url if self.logo else None,
            'favicon': self.favicon.url if self.favicon else None,
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
        }

    def get_default_features(self):
        """Get default features based on subscription plan."""
        features = {
            'max_users': 10,
            'max_kpis': 50,
            'custom_branding': False,
            'api_access': False,
            'sso': False,
            'advanced_analytics': False,
            'audit_logs': True,
            'reports': True,
        }

        if self.subscription_plan == self.SUBSCRIPTION_BASIC:
            features.update({
                'max_users': 50,
                'max_kpis': 100,
            })
        elif self.subscription_plan == self.SUBSCRIPTION_PROFESSIONAL:
            features.update({
                'max_users': 500,
                'max_kpis': 1000,
                'custom_branding': True,
                'api_access': True,
                'advanced_analytics': True,
            })
        elif self.subscription_plan == self.SUBSCRIPTION_ENTERPRISE:
            features.update({
                'max_users': 10000,
                'max_kpis': 10000,
                'custom_branding': True,
                'api_access': True,
                'sso': True,
                'advanced_analytics': True,
            })

        return features

    def save(self, *args, **kwargs):
        """Set default features on creation."""
        if not self.features:
            self.features = self.get_default_features()
        super().save(*args, **kwargs)
