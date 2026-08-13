import logging
from typing import Dict, Any, Optional, List
from django.db import transaction
from django.core.cache import cache
from uuid import UUID
from ...models import SubscriptionPlan, SubscriptionPlanFeature, TenantSubscriptionOverride, BillingAuditLog
from ...exceptions import PlanNotFoundError, PlanSyncError
from ..decorators import idempotent, audit_log, tenant_isolation
from ..circuit_breaker import CircuitBreakerRegistry
from ..payment.interface import PaymentProviderInterface
from ..payment.paystack_provider import PayStackProvider

logger = logging.getLogger(__name__)

class DynamicPlanManagementService:
    def __init__(self, payment_provider: Optional[PaymentProviderInterface] = None):
        self.payment_provider = payment_provider or PayStackProvider()
        self.circuit_breaker = CircuitBreakerRegistry.get('plan_management')

    @audit_log('create', 'plan')
    def create_plan(self, plan_data: Dict[str, Any], created_by: Optional[UUID] = None) -> SubscriptionPlan:
        with transaction.atomic():
            plan = SubscriptionPlan.objects.create(name=plan_data['name'], slug=plan_data.get('slug', plan_data['name'].lower().replace(' ', '_')), plan_type=plan_data['plan_type'], price=plan_data['price'], yearly_price=plan_data.get('yearly_price'), max_users=plan_data.get('max_users', 10), max_kpis=plan_data.get('max_kpis', 50), max_departments=plan_data.get('max_departments', 10), max_storage_mb=plan_data.get('max_storage_mb', 100), custom_branding=plan_data.get('custom_branding', False), api_access=plan_data.get('api_access', False), sso_enabled=plan_data.get('sso_enabled', False), advanced_analytics=plan_data.get('advanced_analytics', False), priority_support=plan_data.get('priority_support', False), description=plan_data.get('description', ''), features_list=plan_data.get('features_list', []), display_order=plan_data.get('display_order', 0), is_active=plan_data.get('is_active', True))
            for feature_data in plan_data.get('dynamic_features', []):
                SubscriptionPlanFeature.objects.create(plan=plan, feature_key=feature_data['feature_key'], feature_value=feature_data['feature_value'], feature_type=feature_data.get('feature_type', 'integer'), display_name=feature_data.get('display_name'), display_icon=feature_data.get('display_icon'), display_order=feature_data.get('display_order', 0), is_core_feature=feature_data.get('is_core_feature', False))
            try:
                self.circuit_breaker.call(self._sync_to_paystack, plan)
            except Exception as e:
                logger.error(f"PayStack sync failed for plan {plan.name}: {str(e)}")
            cache.delete('public_plans')
            return plan

    @audit_log('update', 'plan')
    def update_plan(self, plan_id: str, plan_data: Dict[str, Any], updated_by: Optional[UUID] = None) -> SubscriptionPlan:
        with transaction.atomic():
            plan = SubscriptionPlan.objects.get_by_id(plan_id)
            for field in ['name', 'price', 'yearly_price', 'max_users', 'max_kpis', 'max_departments', 'max_storage_mb', 'custom_branding', 'api_access', 'sso_enabled', 'advanced_analytics', 'priority_support', 'description', 'features_list', 'display_order', 'is_active']:
                if field in plan_data:
                    setattr(plan, field, plan_data[field])
            plan.save()
            if 'dynamic_features' in plan_data:
                plan.dynamic_features.all().delete()
                for feature_data in plan_data['dynamic_features']:
                    SubscriptionPlanFeature.objects.create(plan=plan, **feature_data)
            try:
                self.circuit_breaker.call(self._sync_to_paystack, plan)
            except Exception as e:
                logger.error(f"PayStack sync failed for plan {plan.name}: {str(e)}")
            cache.delete('public_plans')
            return plan

    def _sync_to_paystack(self, plan: SubscriptionPlan):
        if plan.plan_type == 'trial':
            return
        try:
            result = self.payment_provider.get_plan(plan.slug)
            if result.success:
                plan.paystack_plan_code = result.plan_code
                plan.paystack_plan_id = result.plan_id
                plan.save()
            else:
                interval = 'monthly' if plan.billing_interval == 'monthly' else 'annually'
                result = self.payment_provider.create_plan(name=plan.name, amount=plan.price, interval=interval, description=plan.description)
                plan.paystack_plan_code = result.plan_code
                plan.paystack_plan_id = result.plan_id
                plan.save()
        except Exception as e:
            raise PlanSyncError(f"Failed to sync plan to PayStack: {str(e)}")

    def get_all_plans(self, include_inactive: bool = False) -> List[Dict]:
        cache_key = f'all_plans_with_features_{include_inactive}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        queryset = SubscriptionPlan.objects.all() if include_inactive else SubscriptionPlan.objects.filter(is_active=True)
        plans = []
        for plan in queryset.prefetch_related('dynamic_features'):
            plans.append({'id': str(plan.id), 'name': plan.name, 'slug': plan.slug, 'plan_type': plan.plan_type, 'price': plan.price, 'yearly_price': plan.yearly_price, 'currency': plan.currency, 'billing_interval': plan.billing_interval, 'features': {f.feature_key: f.typed_value for f in plan.dynamic_features.all()}, 'static_features': plan.feature_dict, 'display_order': plan.display_order, 'is_active': plan.is_active})
        cache.set(cache_key, plans, 300)
        return plans