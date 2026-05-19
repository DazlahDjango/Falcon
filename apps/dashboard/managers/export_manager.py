from django.utils import timezone
from .base import DashboardBaseManager

class ExportScheduleManager(DashboardBaseManager):
    def get_due_exports(self, tenant_id=None):
        now = timezone.now()
        queryset = self.filter(
            is_active=True,
            next_run_at__lte=now
        )
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        return queryset.select_related()
    
    def get_user_exports(self, user_id, tenant_id):
        return self.for_tenant(tenant_id).filter(user_id=user_id).order_by('-is_active', 'next_run_at')
    
    def update_next_run(self, export_id, tenant_id):
        from dateutil.relativedelta import relativedelta
        export = self.get(id=export_id, tenant_id=tenant_id)
        now = timezone.now()
        if export.schedule_type == 'daily':
            export.next_run_at = now + timezone.timedelta(days=1)
        elif export.schedule_type == 'weekly':
            export.next_run_at = now + timezone.timedelta(weeks=1)
        elif export.schedule_type == 'monthly':
            export.next_run_at = now + relativedelta(months=1)
        elif export.schedule_type == 'quarterly':
            export.next_run_at = now + relativedelta(months=3)
        export.last_run_at = now
        export.save(update_fields=['next_run_at', 'last_run_at', 'updated_at'])
        return export
    
    def record_run_result(self, export_id, tenant_id, status, details=None):
        export = self.get(id=export_id, tenant_id=tenant_id)
        export.last_run_status = status
        export.save(update_fields=['last_run_status', 'updated_at'])
        return export