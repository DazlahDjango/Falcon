import logging
from django.http import HttpResponse, Http404
from apps.tenant.models import OrganizationDomain

logger = logging.getLogger(__name__)


def falcon_verification_view(request):
    """
    HTTP Challenge endpoint for domain ownership verification.
    Responds to GET /.well-known/falcon-verification.txt?domain=<domain_name>
    or host header.
    """
    domain_name = request.GET.get('domain')
    if not domain_name:
        domain_name = request.get_host().split(':')[0]

    logger.info(f"Falcon domain verification requested for domain: {domain_name}")

    try:
        domain_obj = OrganizationDomain.objects.get(domain=domain_name, is_deleted=False)
        content = f"falcon-domain-verification={domain_obj.verification_token.hex}"
        return HttpResponse(content, content_type="text/plain")
    except OrganizationDomain.DoesNotExist:
        logger.warning(f"Domain verification record not found for: '{domain_name}'")
        raise Http404("Domain verification record not found")
