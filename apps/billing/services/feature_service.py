import logging
from typing import Dict, Any, List, Optional
from django.core.cache import cache
from apps.billing.constants import FeatureFlag
from apps.billing.services.quota_service import QuotaService
logger = logging.getLogger(__name__)

class FeatureService:
    CACHE_KEY_PREFIX = 'feature:'
    CACHE_TTL = 300  # 5 minutes
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
    def __init__(self):
        self._cache = cache
        self.quota_service = QuotaService()
    
    def has_feature(self, tenant, feature: str) -> bool:
        cache_key = f"{self.CACHE_KEY_PREFIX}{tenant.id}:{feature}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached
        subscription = getattr(tenant, 'subscription', None)
        if not subscription or not subscription.is_active:
            self._cache.set(cache_key, False, self.CACHE_TTL)
            return False
        plan_type = subscription.plan.plan_type
        features_snapshot = subscription.features_snapshot
        if feature in features_snapshot:
            feature_data = features_snapshot.get(feature, {})
            value = feature_data.get('value', '')
            if value and value.lower() in ['yes', 'true', '1', 'enabled']:
                self._cache.set(cache_key, True, self.CACHE_TTL)
                return True
        required_plans = self.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
        result = plan_type in required_plans
        self._cache.set(cache_key, result, self.CACHE_TTL)
        return result
    
    def has_multiple_features(self, tenant, features: List[str]) -> Dict[str, bool]:
        return {feature: self.has_feature(tenant, feature) for feature in features}
    
    def get_available_features(self, tenant) -> List[Dict[str, Any]]:
        features = []
        for feature in FeatureFlag.ALL_FLAGS:
            is_available = self.has_feature(tenant, feature)
            required_plans = self.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
            features.append({
                'name': feature,
                'available': is_available,
                'required_plans': required_plans,
                'min_plan': required_plans[0] if required_plans else None
            })
        return features
    
    def get_feature_value(self, tenant, feature: str, default=None):
        subscription = getattr(tenant, 'subscription', None)
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
    
    def get_feature_limits(self, tenant, feature: str) -> Optional[Dict]:
        if feature == FeatureFlag.API_ACCESS:
            limits = self.quota_service.get_limits(tenant)
            if limits:
                return {
                    'max_api_calls_per_day': limits.max_api_calls_per_day
                }
        
        if feature == FeatureFlag.REPORTS:
            return {
                'max_concurrent_reports': 5,
                'max_export_rows': 100000
            }
        return None
    
    def get_minimum_plan_for_feature(self, feature: str) -> Optional[str]:
        plans = self.FEATURE_PLAN_REQUIREMENTS.get(feature, [])
        return plans[0] if plans else None
    
    def _invalidate_cache(self, tenant_id: str) -> None:
        self._cache.delete_pattern(f"{self.CACHE_KEY_PREFIX}{tenant_id}:*")