"""
Settings Manager Service - Manages organisation settings
"""

import logging
from apps.organisations.models import OrganisationSettings

logger = logging.getLogger(__name__)


class SettingsManagerService:
    """
    Service for managing organisation settings
    """
    
    @classmethod
    def get_settings(cls, organisation):
        """
        Get settings for an organisation
        
        Args:
            organisation: Organisation instance
        
        Returns:
            OrganisationSettings: Settings instance
        """
        settings, created = OrganisationSettings.objects.get_or_create(
            organisation=organisation
        )
        return settings
    
    @classmethod
    def update_settings(cls, organisation, data):
        """
        Update settings for an organisation
        
        Args:
            organisation: Organisation instance
            data: dict of settings to update
        
        Returns:
            OrganisationSettings: Updated settings
        """
        settings = cls.get_settings(organisation)
        
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.save()
        logger.info(f"Updated settings for organisation: {organisation.name}")
        return settings
    
    @classmethod
    def update_branding(cls, organisation, data):
        """
        Update branding for an organisation
        
        Args:
            organisation: Organisation instance
            data: dict of branding to update
        
        Returns:
            Branding: Updated branding
        """
        from apps.organisations.models import Branding
        
        branding, created = Branding.objects.get_or_create(organisation=organisation)
        
        for key, value in data.items():
            if hasattr(branding, key):
                setattr(branding, key, value)
        
        branding.save()
        logger.info(f"Updated branding for organisation: {organisation.name}")
        return branding