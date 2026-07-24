# apps/reportplt/middleware/rls_enforcer.py
import logging
from typing import Optional
from django.db import connection
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest, HttpResponse
from django.core.exceptions import PermissionDenied
from apps.tenant.context import get_current_tenant_id
from apps.reportplt.services.security.row_level_security import RowLevelSecurity, RLSEnforcer
from apps.accounts.models import User

logger = logging.getLogger(__name__)

class RLSEnforcerMiddleware(MiddlewareMixin):
    """
    Middleware to enforce Row Level Security (RLS) for PostgreSQL.
    Sets the current tenant and user context for RLS policies.
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.rls = RowLevelSecurity()
        self.enforcer = RLSEnforcer()
    
    def process_request(self, request: HttpRequest):
        try:
            tenant_id = self._get_tenant_id(request)
            user_id = self._get_user_id(request)
            if tenant_id:
                self.rls.set_tenant_context(str(tenant_id))
                logger.debug(f"RLS tenant context set: {tenant_id}")
            if user_id:
                self.rls.set_user_context(str(user_id))
                logger.debug(f"RLS user context set: {user_id}")
            if tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
                self._validate_tenant_access(request.user, tenant_id)
        except PermissionDenied:
            raise
        except Exception as e:
            logger.error(f"RLS enforcer failed: {str(e)}")
    
    def process_response(self, request: HttpRequest, response: HttpResponse):
        try:
            self.rls.clear_context()
            logger.debug("RLS context cleared")
        except Exception as e:
            logger.warning(f"Failed to clear RLS context: {str(e)}")
        return response
    
    def process_exception(self, request: HttpRequest, exception: Exception):
        try:
            self.rls.clear_context()
        except:
            pass
        return None
    
    def _get_tenant_id(self, request: HttpRequest) -> Optional[str]:
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                return str(request.user.tenant_id)
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            return tenant_id
        report_context = getattr(request, 'report_context', {})
        return report_context.get('tenant_id')
    
    def _get_user_id(self, request: HttpRequest) -> Optional[str]:
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.id)
        user_id = request.headers.get('X-User-ID')
        if user_id:
            return user_id
        return None
    
    def _validate_tenant_access(self, user: User, tenant_id: str):
        if user.is_superuser or user.role == 'super_admin':
            return
        if hasattr(user, 'tenant_id') and user.tenant_id and str(user.tenant_id) != str(tenant_id):
            logger.warning(f"Tenant access violation: User {user.id} attempted tenant {tenant_id}, belongs to {user.tenant_id}")
            raise PermissionDenied("Access denied: You do not belong to this organization")


class RLSEnforcer:
    """
    Standalone RLS enforcer for use in views and services.
    """
    
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.rls = RowLevelSecurity()
        self._tenant_set = False
        self._user_set = False
    
    def __enter__(self):
        if self.user:
            if self.user.tenant_id:
                self.rls.set_tenant_context(str(self.user.tenant_id))
                self._tenant_set = True
            self.rls.set_user_context(str(self.user.id))
            self._user_set = True
        else:
            tenant_id = get_current_tenant_id()
            if tenant_id:
                self.rls.set_tenant_context(str(tenant_id))
                self._tenant_set = True
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.rls.clear_context()
        self._tenant_set = False
        self._user_set = False
    
    def enforce_report_access(self, report):
        """Enforce RLS for a specific report object."""
        enforcer = RLSEnforcer(self.user)
        return enforcer.enforce_object_access(report)
    
    def filter_queryset(self, queryset, model_name: str = None):
        """Apply RLS filtering to a queryset."""
        enforcer = RLSEnforcer(self.user)
        return enforcer.enforce_user_access(queryset, model_name)


class RLSContext:
    """
    Context manager for RLS operations.
    """
    
    def __init__(self, tenant_id: Optional[str] = None, user_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.rls = RowLevelSecurity()
    
    def __enter__(self):
        if self.tenant_id:
            self.rls.set_tenant_context(self.tenant_id)
        if self.user_id:
            self.rls.set_user_context(self.user_id)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.rls.clear_context()


class RLSQuerySetMixin:
    """
    Mixin for querysets to automatically apply RLS filtering.
    """
    
    def rls_filter(self, user: Optional[User] = None):
        from apps.reportplt.services.security.row_level_security import RLSEnforcer
        enforcer = RLSEnforcer(user)
        return enforcer.enforce_user_access(self)
    
    def tenant_filter(self, tenant_id: Optional[str] = None):
        from apps.reportplt.services.security.row_level_security import RLSEnforcer
        enforcer = RLSEnforcer()
        if not tenant_id:
            tenant_id = get_current_tenant_id()
        if tenant_id:
            return self.filter(tenant_id=tenant_id)
        return self