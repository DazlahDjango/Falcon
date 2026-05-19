from django.core.exceptions import PermissionDenied
from django.utils import timezone
import logging
from apps.dashboard.exceptions import DashboardAccessError
from apps.dashboard.constants import DashboardType
from apps.dashboard.utils import safe_cache_get, safe_cache_set, log_dashboard_action
logger = logging.getLogger(__name__)

class BaseDashboardService:
    def __init__(self, user, tenant_id):
        self.user = user
        self.tenant_id = tenant_id
        self.user_role = getattr(user, 'role', 'staff')
        self.user_id = str(user.id) if hasattr(user, 'id') else None
        
    def _validate_dashboard_access(self, dashboard_type):
        allowed = DashboardType.ROLE_DASHBOARD_MAP.get(self.user_role, [])
        if dashboard_type not in allowed:
            raise DashboardAccessError(
                user_id=self.user_id,
                dashboard_type=dashboard_type,
                required_role=self.user_role
            )
        return True
    
    def _validate_tenant_access(self, requested_tenant_id=None):
        target_tenant = requested_tenant_id or self.tenant_id
        if str(target_tenant) != str(self.tenant_id) and self.user_role != 'super_admin':
            raise PermissionDenied("Tenant access violation")
        return True
    
    def _audit_log(self, dashboard_type, action, details=None):
        log_dashboard_action(
            user_id=self.user_id,
            dashboard_type=dashboard_type,
            action=action,
            details=details,
            tenant_id=self.tenant_id
        )
    
    def _get_cached(self, key, timeout=300):
        return safe_cache_get(key)
    
    def _set_cached(self, key, value, timeout=300):
        return safe_cache_set(key, value, timeout)
    
    def _clear_cache(self, pattern):
        from django.core.cache import cache
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)