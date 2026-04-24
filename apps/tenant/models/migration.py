
"""
Tenant-specific migration tracking.
Tracks which migrations have been applied to which tenant.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel


class MigrationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    ROLLED_BACK = 'rolled_back', 'Rolled Back'


class TenantMigration(BaseModel):
    """
    Tracks migrations applied to each tenant.
    Essential for multi-tenant systems with separate schemas/databases.
    """

    tenant = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='migrations',
        help_text="Tenant this migration was applied to"
    )

    migration_name = models.CharField(
        max_length=255,
        help_text="Name of the migration (e.g., 0001_initial)"
    )

    app_name = models.CharField(
        max_length=100,
        help_text="Django app this migration belongs to"
    )

    status = models.CharField(
        max_length=20,
        choices=MigrationStatus.choices,
        default=MigrationStatus.PENDING,
        db_index=True,
        help_text="Current migration status"
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When migration started"
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When migration completed"
    )

    error_message = models.TextField(
        blank=True,
        help_text="Error message if migration failed"
    )

    error_traceback = models.TextField(
        blank=True,
        help_text="Full traceback if migration failed"
    )

    execution_time_ms = models.IntegerField(
        null=True,
        blank=True,
        help_text="How long the migration took in milliseconds"
    )

    is_rollback = models.BooleanField(
        default=False,
        help_text="Is this a rollback migration?"
    )

    rolled_back_from = models.CharField(
        max_length=255,
        blank=True,
        help_text="Which migration was rolled back from"
    )

    class Meta:
        db_table = 'tenant_migrations'
        ordering = ['-created_at']
        unique_together = [['tenant', 'migration_name', 'app_name']]
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['status', 'completed_at']),
            models.Index(fields=['app_name', 'migration_name']),
        ]

    def __str__(self):
        return f"{self.tenant.name}: {self.app_name}.{self.migration_name} ({self.status})"

    @property
    def is_completed(self):
        return self.status == MigrationStatus.COMPLETED

    @property
    def is_failed(self):
        return self.status == MigrationStatus.FAILED

    @property
    def is_pending(self):
        return self.status == MigrationStatus.PENDING

    def mark_started(self):
        self.status = MigrationStatus.RUNNING
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])

    def mark_completed(self, execution_time_ms=None):
        self.status = MigrationStatus.COMPLETED
        self.completed_at = timezone.now()
        if execution_time_ms:
            self.execution_time_ms = execution_time_ms
        self.save(update_fields=[
                  'status', 'completed_at', 'execution_time_ms'])

    def mark_failed(self, error_message, error_traceback=''):
        self.status = MigrationStatus.FAILED
        self.error_message = error_message
        self.error_traceback = error_traceback
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message',
                  'error_traceback', 'completed_at'])

    def mark_rolled_back(self):
        self.status = MigrationStatus.ROLLED_BACK
        self.save(update_fields=['status'])
