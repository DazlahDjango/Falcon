from django.db import models
from .base import BaseKPIModel

class BackupRecord(BaseKPIModel):
    BACKUP_TYPES = [
        ('full', 'Full Backup'),
        ('database', 'Database Backup'),
        ('media', 'Media Backup'),
        ('config', 'Configuration Backup'),
    ]

    DESTINATIONS = [
        ('local', 'Local Storage'),
        ('s3', 'Amazon S3'),
        ('both', 'Both'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    timestamp = models.CharField(max_length=50, unique=True)
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPES)
    destination = models.CharField(max_length=20, choices=DESTINATIONS)
    size = models.BigIntegerField(help_text="Size in bytes")
    files = models.JSONField(default=dict, help_text="List of backup files")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'kpi_backup_records'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.backup_type} backup - {self.timestamp}"