from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp
from apps.configs.managers.maintenance_window_manager import MaintenanceWindowManager

class MaintenanceWindow(BaseConfigModel):
    MAINTENANCE_TYPE_CHOICES = [('full', 'Full Maintenance - ALL apps stopped'), ('partial', 'Partial Maintenance - Specific apps stopped'), ('rolling', 'Rolling Maintenance - Apps restart one by one'), ('emergency', 'Emergency Maintenance - Immediate, no schedule')]
    STATUS_CHOICES = [('scheduled', 'Scheduled'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('failed', 'Failed')]
    
    title = models.CharField(max_length=255)
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled', db_index=True)
    affected_apps = models.ManyToManyField(RegisteredApp, related_name='maintenance_windows', help_text="Which apps are affected (all if full maintenance)")
    scheduled_start = models.DateTimeField(db_index=True)
    scheduled_end = models.DateTimeField(db_index=True)
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    triggered_by = models.UUIDField(db_index=True, help_text="User ID who created/triggered this maintenance")
    triggered_by_role = models.CharField(max_length=50, help_text="super_admin or client_admin")
    reason = models.TextField(help_text="Reason for maintenance")
    expected_downtime_minutes = models.IntegerField(help_text="Expected downtime in minutes")
    is_weekday_only = models.BooleanField(default=True, help_text="Only schedule on weekdays unless emergency")
    notification_sent_at = models.DateTimeField(null=True, blank=True, help_text="When users were notified")
    notification_message = models.TextField(blank=True, help_text="Custom message shown to users")
    rollback_plan = models.TextField(blank=True, help_text="Steps to rollback if maintenance fails")
    completed_by = models.UUIDField(null=True, blank=True)
    
    objects = MaintenanceWindowManager()
    
    class Meta:
        db_table = 'config_maintenance_window'
        ordering = ['-scheduled_start']
        indexes = [models.Index(fields=['maintenance_type', 'status']), models.Index(fields=['scheduled_start', 'scheduled_end'])]
    
    def __str__(self):
        return f"{self.title} - {self.get_maintenance_type_display()} ({self.status})"