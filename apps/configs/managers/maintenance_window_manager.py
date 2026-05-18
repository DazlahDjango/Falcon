from django.db import models
from .base import BaseConfigManager

class MaintenanceWindowManager(BaseConfigManager):
    def active(self):
        return self.get_queryset().filter(status='in_progress')
    
    def upcoming(self):
        return self.get_queryset().filter(status='scheduled', scheduled_start__gt=models.F('scheduled_end'))
    
    def scheduled(self):
        return self.get_queryset().filter(status='scheduled')
    
    def full_maintenance(self):
        return self.get_queryset().filter(maintenance_type='full')
    
    def partial_maintenance(self):
        return self.get_queryset().filter(maintenance_type='partial')
    
    def emergency(self):
        return self.get_queryset().filter(maintenance_type='emergency')
    
    def completed_today(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.get_queryset().filter(status='completed', actual_end__date=today)
    
    def in_progress_or_scheduled(self):
        return self.get_queryset().filter(status__in=['scheduled', 'in_progress'])
    
    def overlapping(self, start_time, end_time):
        return self.get_queryset().filter(
            models.Q(scheduled_start__lte=end_time, scheduled_end__gte=start_time)
        )
    
    def for_app(self, app_id):
        return self.get_queryset().filter(affected_apps__id=app_id)
    
    def by_triggered_by_role(self, role):
        return self.get_queryset().filter(triggered_by_role=role)
    
    def past_week(self):
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        return self.get_queryset().filter(scheduled_start__gte=week_ago)
    
    def requiring_notification(self):
        from django.utils import timezone
        from datetime import timedelta
        upcoming = timezone.now() + timedelta(hours=24)
        return self.get_queryset().filter(
            status='scheduled', scheduled_start__lte=upcoming, notification_sent_at__isnull=True
        )