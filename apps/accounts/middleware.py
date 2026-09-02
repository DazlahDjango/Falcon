import logging
import json
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
from django.urls import resolve
from .models import UserSession, AuditLog
from .services import JWTServices, AuditService
from .constants import CacheKeys

logger = logging.getLogger(__name__)
jwt_service = JWTServices()
audit_service = AuditService()


class SessionMiddleware(MiddlewareMixin):
    """Middleware to track and manage user sessions."""
    
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        
        session_id = self._extract_session_from_token(request)
        if session_id:
            request.current_session_id = session_id
            # Throttle last activity DB updates (once per 5 min per session)
            cache_key = f"session_activity:{session_id}"
            if not cache.get(cache_key):
                UserSession.objects.filter(id=session_id).update(last_activity=timezone.now())
                cache.set(cache_key, True, timeout=300)
        elif hasattr(request, 'user') and request.user.is_authenticated:
            # ✅ FIXED: Indentation was incorrect - this block should run when no session_id found
            # Create session for authenticated users without one
            try:
                session = UserSession.objects.create(
                    user=request.user,
                    tenant_id=request.user.tenant_id,
                    session_key=request.session.session_key or '',
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    status='active',
                    expires_at=timezone.now() + timezone.timedelta(days=7)
                )
                request.current_session_id = str(session.id)
                logger.debug(f"[SessionMiddleware] Created new session {session.id} for user {request.user.email}")
            except Exception as e:
                logger.error(f"[SessionMiddleware] Failed to create session: {str(e)}")
        
        return None
    
    def process_response(self, request, response):
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
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class AuditMiddleware(MiddlewareMixin):
    """Middleware to log all API requests for audit purposes."""
    
    def process_request(self, request):
        request._request_start_time = timezone.now()
        return None
    
    def process_response(self, request, response):
        if self._should_skip_logging(request.path):
            return response
        
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            self._log_request(request, response)
        elif hasattr(request, 'current_tenant_id'):
            # Log even for unauthenticated requests that have tenant context
            self._log_anonymous_request(request, response)
        
        return response
    
    def _should_skip_logging(self, path):
        skip_paths = [
            '/api/v1/health',
            '/static/',
            '/media/',
            '/admin/jsi18n/',  # Skip admin JS
            '/ws/',
        ]
        return any(path.startswith(p) for p in skip_paths)
    
    def _log_request(self, request, response):
        try:
            # Skip auditing successful GET requests to eliminate DB overhead
            if request.method == 'GET' and response.status_code < 400:
                return

            duration = (timezone.now() - request._request_start_time).total_seconds()
            audit_service.log(
                user=request.user,
                action=f"request.{request.method.lower()}",
                action_type='view' if request.method == 'GET' else 'action',
                request=request,
                severity='warning' if response.status_code >= 400 else 'info',
                metadata={
                    'path': request.path,
                    'method': request.method,
                    'status_code': response.status_code,
                    'duration_ms': round(duration * 1000, 2),
                    'ip_address': self._get_client_ip(request)
                }
            )
        except Exception as e:
            logger.error(f"[AuditMiddleware] Audit logging failed: {str(e)}")
    
    def _log_anonymous_request(self, request, response):
        """Log anonymous requests with tenant context."""
        try:
            duration = (timezone.now() - request._request_start_time).total_seconds()
            # Don't log anonymous requests too heavily - just log warnings for 4xx/5xx
            if response.status_code >= 400:
                logger.warning(
                    f"[Audit] Anonymous {request.method} {request.path} "
                    f"returned {response.status_code} from tenant {getattr(request, 'current_tenant_id', 'unknown')}"
                )
        except Exception as e:
            logger.error(f"[AuditMiddleware] Anonymous logging failed: {str(e)}")

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class SecurityMiddleware(MiddlewareMixin):
    """Middleware for security headers and rate limiting."""
    
    def process_request(self, request):
        if self._is_sensitive_endpoint(request.path):
            if self._is_rate_limited(request):
                return JsonResponse(
                    {'error': 'Too many requests. Please try again later', 'retry_after': 60},
                    status=429
                )
        return None
    
    def process_response(self, request, response):
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Content-Security-Policy'] = "default-src 'self'"  # ✅ Added CSP
        
        # HSTS for HTTPS only
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        return response
    
    def _is_sensitive_endpoint(self, path):
        sensitive_paths = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/password-reset',
            '/api/v1/auth/refresh/',
            '/api/v1/auth/mfa-verify/',
        ]
        return any(path.startswith(p) for p in sensitive_paths)
    
    def _is_rate_limited(self, request):
        ip = self._get_client_ip(request)
        
        # Rate limit by IP
        cache_key = f'rate_limit:ip:{ip}'
        ip_attempts = cache.get(cache_key, 0)
        
        if ip_attempts >= 10:
            logger.warning(f"[SecurityMiddleware] Rate limit exceeded for IP: {ip}")
            return True
        
        cache.set(cache_key, ip_attempts + 1, timeout=60)
        
        # Also rate limit by user if authenticated
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            user_cache_key = f'rate_limit:user:{request.user.id}'
            user_attempts = cache.get(user_cache_key, 0)
            if user_attempts >= 20:  # Higher limit for authenticated users
                return True
            cache.set(user_cache_key, user_attempts + 1, timeout=60)
        
        return False
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
