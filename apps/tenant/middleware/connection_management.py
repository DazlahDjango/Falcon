import logging
import threading
import uuid
from datetime import timedelta
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import MiddlewareNotUsed
from django.conf import settings
from django.utils import timezone
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

        # ✅ FIX 1: Do NOT create a tenant DB connection for unauthenticated requests.
        # Anonymous requests will be rejected with 401 by DRF authentication — there is
        # no need to acquire a pooled tenant connection beforehand. Creating one would
        # burn a pool slot and immediately release it as IDLE, filling the pool with
        # 20 wasted records that block legitimate authenticated requests.
        if not self._is_authenticated(request):
            return None

        org_id = self._get_org_id(request)
        if org_id:
            try:
                connection = self.connection_service.get_connection(org_id)
                request.organization_connection = connection
                request.organization_id = org_id

                record = getattr(connection, '_connection_record', None)
                request._connection_record_id = record.id if record else self._get_latest_connection_id(org_id)

                self._set_thread_local(org_id, connection)
                logger.debug(f"Connection established for organization {org_id}")
            except Exception as e:
                logger.error(f"Failed to establish connection for org {org_id}: {str(e)}")
                setattr(request, 'connection_error', str(e))
        return None

    def process_response(self, request, response):
        if hasattr(request, 'organization_connection'):
            try:
                org_id = str(request.organization_id)
                record_id = getattr(request, '_connection_record_id', None)
                self.connection_service.release_connection(org_id, record_id=record_id)

                logger.debug(f"Connection released for organization {request.organization_id}")
            except Exception as e:
                logger.warning(f"Failed to release connection: {str(e)}")
        self._clear_thread_local()
        return response

    def process_exception(self, request, exception):
        if hasattr(request, 'organization_id'):
            from django.http import Http404
            from django.core.exceptions import ValidationError as DjangoValidationError
            from rest_framework.exceptions import APIException

            if isinstance(exception, (Http404, DjangoValidationError, APIException)):
                return None

            try:
                from apps.tenant.models import OrganizationConnection
                self.connection_service.close_connection(str(request.organization_id))
                record_id = getattr(request, '_connection_record_id', None)
                qs = OrganizationConnection.objects.filter(organization_id=request.organization_id)
                if record_id:
                    qs = qs.filter(id=record_id)
                qs.filter(status='ACTIVE').update(
                    status='ERROR',
                    error_message=str(exception)[:500]
                )
                logger.warning(f"Connection marked as error for org {request.organization_id}: {exception}")
            except Exception as e:
                logger.error(f"Failed to handle connection exception: {str(e)}")
        return None

    # ─── Helpers ────────────────────────────────────────────────────────────────

    def _is_authenticated(self, request):
        """Return True only if the request carries a verified authenticated user.
        We check the Authorization header *and* a previously resolved request.user
        so this works both before and after authentication middleware runs.
        """
        # If Django auth has already resolved the user (should be the case for DRF
        # which authenticates during view dispatch, not middleware), use that.
        user = getattr(request, 'user', None)
        if user is not None and hasattr(user, 'is_authenticated') and user.is_authenticated:
            return True

        # Fallback: presence of a Bearer token in the Authorization header is a
        # *strong hint* that this is an authenticated request.  We don't verify
        # the token here (that's DRF's job), but we use it to allow the connection
        # to be established so the view can validate authentication properly.
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            return True

        return False

    def _get_org_id(self, request):
        org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
        if org_id:
            return org_id
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_org_id = getattr(request.user, 'tenant_id', None) or getattr(request.user, 'organization_id', None)
            if user_org_id:
                return str(user_org_id)
        return getattr(request, 'tenant_id', None) or getattr(request, 'organization_id', None)

    def _get_latest_connection_id(self, org_id):
        """Return the PK of the most-recently created ACTIVE OrganizationConnection record safely."""
        if getattr(settings, 'CONNECTION_METRICS_ASYNC', True):
            return None
        try:
            from apps.tenant.models import OrganizationConnection
            from apps.tenant.constants import ConnectionStatus
            record = OrganizationConnection.objects.filter(
                organization_id=org_id,
                status=ConnectionStatus.ACTIVE,
            ).order_by('-created_at').first()
            return record.id if record else None
        except Exception:
            return None

    def _close_request_connection_record(self, org_id, request):
        """Mark this request's OrganizationConnection record as CLOSED immediately.
        This prevents the accumulation of IDLE records that exhaust the pool.
        """
        try:
            from apps.tenant.models import OrganizationConnection
            from apps.tenant.constants import ConnectionStatus
            record_id = getattr(request, '_connection_record_id', None)
            qs = OrganizationConnection.objects.filter(organization_id=org_id)
            if record_id:
                qs = qs.filter(id=record_id)
            else:
                # Fallback: close only records created very recently (within 10s)
                cutoff = timezone.now() - timedelta(seconds=10)
                qs = qs.filter(
                    status__in=[ConnectionStatus.ACTIVE, ConnectionStatus.IDLE],
                    connected_at__gte=cutoff,
                )
            qs.update(status=ConnectionStatus.CLOSED, closed_at=timezone.now())
        except Exception as e:
            logger.debug(f"Could not close request connection record: {e}")

    def _skip_middleware(self, request):
        excluded = getattr(settings, 'CONNECTION_MIDDLEWARE_EXCLUDED_PATHS', [
            '/health/',
            '/metrics/',
            '/static/',
            '/media/',
            '/api/v1/auth/',
            '/ws/',
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