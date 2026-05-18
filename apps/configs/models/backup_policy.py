# apps/config/models/backup_policy.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseConfigModel
from .registered_app import RegisteredApp

class BackupPolicy(BaseConfigModel):
    BACKUP_TYPE_CHOICES = [('full', 'Full Backup'), ('incremental', 'Incremental Backup'), ('differential', 'Differential Backup'), ('synthetic', 'Synthetic Full Backup'), ('cdp', 'Continuous Data Protection')]
    BACKUP_STATUS_CHOICES = [('enabled', 'Enabled'), ('disabled', 'Disabled'), ('maintenance', 'Maintenance Mode - Paused')]
    STORAGE_CLASS_CHOICES = [('standard', 'Standard - Frequent Access'), ('intelligent', 'Intelligent-Tiering'), ('glacier', 'Glacier - Long-term Archive'), ('deep_archive', 'Deep Archive - 10+ Years')]
    
    app = models.OneToOneField(RegisteredApp, on_delete=models.CASCADE, related_name='backup_policy')
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPE_CHOICES, default='full')
    status = models.CharField(max_length=20, choices=BACKUP_STATUS_CHOICES, default='enabled', db_index=True)
    schedule_cron = models.CharField(max_length=100, blank=True, help_text="Cron expression for scheduled backups")
    schedule_weekdays_only = models.BooleanField(default=True, help_text="Only run backups Monday-Friday")
    retention_days = models.IntegerField(default=30, help_text="Number of days to keep backups")
    retention_full_weeks = models.IntegerField(default=4, help_text="Keep weekly full backups for this many weeks")
    retention_monthly = models.IntegerField(default=12, help_text="Keep monthly backups for this many months")
    compression_enabled = models.BooleanField(default=True)
    compression_algorithm = models.CharField(max_length=20, default='zstd', help_text="zstd, gzip, lz4")
    encryption_enabled = models.BooleanField(default=True)
    encryption_algorithm = models.CharField(max_length=20, default='AES-256-GCM')
    storage_class = models.CharField(max_length=20, choices=STORAGE_CLASS_CHOICES, default='standard')
    incremental_chain_length = models.IntegerField(default=30, help_text="Max increments before new full backup", validators=[MinValueValidator(1), MaxValueValidator(365)])
    parallel_backup_workers = models.IntegerField(default=4, validators=[MinValueValidator(1), MaxValueValidator(16)])
    backup_timeout_minutes = models.IntegerField(default=60, validators=[MinValueValidator(5), MaxValueValidator(1440)])
    pre_backup_hook = models.CharField(max_length=500, blank=True, help_text="Script/command to run before backup")
    post_backup_hook = models.CharField(max_length=500, blank=True, help_text="Script/command to run after backup")
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'config_backup_policy'
    
    def __str__(self):
        return f"{self.app.name} - {self.get_backup_type_display()} ({self.get_status_display()})"