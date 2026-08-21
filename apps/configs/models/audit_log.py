from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp
from apps.configs.managers.audit_log_manager import ConfigAuditLogManager

class ConfigAuditLog(BaseConfigModel):
    ACTION_CHOICES = [
        ('register_app', 'Registered App'), ('unregister_app', 'Unregistered App'), ('trigger_backup', 'Triggered Backup'), ('cancel_backup', 'Cancelled Backup'), ('restore_backup', 'Restored from Backup'),
        ('delete_backup', 'Deleted Backup'), ('create_maintenance', 'Created Maintenance Window'), ('start_maintenance', 'Started Maintenance'), ('stop_maintenance', 'Stopped Maintenance'),
        ('cancel_maintenance', 'Cancelled Maintenance'), ('extend_maintenance', 'Extended Maintenance'), ('execute_dr', 'Executed DR Plan'), ('run_dr_drill', 'Ran DR Drill'),
        ('failover', 'Performed Failover'), ('failback', 'Performed Failback'), ('update_policy', 'Updated Backup Policy'), ('rotate_key', 'Rotated Encryption Key'),
        ('change_quota', 'Changed Backup Quota'), ('delete_artifact', 'Deleted Backup Artifact'), ('verify_backup', 'Verified Backup Integrity'), ('schedule_create', 'Created Schedule'),
        ('schedule_update', 'Updated Schedule'), ('schedule_delete', 'Deleted Schedule'), ('system_action', 'System Automated Action')
    ]
    RESULT_CHOICES = [('success', 'Success'), ('failure', 'Failure'), ('partial', 'Partial Success'), ('pending', 'Pending')]
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    performed_by = models.UUIDField(db_index=True)
    performed_by_role = models.CharField(max_length=50, db_index=True)
    performed_by_email = models.CharField(max_length=255, blank=True)
    performed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    target_app = models.ForeignKey(RegisteredApp, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    target_id = models.CharField(max_length=255, blank=True, help_text="ID of affected object (backup_job_id, maintenance_id, etc.)")
    details = models.JSONField(default=dict, help_text="Full details of the action")
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    request_id = models.CharField(max_length=100, blank=True, db_index=True, help_text="Correlation ID for tracing")
    
    objects = ConfigAuditLogManager()
    
    class Meta:
        db_table = 'config_audit_log'
        ordering = ['-performed_at']
        indexes = [models.Index(fields=['action', 'performed_at']), models.Index(fields=['performed_by', 'performed_by_role']), models.Index(fields=['target_app', 'action']), models.Index(fields=['result', 'performed_at'])]
    
    def __str__(self):
        return f"{self.action} by {self.performed_by_role} at {self.performed_at} - {self.result}"