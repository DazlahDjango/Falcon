"""
Branding Service - Manages organisation branding and theming
"""

import logging
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


class BrandingService:
    """
    Service for managing organisation branding
    """
    
    @classmethod
    def upload_logo(cls, organisation, logo_file):
        """
        Upload and set organisation logo
        
        Args:
            organisation: Organisation instance
            logo_file: Uploaded file object
        
        Returns:
            Branding: Updated branding
        """
        from apps.organisations.models import Branding
        
        branding, _ = Branding.objects.get_or_create(organisation=organisation)
        
        # Delete old logo if exists
        if branding.logo:
            default_storage.delete(branding.logo.path)
        
        # Save new logo
        branding.logo = logo_file
        branding.save()
        
        logger.info(f"Logo uploaded for organisation: {organisation.name}")
        return branding
    
    @classmethod
    def generate_css_variables(cls, organisation):
        """
        Generate CSS variables for organisation branding
        
        Args:
            organisation: Organisation instance
        
        Returns:
            str: CSS variables string
        """
        from apps.organisations.models import Branding
        
        branding = Branding.objects.filter(organisation=organisation).first()
        
        if not branding:
            # Default branding
            return """
            :root {
                --primary: #3B82F6;
                --secondary: #10B981;
                --accent: #F59E0B;
                --background: #FFFFFF;
            }
            """
        
        return f"""
        :root {{
            --primary: {branding.theme_color};
            --secondary: {branding.secondary_color};
            --accent: {branding.accent_color};
            --background: #FFFFFF;
            --font-family: {branding.font_family}, sans-serif;
        }}
        """
    
    @classmethod
    def get_login_page_customizations(cls, organisation):
        """
        Get login page customizations for organisation
        
        Args:
            organisation: Organisation instance
        
        Returns:
            dict: Login page customizations
        """
        from apps.organisations.models import Branding
        
        branding = Branding.objects.filter(organisation=organisation).first()
        
        if not branding:
            return {}
        
        return {
            'logo_url': branding.logo.url if branding.logo else None,
            'primary_color': branding.theme_color,
            'secondary_color': branding.secondary_color,
            'accent_color': branding.accent_color,
            'login_page_image': branding.login_page_image.url if hasattr(branding, 'login_page_image') and branding.login_page_image else None,
            'login_page_message': branding.login_page_message if hasattr(branding, 'login_page_message') else None,
        }