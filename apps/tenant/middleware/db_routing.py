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
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class TenantDatabaseRouterMiddleware(MiddlewareMixin):
    """
    Sets the PostgreSQL search_path for every request that has a resolved
    tenant context.

    IMPORTANT: Must run AFTER TenantContextMiddleware in the MIDDLEWARE list
    so that request.current_tenant_id is already set.
    """

    def process_request(self, request):
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'current_organization_id', None)
        if not tenant_id:
            return None
        if getattr(request, '_schema_path_set', None) == str(tenant_id):
            return None
        if self._set_schema_path(request, tenant_id):
            request._schema_path_set = str(tenant_id)
        return None

    def process_response(self, request, response):
        # Reset to public schema and clear session tenant context only if schema was set for this request
        if hasattr(request, '_schema_path_set'):
            try:
                with connection.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"; SELECT set_config(\'app.current_tenant_id\', \'\', true);')
            except Exception as e:
                logger.debug(f"Could not reset search_path / tenant session to public: {e}")
            finally:
                delattr(request, '_schema_path_set')
        return response

    def _get_schema_name(self, request, tenant_id):
        cache_key = f"tenant_schema_name:{tenant_id}"
        schema_name = cache.get(cache_key)
        if schema_name:
            return schema_name

        # Check if organization is attached to request or user to prevent DB lookup
        org = getattr(request, 'organization', None) or (
            getattr(request.user, 'organization', None) if hasattr(request, 'user') and request.user.is_authenticated else None
        )
        if org and str(getattr(org, 'id', '')) == str(tenant_id):
            if hasattr(org, 'schema_name') and org.schema_name:
                schema_name = org.schema_name
                ttl = getattr(settings, 'TENANT_SCHEMA_CACHE_TTL', 300)
                cache.set(cache_key, schema_name, timeout=ttl)
                return schema_name

        try:
            from apps.tenant.models import Organization
            org = Organization.objects.filter(id=tenant_id, is_active=True).first()
            if org and hasattr(org, 'schema_name') and org.schema_name:
                schema_name = org.schema_name
                ttl = getattr(settings, 'TENANT_SCHEMA_CACHE_TTL', 300)
                cache.set(cache_key, schema_name, timeout=ttl)
        except Exception as e:
            logger.warning(f"[DBRouting] Error fetching schema_name for tenant {tenant_id}: {e}")

        return schema_name

    def _set_schema_path(self, request, tenant_id):
        """
        Resolve the Organisation's schema_name and set PostgreSQL search_path and app.current_tenant_id for RLS policies.
        Uses cached org.schema_name (e.g. 'org_airtel') and transaction-scoped set_config for PgBouncer compatibility.
        """
        schema_name = self._get_schema_name(request, tenant_id)
        if not schema_name:
            return False

        try:
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')
                # 3rd argument 'true' scopes setting to local transaction (PgBouncer transaction mode safe)
                cursor.execute("SELECT set_config('app.current_tenant_id', %s, true)", [str(tenant_id)])
                logger.debug(f"[DBRouting] search_path → {schema_name}, app.current_tenant_id → {tenant_id}")
            return True
        except Exception as e:
            logger.warning(f"[DBRouting] Could not set schema path or RLS context: {e}")
            return False



