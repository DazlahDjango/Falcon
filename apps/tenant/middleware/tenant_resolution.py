# apps/tenant/middleware/tenant_resolution.py
"""
Tenant Resolution Middleware - Identifies which tenant is making the request.

This middleware runs FIRST. It looks at the incoming request and figures out
which tenant (organization) it belongs to by checking:
    1. HTTP Header: X-Tenant-ID
    2. Subdomain: tenantname.falcon.com
    3. Custom domain: pms.client.com

Once identified, it attaches tenant_id and tenant object to the request
so all subsequent code knows which tenant is active.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseBadRequest

logger = logging.getLogger(__name__)


class TenantResolutionMiddleware(MiddlewareMixin):

    def process_request(self, request):
        """
        This method runs before the view is called.
        It analyzes the request and identifies the tenant.
        """

        # Skip tenant resolution for:
        # - Admin panel (super admins manage all tenants)
        # - Authentication endpoints (login, register, password reset)
        # - Public endpoints (health checks, docs)
        if self._should_skip_tenant_resolution(request):
            return None

        tenant_id = None

        # METHOD 1: Check HTTP Header (X-Tenant-ID)
        # Frontend apps should send this header with every request
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            logger.debug(f"Tenant identified via header: {tenant_id}")
            request.tenant_id = tenant_id
            return None

        # METHOD 2: Check Subdomain (e.g., acme.falcon.com)
        # If tenant uses subdomain, extract from hostname
        host = request.get_host().split(':')[0]  # Remove port number
        parts = host.split('.')

        # If host has subdomain (e.g., acme.falcon.com -> acme is subdomain)
        if len(parts) >= 3 and parts[-2] == 'falcon' and parts[-1] == 'com':
            subdomain = parts[0]
            tenant_id = self._get_tenant_id_from_subdomain(subdomain)
            if tenant_id:
                logger.debug(f"Tenant identified via subdomain: {subdomain}")
                request.tenant_id = tenant_id
                return None

        # METHOD 3: Check Custom Domain (e.g., pms.client.com)
        # For tenants using their own domain (not falcon.com)
        tenant_id = self._get_tenant_id_from_custom_domain(host)
        if tenant_id:
            logger.debug(f"Tenant identified via custom domain: {host}")
            request.tenant_id = tenant_id
            return None

        # No tenant identified - reject the request
        logger.warning(f"No tenant identified for request: {request.path}")
        return HttpResponseBadRequest(
            "Unable to identify tenant. Please provide X-Tenant-ID header."
        )

    def _should_skip_tenant_resolution(self, request):
        """Check if we should skip tenant resolution for this request"""
        skip_paths = [
            '/admin/',           # Django admin
            '/api/v1/auth/',     # Authentication endpoints
            '/health/',          # Health checks
            '/docs/',            # API documentation
            '/api/v1/tenant/',   # Tenant creation (no tenant yet)
        ]

        for path in skip_paths:
            if request.path.startswith(path):
                return True
        return False

    def _get_tenant_id_from_subdomain(self, subdomain):
        """Look up tenant by subdomain"""
        from apps.tenant.models import Client

        try:
            tenant = Client.objects.filter(
                slug=subdomain,
                is_active=True,
                is_deleted=False
            ).first()
            return str(tenant.id) if tenant else None
        except Exception:
            return None

    def _get_tenant_id_from_custom_domain(self, domain):
        """Look up tenant by custom domain"""
        from apps.tenant.models import CustomDomain

        try:
            custom_domain = CustomDomain.objects.filter(
                domain=domain,
                status='active',
                is_deleted=False
            ).first()
            return str(custom_domain.tenant.id) if custom_domain else None
        except Exception:
            return None
