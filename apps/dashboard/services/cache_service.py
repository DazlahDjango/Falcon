from django.core.cache import cache
from typing import Optional, List
import hashlib
import json
import logging
from .base_service import BaseDashboardService
from apps.dashboard.constants import CacheKeys, Defaults
from apps.dashboard.exceptions import DashboardCacheError
logger = logging.getLogger(__name__)

class DashboardCacheService(BaseDashboardService):
    def get_dashboard_data(self, user_id: str, dashboard_type: str, filters: dict = None) -> Optional[dict]:
        cache_key = self._generate_key(user_id, dashboard_type, filters)
        try:
            cached = cache.get(cache_key)
            if cached:
                self._audit_log(dashboard_type, 'cache_hit', {'key': cache_key})
                return cached
        except Exception as e:
            raise DashboardCacheError(cache_key=cache_key, operation='get', message=str(e))
        return None
    
    def set_dashboard_data(self, user_id: str, dashboard_type: str, data: dict, filters: dict = None, ttl: int = None):
        cache_key = self._generate_key(user_id, dashboard_type, filters)
        ttl = ttl or Defaults.CACHE_TTL
        try:
            cache.set(cache_key, data, ttl)
            self._audit_log(dashboard_type, 'cache_set', {'key': cache_key, 'ttl': ttl})
        except Exception as e:
            raise DashboardCacheError(cache_key=cache_key, operation='set', message=str(e))
    
    def invalidate_user_dashboards(self, user_id: str):
        pattern = f"dashboard:*:{self.tenant_id}:{user_id}:*"
        self._invalidate_pattern(pattern)
        self._audit_log('all', 'cache_invalidate', {'user_id': user_id, 'pattern': pattern})
    
    def invalidate_tenant_dashboards(self):
        pattern = f"dashboard:*:{self.tenant_id}:*:*"
        self._invalidate_pattern(pattern)
        self._audit_log('all', 'cache_invalidate', {'tenant_id': self.tenant_id})
    
    def _invalidate_pattern(self, pattern: str):
        try:
            if hasattr(cache, 'delete_pattern'):
                cache.delete_pattern(pattern)
            else:
                self._fallback_clear(pattern)
        except Exception as e:
            raise DashboardCacheError(cache_key=pattern, operation='invalidate', message=str(e))
    
    def _fallback_clear(self, pattern: str):
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        for key in keys:
            cache.delete(key)
    
    def _generate_key(self, user_id: str, dashboard_type: str, filters: dict = None) -> str:
        base_key = f"dashboard:{dashboard_type}:{self.tenant_id}:{user_id}"
        
        if filters:
            filter_hash = hashlib.md5(
                json.dumps(filters, sort_keys=True).encode()
            ).hexdigest()[:8]
            return f"{base_key}:{filter_hash}"
        
        return base_key
    
    def warm_user_dashboards(self, user_id: str, dashboard_types: List[str]):
        from apps.dashboard.services import ExecutiveDashboardService
        from apps.dashboard.services import ClientAdminDashboardService
        from apps.dashboard.services import SuperAdminDashboardService
        for dashboard_type in dashboard_types:
            try:
                if dashboard_type == 'executive':
                    service = ExecutiveDashboardService(self.user, self.tenant_id)
                    data = service.get_dashboard_data(user_id)
                elif dashboard_type == 'client_admin':
                    service = ClientAdminDashboardService(self.user, self.tenant_id)
                    data = service.get_dashboard_data()
                elif dashboard_type == 'super_admin':
                    service = SuperAdminDashboardService(self.user, self.tenant_id)
                    data = service.get_dashboard_data()
                else:
                    continue
                if data:
                    self.set_dashboard_data(user_id, dashboard_type, data)
            except Exception as e:
                logger.warning(f"Failed to warm dashboard {dashboard_type} for {user_id}: {e}")