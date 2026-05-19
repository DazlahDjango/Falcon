from django.db import models
from .base import BaseConfigManager

class ConfigAuditLogManager(BaseConfigManager):
    def by_action(self, action):
        return self.get_queryset().filter(action=action)
    
    def by_role(self, role):
        return self.get_queryset().filter(performed_by_role=role)
    
    def by_user(self, user_id):
        return self.get_queryset().filter(performed_by=user_id)
    
    def successful(self):
        return self.get_queryset().filter(result='success')
    
    def failed(self):
        return self.get_queryset().filter(result='failure')
    
    def for_app(self, app_id):
        return self.get_queryset().filter(target_app_id=app_id)
    
    def in_date_range(self, start_date, end_date):
        return self.get_queryset().filter(performed_at__gte=start_date, performed_at__lte=end_date)
    
    def today(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.get_queryset().filter(performed_at__date=today)
    
    def this_week(self):
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        return self.get_queryset().filter(performed_at__gte=week_ago)
    
    def by_request_id(self, request_id):
        return self.get_queryset().filter(request_id=request_id)
    
    def backup_actions(self):
        return self.get_queryset().filter(action__in=['trigger_backup', 'cancel_backup', 'restore_backup', 'delete_backup', 'verify_backup'])
    
    def maintenance_actions(self):
        return self.get_queryset().filter(action__in=['create_maintenance', 'start_maintenance', 'stop_maintenance', 'cancel_maintenance', 'extend_maintenance'])
    
    def dr_actions(self):
        return self.get_queryset().filter(action__in=['execute_dr', 'run_dr_drill', 'failover', 'failback'])
    
    def security_actions(self):
        return self.get_queryset().filter(action__in=['rotate_key'])
    
    def super_admin_only_actions(self):
        return self.get_queryset().filter(action__in=['rotate_key', 'execute_dr', 'run_dr_drill', 'failover', 'failback', 'change_quota'])