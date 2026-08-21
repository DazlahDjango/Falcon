from django.db import models
from .base import BaseConfigModel
from .maintenance_window import MaintenanceWindow
from apps.configs.managers.maintenance_log_manager import MaintenanceLogManager

class MaintenanceLog(BaseConfigModel):
    ACTION_CHOICES = [('start', 'Maintenance Started'), ('stop', 'Maintenance Stopped'), ('extend', 'Maintenance Extended'), ('cancel', 'Maintenance Cancelled'), ('fail', 'Maintenance Failed'), ('rollback', 'Rollback Executed')]
    
    maintenance_window = models.ForeignKey(MaintenanceWindow, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, db_index=True)
    performed_by = models.UUIDField(db_index=True)
    performed_by_role = models.CharField(max_length=50)
    performed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    details = models.JSONField(default=dict, help_text="Additional details like which apps were stopped, errors encountered")
    previous_status = models.CharField(max_length=50, blank=True)
    new_status = models.CharField(max_length=50, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    objects = MaintenanceLogManager()
    
    class Meta:
        db_table = 'config_maintenance_log'
        ordering = ['-performed_at']
        indexes = [models.Index(fields=['maintenance_window', 'action']), models.Index(fields=['performed_by', 'performed_at'])]
    
    def __str__(self):
        return f"{self.maintenance_window.title} - {self.action} at {self.performed_at}"