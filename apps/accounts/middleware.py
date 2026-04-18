import logging
import json
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
from .models import UserSession, AuditLog
from .services import JWTServices, TenantAccessService, AuditService
from .constants import CacheKeys
logger = logging.getLogger(__name__)
jwt_service = JWTServices()
tenant_service = TenantAccessService()
audit_service = AuditService()

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        tenant_id = self._extract_tenant_from_token(request)
        if tenant_id:
            cache.set(CacheKeys.CURRENT_TENANT, tenant_id, timeout=3600)
            request.current_tenant_id = tenant_id
        else:
            if hasattr(request, 'user') and request.user.is_authenticated:
                request.current_tenant_id = str(request.user.tenant_id)
                cache.set(CacheKeys.CURRENT_TENANT, request.current_tenant_id, timeout=3600)
        return None
    
    def process_response(self, request, response):
        cache.delete(CacheKeys.CURRENT_TENANT)
        return response
    
    def _is_public_path(self, path):
        public_paths = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
            '/api/v1/auth/verify-email',
            '/api/v1/auth/accept-invitation',
            '/api/v1/health',
            '/admin/',
            '/static/',
            '/media/'
        ]
        return any(path.startswith(p) for p in public_paths)
    
    def _extract_tenant_from_token(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        payload = jwt_service.verify_token(token)
        if payload and payload.get('tenant_id'):
            return payload['tenant_id']
        return None

class SessionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        session_id = self._extract_session_from_token(request)
        if session_id:
            request.current_session_id = session_id
            
            # ✅ PERFORMANCE: Only update last_activity once every 5 minutes
            cache_key = f'session_activity:{session_id}'
            if not cache.get(cache_key):
                UserSession.objects.filter(id=session_id).update(last_activity=timezone.now())
                cache.set(cache_key, True, timeout=300) # 5 minutes
        elif hasattr(request, 'user') and request.user.is_authenticated:
        # Create session for authenticated users without one
            session = UserSession.objects.create(
                user=request.user,
                tenant_id=request.user.tenant_id,
                session_key=request.session.session_key,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                status='active',
                expires_at=timezone.now() + timezone.timedelta(days=7)
            )
            request.current_session_id = str(session.id)
        return None
    
    def process_response(self, request, response):
        return response
    
    def _is_public_path(self, path):
        public_paths = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
            '/api/v1/auth/verify-email',
            '/api/v1/health',
        ]
        return any(path.startswith(p) for p in public_paths)
    
    def _extract_session_from_token(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        payload = jwt_service.verify_token(token)
        if payload and payload.get('session_id'):
            return payload['session_id']
        return None
    
class AuditMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._request_start_time = timezone.now()
        return None
    
    def process_response(self, request, response):
        if self._should_skip_logging(request.path):
            return response
        # ✅ PERFORMANCE: Skip logging for GET requests to prevent timeouts on dashboard load
        if request.method == 'GET':
            return response
        if hasattr(request, 'user') and request.user.is_authenticated:
            self._log_request(request, response)
        return response
    
    def _should_skip_logging(self, path):
        skip_paths = [
            '/api/v1/health',
            '/static/',
            '/media/',
        ]
        return any(path.startswith(p) for p in skip_paths)
    
    def _log_request(self, request, response):
        try:
            duration = (timezone.now() - request._request_start_time).total_seconds()
            audit_service.log(
                user=request.user,
                action=f"request.{request.method.lower()}",
                action_type='view',
                request=request,
                severity='info',
                metadata={
                    'path': request.path,
                    'method': request.method,
                    'status_code': response.status_code,
                    'duration_ms': round(duration * 1000, 2),
                    'ip_address': self._get_client_ip(request)
                }
            )
        except Exception as e:
            logger.error(f"Audit logging failed: {str(e)}")

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
    
class SecurityMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._is_sensitive_endpoint(request.path):
            if self._is_rate_limited(request):
                return JsonResponse(
                    {'error': 'Too many requests. Please try again later'},
                    status=429
                )
        return None
    
    def process_response(self, request, response):
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
    
    def _is_sensitive_endpoint(self, path):
        sensitive_path = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
        ]
        return any(path.startswith(p) for p in sensitive_path)
    
    def _is_rate_limited(self, request):
        ip = self._get_client_ip(request)
        cache_key = f'rate_limit:{ip}'
        attempts = cache.get(cache_key, 0)
        if attempts >= 10:
            return True
        cache.set(cache_key, attempts + 1, timeout=60)
        return False
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
    
class TenantAccessMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._should_skip(request.path) or not hasattr(request, 'user'):
            return None
        if request.user.is_authenticated and not request.user.is_superuser:
            requested_tenant = self._extract_tenant_from_path(request.path)
            if requested_tenant and requested_tenant != str(request.user.tenant_id):
                return JsonResponse(
                    {'error': 'You do not have access to this tenant'},
                    status=403
                )
        return None
    
    def _should_skip(self, path):
        skip_path = [
            '/api/v1/auth/',
            '/api/v1/health',
            '/admin/',
            '/static/',
            '/media/',
        ]
        return any(path.startswith(p) for p in skip_path)
    
    def _extract_tenant_from_path(self, path):
        parts = path.split('/')
        try:
            if 'tenants' in parts:
                idx = parts.index('tenants')
                if idx + 1 < len(parts):
                    return parts[idx + 1]
        except ValueError:
            pass
        return None
    