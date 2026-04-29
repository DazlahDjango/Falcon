# apps/tenant/middleware/db_routing.py
"""
Database Routing Middleware - Routes queries to correct tenant database.

This middleware runs FOURTH. It tells Django which database or schema
to use for the current tenant (shared schema, separate schema, or separate DB).
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.db import connection

logger = logging.getLogger(__name__)


class TenantDatabaseRouterMiddleware(MiddlewareMixin):
    """
    Routes database queries to the correct tenant database/schema.
    
    This is OPTIONAL - only needed if using separate schemas or databases.
    For shared schema (tenant_id column), you don't need this.
    """
    
    def process_request(self, request):
        """
        Set database connection details based on tenant.
        """
        
        tenant_id = getattr(request, 'tenant_id', None)
        
        if not tenant_id:
            return None
        
        # Set search path for PostgreSQL schema isolation
        self._set_schema_path(tenant_id)
        
        return None
    
    def _set_schema_path(self, tenant_id):
        """
        Set PostgreSQL search path to tenant's schema.
        
        This makes all queries automatically use the correct schema.
        """
        from apps.tenant.models import Client
        
        try:
            tenant = Client.objects.filter(id=tenant_id).first()
            
            if tenant and hasattr(tenant, 'schema_name') and tenant.schema_name:
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{tenant.schema_name}", public')
                    logger.debug(f"Set search path to {tenant.schema_name}")
        except Exception as e:
            logger.debug(f"Could not set schema path: {e}")