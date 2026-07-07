from django.db import models
from django.utils import timezone
from .base import BaseModel
from .organization import Organization
from ..managers import SchemaManager


class OrganizationSchema(BaseModel):
    SCHEMA_STATUS = [
        ('PENDING', 'Pending'),
        ('CREATING', 'Creating'),
        ('ACTIVE', 'Active'),
        ('MIGRATING', 'Migrating'),
        ('FAILED', 'Failed'),
        ('DELETED', 'Deleted'),
    ]
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='schema')
    schema_name = models.CharField(max_length=63, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=SCHEMA_STATUS, default='PENDING', db_index=True)
    is_ready = models.BooleanField(default=False)
    created_at_schema = models.DateTimeField(null=True, blank=True)
    last_migration_at = models.DateTimeField(null=True, blank=True)
    last_migration_name = models.CharField(max_length=255, blank=True)
    table_count = models.IntegerField(default=0)
    size_mb = models.FloatField(default=0)
    error_message = models.TextField(blank=True)
    objects = SchemaManager()

    class Meta:
        db_table = 'organization_schemas'
        ordering = ['-created_at']
        verbose_name = 'Organization Schema'
        verbose_name_plural = 'Organization Schemas'
        indexes = [
            models.Index(fields=['schema_name']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['is_ready']),
        ]

    def __str__(self):
        return f"{self.schema_name} ({self.organization.name})"

    def mark_creating(self):
        self.status = 'CREATING'
        self.save(update_fields=['status'])

    def mark_active(self):
        self.status = 'ACTIVE'
        self.is_ready = True
        self.created_at_schema = timezone.now()
        self.save(update_fields=['status', 'is_ready', 'created_at_schema'])

    def mark_migrating(self, migration_name):
        self.status = 'MIGRATING'
        self.last_migration_name = migration_name
        self.save(update_fields=['status', 'last_migration_name'])

    def mark_migration_complete(self):
        self.status = 'ACTIVE'
        self.last_migration_at = timezone.now()
        self.save(update_fields=['status', 'last_migration_at'])

    def mark_failed(self, error_message):
        self.status = 'FAILED'
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message'])

    def update_stats(self, table_count, size_mb):
        self.table_count = table_count
        self.size_mb = size_mb
        self.save(update_fields=['table_count', 'size_mb'])