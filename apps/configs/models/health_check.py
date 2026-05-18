from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp
from .maintenance_window import MaintenanceWindow

class HealthCheck(BaseConfigModel):
    STATUS_CHOICES = [('healthy', 'Healthy - All Systems Operational'), ('degraded', 'Degraded - Some Issues'), ('unhealthy', 'Unhealthy - Critical Issues'), ('unknown', 'Unknown - No Data'), ('maintenance', 'Maintenance Mode')]
    
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='health_checks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unknown', db_index=True)
    status_code = models.IntegerField(null=True, blank=True, help_text="HTTP status code from health endpoint")
    response_time_ms = models.IntegerField(null=True, blank=True)
    error_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    message = models.TextField(blank=True, help_text="Detailed health message")
    details = models.JSONField(default=dict, help_text="Detailed metrics from health endpoint")
    consecutive_failures = models.IntegerField(default=0)
    last_successful_check = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'config_health_check'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['app', 'status', 'created_at']), models.Index(fields=['consecutive_failures'])]
    
    def __str__(self):
        return f"{self.app.name} - {self.status} at {self.created_at}"

class HealthCheckHistory(BaseConfigModel):
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='health_history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    trigger_conditional_maintenance = models.BooleanField(default=False, help_text="Did this status change trigger conditional maintenance?")
    maintenance_window = models.ForeignKey(MaintenanceWindow, on_delete=models.SET_NULL, null=True, blank=True, related_name='triggered_by_health')
    
    class Meta:
        db_table = 'config_health_check_history'
        indexes = [models.Index(fields=['app', 'changed_at']), models.Index(fields=['new_status', 'changed_at'])]
    
    def __str__(self):
        return f"{self.app.name}: {self.previous_status} -> {self.new_status} at {self.changed_at}"