from django.db import models
from .base import BaseConfigModel
from .backup_policy import BackupPolicy
from .maintenance_window import MaintenanceWindow
from .disaster_recovery_plan import DisasterRecoveryPlan

class Schedule(BaseConfigModel):
    SCHEDULE_TYPE_CHOICES = [('backup', 'Backup Schedule'), ('maintenance', 'Maintenance Schedule'), ('health_check', 'Health Check Schedule'), ('dr_drill', 'DR Drill Schedule')]
    STATUS_CHOICES = [('active', 'Active'), ('paused', 'Paused'), ('expired', 'Expired'), ('deleted', 'Deleted')]
    
    name = models.CharField(max_length=255)
    schedule_type = models.CharField(max_length=20, choices=SCHEDULE_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    cron_expression = models.CharField(max_length=100, help_text="Cron expression for schedule")
    timezone = models.CharField(max_length=50, default='UTC')
    weekday_only = models.BooleanField(default=True, help_text="Only run Monday-Friday")
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_run_status = models.CharField(max_length=50, blank=True)
    run_count = models.IntegerField(default=0)
    failure_count = models.IntegerField(default=0)
    max_consecutive_failures = models.IntegerField(default=3, help_text="Auto-pause after this many failures")
    is_disaster_override = models.BooleanField(default=False, help_text="True if this schedule was created for disaster recovery")
    created_by = models.UUIDField()
    created_by_role = models.CharField(max_length=50)
    associated_backup_policy = models.ForeignKey(BackupPolicy, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')
    associated_maintenance = models.ForeignKey(MaintenanceWindow, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')
    associated_dr_plan = models.ForeignKey(DisasterRecoveryPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')
    
    class Meta:
        db_table = 'config_schedule'
        ordering = ['next_run_at']
        indexes = [models.Index(fields=['schedule_type', 'status', 'next_run_at']), models.Index(fields=['weekday_only']), models.Index(fields=['is_disaster_override'])]
    
    def __str__(self):
        return f"{self.name} - {self.get_schedule_type_display()} ({self.status})"