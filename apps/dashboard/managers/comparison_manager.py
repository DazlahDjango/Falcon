from django.utils import timezone
from django.db import models
from django.core.exceptions import PermissionDenied
from django.core.cache import cache
from .base import DashboardBaseManager

class PeriodComparisonManager(DashboardBaseManager):
    def get_user_comparisons(self, user_id, tenant_id):
        return self.for_tenant(tenant_id).filter(
            models.Q(user_id=user_id) | models.Q(is_public=True)
        ).order_by('-created_at')
    
    def get_cached_results(self, comparison_id, user_id, tenant_id):
        cache_key = f"dashboard_comparison_{tenant_id}_{comparison_id}_{user_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        comparison = self.get(id=comparison_id, tenant_id=tenant_id)
        if comparison.user_id != user_id and not comparison.is_public:
            raise PermissionDenied("Cannot access this comparison")
        return comparison
    
    def cache_results(self, comparison_id, user_id, tenant_id, results):
        cache_key = f"dashboard_comparison_{tenant_id}_{comparison_id}_{user_id}"
        cache.set(cache_key, results, 3600)
        comparison = self.get(id=comparison_id, tenant_id=tenant_id)
        comparison.cached_results = results
        comparison.cached_at = timezone.now()
        comparison.save(update_fields=['cached_results', 'cached_at', 'updated_at'])
        return results
    
    def create_standard_comparisons(self, user_id, tenant_id):
        standard_comparisons = [
            {
                'name': 'Month over Month',
                'comparison_type': 'mom',
                'is_public': False
            },
            {
                'name': 'Year over Year',
                'comparison_type': 'yoy',
                'is_public': False
            },
            {
                'name': 'Quarter over Quarter',
                'comparison_type': 'qoq',
                'is_public': False
            }
        ]
        created = []
        for comp in standard_comparisons:
            existing = self.filter(
                user_id=user_id,
                tenant_id=tenant_id,
                name=comp['name']
            ).first()
            if not existing:
                created.append(self.secure_create(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    **comp
                ))
        return created