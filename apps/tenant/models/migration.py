from django.db import models
from django.utils import timezone
from .base import BaseModel
from .organization import Organization
from ..managers import MigrationManager


class OrganizationMigration(BaseModel):
    MIGRATION_STATUS = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('ROLLED_BACK', 'Rolled Back'),
    ]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='migrations')
    migration_name = models.CharField(max_length=255)
    app_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=MIGRATION_STATUS, default='PENDING', db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    error_traceback = models.TextField(blank=True)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    is_rollback = models.BooleanField(default=False)
    rolled_back_from = models.CharField(max_length=255, blank=True)
    objects = MigrationManager()

    @property
    def is_completed(self):
        return self.status == 'COMPLETED'

    @property
    def is_failed(self):
        return self.status == 'FAILED'

    @property
    def is_pending(self):
        return self.status == 'PENDING'

    class Meta:
        db_table = 'organization_migrations'
        ordering = ['-created_at']
        verbose_name = 'Organization Migration'
        verbose_name_plural = 'Organization Migrations'
        unique_together = [['organization', 'migration_name', 'app_name']]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['status', 'completed_at']),
            models.Index(fields=['app_name', 'migration_name']),
        ]

    def __str__(self):
        return f"{self.organization.name}: {self.app_name}.{self.migration_name} ({self.get_status_display()})"

    def mark_started(self):
        self.status = 'RUNNING'
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])

    def mark_completed(self, execution_time_ms=None):
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        if execution_time_ms:
            self.execution_time_ms = execution_time_ms
        self.save(update_fields=['status', 'completed_at', 'execution_time_ms'])

    def mark_failed(self, error_message, error_traceback=''):
        self.status = 'FAILED'
        self.error_message = error_message
        self.error_traceback = error_traceback
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message', 'error_traceback', 'completed_at'])

    def mark_rolled_back(self):
        self.status = 'ROLLED_BACK'
        self.save(update_fields=['status'])