import re
from django.db import models
from django.utils import timezone
from django.core.validators import EmailValidator
from .base import BaseModel
from .sector import OrganizationSector
from ..managers import OrganizationManager
from ..constants import OrganizationStatus, SubscriptionTier


class Organization(BaseModel):
    status = models.CharField(
        max_length=20,
        choices=OrganizationStatus.choices,
        default=OrganizationStatus.PENDING,
        db_index=True,
    )
    tenant_id = models.UUIDField(
        db_index=True,
        null=True,
        blank=True,
        help_text='Legacy tenant ID retained for migration compatibility.',
    )
    name = models.CharField(max_length=200, db_index=True)
    slug = models.CharField(max_length=100, unique=True, db_index=True)
    sector = models.ForeignKey(
        OrganizationSector,
        on_delete=models.PROTECT,
        related_name='organizations',
        null=True,
        blank=True,
    )
    contact_email = models.EmailField(db_index=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='organization/logos/', blank=True, null=True)
    favicon = models.ImageField(upload_to='organization/favicons/', blank=True, null=True)
    primary_color = models.CharField(max_length=20, default='#2563EB')
    secondary_color = models.CharField(max_length=20, default='#7C3AED')
    is_active = models.BooleanField(default=True, db_index=True)
    is_onboarded = models.BooleanField(default=False, db_index=True)
    onboarded_at = models.DateTimeField(null=True, blank=True)
    subscription_tier = models.CharField(
        max_length=50,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE,
    )
    metadata = models.JSONField(default=dict, blank=True)

    objects = OrganizationManager()

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['tenant_id']),
            models.Index(fields=['contact_email']),
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['sector', 'status']),
            models.Index(fields=['is_onboarded', 'status']),
        ]

    def __str__(self):
        return self.name

    # ------------------------------------------------------------------ #
    # Derived state                                                         #
    # ------------------------------------------------------------------ #

    @property
    def schema_name(self):
        try:
            if hasattr(self, 'schema') and self.schema and self.schema.schema_name:
                return self.schema.schema_name
        except Exception:
            pass
        return f"org_{self.slug.replace('-', '_').lower()}"

    @property
    def is_provisioning(self):
        return self.status == OrganizationStatus.PROVISIONING

    @property
    def is_provisioned(self):
        return self.is_onboarded and self.status == OrganizationStatus.ACTIVE

    @property
    def provisioning_state(self):
        return (self.metadata or {}).get('provisioning', {})

    @property
    def provisioning_progress(self):
        return self.provisioning_state.get('progress', 0)

    # ------------------------------------------------------------------ #
    # Validation                                                            #
    # ------------------------------------------------------------------ #

    def clean(self):
        if not self.name or not self.name.strip():
            raise models.ValidationError({'name': 'Organization name is required.'})
        EmailValidator()(self.contact_email)
        if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$', self.slug):
            raise models.ValidationError({'slug': 'Slug must be lowercase alphanumeric with optional hyphens.'})

    # ------------------------------------------------------------------ #
    # Lifecycle transitions                                                 #
    # ------------------------------------------------------------------ #

    def mark_provisioning(self):
        self.status = OrganizationStatus.PROVISIONING
        self.is_active = True
        self.save(update_fields=['status', 'is_active', 'updated_at'])

    def mark_onboarded(self):
        self.is_onboarded = True
        self.onboarded_at = timezone.now()
        self.status = OrganizationStatus.ACTIVE
        self.is_active = True
        self.save(update_fields=['is_onboarded', 'onboarded_at', 'status', 'is_active', 'updated_at'])

    def mark_failed(self, error_message=None):
        self.status = OrganizationStatus.FAILED
        self.is_active = False
        self.is_onboarded = False
        meta = self.metadata or {}
        provisioning = meta.setdefault('provisioning', {})
        provisioning.update({
            'status': 'FAILED',
            'error': error_message,
            'failed_at': timezone.now().isoformat(),
        })
        self.metadata = meta
        self.save(update_fields=['status', 'is_active', 'is_onboarded', 'metadata', 'updated_at'])

    def reset_for_provisioning_retry(self):
        self.status = OrganizationStatus.PENDING
        self.is_onboarded = False
        meta = self.metadata or {}
        meta.pop('provisioning', None)
        self.metadata = meta
        self.save(update_fields=['status', 'is_onboarded', 'metadata', 'updated_at'])

    def suspend(self):
        self.status = OrganizationStatus.SUSPENDED
        self.is_active = False
        self.save(update_fields=['status', 'is_active', 'updated_at'])

    def activate(self):
        self.status = OrganizationStatus.ACTIVE
        self.is_active = True
        self.save(update_fields=['status', 'is_active', 'updated_at'])

    def archive(self):
        self.status = OrganizationStatus.ARCHIVED
        self.is_active = False
        self.save(update_fields=['status', 'is_active', 'updated_at'])

    def record_audit(self, action, user_id=None, details=None):
        meta = self.metadata or {}
        audit_log = meta.setdefault('audit_log', [])
        audit_log.append({
            'action': action,
            'user_id': str(user_id) if user_id else None,
            'details': details or {},
            'timestamp': timezone.now().isoformat(),
        })
        meta['audit_log'] = audit_log[-50:]
        self.metadata = meta
        self.save(update_fields=['metadata', 'updated_at'])
