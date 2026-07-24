# apps/reportplt/api/v1/decorators/tenant.py
import logging
from functools import wraps
from typing import Optional, Callable
from django.http import JsonResponse
from rest_framework.exceptions import PermissionDenied
from apps.tenant.context import get_current_tenant_id
from apps.reportplt.middleware.report_context import ReportContextMiddleware

logger = logging.getLogger(__name__)

def tenant_isolation(require_tenant: bool = True, allow_superuser: bool = True):
    """
    Decorator to enforce tenant isolation for API endpoints.
    
    Args:
        require_tenant: Whether tenant ID is required
        allow_superuser: Whether superusers bypass tenant check
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            tenant_id = get_current_tenant_id()
            report_context = getattr(request, 'report_context', {})
            if not tenant_id:
                tenant_id = report_context.get('tenant_id')
            if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated and hasattr(request.user, 'tenant_id'):
                tenant_id = str(request.user.tenant_id)
            user = request.user if request.user.is_authenticated else None
            if allow_superuser and user and (user.is_superuser or user.role == 'super_admin'):
                return func(self, request, *args, **kwargs)
            if require_tenant and not tenant_id:
                logger.warning(f"Tenant isolation failed: No tenant ID for {request.path}")
                return JsonResponse({'error': 'Tenant ID required'}, status=400)
            request.tenant_id = tenant_id
            if kwargs.get('tenant_id') and str(kwargs['tenant_id']) != str(tenant_id):
                logger.warning(f"Tenant isolation violation: {kwargs['tenant_id']} vs {tenant_id}")
                raise PermissionDenied("Tenant ID mismatch")
            if hasattr(request, 'report_context'):
                request.report_context['tenant_id'] = tenant_id
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator

def enforce_tenant(func: Callable):
    """
    Simple decorator to enforce tenant isolation without extra parameters.
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        tenant_id = get_current_tenant_id()
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                tenant_id = str(request.user.tenant_id)
        if not tenant_id:
            raise PermissionDenied("Tenant context required")
        request.tenant_id = tenant_id
        return func(self, request, *args, **kwargs)
    return wrapper

def require_tenant(func: Callable):
    """
    Decorator that requires tenant context and validates tenant ownership of resources.
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        tenant_id = get_current_tenant_id()
        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                tenant_id = str(request.user.tenant_id)
        if not tenant_id:
            logger.warning(f"Require tenant failed: No tenant for {request.path}")
            return JsonResponse({'error': 'Tenant context required'}, status=400)
        resource_id = kwargs.get('pk') or kwargs.get('report_id') or kwargs.get('dashboard_id')
        if resource_id:
            try:
                import uuid
                uuid.UUID(str(resource_id))
            except ValueError:
                pass
        request.tenant_id = tenant_id
        if hasattr(request, 'report_context'):
            request.report_context['tenant_id'] = tenant_id
        return func(self, request, *args, **kwargs)
    return wrapper

class TenantIsolation:
    """
    Class-based decorator for tenant isolation.
    Can be used as a mixin for viewsets.
    """
    
    @staticmethod
    def check_tenant_access(request, obj):
        """
        Check if the user has access to the object's tenant.
        """
        if not obj:
            return True
        tenant_id = get_current_tenant_id()
        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)
        if not tenant_id and hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                tenant_id = str(request.user.tenant_id)
        if not tenant_id:
            return False
        obj_tenant = getattr(obj, 'tenant_id', None)
        if obj_tenant:
            return str(obj_tenant) == str(tenant_id)
        return True
    
    @staticmethod
    def filter_queryset_by_tenant(request, queryset):
        """
        Filter a queryset by the current tenant.
        """
        tenant_id = get_current_tenant_id()
        if not tenant_id:
            tenant_id = getattr(request, 'tenant_id', None)
        if tenant_id and hasattr(queryset.model, 'tenant_id'):
            return queryset.filter(tenant_id=tenant_id)
        return queryset