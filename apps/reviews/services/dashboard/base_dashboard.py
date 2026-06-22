from django.core.cache import cache
from django.utils import timezone
from ..base_service import BaseReviewService

class BaseDashboardService(BaseReviewService):
    CACHE_TTL = 120
    @classmethod
    def _cache_key(cls, tenant_id, user_id, dashboard_type):
        return f"reviews:dashboard:{dashboard_type}:{tenant_id}:{user_id}"
    @classmethod
    def _get_cached(cls, tenant_id, user_id, dashboard_type):
        return cache.get(cls._cache_key(tenant_id, user_id, dashboard_type))
    @classmethod
    def _set_cached(cls, tenant_id, user_id, dashboard_type, data):
        cache.set(cls._cache_key(tenant_id, user_id, dashboard_type), data, cls.CACHE_TTL)
    @classmethod
    def invalidate_cache(cls, tenant_id, user_id, dashboard_type):
        cache.delete(cls._cache_key(tenant_id, user_id, dashboard_type))