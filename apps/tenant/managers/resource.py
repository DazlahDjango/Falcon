from django.db import models
from django.utils import timezone
from .base import BaseManager


class ResourceManager(BaseManager):
    def by_client(self, client_id):
        return self.active().filter(client_id=client_id)
    
    def by_type(self, resource_type):
        return self.active().filter(resource_type=resource_type)
    
    def get_for_client(self, client_id, resource_type):
        from apps.tenant.constants import DEFAULT_TENANT_LIMITS
        
        mapping = {
            'users': 'max_users',
            'storage_mb': 'max_storage_mb',
            'api_calls_per_day': 'max_api_calls_per_day',
            'kpis': 'max_kpis',
            'departments': 'max_departments',
            'concurrent_sessions': 'max_concurrent_sessions',
        }
        key = mapping.get(resource_type, resource_type)
        default_limit = DEFAULT_TENANT_LIMITS.get(key, 100)
        
        resource, created = self.get_queryset().get_or_create(
            client_id=client_id,
            resource_type=resource_type,
            defaults={'limit_value': default_limit}
        )
        return resource
    
    def exceeded_limits(self):
        return self.active().filter(current_value__gte=models.F('limit_value'))
    
    def near_limit(self, percentage=80):
        return self.active().filter(
            current_value__gte=(models.F('limit_value') * percentage / 100)
        )
    
    def within_limit(self):
        return self.active().filter(current_value__lt=models.F('limit_value'))
    
    def daily_resources(self):
        return self.active().filter(resource_type='api_calls_per_day')
    
    def needs_reset(self):
        today = timezone.now().date()
        return self.daily_resources().filter(
            models.Q(last_reset_at__isnull=True) |
            models.Q(last_reset_at__date__lt=today)
        )
    
    def by_usage_percentage(self, min_percent=0, max_percent=100):
        return self.active().filter(
            current_value__gte=(models.F('limit_value') * min_percent / 100),
            current_value__lte=(models.F('limit_value') * max_percent / 100)
        )
