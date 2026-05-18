from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp

class BackupJob(BaseConfigModel):
    BACKUP_TYPE_CHOICES = [('full', 'Full Backup'), ('incremental', 'Incremental'), ('differential', 'Differential'), ('synthetic', 'Synthetic'), ('cdp', 'CDP')]
    STATUS_CHOICES = [('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed'), ('cancelled', 'Cancelled'), ('partial', 'Partial Success'), ('verifying', 'Verifying Integrity')]
    
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='backup_jobs')
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    triggered_by = models.UUIDField(db_index=True, help_text="User ID who triggered this backup (system if scheduled)")
    triggered_by_role = models.CharField(max_length=50, help_text="super_admin or client_admin")
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    size_bytes = models.BigIntegerField(null=True, blank=True, help_text="Compressed encrypted size")
    original_size_bytes = models.BigIntegerField(null=True, blank=True, help_text="Original uncompressed size")
    compression_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    checksum = models.CharField(max_length=128, blank=True, help_text="SHA-256 checksum of backup")
    parent_job = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_jobs', help_text="For incremental/differential - points to last full backup")
    sequence_number = models.IntegerField(default=1, help_text="Sequence number in backup chain")
    error_message = models.TextField(blank=True)
    error_code = models.CharField(max_length=50, blank=True)
    retry_count = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'config_backup_job'
        ordering = ['-started_at']
        indexes = [models.Index(fields=['app', 'status', 'started_at']), models.Index(fields=['triggered_by', 'started_at']), models.Index(fields=['parent_job', 'sequence_number'])]
    
    def __str__(self):
        return f"{self.app.name} - {self.get_backup_type_display()} - {self.status} - {self.started_at}"

class BackupJobDetail(BaseConfigModel):
    DETAIL_TYPE_CHOICES = [('table', 'Database Table'), ('schema', 'Database Schema'), ('file', 'File/Blob'), ('config', 'Configuration'), ('cache', 'Cache Data'), ('queue', 'Message Queue')]
    
    backup_job = models.ForeignKey(BackupJob, on_delete=models.CASCADE, related_name='details')
    detail_type = models.CharField(max_length=20, choices=DETAIL_TYPE_CHOICES)
    name = models.CharField(max_length=255, help_text="Table name, schema name, or file path")
    rows_processed = models.IntegerField(null=True, blank=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    error_message = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'config_backup_job_detail'
        indexes = [models.Index(fields=['backup_job', 'detail_type'])]