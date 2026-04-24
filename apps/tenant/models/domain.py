
"""
Custom Domain model for tenant custom domains.
Allows tenants to use their own domain (e.g., pms.acme.com) instead of subdomain.
"""

import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .tenant import Client
from .base import BaseModel


class DomainStatus(models.TextChoices):
    """Status of custom domain verification and activation"""
    PENDING = 'pending', 'Pending Verification'      # DNS not verified yet
    VERIFYING = 'verifying', 'Verifying'              # Currently checking DNS
    ACTIVE = 'active', 'Active'                       # Verified and active
    FAILED = 'failed', 'Failed'                       # Verification failed
    EXPIRED = 'expired', 'Expired'                    # SSL certificate expired
    REMOVED = 'removed', 'Removed'                    # Removed by tenant


class CustomDomain(BaseModel):

    # ========================================================================
    # DOMAIN INFORMATIONS
    # ========================================================================
    domain = models.CharField(max_length=255, unique=True, db_index=True,
                              help_text="Custom domain name (e.g., pms.acme.com)")

    # Link to the client/tenant who owns this domain
    tenant = models.ForeignKey(Client, on_delete=models.CASCADE,
                               related_name='custom_domains', help_text="Tenant that owns this domain")

    # Is this the primary domain for this tenant?
    is_primary = models.BooleanField(
        default=False, help_text="If True, this is the main domain for this tenant")

    # ========================================================================
    # STATUS AND VERIFICATION
    # ========================================================================

    status = models.CharField(max_length=20, choices=DomainStatus.choices,
                              default=DomainStatus.PENDING, db_index=True, help_text="Current status of the domain")

    # DNS verification token (TXT record value to verify ownership)
    verification_token = models.UUIDField(
        default=uuid.uuid4, editable=False, help_text="Token for DNS verification (add as TXT record)")
    verified_at = models.DateTimeField(
        null=True, blank=True, help_text="When the domain was successfully verified")
    verification_error = models.TextField(
        blank=True, help_text="Error message if verification failed")

    # ========================================================================
    # SSL CERTIFICATE MANAGEMENT
    # ========================================================================

    # SSL certificate information (for HTTPS)
    ssl_issued_at = models.DateTimeField(
        null=True, blank=True, help_text="When SSL certificate was issued")
    ssl_expires_at = models.DateTimeField(
        null=True, blank=True, help_text="When SSL certificate expires")
    ssl_issuer = models.CharField(
        max_length=255, blank=True, help_text="SSL certificate issuer (e.g., Let's Encrypt)")

    # ========================================================================
    # ADDITIONAL SETTINGS
    # ========================================================================

    # Force HTTPS for this domain
    force_https = models.BooleanField(
        default=True, help_text="If True, redirect HTTP to HTTPS")

    # Custom redirect URL (optional)
    redirect_to = models.CharField(
        max_length=255, blank=True, help_text="Redirect this domain to another URL")

    # Metadata for additional domain settings
    metadata = models.JSONField(
        default=dict, blank=True, help_text="Additional domain metadata")

    class Meta:
        db_table = 'tenant_custom_domains'
        ordering = ['-is_primary', '-created_at']
        verbose_name = _('Custom Domain')
        verbose_name_plural = _('Custom Domains')
        indexes = [
            models.Index(fields=['domain']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tenant', 'is_primary']),
            models.Index(fields=['status', 'verified_at']),
            models.Index(fields=['ssl_expires_at']),
        ]
        constraints = [
            # Ensure only one primary domain per tenant
            models.UniqueConstraint(
                fields=['tenant'],
                condition=models.Q(is_primary=True),
                name='unique_primary_domain_per_tenant'
            )
        ]

    def __str__(self):
        return self.domain

    # ========================================================================
    # PROPERTIES
    # ========================================================================

    @property
    def is_active(self):
        """Check if domain is active and verified"""
        return self.status == DomainStatus.ACTIVE

    @property
    def is_verification_pending(self):
        """Check if domain needs verification"""
        return self.status == DomainStatus.PENDING

    @property
    def ssl_is_valid(self):
        """Check if SSL certificate is still valid"""
        if not self.ssl_expires_at:
            return False
        return self.ssl_expires_at > timezone.now()

    @property
    def days_until_ssl_expiry(self):
        """Get number of days until SSL certificate expires"""
        if not self.ssl_expires_at:
            return None
        remaining = (self.ssl_expires_at - timezone.now()).days
        return max(0, remaining)

    @property
    def verification_dns_record(self):
        """Get DNS TXT record value for verification"""
        return f"falcon-domain-verification={self.verification_token.hex}"

    # ========================================================================
    # METHODS
    # ========================================================================

    def mark_verified(self):
        """Mark domain as verified and active"""
        self.status = DomainStatus.ACTIVE
        self.verified_at = timezone.now()
        self.verification_error = ''
        self.save(update_fields=[
                  'status', 'verified_at', 'verification_error'])

    def mark_verification_failed(self, error_message):
        """Mark domain verification as failed"""
        self.status = DomainStatus.FAILED
        self.verification_error = error_message
        self.save(update_fields=['status', 'verification_error'])

    def set_primary(self):
        """Set this domain as primary for the tenant"""
        # Remove primary flag from all other domains of this client
        CustomDomain.objects.filter(
            tenant=self.tenant,
            is_primary=True
        ).exclude(id=self.id).update(is_primary=False)

        # Set this domain as primary
        self.is_primary = True
        self.save(update_fields=['is_primary'])

    def update_ssl_info(self, issued_at, expires_at, issuer):
        """Update SSL certificate information"""
        self.ssl_issued_at = issued_at
        self.ssl_expires_at = expires_at
        self.ssl_issuer = issuer
        self.save(update_fields=['ssl_issued_at',
                  'ssl_expires_at', 'ssl_issuer'])

    def get_full_url(self, path=''):
        """Get full URL for this domain"""
        protocol = 'https' if self.force_https else 'http'
        path = path.lstrip('/')
        return f"{protocol}://{self.domain}/{path}"
