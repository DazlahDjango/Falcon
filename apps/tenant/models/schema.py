
"""
Database schema tracking for multi-tenancy.
Tracks PostgreSQL schemas for tenants using separate schema isolation.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel


class SchemaStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Creation'
    CREATING = 'creating', 'Creating'
    ACTIVE = 'active', 'Active'
    MIGRATING = 'migrating', 'Migrating'
    FAILED = 'failed', 'Failed'
    DELETED = 'deleted', 'Deleted'


class TenantSchema(BaseModel):
    """
    Tracks database schema information for each tenant.
    Used when schema_type = 'separate' in tenant configuration.
    """

    tenant = models.OneToOneField(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='schema',
        help_text="Tenant this schema belongs to"
    )

    schema_name = models.CharField(
        max_length=63,
        unique=True,
        db_index=True,
        help_text="PostgreSQL schema name (e.g., tenant_acme_corp)"
    )

    status = models.CharField(
        max_length=20,
        choices=SchemaStatus.choices,
        default=SchemaStatus.PENDING,
        db_index=True,
        help_text="Current schema status"
    )

    is_ready = models.BooleanField(
        default=False,
        help_text="Is the schema ready for use?"
    )

    created_at_schema = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the actual database schema was created"
    )

    last_migration_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the last migration was applied"
    )

    last_migration_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Name of the last migration applied"
    )

    table_count = models.IntegerField(
        default=0,
        help_text="Number of tables in this schema"
    )

    size_mb = models.FloatField(
        default=0,
        help_text="Total size of this schema in MB"
    )

    error_message = models.TextField(
        blank=True,
        help_text="Error message if schema creation/migration failed"
    )

    class Meta:
        db_table = 'tenant_schemas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['schema_name']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['is_ready']),
        ]

    def __str__(self):
        return f"Schema: {self.schema_name} (Tenant: {self.tenant.name})"

    @property
    def is_active(self):
        return self.status == SchemaStatus.ACTIVE and self.is_ready

    @property
    def full_schema_path(self):
        return f"{self.schema_name}.*"

    def mark_creating(self):
        self.status = SchemaStatus.CREATING
        self.save(update_fields=['status'])

    def mark_active(self):
        self.status = SchemaStatus.ACTIVE
        self.is_ready = True
        self.created_at_schema = timezone.now()
        self.save(update_fields=['status', 'is_ready', 'created_at_schema'])

    def mark_migrating(self, migration_name):
        self.status = SchemaStatus.MIGRATING
        self.last_migration_name = migration_name
        self.save(update_fields=['status', 'last_migration_name'])

    def mark_migration_complete(self):
        self.status = SchemaStatus.ACTIVE
        self.last_migration_at = timezone.now()
        self.save(update_fields=['status', 'last_migration_at'])

    def mark_failed(self, error_message):
        self.status = SchemaStatus.FAILED
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message'])

    def update_stats(self, table_count, size_mb):
        self.table_count = table_count
        self.size_mb = size_mb
        self.save(update_fields=['table_count', 'size_mb'])
