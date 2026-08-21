"""
apps/tenant/services/resource_service.py
Enterprise-grade Resource Service.

Responsibilities:
  - Resolves effective limits from billing (plan → custom_limits → enterprise override).
  - Checks grace-period awareness on every quota check.
  - Distributed Redis locking on every mutation (select_for_update fallback).
  - Delegates audit logging to billing.AuditLogger (no local re-implementation).
  - Fires Django signals at 80 / 90 / 100 % thresholds.
  - Provides usage analytics: trend, peak, projected exhaustion.
  - Writes ResourceUsageSnapshots for historical graphing.
"""
import logging
from contextlib import contextmanager
from typing import Any, Dict, List, Optional, Tuple
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from apps.tenant.exceptions import ResourceError
from apps.tenant.models import OrganizationResource, ResourceUsageSnapshot

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Constants                                                                    #
# --------------------------------------------------------------------------- #

# Billing → tenant resource type mapping
BILLING_TO_RESOURCE_TYPE: Dict[str, str] = {
    'users': 'USERS',
    'kpis': 'KPIS',
    'api_calls': 'API_CALLS_PER_DAY',
    'storage': 'STORAGE_MB',
    'departments': 'DEPARTMENTS',
}

RESOURCE_TO_BILLING_TYPE: Dict[str, str] = {v: k for k, v in BILLING_TO_RESOURCE_TYPE.items()}

# Billing plan field → resource type mapping (for limit resolution)
PLAN_LIMIT_FIELD: Dict[str, str] = {
    'USERS': 'max_users',
    'KPIS': 'max_kpis',
    'STORAGE_MB': 'max_storage_mb',
    'DEPARTMENTS': 'max_departments',
    'API_CALLS_PER_DAY': 'max_api_calls_per_day',
    'CONCURRENT_SESSIONS': 'max_concurrent_sessions',
}

# Statuses that allow access during grace period (reads + existing resources, no new creation)
GRACE_PERIOD_RESTRICTED_TYPES = {'USERS', 'DEPARTMENTS', 'CONCURRENT_SESSIONS'}

# Statuses that fully block access
BLOCKING_STATUSES = {'cancelled', 'expired', 'suspended'}

# Redis lock TTL (seconds)
LOCK_TIMEOUT = 10


# --------------------------------------------------------------------------- #
# Service                                                                      #
# --------------------------------------------------------------------------- #

