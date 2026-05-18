from django.db import models
from .base import BaseConfigManager

class RegisteredAppManager(BaseConfigManager):
    def active(self):
        return self.get_queryset().filter(is_registered=True)
    
    def critical(self):
        return self.get_queryset().filter(is_critical=True, is_registered=True)
    
    def by_priority(self):
        return self.get_queryset().filter(is_registered=True).order_by('recovery_priority')
    
    def needs_backup(self):
        from django.utils import timezone
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=1)
        return self.get_queryset().filter(is_registered=True).exclude(backup_jobs__started_at__gte=cutoff)
    
    def healthy(self):
        return self.get_queryset().filter(is_registered=True, health_checks__status='healthy')
    
    def unhealthy(self):
        return self.get_queryset().filter(is_registered=True, health_checks__status='unhealthy')
    
    def registered_names(self):
        return list(self.active().values_list('name', flat=True))

class AppDependencyManager(BaseConfigManager):
    def for_app(self, app_id):
        return self.get_queryset().filter(source_app_id=app_id)
    
    def hard_dependencies(self):
        return self.get_queryset().filter(dependency_type='hard')
    
    def get_dependency_order(self, app_id):
        deps = self.for_app(app_id).select_related('target_app')
        return [dep.target_app for dep in deps if dep.dependency_type == 'hard']
    
    def get_reverse_deps(self, app_id):
        return self.get_queryset().filter(target_app_id=app_id)