from django.db import models
from .base import BaseConfigManager

class HealthCheckManager(BaseConfigManager):
    def healthy(self):
        return self.get_queryset().filter(status='healthy')
    
    def unhealthy(self):
        return self.get_queryset().filter(status='unhealthy')
    
    def degraded(self):
        return self.get_queryset().filter(status='degraded')
    
    def for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id)
    
    def latest_for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id).order_by('-created_at').first()
    
    def latest_all(self):
        from django.db.models import Max, Subquery, OuterRef
        latest_per_app = self.get_queryset().values('app_id').annotate(latest=Max('created_at'))
        return self.get_queryset().filter(created_at__in=Subquery(latest_per_app.values('latest')))
    
    def critical_failures(self, threshold=3):
        return self.get_queryset().filter(consecutive_failures__gte=threshold)
    
    def today(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.get_queryset().filter(created_at__date=today)

class HealthCheckHistoryManager(BaseConfigManager):
    def for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id)
    
    def status_changes(self, app_id, hours=24):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.get_queryset().filter(app_id=app_id, changed_at__gte=cutoff)
    
    def triggered_maintenance(self):
        return self.get_queryset().filter(trigger_conditional_maintenance=True)
    
    def to_unhealthy(self):
        return self.get_queryset().filter(new_status='unhealthy')