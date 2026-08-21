# apps/config/models/disaster_recovery_execution.py
from django.db import models
from .base import BaseConfigModel
from .disaster_recovery_plan import DisasterRecoveryPlan
from .backup_job import BackupJob
from apps.configs.managers.disaster_recovery_manager import DisasterRecoveryExecutionManager

class DisasterRecoveryExecution(BaseConfigModel):
    EXECUTION_TYPE_CHOICES = [('drill', 'Drill/Test - No Production Impact'), ('actual', 'Actual Disaster Recovery'), ('failover', 'Failover to Standby'), ('failback', 'Failback to Primary')]
    STATUS_CHOICES = [('initiated', 'Initiated'), ('in_progress', 'In Progress'), ('validating', 'Validating Recovery'), ('success', 'Success'), ('partial', 'Partial Success'), ('failed', 'Failed'), ('aborted', 'Aborted')]
    
    dr_plan = models.ForeignKey(DisasterRecoveryPlan, on_delete=models.CASCADE, related_name='executions')
    execution_type = models.CharField(max_length=20, choices=EXECUTION_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated', db_index=True)
    triggered_by = models.UUIDField(db_index=True)
    triggered_by_role = models.CharField(max_length=50)
    triggered_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    backup_job_used = models.ForeignKey(BackupJob, on_delete=models.SET_NULL, null=True, blank=True, related_name='dr_executions')
    rto_achieved_minutes = models.IntegerField(null=True, blank=True, help_text="Actual RTO achieved")
    rpo_achieved_minutes = models.IntegerField(null=True, blank=True, help_text="Actual RPO achieved (data loss)")
    steps_executed = models.JSONField(default=list, help_text="Record of each step execution")
    validation_results = models.JSONField(default=dict, help_text="Results of validation steps")
    issues_encountered = models.JSONField(default=list, help_text="Issues during recovery")
    notes = models.TextField(blank=True)
    customer_notified = models.BooleanField(default=False, help_text="Was client admin notified?")
    
    objects = DisasterRecoveryExecutionManager()
    
    class Meta:
        db_table = 'config_disaster_recovery_execution'
        ordering = ['-triggered_at']
        indexes = [models.Index(fields=['dr_plan', 'execution_type']), models.Index(fields=['status', 'triggered_at'])]
    
    def __str__(self):
        return f"{self.get_execution_type_display()} for {self.dr_plan.app.name} - {self.status}"