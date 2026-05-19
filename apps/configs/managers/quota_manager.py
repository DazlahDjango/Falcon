from django.db import models
from .base import BaseConfigManager

class BackupQuotaManager(BaseConfigManager):
    def for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)
    
    def for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id)
    
    def for_tenant_app(self, tenant_id, app_id):
        return self.get_queryset().filter(tenant_id=tenant_id, app_id=app_id).first()
    
    def system_defaults(self):
        return self.get_queryset().filter(tenant_id__isnull=True, app_id__isnull=True)
    
    def over_threshold(self):
        return self.get_queryset().filter(
            used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes') * models.Value(0.8)
        )
    
    def exceeded(self):
        return self.get_queryset().filter(used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes'))
    
    def needs_alert(self):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=1)
        return self.over_threshold().filter(
            models.Q(alert_sent_at__isnull=True) | models.Q(alert_sent_at__lt=cutoff)
        )
    
    def by_usage_desc(self):
        return self.get_queryset().order_by('-used_backup_storage_bytes')