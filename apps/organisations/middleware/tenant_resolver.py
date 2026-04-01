"""
Tenant Resolver Middleware
Identifies the current tenant (organisation) from the request
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from apps.organisations.models import Organisation, Domain
from apps.organisations.utils import set_current_tenant

logger = logging.getLogger(__name__)


class TenantResolverMiddleware(MiddlewareMixin):
    """
    Middleware that identifies the current tenant from:
    1. Custom domain (e.g., pms.acme.com)
    2. Subdomain (e.g., acme.falconpms.com)
    3. Header (X-Tenant-ID)
    """

    def process_request(self, request):
        """
        Extract tenant from request and attach to request object
        """
        organisation = None

        # Method 1: Check header first (for API calls)
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            try:
                organisation = Organisation.objects.filter(
                    id=tenant_id,
                    is_active=True
                ).first()
                if organisation:
                    logger.debug(f"Tenant resolved via header: {organisation.slug}")
                    request.organisation = organisation
                    set_current_tenant(organisation)
                    return
            except Exception as e:
                logger.error(f"Error resolving tenant from header: {e}")

        # Method 2: Check custom domain
        host = request.get_host().split(':')[0]  # Remove port
        try:
            # Check if host matches a custom domain
            domain = Domain.objects.filter(
                domain_name=host,
                verification_status='verified'
            ).select_related('organisation').first()

            if domain and domain.organisation.is_active:
                organisation = domain.organisation
                logger.debug(f"Tenant resolved via custom domain: {organisation.slug}")
                request.organisation = organisation
                set_current_tenant(organisation)
                return
        except Exception as e:
            logger.error(f"Error resolving tenant from domain: {e}")

        # Method 3: Check subdomain
        parts = host.split('.')
        if len(parts) >= 3:
            subdomain = parts[0]
            try:
                organisation = Organisation.objects.filter(
                    subdomain=subdomain,
                    is_active=True
                ).first()
                if organisation:
                    logger.debug(f"Tenant resolved via subdomain: {organisation.slug}")
                    request.organisation = organisation
                    set_current_tenant(organisation)
                    return
            except Exception as e:
                logger.error(f"Error resolving tenant from subdomain: {e}")

        # Method 4: For authenticated users, use their organisation
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'organisation') and request.user.organisation:
                organisation = request.user.organisation
                if organisation.is_active:
                    logger.debug(f"Tenant resolved via authenticated user: {organisation.slug}")
                    request.organisation = organisation
                    set_current_tenant(organisation)
                    return

        # If no tenant found and not a public endpoint, set default or raise
        if not organisation:
            # Skip tenant resolution for public endpoints
            public_paths = ['/api/v1/organisations/register/', '/admin/', '/health/']
            if any(request.path.startswith(path) for path in public_paths):
                logger.debug(f"Skipping tenant resolution for public path: {request.path}")
                return

            # For API calls, we might want to raise an error
            if request.path.startswith('/api/'):
                logger.warning(f"No tenant found for request: {request.path}")
                request.organisation = None
                return

        request.organisation = organisation