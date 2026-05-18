from django.db import models
from .base import BaseConfigManager

class ScheduleManager(BaseConfigManager):
    def active(self):
        return self.get_queryset().filter(status='active')
    
    def by_type(self, schedule_type):
        return self.get_queryset().filter(schedule_type=schedule_type)
    
    def backup_schedules(self):
        return self.get_queryset().filter(schedule_type='backup', status='active')
    
    def maintenance_schedules(self):
        return self.get_queryset().filter(schedule_type='maintenance', status='active')
    
    def health_check_schedules(self):
        return self.get_queryset().filter(schedule_type='health_check', status='active')
    
    def dr_drill_schedules(self):
        return self.get_queryset().filter(schedule_type='dr_drill', status='active')
    
    def due_now(self):
        from django.utils import timezone
        return self.get_queryset().filter(status='active', next_run_at__lte=timezone.now())
    
    def upcoming(self, hours=24):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() + timedelta(hours=hours)
        return self.get_queryset().filter(status='active', next_run_at__lte=cutoff)
    
    def failed_schedules(self):
        return self.get_queryset().filter(failure_count__gte=models.F('max_consecutive_failures'))
    
    def weekday_schedules(self):
        return self.get_queryset().filter(weekday_only=True, status='active')
    
    def disaster_override(self):
        return self.get_queryset().filter(is_disaster_override=True)
    
    def for_backup_policy(self, policy_id):
        return self.get_queryset().filter(associated_backup_policy_id=policy_id)
    
    def for_maintenance(self, maintenance_id):
        return self.get_queryset().filter(associated_maintenance_id=maintenance_id)