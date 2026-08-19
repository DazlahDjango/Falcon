import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseBadRequest
from django.conf import settings

logger = logging.getLogger(__name__)


class OrganizationResolutionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if self._should_skip(request):
            return None
        if getattr(request, 'tenant_id', None) or getattr(request, 'current_organization_id', None):
            return None
        org_id = None
        org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
        if org_id:
            logger.debug(f"Organization identified via header: {org_id}")
            request.organization_id = org_id
            request.tenant_id = org_id
            return None
        host = request.get_host().split(':')[0]
        parts = host.split('.')
        if len(parts) >= 3 and parts[-2] == getattr(settings, 'BASE_DOMAIN', 'falcon') and parts[-1] == 'com':
            subdomain = parts[0]
            org_id = self._get_org_id_from_slug(subdomain)
            if org_id:
                logger.debug(f"Organization identified via subdomain: {subdomain}")
                request.organization_id = org_id
                request.tenant_id = org_id
                return None
        org_id = self._get_org_id_from_domain(host)
        if org_id:
            logger.debug(f"Organization identified via custom domain: {host}")
            request.organization_id = org_id
            request.tenant_id = org_id
            return None
        logger.warning(f"No organization identified for request: {request.path}")
        return HttpResponseBadRequest("Unable to identify organization. Please provide X-Tenant-ID header.")

    def _should_skip(self, request):
        if '/health' in request.path or request.headers.get('X-Health-Check') == 'true':
            return True
        skip_paths = [
            '/admin/',
            '/api/v1/auth/',
            '/health/',
            '/docs/',
            '/api/v1/organizations/',
            '/media/',
            '/static/',
            '/ws/',
        ]
        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _get_org_id_from_slug(self, slug):
        from apps.tenant.models import Organization
        try:
            org = Organization.objects.filter(slug=slug, is_active=True, is_deleted=False).first()
            return str(org.id) if org else None
        except Exception:
            return None

    def _get_org_id_from_domain(self, domain):
        from apps.tenant.models import OrganizationDomain
        try:
            org_domain = OrganizationDomain.objects.filter(domain=domain, status='ACTIVE', is_deleted=False).first()
            return str(org_domain.organization.id) if org_domain else None
        except Exception:
            return None