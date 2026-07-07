import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden, JsonResponse
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class OrganizationIsolationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._should_skip(request):
            return None
        requested_org_id = getattr(request, 'organization_id', None)
        if not requested_org_id:
            return None
        user = getattr(request, 'user', None)
        if not user or isinstance(user, AnonymousUser):
            logger.debug(f"Anonymous access for organization {requested_org_id}")
            return None
        user_org_id = self._get_user_org_id(user)
        if self._is_super_admin(user):
            logger.info(f"Super admin {user.email} accessing organization {requested_org_id}")
            return None
        if user_org_id and str(user_org_id) != str(requested_org_id):
            logger.warning(f"ISOLATION VIOLATION: User {user.email} (org {user_org_id}) attempted org {requested_org_id}")
            return HttpResponseForbidden("Access denied: You do not belong to this organization.")
        request.organization_id = requested_org_id
        return None

    def _should_skip(self, request):
        skip_paths = [
            '/admin/',
            '/api/v1/auth/',
            '/health/',
            '/docs/',
        ]
        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _get_user_org_id(self, user):
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _is_super_admin(self, user):
        return user.is_superuser or getattr(user, 'role', '') == 'super_admin'


class OrganizationPathIsolationMiddleware(MiddlewareMixin):
    """
    Middleware to enforce organization isolation via URL path patterns.
    
    Checks if authenticated users are trying to access data from a different
    organization via URL patterns like:
        - /api/v1/organizations/{org_id}/...
        - /api/v1/admin/organizations/{org_id}/...
    """
    
    def process_request(self, request):
        if self._should_skip(request.path):
            return None
        
        if not hasattr(request, 'user') or not request.user:
            return None
        
        if request.user.is_authenticated and not self._is_super_admin(request.user):
            requested_org_id = self._extract_org_from_path(request.path)
            
            if requested_org_id:
                user_org_id = self._get_user_org_id(request.user)
                
                if user_org_id and str(user_org_id) != str(requested_org_id):
                    logger.warning(
                        f"[OrganizationPathIsolation] User {request.user.email} "
                        f"attempted to access org {requested_org_id} (their org: {user_org_id})"
                    )
                    return JsonResponse(
                        {'error': 'You do not have access to this organization\'s data'},
                        status=403
                    )
        
        return None
    
    def _should_skip(self, path):
        skip_paths = [
            '/api/v1/auth/',
            '/api/v1/health',
            '/admin/',
            '/static/',
            '/media/',
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
            '/api/v1/auth/refresh/',
            '/api/v1/organizations/',  # List/create endpoints (no org_id in path)
        ]
        return any(path.startswith(p) for p in skip_paths)
    
    def _extract_org_from_path(self, path):
        """Extract organization ID from URL path patterns."""
        parts = path.split('/')
        
        # Pattern 1: /api/v1/organizations/{org_id}/...
        try:
            if 'organizations' in parts:
                idx = parts.index('organizations')
                if idx + 1 < len(parts) and parts[idx + 1]:
                    return parts[idx + 1]
        except ValueError:
            pass
        
        # Pattern 2: /api/v1/admin/organizations/{org_id}/...
        try:
            if 'admin' in parts and 'organizations' in parts:
                admin_idx = parts.index('admin')
                tenants_idx = parts.index('organizations', admin_idx)
                if tenants_idx + 1 < len(parts) and parts[tenants_idx + 1]:
                    return parts[tenants_idx + 1]
        except ValueError:
            pass
        
        # Pattern 3: /api/v1/organizations/{org_id}/domains/...
        try:
            if 'organizations' in parts:
                idx = parts.index('organizations')
                if idx + 1 < len(parts) and parts[idx + 1]:
                    return parts[idx + 1]
        except ValueError:
            pass
        
        return None
    
    def _get_user_org_id(self, user):
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None
    
    def _is_super_admin(self, user):
        return user.is_superuser or getattr(user, 'role', '') == 'super_admin'