import logging
import threading
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import MiddlewareNotUsed
from django.conf import settings
from apps.tenant.services import ConnectionManager

logger = logging.getLogger(__name__)


class ConnectionManagementMiddleware(MiddlewareMixin):
    """
    Middleware to manage database connections per request.

    What it does:
        - Gets or creates connection for tenant at request start
        - Sets connection in thread-local for request context
        - Releases connection at request end (marks as idle)
        - Handles connection-related exceptions gracefully

    Benefits:
        - Connection reuse across requests
        - Automatic cleanup
        - Reduced connection overhead
    """

    def __init__(self, get_response):
        super().__init__(get_response)
        self.connection_manager = ConnectionManager()
        
        # Optional: Disable middleware if not needed
        if not getattr(settings, 'ENABLE_CONNECTION_MIDDLEWARE', True):
            raise MiddlewareNotUsed

    def process_request(self, request):
        """
        Called before the view is executed.
        Establishes connection for the tenant.
        """
        # Skip for non-tenant routes (e.g., health checks, static files)
        if self._skip_middleware(request):
            return None

        tenant_id = self._get_tenant_id(request)
        
        if tenant_id:
            try:
                # Get or create connection for this tenant
                connection = self.connection_manager.get_connection(tenant_id)
                
                # Store in request object for later use
                request.tenant_connection = connection
                request.tenant_id = tenant_id
                
                # Track in thread-local for nested calls
                self._set_thread_local(tenant_id, connection)
                
                logger.debug(f"Connection established for tenant {tenant_id}")
                
            except Exception as e:
                logger.error(f"Failed to establish connection for tenant {tenant_id}: {str(e)}")
                # Don't block the request, but log error
                setattr(request, 'connection_error', str(e))

        return None

    def process_response(self, request, response):
        """
        Called after the view is executed.
        Releases the connection (marks as idle).
        """
        if hasattr(request, 'tenant_connection'):
            try:
                # Mark connection as idle for reuse
                self.connection_manager.release_connection(
                    str(request.tenant_id),
                    request.tenant_connection
                )
                logger.debug(f"Connection released for tenant {request.tenant_id}")
            except Exception as e:
                logger.warning(f"Failed to release connection: {str(e)}")
        
        # Clear thread-local
        self._clear_thread_local()
        
        return response

    def process_exception(self, request, exception):
        """
        Called when an exception occurs.
        Logs connection-related exceptions and marks connection as error.
        """
        if hasattr(request, 'tenant_connection'):
            error_msg = str(exception)[:500]  # Limit length
            
            try:
                # Mark connection as error
                from apps.tenant.models import ConnectionPool
                from apps.tenant.constants import ConnectionStatus
                
                ConnectionPool.objects.filter(
                    tenant_id=request.tenant_id,
                    status=ConnectionStatus.ACTIVE
                ).update(
                    status=ConnectionStatus.ERROR,
                    error_message=error_msg
                )
                
                # Close the problematic connection
                self.connection_manager.close_connection(str(request.tenant_id))
                
                logger.warning(
                    f"Connection marked as error for tenant {request.tenant_id}: {error_msg}"
                )
            except Exception as e:
                logger.error(f"Failed to handle connection exception: {str(e)}")
        
        return None

    def _get_tenant_id(self, request):
        """
        Extract tenant ID from request.
        
        Priority:
            1. Request header: X-Tenant-ID
            2. Authenticated user's tenant_id
            3. Session tenant_id
            4. Domain-based lookup (future)
        """
        # Check header
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            return tenant_id
        
        # Check authenticated user
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.tenant_id:
                return str(request.user.tenant_id)
        
        # Check session
        if hasattr(request, 'session') and request.session.get('tenant_id'):
            return request.session.get('tenant_id')
        
        return None

    def _skip_middleware(self, request):
        excluded_paths = getattr(settings, 'CONNECTION_MIDDLEWARE_EXCLUDED_PATHS', [
            '/health/',
            '/metrics/',
            '/static/',
            '/media/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
        ])
        
        path = request.path_info
        for excluded in excluded_paths:
            if path.startswith(excluded):
                return True
        
        # Skip for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return True
        
        return False

    def _set_thread_local(self, tenant_id, connection):
        """Set connection in thread-local storage"""
        if not hasattr(threading.local(), 'tenant_connections'):
            threading.local().tenant_connections = {}
        threading.local().tenant_connections[tenant_id] = connection

    def _clear_thread_local(self):
        """Clear thread-local storage"""
        if hasattr(threading.local(), 'tenant_connections'):
            threading.local().tenant_connections = {}


class TenantConnectionHealthCheckMiddleware(MiddlewareMixin):
    """
    Middleware to check tenant connection health before processing.
    
    Performs lightweight health check and closes dead connections.
    """

    def __init__(self, get_response):
        super().__init__(get_response)
        self.connection_manager = ConnectionManager()

    def process_request(self, request):
        tenant_id = self._get_tenant_id(request)
        
        if tenant_id and self._should_check_health(request):
            # Quick health check
            if not self._is_connection_healthy(tenant_id):
                # Close and recreate connection
                self.connection_manager.close_connection(tenant_id)
                
                # Log for monitoring
                logger.info(f"Unhealthy connection closed for tenant {tenant_id}")
        
        return None

    def _get_tenant_id(self, request):
        """Extract tenant ID from request"""
        if hasattr(request, 'tenant_id'):
            return request.tenant_id
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.tenant_id) if request.user.tenant_id else None
        return None

    def _should_check_health(self, request):
        """Determine if health check should be performed"""
        # Check every 5 requests or every minute (configurable)
        # For simplicity, we'll check on a percentage of requests
        import random
        return random.random() < 0.1  # 10% of requests

    def _is_connection_healthy(self, tenant_id):
        """Check if connection is healthy"""
        status = self.connection_manager.get_connection_status(tenant_id)
        
        if status.get('is_connected'):
            idle_minutes = status.get('idle_minutes')
            if idle_minutes and idle_minutes > 30:
                return False  # Too old
            return True
        
        return False