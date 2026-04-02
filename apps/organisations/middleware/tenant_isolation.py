"""
Tenant Isolation Middleware
Ensures that all queries are scoped to the current tenant
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.db import connection

logger = logging.getLogger(__name__)


class TenantIsolationMiddleware(MiddlewareMixin):
    """
    Middleware that enforces tenant isolation:
    1. Sets database search path for PostgreSQL schemas
    2. Adds tenant filter to all queries
    3. Prevents cross-tenant access
    """

    def process_request(self, request):
        """
        Set up tenant isolation before the view is called
        """
        # Skip for public endpoints
        public_paths = ['/api/v1/organisations/register/', '/api/v1/organisations/organisations/', '/admin/', '/health/']
        if any(request.path.startswith(path) for path in public_paths):
            return

        # Check if we have a tenant
        if not hasattr(request, 'organisation') or not request.organisation:
            # For API calls, return error
            if request.path.startswith('/api/'):
                return JsonResponse(
                    {'error': 'Tenant not found. Please provide a valid tenant.'},
                    status=400
                )
            return

        # Set tenant ID in thread local for models to use
        from apps.organisations.utils import set_current_tenant
        set_current_tenant(request.organisation)

        # For PostgreSQL, set the schema search path
        schema_name = f"tenant_{request.organisation.slug.replace('-', '_')}"
        try:
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')
                logger.debug(f"Set search path to: {schema_name}")
        except Exception as e:
            logger.error(f"Error setting search path: {e}")

        # Mark that isolation is set
        request._tenant_isolation_set = True

    def process_response(self, request, response):
        """
        Add tenant information to response headers and clean up
        """
        if hasattr(request, 'organisation') and request.organisation:
            response['X-Tenant-ID'] = str(request.organisation.id)
            response['X-Tenant-Slug'] = request.organisation.slug

        # Reset tenant context
        from apps.organisations.utils import clear_current_tenant
        clear_current_tenant()

        return response

    def process_exception(self, request, exception):
        """
        Handle exceptions during tenant isolation
        """
        logger.error(f"Tenant isolation error: {exception}")
        return None