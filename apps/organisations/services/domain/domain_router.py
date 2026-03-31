"""
Domain Router Service - Routes requests to correct tenant based on domain
"""

import logging
from django.db import connection
from apps.organisations.models import Domain, Organisation

logger = logging.getLogger(__name__)


class DomainRouterService:
    """
    Service for routing requests to the correct tenant based on domain
    """
    
    @classmethod
    def get_organisation_from_host(cls, host):
        """
        Get organisation from host header
        """
        # Remove port if present
        host = host.split(':')[0]
        
        # Check custom domains first
        try:
            domain = Domain.objects.filter(
                domain_name=host,
                verification_status='verified'
            ).select_related('organisation').first()
            
            if domain:
                return domain.organisation
        except Exception as e:
            logger.error(f"Error looking up custom domain: {e}")
        
        # Check subdomain
        parts = host.split('.')
        if len(parts) >= 3:
            subdomain = parts[0]
            try:
                organisation = Organisation.objects.filter(
                    subdomain=subdomain,
                    is_active=True
                ).first()
                return organisation
            except Exception as e:
                logger.error(f"Error looking up subdomain: {e}")
        
        # Return default organisation or None
        return None
    
    @classmethod
    def set_current_tenant(cls, request):
        """
        Set current tenant in request based on host
        """
        host = request.get_host()
        organisation = cls.get_organisation_from_host(host)
        
        if organisation:
            request.organisation = organisation
            # Set schema search path for database
            with connection.cursor() as cursor:
                schema_name = f"tenant_{organisation.slug.replace('-', '_')}"
                cursor.execute(f'SET search_path TO "{schema_name}", public')
            
            return organisation
        
        return None
    
    @classmethod
    def get_domain_info(cls, organisation):
        """
        Get domain information for an organisation
        """
        primary_domain = organisation.domains.filter(is_primary=True).first()
        custom_domains = organisation.domains.filter(is_primary=False)
        
        return {
            'subdomain': organisation.subdomain,
            'primary_domain': primary_domain.domain_name if primary_domain else None,
            'custom_domains': [d.domain_name for d in custom_domains],
            'full_url': cls.get_full_url(organisation),
        }
    
    @classmethod
    def get_full_url(cls, organisation):
        """
        Get full URL for organisation
        """
        from django.conf import settings
        
        base_url = getattr(settings, 'SITE_URL', 'https://app.falconpms.com')
        
        primary_domain = organisation.domains.filter(is_primary=True).first()
        if primary_domain:
            return f"https://{primary_domain.domain_name}"
        
        if organisation.subdomain:
            return f"https://{organisation.subdomain}.falconpms.com"
        
        return f"{base_url}/org/{organisation.slug}"