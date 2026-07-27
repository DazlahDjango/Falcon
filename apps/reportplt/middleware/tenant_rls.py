# apps/reportplt/middleware/tenant_rls.py (additional RLS middleware for tenant isolation)

import logging
from django.db import connection
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest
from apps.tenant.context import get_current_tenant_id

logger = logging.getLogger(__name__)

class TenantRLSMiddleware(MiddlewareMixin):
    """
    Middleware to set PostgreSQL RLS session variables for tenant isolation.
    """
    
    def process_request(self, request: HttpRequest):
        try:
            tenant_id = get_current_tenant_id()
            if tenant_id:
                with connection.cursor() as cursor:
                    cursor.execute("SET app.current_tenant_id = %s", [str(tenant_id)])
                logger.debug(f"Tenant RLS set: {tenant_id}")
            user_id = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_id = str(request.user.id)
                with connection.cursor() as cursor:
                    cursor.execute("SET app.current_user_id = %s", [user_id])
                logger.debug(f"User RLS set: {user_id}")
        except Exception as e:
            logger.warning(f"Failed to set RLS session variables: {str(e)}")
    
    def process_response(self, request, response):
        try:
            with connection.cursor() as cursor:
                cursor.execute("RESET app.current_tenant_id")
                cursor.execute("RESET app.current_user_id")
            logger.debug("RLS session variables reset")
        except Exception as e:
            logger.warning(f"Failed to reset RLS session variables: {str(e)}")
        return response