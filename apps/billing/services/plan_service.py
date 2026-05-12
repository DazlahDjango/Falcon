import logging
from typing import Optional, List, Dict, Any
from django.db import transaction
from django.core.cache import cache
from apps.billing.models import Plan, PlanFeature, Price
from apps.billing.constants import PlanType
from apps.billing.exceptions import PlanError
logger = logging.getLogger(__name__)

class PlanService:
    CACHE_KEY_PLANS = 'billing:plans:all'
    CACHE_KEY_PLAN = 'billing:plan:{}'
    CACHE_TTL = 3600  # 1 hour
    def __init__(self):
        self._cache = cache
    
    def get_all_plans(self, include_inactive: bool = False) -> List[Plan]:
        cache_key = f"{self.CACHE_KEY_PLANS}:{include_inactive}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached
        queryset = Plan.objects.filter(is_deleted=False)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        plans = list(queryset.prefetch_related('features').order_by('display_order', 'price_monthly'))
        self._cache.set(cache_key, plans, self.CACHE_TTL)
        return plans
    
    def get_plan(self, plan_id: str) -> Optional[Plan]:
        cache_key = self.CACHE_KEY_PLAN.format(plan_id)
        cached = self._cache.get(cache_key)
        if cached:
            return cached
        try:
            plan = Plan.objects.get(id=plan_id, is_deleted=False)
            self._cache.set(cache_key, plan, self.CACHE_TTL)
            return plan
        except Plan.DoesNotExist:
            return None
    
    def get_plan_by_slug(self, slug: str) -> Optional[Plan]:
        try:
            return Plan.objects.get(slug=slug, is_deleted=False, is_active=True)
        except Plan.DoesNotExist:
            return None
    
    def get_public_plans(self) -> List[Dict[str, Any]]:
        plans = self.get_all_plans(include_inactive=False)
        return [
            {
                'id': str(plan.id),
                'name': plan.name,
                'slug': plan.slug,
                'description': plan.description,
                'plan_type': plan.plan_type,
                'price_monthly': float(plan.price_monthly),
                'price_yearly': float(plan.price_yearly),
                'currency': plan.currency,
                'trial_days': plan.trial_days,
                'is_recommended': plan.is_recommended,
                'features': [
                    {
                        'name': f.name,
                        'value': f.value,
                        'is_highlight': f.is_highlight
                    }
                    for f in plan.features.filter(is_deleted=False).order_by('display_order')
                ]
            }
            for plan in plans
            if plan.plan_type != PlanType.TRIAL  # Exclude trial from public listing
        ]
    
    def get_plan_features(self, plan: Plan) -> List[Dict[str, Any]]:
        return [
            {
                'id': str(f.id),
                'name': f.name,
                'value': f.value,
                'is_highlight': f.is_highlight,
                'display_order': f.display_order
            }
            for f in plan.features.filter(is_deleted=False).order_by('display_order')
        ]
    
    @transaction.atomic
    def create_plan(self, name: str, slug: str, plan_type: str, price_monthly: float, price_yearly: float, currency: str = 'KES', description: str = '', trial_days: int = 14, features: List[Dict] = None) -> Plan:
        plan = Plan.objects.create(
            name=name,
            slug=slug,
            plan_type=plan_type,
            price_monthly=price_monthly,
            price_yearly=price_yearly,
            currency=currency,
            description=description,
            trial_days=trial_days,
            is_active=True
        )
        if features:
            for idx, feature_data in enumerate(features):
                PlanFeature.objects.create(
                    plan=plan,
                    name=feature_data['name'],
                    value=feature_data.get('value', ''),
                    is_highlight=feature_data.get('is_highlight', False),
                    display_order=idx
                )
        self._invalidate_cache()
        logger.info(f"Created plan: {plan.name}")
        return plan
    
    @transaction.atomic
    def update_plan(self, plan: Plan, **kwargs) -> Plan:
        allowed_fields = ['name', 'description', 'price_monthly', 'price_yearly', 'trial_days', 'is_active', 'is_recommended', 'display_order']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(plan, field, value)
        plan.save()
        self._invalidate_cache()
        logger.info(f"Updated plan: {plan.name}")
        return plan
    
    def compare_plans(self, plan_ids: List[str]) -> Dict[str, Any]:
        plans = []
        for plan_id in plan_ids:
            plan = self.get_plan(plan_id)
            if plan:
                plans.append(plan)
        all_features = set()
        for plan in plans:
            for feature in plan.features.all():
                all_features.add(feature.name)
        comparison = {
            'plans': [],
            'features': {}
        }
        for plan in plans:
            plan_data = {
                'id': str(plan.id),
                'name': plan.name,
                'plan_type': plan.plan_type,
                'price_monthly': float(plan.price_monthly),
                'price_yearly': float(plan.price_yearly),
                'currency': plan.currency,
                'trial_days': plan.trial_days
            }
            comparison['plans'].append(plan_data)
            feature_dict = {f.name: f.value for f in plan.features.all()}
            for feature_name in all_features:
                if feature_name not in comparison['features']:
                    comparison['features'][feature_name] = []
                comparison['features'][feature_name].append(feature_dict.get(feature_name, '—'))
        return comparison
    
    def get_recommended_plan(self) -> Optional[Plan]:
        return Plan.objects.filter(
            is_recommended=True,
            is_active=True,
            is_deleted=False
        ).first()
    
    def _invalidate_cache(self) -> None:
        self._cache.delete_pattern(f"{self.CACHE_KEY_PLANS}*")
        self._cache.delete_pattern(f"{self.CACHE_KEY_PLAN}*")