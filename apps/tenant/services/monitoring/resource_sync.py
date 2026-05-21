"""
Reconcile TenantResource counters from live cross-app data (Accounts, Structure, KPI).

CIA Integrity: usage dashboards reflect real DB counts, not stale increments.
"""
import logging
from typing import Dict, Optional

from django.db import transaction
from django.utils import timezone

from apps.tenant.constants import ResourceType, DEFAULT_TENANT_LIMITS, PLAN_LIMITS
from apps.tenant.models import Client, TenantResource

logger = logging.getLogger(__name__)


class ResourceSyncService:
    @classmethod
    def count_live_usage(cls, tenant_id) -> Dict[str, int]:
        counts = {
            ResourceType.USERS: 0,
            ResourceType.DEPARTMENTS: 0,
            ResourceType.KPIS: 0,
            ResourceType.CONCURRENT_SESSIONS: 0,
        }
        try:
            from apps.accounts.models import User
            counts[ResourceType.USERS] = User.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).count()
        except Exception as exc:
            logger.debug('User count skipped: %s', exc)

        try:
            from apps.structure.models import Department
            counts[ResourceType.DEPARTMENTS] = Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).count()
        except Exception as exc:
            logger.debug('Department count skipped: %s', exc)

        try:
            from apps.kpi.models import KPI
            counts[ResourceType.KPIS] = KPI.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).count()
        except Exception as exc:
            logger.debug('KPI count skipped: %s', exc)

        try:
            from apps.accounts.models import UserSession
            counts[ResourceType.CONCURRENT_SESSIONS] = UserSession.objects.filter(
                tenant_id=tenant_id, is_active=True, is_deleted=False,
            ).count()
        except Exception as exc:
            logger.debug('Session count skipped: %s', exc)

        return counts

    @classmethod
    def _default_limit(cls, tenant: Client, resource_type: str) -> int:
        plan_limits = PLAN_LIMITS.get(tenant.subscription_plan, {})
        if resource_type in plan_limits:
            return plan_limits[resource_type]
        feature_key = {
            ResourceType.USERS: 'max_users',
            ResourceType.KPIS: 'max_kpis',
            ResourceType.DEPARTMENTS: 'max_departments',
        }.get(resource_type)
        if feature_key:
            return int(tenant.get_feature(feature_key, DEFAULT_TENANT_LIMITS.get(resource_type, 100)))
        return DEFAULT_TENANT_LIMITS.get(resource_type, 100)

    @classmethod
    @transaction.atomic
    def sync_tenant(
        cls,
        tenant_id,
        *,
        broadcast: bool = True,
    ) -> Dict[str, dict]:
        tenant = Client.objects.filter(id=tenant_id, is_deleted=False).first()
        if not tenant:
            return {}

        live = cls.count_live_usage(tenant_id)
        results = {}

        for resource_type, current in live.items():
            resource, _ = TenantResource.objects.get_or_create(
                tenant_id=tenant_id,
                resource_type=resource_type,
                defaults={'limit_value': cls._default_limit(tenant, resource_type)},
            )
            if resource.limit_value <= 0:
                resource.limit_value = cls._default_limit(tenant, resource_type)
            old_value = resource.current_value
            resource.current_value = current
            resource.save(update_fields=['current_value', 'limit_value', 'updated_at'])
            results[resource_type] = {
                'current': current,
                'limit': resource.limit_value,
                'previous': old_value,
                'synced_at': timezone.now().isoformat(),
            }

        if broadcast:
            try:
                from apps.tenant.services.settings import TenantSettingsService
                if TenantSettingsService.get_section('quotas').get('sync_live_counts', True):
                    from apps.tenant.services.realtime import TenantEventBroadcaster
                    TenantEventBroadcaster.resource_usage_updated(
                        tenant_id=str(tenant_id),
                        usage=results,
                    )
                    warn_pct = TenantSettingsService.get_section('quotas').get(
                        'warn_threshold_percent', 80,
                    )
                    for rt, info in results.items():
                        limit = info.get('limit') or 0
                        current = info.get('current') or 0
                        if limit > 0 and (current / limit) * 100 >= warn_pct:
                            TenantEventBroadcaster.quota_warning(
                                tenant_id=str(tenant_id),
                                resource_type=rt,
                                current_value=current,
                                limit_value=limit,
                                percentage=round((current / limit) * 100, 1),
                            )
            except Exception as exc:
                logger.warning('Resource sync broadcast failed: %s', exc)

        return results

    @classmethod
    def sync_all_tenants(cls) -> int:
        synced = 0
        for tid in Client.objects.filter(is_deleted=False).values_list('id', flat=True):
            cls.sync_tenant(tid, broadcast=False)
            synced += 1
        return synced

    @classmethod
    def maybe_sync_on_read(cls, tenant_id) -> None:
        try:
            from apps.tenant.services.settings import TenantSettingsService
            if TenantSettingsService.get_section('quotas').get('reconcile_on_usage_read', True):
                cls.sync_tenant(tenant_id, broadcast=False)
        except Exception as exc:
            logger.debug('maybe_sync_on_read skipped: %s', exc)
