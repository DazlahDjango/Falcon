import logging
from decimal import Decimal
from typing import Dict, Any, Optional, Tuple
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from apps.billing.models import QuotaLimit, QuotaUsage, Subscription
from apps.billing.constants import QuotaResource, DEFAULT_QUOTA_LIMITS
from apps.billing.exceptions import QuotaError
logger = logging.getLogger(__name__)

class QuotaService:
    CACHE_KEY_PREFIX = 'quota:'
    CACHE_TTL = 300  # 5 minutes
    def __init__(self):
        self._cache = cache
    
    @transaction.atomic
    def initialize_limits(self, subscription: Subscription) -> QuotaLimit:
        plan_type = subscription.plan.plan_type
        defaults = DEFAULT_QUOTA_LIMITS.get(plan_type, DEFAULT_QUOTA_LIMITS['basic'])
        quota_limit = QuotaLimit.objects.create(
            subscription=subscription,
            max_users=defaults['max_users'],
            max_admins=defaults['max_admins'],
            max_kpis=defaults['max_kpis'],
            max_kpi_frameworks=defaults['max_kpi_frameworks'],
            max_storage_mb=defaults['max_storage_mb'],
            max_api_calls_per_day=defaults['max_api_calls_per_day'],
            allow_custom_branding=defaults['allow_custom_branding'],
            allow_api_access=defaults['allow_api_access'],
            allow_sso=defaults['allow_sso'],
            allow_advanced_analytics=defaults['allow_advanced_analytics'],
            allow_audit_logs=defaults['allow_audit_logs'],
            allow_reports=defaults['allow_reports'],
            allow_export=defaults['allow_export']
        )
        logger.info(f"Initialized quota limits for subscription {subscription.id}")
        return quota_limit
    
    @transaction.atomic
    def update_limits_for_subscription(self, subscription: Subscription) -> QuotaLimit:
        quota_limit = QuotaLimit.objects.filter(subscription=subscription).first()
        if not quota_limit:
            return self.initialize_limits(subscription)
        plan_type = subscription.plan.plan_type
        defaults = DEFAULT_QUOTA_LIMITS.get(plan_type, DEFAULT_QUOTA_LIMITS['basic'])
        quota_limit.max_users = defaults['max_users']
        quota_limit.max_admins = defaults['max_admins']
        quota_limit.max_kpis = defaults['max_kpis']
        quota_limit.max_kpi_frameworks = defaults['max_kpi_frameworks']
        quota_limit.max_storage_mb = defaults['max_storage_mb']
        quota_limit.max_api_calls_per_day = defaults['max_api_calls_per_day']
        quota_limit.allow_custom_branding = defaults['allow_custom_branding']
        quota_limit.allow_api_access = defaults['allow_api_access']
        quota_limit.allow_sso = defaults['allow_sso']
        quota_limit.allow_advanced_analytics = defaults['allow_advanced_analytics']
        quota_limit.allow_audit_logs = defaults['allow_audit_logs']
        quota_limit.allow_reports = defaults['allow_reports']
        quota_limit.allow_export = defaults['allow_export']
        quota_limit.save()
        self._invalidate_cache(subscription.tenant_id)
        logger.info(f"Updated quota limits for subscription {subscription.id}")
        return quota_limit
    
    def get_limits(self, tenant) -> Optional[QuotaLimit]:
        cache_key = f"{self.CACHE_KEY_PREFIX}limits:{tenant.id}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached
        subscription = getattr(tenant, 'subscription', None)
        if not subscription:
            return None
        quota_limit = QuotaLimit.objects.filter(subscription=subscription).first()
        if quota_limit:
            self._cache.set(cache_key, quota_limit, self.CACHE_TTL)
        return quota_limit
    
    def get_or_create_today_usage(self, tenant) -> QuotaUsage:
        today = timezone.now().date()
        usage, created = QuotaUsage.objects.get_or_create(
            tenant=tenant,
            snapshot_date=today,
            defaults={
                'current_users': 0,
                'current_admins': 0,
                'current_kpis': 0,
                'current_storage_mb': 0,
                'api_calls_today': 0,
            }
        )
        return usage
    
    def check_quota(self, tenant, resource: str, requested_amount: int = 1) -> Tuple[bool, int, int, str]:
        limits = self.get_limits(tenant)
        if not limits:
            return False, 0, 0, "No active subscription"
        usage = self.get_or_create_today_usage(tenant)
        resource_map = {
            QuotaResource.USERS: ('max_users', 'current_users'),
            QuotaResource.ADMINS: ('max_admins', 'current_admins'),
            QuotaResource.KPIS: ('max_kpis', 'current_kpis'),
            QuotaResource.KPI_FRAMEWORKS: ('max_kpi_frameworks', 'current_kpi_frameworks'),
            QuotaResource.STORAGE_MB: ('max_storage_mb', 'current_storage_mb'),
            QuotaResource.API_CALLS: ('max_api_calls_per_day', 'api_calls_today'),
        }
        if resource not in resource_map:
            return False, 0, 0, f"Unknown resource: {resource}"
        limit_field, usage_field = resource_map[resource]
        max_limit = getattr(limits, limit_field)
        current_usage = getattr(usage, usage_field)
        if resource == QuotaResource.API_CALLS:
            is_available = (current_usage + requested_amount) <= max_limit
        else:
            is_available = (current_usage + requested_amount) <= max_limit
        if not is_available:
            message = f"{resource.replace('_', ' ').title()} limit reached. Maximum: {max_limit}"
        else:
            message = "Quota available"
        return is_available, current_usage, max_limit, message
    
    def increment_usage(self, tenant, resource: str, amount: int = 1) -> bool:
        is_available, current_usage, max_limit, message = self.check_quota(
            tenant, resource, amount
        )
        if not is_available:
            from billing.services.audit_service import BillingAuditService
            BillingAuditService().log_quota_exceeded(
                tenant_id=str(tenant.id),
                resource=resource,
                current=current_usage,
                limit=max_limit
            )
            return False
        usage = self.get_or_create_today_usage(tenant)
        resource_field_map = {
            QuotaResource.USERS: 'current_users',
            QuotaResource.ADMINS: 'current_admins',
            QuotaResource.KPIS: 'current_kpis',
            QuotaResource.KPI_FRAMEWORKS: 'current_kpi_frameworks',
            QuotaResource.STORAGE_MB: 'current_storage_mb',
            QuotaResource.API_CALLS: 'api_calls_today',
        }
        if resource in resource_field_map:
            field = resource_field_map[resource]
            current = getattr(usage, field)
            setattr(usage, field, current + amount)
            usage.save(update_fields=[field])
            logger.debug(f"Incremented {resource} for tenant {tenant.id}: {current} -> {current + amount}")
        self._invalidate_cache(tenant.id)
        return True
    
    def decrement_usage(self, tenant, resource: str, amount: int = 1) -> bool:
        usage = self.get_or_create_today_usage(tenant)
        resource_field_map = {
            QuotaResource.USERS: 'current_users',
            QuotaResource.ADMINS: 'current_admins',
            QuotaResource.KPIS: 'current_kpis',
            QuotaResource.KPI_FRAMEWORKS: 'current_kpi_frameworks',
            QuotaResource.STORAGE_MB: 'current_storage_mb',
            QuotaResource.API_CALLS: 'api_calls_today',
        }
        if resource in resource_field_map:
            field = resource_field_map[resource]
            current = getattr(usage, field)
            new_value = max(0, current - amount)
            setattr(usage, field, new_value)
            usage.save(update_fields=[field])
            logger.debug(f"Decremented {resource} for tenant {tenant.id}: {current} -> {new_value}")
        self._invalidate_cache(tenant.id)
        return True
    
    def refresh_usage(self, tenant) -> QuotaUsage:
        from apps.accounts.models import User
        from apps.kpi.models import KPI
        usage = self.get_or_create_today_usage(tenant)
        usage.current_users = User.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False,
            is_active=True
        ).count()
        usage.current_admins = User.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False,
            is_active=True,
            role__in=['super_admin', 'client_admin']
        ).count()
        usage.current_kpis = KPI.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False
        ).count()
        usage.save()
        logger.info(f"Refreshed quota usage for tenant {tenant.id}")
        self._invalidate_cache(tenant.id)
        return usage
    
    def get_quota_status(self, tenant) -> Optional[Dict[str, Any]]:
        limits = self.get_limits(tenant)
        if not limits:
            return None
        usage = self.get_or_create_today_usage(tenant)
        def calculate_percentage(current: int, max_limit: int) -> float:
            if max_limit <= 0:
                return 0.0
            return round((current / max_limit) * 100, 2)
        return {
            'users': {
                'current': usage.current_users,
                'max': limits.max_users,
                'percentage': calculate_percentage(usage.current_users, limits.max_users),
                'available': limits.max_users - usage.current_users
            },
            'admins': {
                'current': usage.current_admins,
                'max': limits.max_admins,
                'percentage': calculate_percentage(usage.current_admins, limits.max_admins),
                'available': limits.max_admins - usage.current_admins
            },
            'kpis': {
                'current': usage.current_kpis,
                'max': limits.max_kpis,
                'percentage': calculate_percentage(usage.current_kpis, limits.max_kpis),
                'available': limits.max_kpis - usage.current_kpis
            },
            'storage': {
                'current_mb': usage.current_storage_mb,
                'max_mb': limits.max_storage_mb,
                'percentage': calculate_percentage(usage.current_storage_mb, limits.max_storage_mb),
                'available_mb': limits.max_storage_mb - usage.current_storage_mb,
                'available_gb': round((limits.max_storage_mb - usage.current_storage_mb) / 1024, 2)
            },
            'api_calls_today': {
                'current': usage.api_calls_today,
                'max': limits.max_api_calls_per_day,
                'percentage': calculate_percentage(usage.api_calls_today, limits.max_api_calls_per_day),
                'remaining': max(0, limits.max_api_calls_per_day - usage.api_calls_today)
            },
            'features': {
                'custom_branding': limits.allow_custom_branding,
                'api_access': limits.allow_api_access,
                'sso': limits.allow_sso,
                'advanced_analytics': limits.allow_advanced_analytics,
                'audit_logs': limits.allow_audit_logs,
                'reports': limits.allow_reports,
                'export': limits.allow_export,
            },
            'is_healthy': (
                usage.current_users <= limits.max_users * 0.9 and
                usage.current_admins <= limits.max_admins * 0.9 and
                usage.current_kpis <= limits.max_kpis * 0.9
            )
        }
    
    def reset_daily_api_usage(self) -> int:
        updated = QuotaUsage.objects.update(api_calls_today=0)
        logger.info(f"Reset daily API quotas for {updated} tenants")
        self._cache.clear()
        return updated
    
    def _invalidate_cache(self, tenant_id: str) -> None:
        cache_key = f"{self.CACHE_KEY_PREFIX}limits:{tenant_id}"
        self._cache.delete(cache_key)