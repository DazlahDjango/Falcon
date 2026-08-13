import logging
from typing import Dict, Any, Optional, List
from django.utils import timezone
from django.db import transaction
from uuid import UUID
from ...models import TenantSubscriptionOverride, Subscription, SubscriptionPlan
from ..decorators import audit_log

logger = logging.getLogger(__name__)

class EnterpriseOverrideService:
    @audit_log('create', 'tenant_override')
    def create_override(self, tenant_id: str, subscription: Subscription, plan: SubscriptionPlan, approved_by: UUID, custom_price_monthly: Optional[int] = None, custom_price_yearly: Optional[int] = None, override_features: Optional[Dict] = None, valid_until: Optional[timezone.datetime] = None, discount_percentage: Optional[float] = None) -> TenantSubscriptionOverride:
        with transaction.atomic():
            original_price = plan.price
            if discount_percentage:
                custom_price_monthly = int(plan.price * (1 - discount_percentage / 100))
                if plan.yearly_price:
                    custom_price_yearly = int(plan.yearly_price * (1 - discount_percentage / 100))
            override = TenantSubscriptionOverride.objects.create(tenant_id=tenant_id, subscription=subscription, plan=plan, approved_by=approved_by, custom_price_monthly=custom_price_monthly, custom_price_yearly=custom_price_yearly, override_features=override_features or {}, valid_until=valid_until, original_price_monthly=original_price, discount_percentage=discount_percentage, is_negotiated=True, approval_notes=f"Custom pricing approved by {approved_by}")
            if custom_price_monthly:
                subscription.amount = custom_price_monthly
                subscription.custom_pricing = {'monthly': custom_price_monthly, 'yearly': custom_price_yearly, 'discount': discount_percentage}
                subscription.save()
            logger.info(f"Created enterprise override for tenant {tenant_id} on plan {plan.name}")
            return override

    def get_active_override(self, tenant_id: str, subscription: Subscription) -> Optional[TenantSubscriptionOverride]:
        from django.db.models import Q
        return TenantSubscriptionOverride.objects.filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=timezone.now()),
            tenant_id=tenant_id,
            subscription=subscription,
            is_deleted=False
        ).first()

    def get_effective_limit(self, subscription: Subscription, limit_key: str, default: int) -> int:
        override = self.get_active_override(subscription.tenant_id, subscription)
        if override and override.override_features and limit_key in override.override_features:
            return override.override_features[limit_key]
        if subscription.custom_limits and limit_key in subscription.custom_limits:
            return subscription.custom_limits[limit_key]
        return default

    def expire_overrides(self) -> int:
        expired = TenantSubscriptionOverride.objects.filter(valid_until__lt=timezone.now(), is_deleted=False)
        count = expired.count()
        expired.update(is_deleted=True, deleted_at=timezone.now())
        logger.info(f"Expired {count} tenant overrides")
        return count