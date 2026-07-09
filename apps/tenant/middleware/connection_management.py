import logging
import threading
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import MiddlewareNotUsed
from django.conf import settings
from apps.tenant.services import ConnectionService

logger = logging.getLogger(__name__)


class ConnectionManagementMiddleware(MiddlewareMixin):
    _thread_local = threading.local()

    def __init__(self, get_response):
        super().__init__(get_response)
        self.connection_service = ConnectionService()
        if not getattr(settings, 'ENABLE_CONNECTION_MIDDLEWARE', True):
            raise MiddlewareNotUsed

    def process_request(self, request):
        if self._skip_middleware(request):
            return None
        org_id = self._get_org_id(request)
        if org_id:
            try:
                connection = self.connection_service.get_connection(org_id)
                request.organization_connection = connection
                request.organization_id = org_id
                self._set_thread_local(org_id, connection)
                logger.debug(f"Connection established for organization {org_id}")
            except Exception as e:
                logger.error(f"Failed to establish connection for org {org_id}: {str(e)}")
                setattr(request, 'connection_error', str(e))
        return None

    def process_response(self, request, response):
        if hasattr(request, 'organization_connection'):
            try:
                self.connection_service.release_connection(str(request.organization_id))
                logger.debug(f"Connection released for organization {request.organization_id}")
            except Exception as e:
                logger.warning(f"Failed to release connection: {str(e)}")
        self._clear_thread_local()
        return response

    def process_exception(self, request, exception):
        if hasattr(request, 'organization_id'):
            try:
                from apps.tenant.models import OrganizationConnection
                self.connection_service.close_connection(str(request.organization_id))
                OrganizationConnection.objects.filter(
                    organization_id=request.organization_id,
                    status='ACTIVE'
                ).update(
                    status='ERROR',
                    error_message=str(exception)[:500]
                )
                logger.warning(f"Connection marked as error for org {request.organization_id}")
            except Exception as e:
                logger.error(f"Failed to handle connection exception: {str(e)}")
        return None

    def _get_org_id(self, request):
        org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
        if org_id:
            return org_id
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check both tenant_id and organization_id for compatibility
            user_org_id = getattr(request.user, 'tenant_id', None) or getattr(request.user, 'organization_id', None)
            if user_org_id:
                return str(user_org_id)
        return getattr(request, 'tenant_id', None) or getattr(request, 'organization_id', None)

    def _skip_middleware(self, request):
        excluded = getattr(settings, 'CONNECTION_MIDDLEWARE_EXCLUDED_PATHS', [
            '/health/',
            '/metrics/',
            '/static/',
            '/media/',
            '/api/v1/auth/',
        ])
        for path in excluded:
            if request.path.startswith(path):
                return True
        if request.method == 'OPTIONS':
            return True
        return False

    def _set_thread_local(self, org_id, connection):
        if not hasattr(self._thread_local, 'org_connections'):
            self._thread_local.org_connections = {}
        self._thread_local.org_connections[org_id] = connection

    def _clear_thread_local(self):
        if hasattr(self._thread_local, 'org_connections'):
            self._thread_local.org_connections = {}