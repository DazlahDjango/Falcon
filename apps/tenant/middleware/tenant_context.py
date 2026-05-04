"""
Tenant Context Middleware
Extracts tenant from request and attaches to request object
"""

from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class TenantContextMiddleware(MiddlewareMixin):
    """
    Middleware to extract tenant_id from request headers or subdomain
    and attach it to the request object for use in authentication.
    """
    
    def process_request(self, request):
        """
        Extract tenant_id from request and attach to request.tenant_id
        """
        tenant_id = None
        
        # Option 1: From header (for API requests)
        tenant_id = request.headers.get('X-Tenant-ID')
        
        # Option 2: From subdomain (e.g., tenant1.example.com)
        if not tenant_id:
            host = request.get_host()
            subdomain = host.split('.')[0]
            if subdomain and subdomain not in ['www', 'api', 'localhost', '127.0.0.1']:
                tenant_id = subdomain
        
        # Option 3: From query parameter (for debugging)
        if not tenant_id:
            tenant_id = request.GET.get('tenant_id')
        
        # Attach to request
        request.tenant_id = tenant_id
        
        if tenant_id:
            logger.debug(f"Tenant context set: {tenant_id}")
        
        return None
