from django.db import models
from django.utils import timezone
from .base import BaseConfigModel
from .registered_app import RegisteredApp

class BackupQuota(BaseConfigModel):
    tenant = models.ForeignKey('tenant.Organization', on_delete=models.CASCADE, related_name='backup_quotas', null=True, blank=True, help_text="Null means system-wide default")
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='quotas', null=True, blank=True, help_text="Null means applies to all apps")
    total_backup_storage_bytes = models.BigIntegerField(default=107374182400, help_text="Default 100GB", db_index=True)
    used_backup_storage_bytes = models.BigIntegerField(default=0)
    max_backup_count = models.IntegerField(default=100, help_text="Maximum number of backup artifacts")
    max_restore_per_day = models.IntegerField(default=10, help_text="Maximum restores per day per tenant")
    backup_retention_days_override = models.IntegerField(null=True, blank=True, help_text="Override app default")
    warning_threshold_percent = models.IntegerField(default=80, help_text="Alert when usage exceeds this %")
    alert_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'config_backup_quota'
        unique_together = [['tenant', 'app']]
        indexes = [models.Index(fields=['tenant', 'total_backup_storage_bytes']), models.Index(fields=['used_backup_storage_bytes'])]
    
    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "System"
        app_name = self.app.name if self.app else "All Apps"
        return f"Quota for {tenant_name} - {app_name}"

    def update_used_storage(self, bytes_added: int) -> bool:
        """Increment used backup storage bytes and check warning threshold."""
        self.used_backup_storage_bytes = max(0, self.used_backup_storage_bytes + bytes_added)
        usage_pct = (self.used_backup_storage_bytes / self.total_backup_storage_bytes * 100) if self.total_backup_storage_bytes > 0 else 0
        update_fields = ['used_backup_storage_bytes', 'updated_at']
        if usage_pct >= self.warning_threshold_percent and not self.alert_sent_at:
            self.alert_sent_at = timezone.now()
            update_fields.append('alert_sent_at')
        self.save(update_fields=update_fields)
        return usage_pct >= self.warning_threshold_percent