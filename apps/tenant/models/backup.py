
"""
Backup management for tenant data.
Tracks backup schedules, status, and recovery points.
"""

from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.utils.translation import gettext_lazy as _
from .base import BaseModel


class BackupType(models.TextChoices):
    FULL = 'full', 'Full Backup'
    SCHEMA = 'schema', 'Schema Only'
    DATA = 'data', 'Data Only'
    INCREMENTAL = 'incremental', 'Incremental'


class BackupStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'


class TenantBackup(BaseModel):
    """
    Tracks backups for each tenant.
    """

    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE,
                               related_name='backups', help_text="Tenant this backup belongs to")

    backup_type = models.CharField(max_length=20, choices=BackupType.choices,
                                   default=BackupType.FULL, help_text="Type of backup performed")
    status = models.CharField(max_length=20, choices=BackupStatus.choices,
                              default=BackupStatus.PENDING, db_index=True, help_text="Current backup status")
    backup_file = models.CharField(
        max_length=500, blank=True, help_text="Path or URL to backup file")
    file_size_mb = models.FloatField(
        default=0, help_text="Size of backup file in MB")
    started_at = models.DateTimeField(
        null=True, blank=True, help_text="When backup started")
    completed_at = models.DateTimeField(
        null=True, blank=True, help_text="When backup completed")
    error_message = models.TextField(
        blank=True, help_text="Error message if backup failed")
    retention_days = models.IntegerField(
        default=30, help_text="Number of days to keep this backup")
    expires_at = models.DateTimeField(
        null=True, blank=True, help_text="When this backup expires and can be deleted")

    class Meta:
        db_table = 'tenant_backups'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tenant', 'created_at']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['status', 'completed_at']),
        ]

    def __str__(self):
        return f"Backup for {self.tenant.name} - {self.created_at.date()}"

    @property
    def is_completed(self):
        return self.status == BackupStatus.COMPLETED

    @property
    def is_failed(self):
        return self.status == BackupStatus.FAILED

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    @property
    def duration_seconds(self):
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    def mark_started(self):
        self.status = BackupStatus.RUNNING
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])

    def mark_completed(self, backup_file, file_size_mb):
        self.status = BackupStatus.COMPLETED
        self.completed_at = timezone.now()
        self.backup_file = backup_file
        self.file_size_mb = file_size_mb
        self.save(update_fields=[
                  'status', 'completed_at', 'backup_file', 'file_size_mb'])

    def mark_failed(self, error_message):
        self.status = BackupStatus.FAILED
        self.error_message = error_message
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message', 'completed_at'])

    def set_expiry(self):
        self.expires_at = timezone.now() + timezone.timedelta(days=self.retention_days)
        self.save(update_fields=['expires_at'])
