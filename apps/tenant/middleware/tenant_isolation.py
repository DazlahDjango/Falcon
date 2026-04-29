# apps/tenant/middleware/tenant_isolation.py
"""
Tenant Isolation Middleware - Ensures no cross-tenant data access.

This middleware runs SECOND. It takes the tenant identified by the
tenant_resolution middleware and checks if the logged-in user is
allowed to access that tenant's data.

This PREVENTS data leaks between tenants.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class TenantIsolationMiddleware(MiddlewareMixin):
    """
    Ensures users can only access data from their own tenant.

    This is the SECURITY GUARD of the multi-tenant system.
    Without this, Tenant A users could see Tenant B's data.
    """

    def process_request(self, request):
        """
        Verify that the authenticated user belongs to the requested tenant.
        """

        # Skip isolation for public endpoints
        if self._should_skip_isolation(request):
            return None

        # Get the tenant ID from request (set by tenant_resolution middleware)
        requested_tenant_id = getattr(request, 'tenant_id', None)

        if not requested_tenant_id:
            # No tenant specified - let other middleware handle
            return None

        # Get the user from request
        user = getattr(request, 'user', None)

        # Anonymous users (not logged in) - let them pass but with tenant_id
        if not user or isinstance(user, AnonymousUser):
            logger.debug(f"Anonymous access for tenant {requested_tenant_id}")
            return None

        # Logged in user - check if they belong to this tenant
        user_tenant_id = self._get_user_tenant_id(user)

        # Super admins can access any tenant (for support purposes)
        if self._is_super_admin(user):
            logger.info(
                f"Super admin {user.email} accessing tenant {requested_tenant_id}")
            return None

        # Compare user's tenant with requested tenant
        if user_tenant_id and str(user_tenant_id) != str(requested_tenant_id):
            logger.warning(
                f"ISOLATION VIOLATION: User {user.email} (tenant {user_tenant_id}) "
                f"attempted to access tenant {requested_tenant_id}"
            )
            return HttpResponseForbidden(
                "Access denied: You do not belong to this tenant."
            )

        # User is allowed - attach tenant to request for convenience
        request.tenant_id = requested_tenant_id
        return None

    def _should_skip_isolation(self, request):
        """Skip isolation for public/admin endpoints"""
        skip_paths = [
            '/admin/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
            '/api/v1/auth/password-reset/',
            '/health/',
            '/docs/',
        ]

        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _get_user_tenant_id(self, user):
        """Extract tenant ID from user object"""
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        if hasattr(user, 'tenant') and user.tenant:
            return user.tenant.id
        return None

    def _is_super_admin(self, user):
        """Check if user is super admin"""
        return user.is_superuser or getattr(user, 'role', '') == 'super_admin'
