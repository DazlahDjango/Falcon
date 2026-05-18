from django.db import models
from .base import BaseConfigManager

class MaintenanceLogManager(BaseConfigManager):
    def for_window(self, window_id):
        return self.get_queryset().filter(maintenance_window_id=window_id)
    
    def by_action(self, action):
        return self.get_queryset().filter(action=action)
    
    def failed_actions(self):
        return self.get_queryset().filter(action__in=['fail', 'rollback'])
    
    def today(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.get_queryset().filter(performed_at__date=today)
    
    def by_performed_by(self, user_id):
        return self.get_queryset().filter(performed_by=user_id)
    
    def recent(self, hours=24):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.get_queryset().filter(performed_at__gte=cutoff)