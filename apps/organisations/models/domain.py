"""
Domain model for custom domains
"""

from django.db import models
import secrets
from apps.core.models import BaseModel
from .organisation import Organisation
from apps.organisations.constants import DomainVerificationStatus, SSLStatus
from apps.organisations.managers import DomainManager


class Domain(BaseModel):
    """
    Manages custom domains for organisations.
    """
    objects = DomainManager()
    
    organisation = models.ForeignKey(
        Organisation, 
        on_delete=models.CASCADE, 
        related_name='domains'
    )
    domain_name = models.CharField(max_length=255, unique=True)
    is_primary = models.BooleanField(default=False)
    
    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=DomainVerificationStatus.choices,
        default=DomainVerificationStatus.PENDING
    )
    verification_token = models.CharField(max_length=100, unique=True, blank=True)
    
    # SSL
    ssl_status = models.CharField(
        max_length=20,
        choices=SSLStatus.choices,
        default=SSLStatus.PENDING
    )
    ssl_expiry_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Domain"
        verbose_name_plural = "Domains"
        ordering = ['-is_primary', 'domain_name']
        indexes = [
            models.Index(fields=['organisation', 'verification_status']),
            models.Index(fields=['domain_name']),
        ]

    def __str__(self):
        return self.domain_name
    
    def save(self, *args, **kwargs):
        if not self.verification_token:
            self.verification_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    
    def is_verified(self):
        """Check if domain is verified"""
        return self.verification_status == DomainVerificationStatus.VERIFIED
    
    def has_active_ssl(self):
        """Check if SSL is active"""
        return self.ssl_status == SSLStatus.ACTIVE