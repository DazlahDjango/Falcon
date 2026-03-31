"""
Module Manager Service - Enables/disables modules per organisation
"""

import logging
from apps.organisations.models import FeatureFlag

logger = logging.getLogger(__name__)


class ModuleManagerService:
    """
    Service for managing optional modules per organisation
    """
    
    # Available modules in the system
    AVAILABLE_MODULES = [
        'kpi_tracking',
        'performance_reviews',
        'pip_management',
        'task_management',
        '360_reviews',
        'learning_development',
        'advanced_reports',
        'api_access',
        'sso',
        'audit_logs',
        'custom_branding',
        'white_label',
    ]
    
    @classmethod
    def get_enabled_modules(cls, organisation):
        """
        Get all enabled modules for an organisation
        """
        enabled = []
        
        # Get from settings
        if hasattr(organisation, 'settings') and organisation.settings.modules_enabled:
            enabled = organisation.settings.modules_enabled.get('enabled', [])
        
        # Override with feature flags
        flags = FeatureFlag.objects.filter(
            organisation=organisation,
            is_enabled=True
        )
        for flag in flags:
            if flag.feature_name in cls.AVAILABLE_MODULES:
                if flag.feature_name not in enabled:
                    enabled.append(flag.feature_name)
        
        return enabled
    
    @classmethod
    def enable_module(cls, organisation, module_name):
        """
        Enable a module for an organisation
        """
        if module_name not in cls.AVAILABLE_MODULES:
            logger.warning(f"Unknown module: {module_name}")
            return False
        
        try:
            # Update settings
            settings = organisation.settings
            modules = settings.modules_enabled or {}
            enabled = modules.get('enabled', [])
            
            if module_name not in enabled:
                enabled.append(module_name)
                modules['enabled'] = enabled
                settings.modules_enabled = modules
                settings.save()
            
            # Create feature flag for override
            flag, created = FeatureFlag.objects.get_or_create(
                organisation=organisation,
                feature_name=module_name,
                defaults={'is_enabled': True}
            )
            if not created:
                flag.is_enabled = True
                flag.save()
            
            logger.info(f"Enabled module '{module_name}' for {organisation.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enable module: {e}")
            return False
    
    @classmethod
    def disable_module(cls, organisation, module_name):
        """
        Disable a module for an organisation
        """
        try:
            # Update settings
            settings = organisation.settings
            modules = settings.modules_enabled or {}
            enabled = modules.get('enabled', [])
            
            if module_name in enabled:
                enabled.remove(module_name)
                modules['enabled'] = enabled
                settings.modules_enabled = modules
                settings.save()
            
            # Update feature flag
            FeatureFlag.objects.filter(
                organisation=organisation,
                feature_name=module_name
            ).update(is_enabled=False)
            
            logger.info(f"Disabled module '{module_name}' for {organisation.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to disable module: {e}")
            return False
    
    @classmethod
    def is_module_enabled(cls, organisation, module_name):
        """
        Check if a module is enabled for an organisation
        """
        # Check feature flag first
        flag = FeatureFlag.objects.filter(
            organisation=organisation,
            feature_name=module_name
        ).first()
        
        if flag:
            return flag.is_enabled
        
        # Check settings
        if hasattr(organisation, 'settings') and organisation.settings.modules_enabled:
            enabled = organisation.settings.modules_enabled.get('enabled', [])
            return module_name in enabled
        
        # Check plan
        if hasattr(organisation, 'subscription') and organisation.subscription.plan:
            return organisation.subscription.plan.features.get(module_name, False)
        
        return False