class ResourceService:
    """
    Enterprise resource service that delegates limit resolution and audit
    logging to the billing app while owning the real-time quota gate.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._override_service = None
        self._usage_service = None

    # ------------------------------------------------------------------ #
    # Lazy service references (avoids circular imports at module level)   #
    # ------------------------------------------------------------------ #

    @property
    def override_service(self):
        if self._override_service is None:
            from apps.billing.services import EnterpriseOverrideService
            self._override_service = EnterpriseOverrideService()
        return self._override_service

    @property
    def usage_service(self):
        if self._usage_service is None:
            from apps.billing.services import UsageTrackingService
            self._usage_service = UsageTrackingService()
        return self._usage_service

    # ------------------------------------------------------------------ #
    # Limit resolution                                                     #
    # ------------------------------------------------------------------ #

    def _get_current_subscription(self, organization_id):
        """Return the active/trialing/past_due Subscription for this org, or None."""
        try:
            from apps.billing.models import Subscription
            return Subscription.objects.get_current_for_tenant(organization_id)
        except Exception:
            return None

    def _resolve_effective_limit(self, organization_id, resource_type: str) -> Optional[int]:
        """
        Resolve the effective limit for a resource type by consulting billing:
          1. Subscription plan field (e.g. max_users)
          2. subscription.custom_limits override
          3. EnterpriseOverrideService.get_effective_limit()

        Results are cached for 5 minutes per (org, resource_type).
        Returns None when no subscription exists.
        """
        cache_key = f"resource_limit:{organization_id}:{resource_type}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        subscription = self._get_current_subscription(organization_id)
        if not subscription:
            return None

        plan = subscription.plan
        plan_field = PLAN_LIMIT_FIELD.get(resource_type)
        default_limit = getattr(plan, plan_field, 0) if plan_field else 0

        # EnterpriseOverrideService handles: custom_limits → override_features → default
        billing_key = RESOURCE_TO_BILLING_TYPE.get(resource_type, resource_type.lower())
        try:
            effective = self.override_service.get_effective_limit(
                subscription, billing_key, default=default_limit
            )
        except Exception:
            effective = default_limit

        cache.set(cache_key, effective, 300)  # 5-minute cache
        return effective

    def _check_subscription_access(self, organization_id, resource_type: str, writing: bool = True):
        """
        Raise ResourceError if the subscription state prevents access.
        - Blocked: cancelled, expired, suspended → always block.
        - Past due (grace period): allow reads; block writes on restricted types.
        """
        subscription = self._get_current_subscription(organization_id)
        if not subscription:
            # No subscription → rely on OrganizationResource existing limits
            return

        status = subscription.status
        if status in BLOCKING_STATUSES:
            raise ResourceError(
                f"Access denied: subscription is {status}. Please renew to continue."
            )

        if status == 'past_due' and writing and resource_type in GRACE_PERIOD_RESTRICTED_TYPES:
            raise ResourceError(
                f"New {resource_type.lower()} creation restricted: payment is overdue. "
                "Please update your payment method."
            )

    # ------------------------------------------------------------------ #
    # Distributed locking                                                 #
    # ------------------------------------------------------------------ #

    @contextmanager
    def _lock(self, organization_id, resource_type: str):
        """
        Acquire a Redis NX lock scoped to (org, resource_type).
        Falls back gracefully if Redis is unavailable (logs warning, no exception).
        """
        lock_key = f"resource_lock:{organization_id}:{resource_type}"
        acquired = cache.add(lock_key, "1", timeout=LOCK_TIMEOUT)
        if not acquired:
            self.logger.warning(
                f"Could not acquire lock for {resource_type} on org {organization_id}. "
                "Proceeding with DB-level select_for_update."
            )
        try:
            yield acquired
        finally:
            if acquired:
                cache.delete(lock_key)

    # ------------------------------------------------------------------ #
    # Alert firing                                                         #
    # ------------------------------------------------------------------ #

    def _fire_alerts(self, resource: OrganizationResource, organization_id):
        """
        Emit Django signals and send email alerts at 80 / 90 / 100% thresholds.
        Updates alert_*_sent_at timestamps to avoid repeat sends.
        """
        from apps.tenant.signals.resource_signals import (
            resource_quota_warning,
            resource_quota_exceeded,
        )
        pct = resource.percentage_used
        now = timezone.now()
        fields_to_save = []

        if pct >= 100 and not resource.alert_100_sent_at:
            resource.alert_100_sent_at = now
            fields_to_save.append('alert_100_sent_at')
            resource_quota_exceeded.send(
                sender=OrganizationResource,
                resource=resource,
                organization_id=organization_id,
                level=100,
                percentage=pct,
            )
            self._send_alert_email(resource, organization_id, level=100, percentage=pct)

        elif pct >= 90 and not resource.alert_90_sent_at:
            resource.alert_90_sent_at = now
            fields_to_save.append('alert_90_sent_at')
            resource_quota_warning.send(
                sender=OrganizationResource,
                resource=resource,
                organization_id=organization_id,
                level=90,
                percentage=pct,
            )
            self._send_alert_email(resource, organization_id, level=90, percentage=pct)

        elif pct >= 80 and not resource.alert_80_sent_at:
            resource.alert_80_sent_at = now
            fields_to_save.append('alert_80_sent_at')
            resource_quota_warning.send(
                sender=OrganizationResource,
                resource=resource,
                organization_id=organization_id,
                level=80,
                percentage=pct,
            )
            self._send_alert_email(resource, organization_id, level=80, percentage=pct)

        if fields_to_save:
            resource.save(update_fields=fields_to_save)

    def _send_alert_email(self, resource, organization_id, level: int, percentage: float):
        """Send a quota alert email to the organization's contact email."""
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            from apps.tenant.models import Organization
            org = Organization.objects.get(id=organization_id)
            email = org.contact_email
            if not email:
                return
            subject = f"[Falcon] {resource.get_resource_type_display()} quota at {level}% — {org.name}"
            if level >= 100:
                body = (
                    f"Dear {org.name},\n\n"
                    f"Your {resource.get_resource_type_display()} quota has been reached "
                    f"({resource.current_value}/{resource.limit_value}).\n"
                    "Further usage may be restricted. Please upgrade your plan or free up resources.\n\n"
                    "— Falcon PMS Team"
                )
            else:
                body = (
                    f"Dear {org.name},\n\n"
                    f"Your {resource.get_resource_type_display()} usage is at {percentage:.1f}% "
                    f"({resource.current_value}/{resource.limit_value}).\n"
                    "Consider upgrading your plan to avoid service interruption.\n\n"
                    "— Falcon PMS Team"
                )
            send_mail(
                subject=subject,
                message=body,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@falconpms.com'),
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception as e:
            self.logger.warning(f"Alert email failed for org {organization_id}: {e}")

    # ------------------------------------------------------------------ #
    # Audit logging (delegates entirely to billing)                       #
    # ------------------------------------------------------------------ #

    def _audit(self, action: str, resource: OrganizationResource,
               organization_id, before: Dict, after: Dict, user=None, metadata: Dict = None):
        try:
            from apps.billing.services.audit.logger import audit_logger
            audit_logger.log(
                user=user,
                tenant_id=organization_id,
                action=action,
                resource_type='organization_resource',
                resource_id=resource.id,
                before=before,
                after=after,
                metadata={
                    'resource_type': resource.resource_type,
                    **(metadata or {}),
                },
            )
        except Exception as e:
            self.logger.warning(f"Audit log failed for {action} on resource {resource.id}: {e}")

    # ------------------------------------------------------------------ #
    # Quota check                                                          #
    # ------------------------------------------------------------------ #

    def check_quota(self, organization_id, resource_type: str, amount: int = 1) -> bool:
        """
        Check whether `amount` more units can be allocated.
        Raises ResourceError on violation.
        Returns True when allowed.
        """
        self._check_subscription_access(organization_id, resource_type, writing=True)

        resource = OrganizationResource.objects.by_organization_and_type(
            organization_id, resource_type
        )
        if not resource:
            return True  # No quota record → allow (no limit enforced)

        # Sync limit from billing on first check if not yet synced
        if not resource.is_synced_from_billing:
            self._sync_single_limit(resource, organization_id, resource_type)
            resource.refresh_from_db()

        if not resource.can_increment(amount):
            if resource.is_hard_exceeded:
                raise ResourceError(
                    f"Hard limit exceeded for {resource_type}: "
                    f"{resource.current_value}/{resource.effective_hard_limit}"
                )
            raise ResourceError(
                f"Quota exceeded for {resource_type}: "
                f"{resource.current_value}/{resource.limit_value}"
            )
        return True

    # ------------------------------------------------------------------ #
    # Usage mutations                                                      #
    # ------------------------------------------------------------------ #

    def increment_usage(self, organization_id, resource_type: str,
                        amount: int = 1, user=None) -> Optional[OrganizationResource]:
        """
        Safely increment usage with:
          - Subscription/grace-period check
          - Atomic Redis LUA script execution
          - DB select_for_update fallback
          - Quota enforcement (soft / hard limits)
          - Audit log (billing)
          - Alert signals
        """
        self._check_subscription_access(organization_id, resource_type, writing=True)

        # Atomic Redis Lua script execution for zero race condition quota checks
        cache_key = f"quota_counter:{organization_id}:{resource_type}"
        lua_script = """
            local current = redis.call('INCRBY', KEYS[1], ARGV[1])
            local limit = tonumber(ARGV[2])
            if limit > 0 and current > limit then
                redis.call('DECRBY', KEYS[1], ARGV[1])
                return -1
            end
            return current
        """
        try:
            from django_redis import get_redis_connection
            redis_conn = get_redis_connection("default")
            resource_ref = OrganizationResource.objects.filter(
                organization_id=organization_id, resource_type=resource_type
            ).first()
            if resource_ref:
                effective_limit = resource_ref.effective_hard_limit if resource_ref.burst_allowed else resource_ref.limit_value
                res = redis_conn.eval(lua_script, 1, cache_key, amount, effective_limit)
                if res == -1:
                    raise ResourceError(f"Quota exceeded for {resource_type}: limit {effective_limit} reached.")
        except Exception as e:
            if isinstance(e, ResourceError):
                raise
            self.logger.debug(f"Redis Lua script skipped, falling back to DB locks: {e}")

        with self._lock(organization_id, resource_type):
            with transaction.atomic():
                try:
                    resource = (
                        OrganizationResource.objects
                        .select_for_update()
                        .get(organization_id=organization_id, resource_type=resource_type)
                    )
                except OrganizationResource.DoesNotExist:
                    return None

                # Sync limit on first write if needed
                if not resource.is_synced_from_billing:
                    self._sync_single_limit(resource, organization_id, resource_type)

                if not resource.can_increment(amount):
                    raise ResourceError(
                        f"Quota exceeded for {resource_type}: "
                        f"{resource.current_value}/{resource.limit_value}"
                    )

                old_value = resource.current_value
                resource.increment(amount)

                self._audit(
                    action='increment',
                    resource=resource,
                    organization_id=organization_id,
                    before={'current_value': old_value, 'limit_value': resource.limit_value},
                    after={'current_value': resource.current_value,
                           'percentage': resource.percentage_used},
                    user=user,
                    metadata={'delta': amount},
                )
                self._fire_alerts(resource, organization_id)
                self.logger.info(
                    f"[Resource] +{amount} {resource_type} for org {organization_id}: "
                    f"{resource.current_value}/{resource.limit_value}"
                )
                return resource

    def decrement_usage(self, organization_id, resource_type: str,
                        amount: int = 1, user=None) -> Optional[OrganizationResource]:
        """Safely decrement usage with lock and audit log."""
        with self._lock(organization_id, resource_type):
            with transaction.atomic():
                try:
                    resource = (
                        OrganizationResource.objects
                        .select_for_update()
                        .get(organization_id=organization_id, resource_type=resource_type)
                    )
                except OrganizationResource.DoesNotExist:
                    return None

                old_value = resource.current_value
                resource.decrement(amount)

                self._audit(
                    action='decrement',
                    resource=resource,
                    organization_id=organization_id,
                    before={'current_value': old_value},
                    after={'current_value': resource.current_value,
                           'percentage': resource.percentage_used},
                    user=user,
                    metadata={'delta': amount},
                )
                self.logger.info(
                    f"[Resource] -{amount} {resource_type} for org {organization_id}: "
                    f"{resource.current_value}/{resource.limit_value}"
                )
                return resource

    def bulk_increment(self, organization_id, increments: List[Dict[str, Any]],
                       user=None) -> Dict[str, Any]:
        """
        Increment multiple resource types atomically.

        Args:
            organization_id: The org UUID.
            increments: [{'resource_type': 'USERS', 'amount': 3}, ...]
            user: Acting user for audit log.

        Returns:
            {'success': True/False, 'results': {resource_type: current_value|error}}
        """
        results = {}
        errors = {}

        # Pre-check all quotas before any mutation
        for item in increments:
            rt = item['resource_type']
            amt = item.get('amount', 1)
            try:
                self.check_quota(organization_id, rt, amt)
            except ResourceError as e:
                errors[rt] = str(e)

        if errors:
            return {'success': False, 'errors': errors, 'results': {}}

        for item in increments:
            rt = item['resource_type']
            amt = item.get('amount', 1)
            try:
                resource = self.increment_usage(organization_id, rt, amt, user=user)
                results[rt] = resource.current_value if resource else None
            except ResourceError as e:
                errors[rt] = str(e)

        return {
            'success': len(errors) == 0,
            'results': results,
            'errors': errors,
        }

    # ------------------------------------------------------------------ #
    # Reads                                                                #
    # ------------------------------------------------------------------ #

    def get_usage(self, organization_id, resource_type: str) -> Optional[OrganizationResource]:
        return OrganizationResource.objects.by_organization_and_type(
            organization_id, resource_type
        )

    def get_all_usage(self, organization_id):
        return OrganizationResource.objects.by_organization(organization_id)

    def get_usage_summary(self, organization_id) -> List[Dict]:
        """
        Returns enriched summary for all resources of an org, including billing
        period usage from UsageRecord where available.
        """
        resources = OrganizationResource.objects.by_organization(organization_id)
        summary = []
        billing_usage = self._get_billing_period_usage(organization_id)

        for resource in resources:
            billing_key = RESOURCE_TO_BILLING_TYPE.get(resource.resource_type)
            billing_data = billing_usage.get(billing_key, {})
            summary.append({
                'id': str(resource.id),
                'resource_type': resource.resource_type,
                'resource_type_display': resource.get_resource_type_display(),
                'current_value': resource.current_value,
                'limit_value': resource.limit_value,
                'percentage_used': resource.percentage_used,
                'remaining': resource.remaining,
                'is_exceeded': resource.is_exceeded,
                'is_soft_exceeded': resource.is_soft_exceeded,
                'is_hard_exceeded': resource.is_hard_exceeded,
                'is_warning_level': resource.is_warning_level,
                'alert_level': resource.alert_level,
                'burst_allowed': resource.burst_allowed,
                'is_synced_from_billing': resource.is_synced_from_billing,
                'last_billing_sync_at': resource.last_billing_sync_at,
                # Billing period overlay (from billing.UsageRecord)
                'billing_period_current': billing_data.get('current_value'),
                'billing_period_limit': billing_data.get('limit_value'),
                'billing_period_percentage': billing_data.get('percentage_used'),
            })
        return summary

    def get_usage_analytics(self, organization_id, resource_type: str,
                            days: int = 7) -> Dict[str, Any]:
        """
        Returns analytics for a single resource type:
          - Trend (daily snapshot values over N days)
          - Peak value
          - Projected exhaustion date
          - Billing period overlay
        """
        resource = OrganizationResource.objects.by_organization_and_type(
            organization_id, resource_type
        )
        if not resource:
            return {}

        trend = ResourceUsageSnapshot.objects.trend_values(
            organization_id, resource_type, days=days
        )
        stats = ResourceUsageSnapshot.objects.daily_average(
            organization_id, resource_type, days=days
        )
        projected_days = self._project_exhaustion(trend, resource)
        billing_overlay = self._get_billing_period_usage(organization_id).get(
            RESOURCE_TO_BILLING_TYPE.get(resource_type, ''), {}
        )

        return {
            'resource_type': resource_type,
            'resource_type_display': resource.get_resource_type_display(),
            'current_value': resource.current_value,
            'limit_value': resource.limit_value,
            'percentage_used': resource.percentage_used,
            'peak_value': stats.get('peak') or resource.current_value,
            f'trend_{days}d': trend,
            'projected_exhaustion_days': projected_days,
            'billing_period_usage': billing_overlay,
        }

    def _get_billing_period_usage(self, organization_id) -> Dict[str, Dict]:
        """
        Fetch current billing period UsageRecord data from billing app.
        Returns dict keyed by billing usage_type.
        """
        try:
            from apps.billing.models import Subscription
            from apps.billing.models.usage_record import UsageRecord
            subscription = self._get_current_subscription(organization_id)
            if not subscription:
                return {}
            records = UsageRecord.objects.filter(
                subscription=subscription,
                period_start=subscription.current_period_start,
            )
            return {
                r.usage_type: {
                    'current_value': r.current_value,
                    'limit_value': r.limit_value,
                    'percentage_used': float(r.percentage_used),
                    'peak_value': r.peak_value,
                }
                for r in records
            }
        except Exception as e:
            self.logger.warning(f"Could not fetch billing period usage for {organization_id}: {e}")
            return {}

    def _project_exhaustion(self, trend: List[int], resource: OrganizationResource) -> Optional[int]:
        """
        Linear projection of days until limit is reached based on recent trend growth.
        Returns None when trend is flat or resource not near limit.
        """
        if not trend or len(trend) < 2:
            return None
        daily_growth = (trend[-1] - trend[0]) / len(trend)
        if daily_growth <= 0:
            return None
        remaining = resource.limit_value - resource.current_value
        if remaining <= 0:
            return 0
        return int(remaining / daily_growth)

    # ------------------------------------------------------------------ #
    # Resets                                                               #
    # ------------------------------------------------------------------ #

    def reset_resource(self, resource_id, user=None) -> Optional[OrganizationResource]:
        """Reset a single resource and write audit log."""
        try:
            resource = OrganizationResource.objects.get(id=resource_id, is_deleted=False)
        except OrganizationResource.DoesNotExist:
            return None

        old_value = resource.current_value
        resource.reset()
        self._audit(
            action='reset',
            resource=resource,
            organization_id=resource.organization_id,
            before={'current_value': old_value},
            after={'current_value': 0},
            user=user,
            metadata={'reset_type': 'manual'},
        )
        from apps.tenant.signals.resource_signals import resource_usage_reset
        resource_usage_reset.send(
            sender=OrganizationResource,
            resource=resource,
            organization_id=resource.organization_id,
        )
        return resource

    def reset_daily_limits(self, user=None) -> Dict[str, int]:
        """Bulk reset API_CALLS_PER_DAY across all orgs with audit log."""
        count = OrganizationResource.objects.bulk_reset_by_type('API_CALLS_PER_DAY')
        self.logger.info(f"[Resource] Reset API_CALLS_PER_DAY for {count} organizations")
        try:
            from apps.billing.services.audit.logger import audit_logger
            audit_logger.log(
                user=user,
                tenant_id=None,
                action='bulk_reset',
                resource_type='organization_resource',
                resource_id=None,
                before={},
                after={'reset_count': count},
                metadata={'resource_type': 'API_CALLS_PER_DAY', 'reset_type': 'daily_scheduled'},
            )
        except Exception as e:
            self.logger.warning(f"Audit log failed on daily reset: {e}")
        return {'reset_count': count}

    # ------------------------------------------------------------------ #
    # Billing sync                                                         #
    # ------------------------------------------------------------------ #

    def _sync_single_limit(self, resource: OrganizationResource,
                            organization_id, resource_type: str):
        """
        Resolve effective limit from billing and update the resource row.
        Called lazily on first quota check or increment if not yet synced.
        """
        effective = self._resolve_effective_limit(organization_id, resource_type)
        if effective is not None and effective != resource.limit_value:
            resource.limit_value = effective
        resource.is_synced_from_billing = True
        resource.last_billing_sync_at = timezone.now()
        resource.save(update_fields=['limit_value', 'is_synced_from_billing', 'last_billing_sync_at'])

    def sync_limits_from_billing(self, organization_id=None) -> Dict[str, Any]:
        """
        Sync limit_value for all (or one org's) OrganizationResource rows from billing.
        Returns a report of how many records were updated and what changed.

        Args:
            organization_id: If provided, sync only that org. Otherwise sync all.
        """
        qs = OrganizationResource.objects.filter(is_deleted=False)
        if organization_id:
            qs = qs.filter(organization_id=organization_id)

        synced = 0
        updated = {}
        errors = []

        for resource in qs.select_related('organization'):
            try:
                effective = self._resolve_effective_limit(
                    resource.organization_id, resource.resource_type
                )
                if effective is None:
                    continue
                old_limit = resource.limit_value
                changed = effective != old_limit
                resource.limit_value = effective
                resource.is_synced_from_billing = True
                resource.last_billing_sync_at = timezone.now()
                resource.save(update_fields=[
                    'limit_value', 'is_synced_from_billing', 'last_billing_sync_at'
                ])
                synced += 1
                if changed:
                    updated[f"{resource.organization_id}:{resource.resource_type}"] = {
                        'old': old_limit,
                        'new': effective,
                    }
                # Invalidate cache
                cache.delete(f"resource_limit:{resource.organization_id}:{resource.resource_type}")
            except Exception as e:
                errors.append({
                    'org': str(resource.organization_id),
                    'resource_type': resource.resource_type,
                    'error': str(e),
                })
                self.logger.error(
                    f"sync_limits_from_billing failed for "
                    f"{resource.organization_id}:{resource.resource_type}: {e}"
                )

        from apps.tenant.signals.resource_signals import resource_limit_synced
        resource_limit_synced.send(
            sender=ResourceService,
            synced_count=synced,
            updated=updated,
            organization_id=organization_id,
        )
        self.logger.info(f"[Resource] Billing sync complete: {synced} synced, {len(updated)} changed")
        return {
            'synced_count': synced,
            'updated_limits': updated,
            'errors': errors,
        }

    # ------------------------------------------------------------------ #
    # Snapshots                                                            #
    # ------------------------------------------------------------------ #

    def take_snapshot(self, organization_id, resource_type: str,
                      snapshot_type: str = 'daily',
                      period_label: Optional[str] = None,
                      source: str = 'auto') -> Optional[ResourceUsageSnapshot]:
        """
        Write a point-in-time snapshot for a given org/resource.
        Skips if a snapshot for this period already exists.
        """
        resource = OrganizationResource.objects.by_organization_and_type(
            organization_id, resource_type
        )
        if not resource:
            return None

        if period_label is None:
            if snapshot_type == 'hourly':
                period_label = timezone.now().strftime('%Y-%m-%d %H:00')
            elif snapshot_type == 'weekly':
                period_label = timezone.now().strftime('%Y-W%W')
            elif snapshot_type == 'monthly':
                period_label = timezone.now().strftime('%Y-%m')
            else:
                period_label = timezone.now().strftime('%Y-%m-%d')

        if ResourceUsageSnapshot.objects.period_exists(
            organization_id, resource_type, snapshot_type, period_label
        ):
            return None  # Already captured

        snapshot = ResourceUsageSnapshot.objects.create(
            organization_id=organization_id,
            resource_type=resource_type,
            snapshot_value=resource.current_value,
            limit_value=resource.limit_value,
            percentage_used=resource.percentage_used,
            snapshot_type=snapshot_type,
            period_label=period_label,
            peak_value=resource.current_value,
            source=source,
        )
        return snapshot

    def take_all_snapshots(self, organization_id=None,
                           snapshot_type: str = 'daily') -> Dict[str, int]:
        """
        Snapshot all active resource records (or one org's resources).
        Returns count of snapshots written.
        """
        qs = OrganizationResource.objects.filter(is_deleted=False)
        if organization_id:
            qs = qs.filter(organization_id=organization_id)

        created = 0
        for resource in qs:
            result = self.take_snapshot(
                resource.organization_id,
                resource.resource_type,
                snapshot_type=snapshot_type,
                source='auto',
            )
            if result:
                created += 1
        return {'snapshots_created': created}