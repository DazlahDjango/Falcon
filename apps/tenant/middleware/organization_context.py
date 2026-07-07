import logging
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class OrganizationContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        org_id = self._extract_org_from_token(request)
        if org_id:
            cache.set('current_organization', org_id, timeout=3600)
            request.current_organization_id = org_id
            logger.debug(f"Set current_organization_id from token: {org_id}")
        else:
            if hasattr(request, 'user') and request.user.is_authenticated:
                if hasattr(request.user, 'organization_id') and request.user.organization_id:
                    request.current_organization_id = str(request.user.organization_id)
                    cache.set('current_organization', request.current_organization_id, timeout=3600)
                    logger.debug(f"Set current_organization_id from user: {request.current_organization_id}")
        return None

    def process_response(self, request, response):
        if hasattr(request, 'current_organization_id'):
            cache.delete('current_organization')
        return response

    def _is_public_path(self, path):
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

    def _extract_org_from_token(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            from apps.accounts.services import JWTServices
            payload = JWTServices().verify_token(token)
            if payload and payload.get('organization_id'):
                return payload['organization_id']
        except Exception:
            pass
        return None