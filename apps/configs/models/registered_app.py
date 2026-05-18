from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseConfigModel

class RegisteredApp(BaseConfigModel):
    APP_CHOICES = [
        ('accounts', 'Accounts & Auth'),
        ('kpi', 'KPI Engine'),
        ('billing', 'Billing & Subscription'),
        ('reviews', 'Performance Reviews'),
        ('tenants', 'Tenant Management'),
        ('structure', 'Organization Structure'),
        ('dashboard', 'Dashboard & Analytics'),
    ]
    PRIORITY_CHOICES = [(1, 'Critical - RTO < 1hr'), (2, 'High - RTO < 4hr'), (3, 'Medium - RTO < 24hr'), (4, 'Low - RTO < 72hr')]
    
    name = models.CharField(max_length=50, choices=APP_CHOICES, unique=True, db_index=True)
    display_name = models.CharField(max_length=100)
    is_registered = models.BooleanField(default=True, db_index=True)
    is_critical = models.BooleanField(default=False, help_text="If True, this app requires immediate recovery")
    recovery_priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3, db_index=True)
    rpo_minutes = models.IntegerField(default=240, help_text="Recovery Point Objective in minutes", validators=[MinValueValidator(5)])
    rto_minutes = models.IntegerField(default=480, help_text="Recovery Time Objective in minutes", validators=[MinValueValidator(15)])
    backup_retention_days = models.IntegerField(default=30, validators=[MinValueValidator(1), MaxValueValidator(365)])
    database_table_name = models.CharField(max_length=100, blank=True, help_text="Primary database table for this app")
    health_check_endpoint = models.CharField(max_length=200, blank=True, help_text="Internal API endpoint for health checks")
    recovery_script_path = models.CharField(max_length=500, blank=True, help_text="Path to recovery script")
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'config_registered_app'
        ordering = ['recovery_priority', 'name']
        indexes = [models.Index(fields=['is_critical', 'recovery_priority']), models.Index(fields=['is_registered'])]
    
    def __str__(self):
        return f"{self.get_name_display()} (Priority {self.recovery_priority})"

class AppDependency(BaseConfigModel):
    DEPENDENCY_TYPE_CHOICES = [('hard', 'Hard Dependency - Must restore first'), ('soft', 'Soft Dependency - Prefer restore first'), ('optional', 'Optional - No strict order')]
    
    source_app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='dependencies_as_source')
    target_app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='dependencies_as_target', help_text="Source depends on this app")
    dependency_type = models.CharField(max_length=20, choices=DEPENDENCY_TYPE_CHOICES, default='hard')
    description = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'config_app_dependency'
        unique_together = [['source_app', 'target_app']]
    
    def __str__(self):
        return f"{self.source_app.name} depends on {self.target_app.name} ({self.dependency_type})"