import uuid
from django.db import models
from django.utils import timezone
from .base import BaseModel
from .organization import Organization
from ..managers import DomainManager


class OrganizationDomain(BaseModel):
    DOMAIN_STATUS = [
        ('PENDING', 'Pending'),
        ('VERIFYING', 'Verifying'),
        ('ACTIVE', 'Active'),
        ('FAILED', 'Failed'),
        ('EXPIRED', 'Expired'),
        ('REMOVED', 'Removed'),
    ]
    domain = models.CharField(max_length=255, unique=True, db_index=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='domains')
    is_primary = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=DOMAIN_STATUS, default='PENDING', db_index=True)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_error = models.TextField(blank=True)
    ssl_issued_at = models.DateTimeField(null=True, blank=True)
    ssl_expires_at = models.DateTimeField(null=True, blank=True)
    ssl_issuer = models.CharField(max_length=255, blank=True)
    force_https = models.BooleanField(default=True)
    redirect_to = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    objects = DomainManager()

    class Meta:
        db_table = 'organization_domains'
        ordering = ['-is_primary', '-created_at']
        verbose_name = 'Organization Domain'
        verbose_name_plural = 'Organization Domains'
        indexes = [
            models.Index(fields=['domain']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'is_primary']),
            models.Index(fields=['status', 'verified_at']),
            models.Index(fields=['ssl_expires_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['organization'],
                condition=models.Q(is_primary=True),
                name='unique_primary_domain_per_organization'
            )
        ]

    def __str__(self):
        return self.domain

    def mark_verified(self):
        self.status = 'ACTIVE'
        self.verified_at = timezone.now()
        self.verification_error = ''
        self.save(update_fields=['status', 'verified_at', 'verification_error'])

    def mark_failed(self, error_message):
        self.status = 'FAILED'
        self.verification_error = error_message
        self.save(update_fields=['status', 'verification_error'])

    def set_primary(self):
        OrganizationDomain.objects.filter(organization=self.organization, is_primary=True).exclude(id=self.id).update(is_primary=False)
        self.is_primary = True
        self.save(update_fields=['is_primary'])

    def update_ssl(self, issued_at, expires_at, issuer):
        self.ssl_issued_at = issued_at
        self.ssl_expires_at = expires_at
        self.ssl_issuer = issuer
        self.save(update_fields=['ssl_issued_at', 'ssl_expires_at', 'ssl_issuer'])

    def get_full_url(self, path=''):
        protocol = 'https' if self.force_https else 'http'
        path = path.lstrip('/')
        return f"{protocol}://{self.domain}/{path}"