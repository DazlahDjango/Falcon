from django.db import models
from django.utils import timezone
from .base import DashboardBaseManager

class DashboardAccessLogManager(DashboardBaseManager):
    def log_access(self, user_id, tenant_id, dashboard_type, action, ip_address=None, user_agent=None, details=None, response_time_ms=None):
        return self.secure_create(
            tenant_id=tenant_id,
            user_id=user_id,
            dashboard_type=dashboard_type,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else '',
            details=details or {},
            response_time_ms=response_time_ms
        )
    
    def get_user_audit_trail(self, user_id, tenant_id, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            created_at__gte=cutoff
        ).order_by('-created_at')
    
    def get_dashboard_usage_stats(self, tenant_id, dashboard_type, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        stats = self.for_tenant(tenant_id).filter(
            dashboard_type=dashboard_type,
            created_at__gte=cutoff
        )
        return {
            'total_views': stats.filter(action='view').count(),
            'total_exports': stats.filter(action='export').count(),
            'total_drill_downs': stats.filter(action='drill_down').count(),
            'unique_users': stats.values('user_id').distinct().count(),
            'avg_response_time': stats.filter(
                response_time_ms__isnull=False
            ).aggregate(models.Avg('response_time_ms'))['response_time_ms__avg']
        }
    
    def cleanup_old_logs(self, tenant_id, retention_days=365):
        cutoff = timezone.now() - timezone.timedelta(days=retention_days)
        deleted_count = self.for_tenant(tenant_id).filter(
            created_at__lt=cutoff
        ).delete()
        return deleted_count[0] if isinstance(deleted_count, tuple) else deleted_count