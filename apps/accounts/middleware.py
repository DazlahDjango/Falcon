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
    """Middleware to extract and set tenant context for the request."""
    
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        
        tenant_id = self._extract_tenant_from_token(request)
        if tenant_id:
            cache.set(CacheKeys.CURRENT_TENANT, tenant_id, timeout=3600)
            request.current_tenant_id = tenant_id
            # ✅ FIXED: Use logger instead of print
            logger.debug(f"[TenantMiddleware] Set current_tenant_id from token: {tenant_id}")
        else:
            if hasattr(request, 'user') and request.user.is_authenticated:
                request.current_tenant_id = str(request.user.tenant_id)
                cache.set(CacheKeys.CURRENT_TENANT, request.current_tenant_id, timeout=3600)
                logger.debug(f"[TenantMiddleware] Set current_tenant_id from user: {request.current_tenant_id}")
        
        return None
    
    def process_response(self, request, response):
        # Only clear if we set it (don't clear if it was already there)
        if hasattr(request, 'current_tenant_id'):
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
            '/media/',
            '/api/v1/auth/refresh/',  # ✅ Added refresh endpoint
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
    """Middleware to track and manage user sessions."""
    
    def process_request(self, request):
        if self._is_public_path(request.path):
            return None
        
        session_id = self._extract_session_from_token(request)
        if session_id:
            request.current_session_id = session_id
            # Update last activity
            UserSession.objects.filter(id=session_id).update(last_activity=timezone.now())
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


class TenantAccessMiddleware(MiddlewareMixin):
    """Middleware to enforce tenant isolation."""
    
    def process_request(self, request):
        if self._should_skip(request.path):
            return None
        
        if not hasattr(request, 'user') or not request.user:
            return None
        
        if request.user.is_authenticated and not request.user.is_superuser:
            # Check if user is trying to access a different tenant's data
            requested_tenant = self._extract_tenant_from_path(request.path)
            if requested_tenant and requested_tenant != str(request.user.tenant_id):
                logger.warning(
                    f"[TenantAccessMiddleware] User {request.user.email} attempted to access "
                    f"tenant {requested_tenant} (their tenant: {request.user.tenant_id})"
                )
                return JsonResponse(
                    {'error': 'You do not have access to this tenant\'s data'},
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
        ]
        return any(path.startswith(p) for p in skip_paths)
    
    def _extract_tenant_from_path(self, path):
        """Extract tenant ID from URL path patterns."""
        parts = path.split('/')
        
        # Pattern 1: /api/v1/tenants/{tenant_id}/...
        try:
            if 'tenants' in parts:
                idx = parts.index('tenants')
                if idx + 1 < len(parts) and parts[idx + 1]:
                    return parts[idx + 1]
        except ValueError:
            pass
        
        # Pattern 2: /api/v1/admin/tenants/{tenant_id}/...
        try:
            if 'admin' in parts and 'tenants' in parts:
                admin_idx = parts.index('admin')
                tenants_idx = parts.index('tenants', admin_idx)
                if tenants_idx + 1 < len(parts) and parts[tenants_idx + 1]:
                    return parts[tenants_idx + 1]
        except ValueError:
            pass
        
        # Pattern 3: /api/v1/users/{user_id}/ - would need DB lookup, skip for performance
        # Tenant isolation is already enforced by queryset filtering in views
        
        return None