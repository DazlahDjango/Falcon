import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class OrganizationIsolationMiddleware(MiddlewareMixin):
    """
    Validates that the authenticated user belongs to the requested organization context.
    Blocks cross-tenant access with a 403 Forbidden JSON response.
    Super admins are permitted cross-tenant access.
    """

    def process_request(self, request):
        if self._should_skip(request):
            return None

        # Check all possible attributes for backward compatibility
        requested_org_id = (
            getattr(request, 'tenant_id', None) or
            getattr(request, 'organization_id', None) or
            getattr(request, 'current_organization_id', None)
        )

        if not requested_org_id:
            return None

        user = getattr(request, 'user', None)
        if not user or isinstance(user, AnonymousUser):
            # Check Bearer token for super_admin API calls
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                try:
                    from apps.accounts.services.auth.jwt import JWTServices
                    payload = JWTServices().verify_token(auth_header.split(' ')[1])
                    if payload and payload.get('role') in ('super_admin', 'SUPER_ADMIN'):
                        return None
                except Exception:
                    pass
            return None

        if self._is_super_admin(user):
            logger.debug(f"Super admin {user.email} accessing organization {requested_org_id}")
            return None

        user_org_id = self._get_user_org_id(user)

        if not user_org_id or str(user_org_id) != str(requested_org_id):
            logger.warning(
                f"ISOLATION VIOLATION: User {user.email} (org: {user_org_id}) "
                f"attempted to access org: {requested_org_id}"
            )
            return JsonResponse(
                {
                    'error': 'Access denied',
                    'detail': 'You do not belong to this organization or do not have permission to access its data.'
                },
                status=403
            )

        # Set all request attributes for compatibility
        request.organization_id = requested_org_id
        request.tenant_id = requested_org_id
        request.current_organization_id = requested_org_id

        return None

    def _should_skip(self, request):
        if '/health' in request.path or request.headers.get('X-Health-Check') == 'true':
            return True
        skip_prefixes = (
            '/admin/',
            '/api/v1/auth/',
            '/health/',
            '/docs/',
            '/swagger/',
            '/redoc/',
            '/static/',
            '/media/',
        )
        return request.path.startswith(skip_prefixes)

    def _get_user_org_id(self, user):
        user_tenant_id = getattr(user, 'tenant_id', None) or getattr(user, 'organization_id', None)
        if user_tenant_id:
            return user_tenant_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _is_super_admin(self, user):
        return (
            getattr(user, 'is_superuser', False) or
            getattr(user, 'role', '') in ('super_admin', 'SUPER_ADMIN')
        )


class OrganizationPathIsolationMiddleware(MiddlewareMixin):
    """
    Middleware to enforce organization isolation via URL path parameters.

    Checks if authenticated non-super-admin users are trying to access data from a different
    organization via URL patterns like:
        - /api/v1/organizations/{org_id}/...
        - /api/v1/admin/organizations/{org_id}/...
        - /api/v1/tenants/{tenant_id}/...
    """

    def process_request(self, request):
        if self._should_skip(request.path):
            return None

        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or isinstance(user, AnonymousUser):
            return None

        if self._is_super_admin(user):
            return None

        requested_org_id = self._extract_org_from_path(request.path)
        if requested_org_id:
            user_org_id = self._get_user_org_id(user)

            if not user_org_id or str(user_org_id) != str(requested_org_id):
                logger.warning(
                    f"[OrganizationPathIsolation] User {user.email} (org: {user_org_id}) "
                    f"attempted to access path with org {requested_org_id}: {request.path}"
                )
                return JsonResponse(
                    {
                        'error': 'Access denied',
                        'detail': "You do not have access to this organization's data."
                    },
                    status=403
                )

        return None

    def _should_skip(self, path):
        # Exact collection endpoints that don't have an org_id in path
        exact_skip = {'/api/v1/organizations', '/api/v1/organizations/', '/api/v1/tenants', '/api/v1/tenants/'}
        if path in exact_skip:
            return True

        skip_prefixes = (
            '/api/v1/auth/',
            '/api/v1/health',
            '/health/',
            '/admin/',
            '/static/',
            '/media/',
            '/docs/',
            '/swagger/',
            '/redoc/',
        )
        return path.startswith(skip_prefixes)

    def _extract_org_from_path(self, path):
        """Extract organization ID from URL path patterns."""
        clean_path = path.split('?')[0].strip('/')
        parts = clean_path.split('/')

        # Pattern 1: api/v1/organizations/{org_id}/...
        # Pattern 2: api/v1/admin/organizations/{org_id}/...
        # Pattern 3: api/v1/tenants/{tenant_id}/...
        for segment in ('organizations', 'tenants'):
            if segment in parts:
                idx = parts.index(segment)
                if idx + 1 < len(parts):
                    val = parts[idx + 1]
                    if val and val not in ('search', 'count', 'export', 'import'):
                        return val

        return None

    def _get_user_org_id(self, user):
        user_tenant_id = getattr(user, 'tenant_id', None) or getattr(user, 'organization_id', None)
        if user_tenant_id:
            return user_tenant_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _is_super_admin(self, user):
        return (
            getattr(user, 'is_superuser', False) or
            getattr(user, 'role', '') in ('super_admin', 'SUPER_ADMIN')
        )
