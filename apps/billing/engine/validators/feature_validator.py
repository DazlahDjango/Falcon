import logging
from typing import List, Optional, Dict, Any
from functools import wraps
from django.core.exceptions import PermissionDenied
from apps.billing.constants import FeatureFlag
logger = logging.getLogger(__name__)

class FeatureValidator:
    FEATURE_PLAN_REQUIREMENTS = {
        FeatureFlag.CUSTOM_BRANDING: ['professional', 'enterprise'],
        FeatureFlag.API_ACCESS: ['professional', 'enterprise'],
        FeatureFlag.SSO: ['enterprise'],
        FeatureFlag.ADVANCED_ANALYTICS: ['professional', 'enterprise'],
        FeatureFlag.AUDIT_LOGS: ['basic', 'professional', 'enterprise'],
        FeatureFlag.REPORTS: ['basic', 'professional', 'enterprise'],
        FeatureFlag.EXPORT: ['basic', 'professional', 'enterprise'],
        FeatureFlag.WEBHOOKS: ['professional', 'enterprise'],
        FeatureFlag.MULTI_CURRENCY: ['professional', 'enterprise'],
        FeatureFlag.PRIORITY_SUPPORT: ['professional', 'enterprise'],
        FeatureFlag.SLA: ['enterprise'],
        FeatureFlag.WHITE_LABEL: ['enterprise'],
    }
    
    def __init__(self, tenant=None):
        self.tenant = tenant
    
    def has_feature(self, tenant, feature: str) -> bool:
        if not tenant:
            return False
        if self._is_super_admin(tenant):
            return True
        subscription = self._get_subscription(tenant)
        if not subscription or not subscription.is_active:
            return False
        plan_type = subscription.plan.plan_type
        features_snapshot = subscription.features_snapshot
        if feature in features_snapshot:
            feature_data = features_snapshot.get(feature, {})
            value = feature_data.get('value', '')
            if value and value.lower() in ['yes', 'true', '1', 'enabled']:
                return True
        required_plans = self.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
        if required_plans and plan_type in required_plans:
            return True
        return False
    
    def validate_or_raise(self, tenant, feature: str):
        if not self.has_feature(tenant, feature):
            raise PermissionDenied(f"Feature '{feature}' is not available in your current plan.")
    
    def get_available_features(self, tenant) -> List[Dict[str, Any]]:
        features = []
        for feature in FeatureFlag.ALL_FLAGS:
            is_available = self.has_feature(tenant, feature)
            required_plan = self.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
            features.append({
                'name': feature,
                'available': is_available,
                'required_plans': required_plan,
                'min_plan': required_plan[0] if required_plan else None
            })
        return features
    
    def get_feature_value(self, tenant, feature: str, default=None):
        subscription = self._get_subscription(tenant)
        if not subscription:
            return default
        features_snapshot = subscription.features_snapshot
        if feature in features_snapshot:
            value = features_snapshot[feature].get('value', default)
            if value and value.lower() in ['yes', 'true', '1', 'enabled']:
                return True
            if value and value.lower() in ['no', 'false', '0', 'disabled']:
                return False
            return value
        return default
    
    def filter_features_by_plan(self, plan_type: str) -> List[str]:
        available = []
        for feature, required_plans in self.FEATURE_PLAN_REQUIREMENTS.items():
            if plan_type in required_plans:
                available.append(feature)
        return available
    
    def _get_subscription(self, tenant):
        if hasattr(tenant, 'subscription') and tenant.subscription:
            return tenant.subscription
        return None
    
    def _is_super_admin(self, tenant) -> bool:
        return False
    
    @classmethod
    def get_minimum_plan_for_feature(cls, feature: str) -> Optional[str]:
        plans = cls.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
        return plans[0] if plans else None