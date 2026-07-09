# apps/tenant/middleware/db_routing.py
"""
Database Routing Middleware - Routes queries to correct tenant database.

This middleware runs AFTER TenantContextMiddleware. It tells Django which
PostgreSQL schema to use for the current tenant's data (KPI, reviews, etc.).

For shared-schema models (accounts_user) this has no effect — those are
isolated via the tenant_id column. For tenant-specific schemas (org_airtel,
org_safaricom, etc.) this sets the PostgreSQL search_path so that all queries
in that request transparently hit the correct schema.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.db import connection

logger = logging.getLogger(__name__)


class TenantDatabaseRouterMiddleware(MiddlewareMixin):
    """
    Sets the PostgreSQL search_path for every request that has a resolved
    tenant context.

    IMPORTANT: Must run AFTER TenantContextMiddleware in the MIDDLEWARE list
    so that request.current_tenant_id is already set.
    """

    def process_request(self, request):
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id:
            return None
        self._set_schema_path(tenant_id)
        return None

    def process_response(self, request, response):
        # Reset to public schema so the connection is clean for the next request
        try:
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')
        except Exception as e:
            logger.debug(f"Could not reset search_path to public: {e}")
        return response

    def _set_schema_path(self, tenant_id):
        """
        Resolve the Organisation's schema_name and set PostgreSQL search_path.
        Uses org.schema_name property (e.g. 'org_airtel') not org.slug.
        """
        from apps.tenant.models import Organization
        try:
            org = Organization.objects.filter(id=tenant_id, is_active=True).first()
            if not org:
                logger.debug(f"[DBRouting] No active org for tenant_id={tenant_id}")
                return
            schema_name = org.schema_name   # e.g. 'org_airtel'
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')
                logger.debug(f"[DBRouting] search_path → {schema_name}")
        except Exception as e:
            logger.warning(f"[DBRouting] Could not set schema path: {e}")

