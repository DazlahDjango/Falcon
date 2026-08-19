import logging
import uuid
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.conf import settings
from apps.tenant.context import set_current_tenant_id, clear_current_tenant_id

logger = logging.getLogger(__name__)



class OrganizationContextMiddleware(MiddlewareMixin):
    """
    Middleware to set the organization/tenant context for every request.
    Sets both request.tenant_id and request.current_organization_id for backward compatibility.
    Uses apps.tenant.context.set_current_tenant_id for thread-local isolation.
    """

    def process_request(self, request):
        # Clear any existing context first
        clear_current_tenant_id()
        
        if self._is_public_path(request.path):
            return None

        tenant_id = None

        # Try 1: Extract from request headers (X-Tenant-ID, X-Organization-ID)
        tenant_id = self._extract_tenant_from_header(request)
        if tenant_id:
            logger.debug(f"Set tenant_id from header: {tenant_id}")
        
        # Try 2: Extract from JWT token (tenant_id, org_id, organization_id)
        if not tenant_id:
            tenant_id = self._extract_tenant_from_token(request)
            if tenant_id:
                logger.debug(f"Set tenant_id from token: {tenant_id}")
        
        # Try 3: Extract from authenticated user's tenant_id
        if not tenant_id:
            if hasattr(request, 'user') and request.user.is_authenticated:
                # Check user.tenant_id first, then user.organization_id for backward compatibility
                user_tenant_id = getattr(request.user, 'tenant_id', None) or getattr(request.user, 'organization_id', None)
                if user_tenant_id:
                    tenant_id = str(user_tenant_id)
                    logger.debug(f"Set tenant_id from user: {tenant_id}")

        # Set everything for backward compatibility
        if tenant_id:
            # Set thread-local context for OrganizationDatabaseRouter
            set_current_tenant_id(tenant_id)
            
            request.tenant_id = tenant_id
            request.current_tenant_id = tenant_id
            request.current_organization_id = tenant_id
        
        return None

    def process_response(self, request, response):
        clear_current_tenant_id()
        return response

    def _is_public_path(self, path):
        if '/health' in path:
            return True
        public_paths = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
            '/api/v1/auth/verify-email',
            '/api/v1/auth/accept-invitation',
            '/api/v1/auth/refresh/',
            '/api/v1/health',
            '/admin/',
            '/static/',
            '/media/',
        ]
        return any(path.startswith(p) for p in public_paths)

    def _extract_tenant_from_header(self, request):
        # Check both X-Tenant-ID and X-Organization-ID for backward compatibility
        tenant_header = request.META.get('HTTP_X_TENANT_ID') or request.META.get('HTTP_X_ORGANIZATION_ID')
        if tenant_header:
            try:
                uuid.UUID(tenant_header)
                return tenant_header
            except (ValueError, TypeError):
                logger.warning(f"Invalid UUID in X-Tenant-ID/X-Organization-ID header: {tenant_header}")
                return None
        return None

    def _extract_tenant_from_token(self, request):
        token = None
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif hasattr(request, 'GET') and request.GET.get('token'):
            token = request.GET.get('token')
        
        if not token:
            return None

        try:
            from apps.accounts.services import JWTServices
            payload = JWTServices().verify_token(token)
            if payload:
                # Check all possible JWT claim names for backward compatibility
                return (
                    payload.get('tenant_id') or
                    payload.get('org_id') or
                    payload.get('organization_id')
                )
        except Exception:
            pass
        return None
