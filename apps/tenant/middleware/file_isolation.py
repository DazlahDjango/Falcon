"""
Tenant File Isolation Middleware
Prevents cross-tenant file access and enforces tenant headers
"""

import re
import logging
from django.http import HttpResponseForbidden, HttpResponseBadRequest
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


class TenantFileIsolationMiddleware:
    """
    Middleware to enforce tenant isolation for file access.
    
    This middleware:
        1. Blocks access to media files without X-Tenant-ID header
        2. Prevents cross-tenant file access
        3. Logs security violations
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Only check media file requests
        if request.path.startswith('/media/'):
            # Check if this is a tenant-isolated file
            tenant_match = re.match(r'/media/tenants/([^/]+)/', request.path)
            
            if tenant_match:
                file_tenant_id = tenant_match.group(1)
                request_tenant_id = request.headers.get('X-Tenant-ID')
                
                # CRITICAL: Check for missing tenant header
                if not request_tenant_id:
                    logger.warning(f"FILE ACCESS DENIED: No tenant header for {request.path}")
                    return HttpResponseBadRequest("X-Tenant-ID header is required")
                
                # Check if tenant header matches file tenant
                if request_tenant_id != file_tenant_id:
                    # Check if user is super admin (optional - adjust based on policy)
                    is_super_admin = request.user.is_superuser if request.user.is_authenticated else False
                    
                    if not is_super_admin:
                        logger.warning(
                            f"FILE ACCESS DENIED: Tenant {request_tenant_id} "
                            f"attempting to access tenant {file_tenant_id}'s file: {request.path}"
                        )
                        return HttpResponseForbidden("Access denied: File belongs to different tenant")
                    else:
                        logger.info(f"Super admin accessing cross-tenant file: {request.path}")
                
                # Log successful access
                logger.debug(f"File access allowed: Tenant {request_tenant_id} accessing {request.path}")
        
        response = self.get_response(request)
        return response