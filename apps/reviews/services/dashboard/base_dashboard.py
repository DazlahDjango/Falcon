from django.core.cache import cache
from django.utils import timezone
from ..base_service import BaseReviewService


class BaseDashboardService(BaseReviewService):
    CACHE_TTL = 120

    @classmethod
    def _cache_key(cls, tenant_id, user_id, dashboard_type, cycle_id='active'):
        cid = str(cycle_id) if cycle_id else 'active'
        return f"reviews:dashboard:{dashboard_type}:{tenant_id}:{user_id}:{cid}"

    @classmethod
    def _get_cached(cls, tenant_id, user_id, dashboard_type, cycle_id='active'):
        return cache.get(cls._cache_key(tenant_id, user_id, dashboard_type, cycle_id))

    @classmethod
    def _set_cached(cls, tenant_id, user_id, dashboard_type, data, cycle_id='active'):
        cache.set(cls._cache_key(tenant_id, user_id, dashboard_type, cycle_id), data, cls.CACHE_TTL)

    @classmethod
    def invalidate_cache(cls, tenant_id, user_id, dashboard_type, cycle_id=None):
        if cycle_id:
            cache.delete(cls._cache_key(tenant_id, user_id, dashboard_type, cycle_id))
        cache.delete(cls._cache_key(tenant_id, user_id, dashboard_type, 'active'))