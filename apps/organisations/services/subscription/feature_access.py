"""
Feature Access Service - Checks if features are enabled for organisations
"""

import logging
from apps.organisations.models import FeatureFlag

logger = logging.getLogger(__name__)


class FeatureAccessService:
    """
    Service for checking feature access based on plan and feature flags
    """
    
    @classmethod
    def has_feature(cls, organisation, feature_name):
        """
        Check if an organisation has access to a specific feature
        
        Args:
            organisation: Organisation instance
            feature_name: Name of the feature to check
        
        Returns:
            bool: True if feature is enabled
        """
        # Check feature flags first (overrides plan)
        feature_flag = FeatureFlag.objects.filter(
            organisation=organisation,
            feature_name=feature_name
        ).first()
        
        if feature_flag:
            return feature_flag.is_active()
        
        # Check plan features
        if hasattr(organisation, 'subscription') and organisation.subscription.plan:
            return organisation.subscription.plan.features.get(feature_name, False)
        
        return False
    
    @classmethod
    def get_enabled_features(cls, organisation):
        """
        Get all enabled features for an organisation
        
        Args:
            organisation: Organisation instance
        
        Returns:
            dict: Dictionary of enabled features
        """
        enabled_features = {}
        
        # Get plan features
        if hasattr(organisation, 'subscription') and organisation.subscription.plan:
            enabled_features.update(organisation.subscription.plan.features)
        
        # Override with feature flags
        for flag in FeatureFlag.objects.filter(organisation=organisation, is_enabled=True):
            enabled_features[flag.feature_name] = True
        
        return enabled_features
    
    @classmethod
    def get_quota(cls, organisation, quota_name):
        """
        Get quota value for an organisation
        
        Args:
            organisation: Organisation instance
            quota_name: Name of the quota (e.g., 'max_users')
        
        Returns:
            int: Quota value
        """
        if hasattr(organisation, 'subscription') and organisation.subscription.plan:
            return getattr(organisation.subscription.plan, quota_name, None)
        return None
    
    @classmethod
    def check_quota(cls, organisation, quota_name, current_value):
        """
        Check if current value is within quota limits
        
        Args:
            organisation: Organisation instance
            quota_name: Name of the quota to check
            current_value: Current value to check against quota
        
        Returns:
            bool: True if within quota
        """
        quota = cls.get_quota(organisation, quota_name)
        if quota is None:
            return True
        return current_value <= quota