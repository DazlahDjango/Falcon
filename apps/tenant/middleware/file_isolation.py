import re
import logging
from django.http import HttpResponseForbidden, HttpResponseBadRequest

logger = logging.getLogger(__name__)


class FileIsolationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/media/'):
            tenant_match = re.match(r'/media/organizations/([^/]+)/', request.path)
            if tenant_match:
                file_org_id = tenant_match.group(1)
                # Check both headers for backward compatibility
                request_org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
                if not request_org_id:
                    logger.warning(f"FILE ACCESS DENIED: No org header for {request.path}")
                    return HttpResponseBadRequest("X-Tenant-ID header is required")
                if request_org_id != file_org_id:
                    is_super_admin = request.user.is_superuser if hasattr(request, 'user') and request.user.is_authenticated else False
                    if not is_super_admin:
                        logger.warning(f"FILE ACCESS DENIED: Org {request_org_id} attempting to access org {file_org_id}'s file: {request.path}")
                        return HttpResponseForbidden("Access denied: File belongs to different organization")
                    else:
                        logger.info(f"Super admin accessing cross-org file: {request.path}")
                logger.debug(f"File access allowed: Org {request_org_id} accessing {request.path}")
        return self.get_response(request)