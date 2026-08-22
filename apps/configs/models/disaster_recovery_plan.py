from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp
from apps.configs.managers.disaster_recovery_manager import DisasterRecoveryPlanManager

class DisasterRecoveryPlan(BaseConfigModel):
    STATUS_CHOICES = [('draft', 'Draft'), ('active', 'Active'), ('tested', 'Tested - Verified'), ('expired', 'Expired - Needs Review'), ('archived', 'Archived')]
    
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='dr_plans')
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=20, default='1.0')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    rpo_target_minutes = models.IntegerField(help_text="Target RPO in minutes")
    rto_target_minutes = models.IntegerField(help_text="Target RTO in minutes")
    recovery_steps = models.JSONField(default=list, help_text="Ordered list of recovery steps")
    validation_steps = models.JSONField(default=list, help_text="Steps to validate recovery success")
    failover_script_path = models.CharField(max_length=500, blank=True)
    failback_script_path = models.CharField(max_length=500, blank=True)
    standby_replica_arn = models.CharField(max_length=255, blank=True, help_text="AWS RDS/Aurora replica ARN")
    standby_endpoint = models.CharField(max_length=255, blank=True, help_text="Standby database endpoint")
    last_tested_at = models.DateTimeField(null=True, blank=True)
    test_frequency_days = models.IntegerField(default=30, help_text="How often to test this DR plan")
    test_successful = models.BooleanField(default=False)
    test_notes = models.TextField(blank=True)
    owned_by = models.UUIDField(help_text="User ID of DR plan owner")
    reviewed_by = models.UUIDField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approval_required = models.BooleanField(default=True, help_text="Does this plan need Super Admin approval?")
    approved_by = models.UUIDField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    objects = DisasterRecoveryPlanManager()
    
    class Meta:
        db_table = 'config_disaster_recovery_plan'
        unique_together = [['app', 'version']]
        indexes = [models.Index(fields=['app', 'status']), models.Index(fields=['last_tested_at'])]
    
    def __str__(self):
        return f"DR Plan for {self.app.name} v{self.version} - {self.status}"