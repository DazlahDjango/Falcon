from django.core.exceptions import PermissionDenied
from django.utils import timezone
import logging
from apps.dashboard.exceptions import DashboardAccessError
from apps.dashboard.constants import DashboardType
from apps.dashboard.utils import safe_cache_get, safe_cache_set, log_dashboard_action
logger = logging.getLogger(__name__)

class BaseDashboardService:
    def __init__(self, user, tenant_id=None):
        self.user = user
        self.user_role = getattr(user, 'role', 'staff')
        self.user_id = str(user.id) if hasattr(user, 'id') and user.id else None

        # Resolve tenant_id with robust fallbacks for role preview & testing
        resolved_tenant = (
            tenant_id or
            getattr(user, 'tenant_id', None) or
            getattr(user, 'organization_id', None)
        )
        if not resolved_tenant and hasattr(user, 'organization') and user.organization:
            resolved_tenant = str(user.organization.id)

        if not resolved_tenant:
            try:
                from apps.tenant.models import Organization
                first_org = Organization.objects.filter(is_deleted=False).first()
                if first_org:
                    resolved_tenant = str(first_org.id)
            except Exception:
                pass

        self.tenant_id = resolved_tenant
        
    def _validate_dashboard_access(self, dashboard_type):
        if self.user_role == 'super_admin':
            return True
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