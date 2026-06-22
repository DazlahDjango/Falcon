import logging
from typing import Dict, Any, Optional, List
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from decimal import Decimal
from ...models import UsageRecord, Subscription, BillingAuditLog
from ...exceptions import UsageLimitExceededError
from ..decorators import tenant_isolation, audit_log
from ..circuit_breaker import CircuitBreakerRegistry

logger = logging.getLogger(__name__)

class UsageTrackingService:
    def __init__(self):
        self.circuit_breaker = CircuitBreakerRegistry.get('usage_tracking')

    @tenant_isolation(UsageRecord)
    def track_usage(self, tenant_id: str, subscription: Subscription, usage_type: str, delta: int = 1) -> Dict[str, Any]:
        period_start = subscription.current_period_start
        period_end = subscription.current_period_end
        usage_record, created = UsageRecord.objects.get_or_create(tenant_id=tenant_id, subscription=subscription, usage_type=usage_type, period_start=period_start, period_end=period_end, defaults={'limit_value': self._get_limit_value(subscription, usage_type), 'current_value': 0})
        new_value = usage_record.current_value + delta
        limit = usage_record.limit_value
        if limit != -1 and new_value > limit:
            is_soft_exceeded = new_value > limit and new_value <= limit * 1.1
            is_hard_exceeded = new_value > limit * 1.1
            if is_hard_exceeded:
                raise UsageLimitExceededError(f"{usage_type} limit exceeded: {new_value} > {limit}")
            if is_soft_exceeded and not usage_record.alert_100_sent_at:
                self._send_soft_limit_alert(tenant_id, subscription, usage_type, new_value, limit)
        usage_record.update_usage(new_value)
        return {'usage_type': usage_type, 'current': usage_record.current_value, 'limit': usage_record.limit_value, 'percentage': float(usage_record.percentage_used), 'remaining': usage_record.remaining}

    def _get_limit_value(self, subscription: Subscription, usage_type: str) -> int:
        limit_map = {'users': subscription.plan.max_users, 'kpis': subscription.plan.max_kpis, 'api_calls': subscription.custom_limits.get('api_rate_limit', 1000), 'storage': subscription.plan.max_storage_mb, 'departments': subscription.plan.max_departments}
        if subscription.custom_limits and usage_type in subscription.custom_limits:
            return subscription.custom_limits[usage_type]
        if subscription.tenant_overrides.filter(is_active=True).exists():
            override = subscription.tenant_overrides.filter(valid_until__gte=timezone.now()).first()
            if override and override.override_features.get(usage_type):
                return override.override_features[usage_type]
        return limit_map.get(usage_type, 0)

    def _send_soft_limit_alert(self, tenant_id: str, subscription: Subscription, usage_type: str, current: int, limit: int):
        from services.audit.logger import audit_logger
        audit_logger.log(user=None, tenant_id=tenant_id, action='alert', resource_type='subscription', resource_id=subscription.id, after={'usage_type': usage_type, 'current': current, 'limit': limit}, metadata={'alert_type': 'soft_limit', 'percentage': (current/limit)*100})
        logger.warning(f"Soft limit alert for {subscription.subscription_code}: {usage_type} at {current}/{limit}")

    def get_usage_summary(self, subscription: Subscription) -> Dict[str, Any]:
        usage_records = UsageRecord.objects.filter(subscription=subscription, period_start=subscription.current_period_start)
        return {record.usage_type: {'current': record.current_value, 'limit': record.limit_value, 'percentage': float(record.percentage_used)} for record in usage_records}