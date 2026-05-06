"""
Quota Enforcer Service - Enforces resource limits for tenants.

Prevents tenants from exceeding their allocated resources:
- User limits
- Storage limits  
- API call limits
- KPI limits
- Department limits
- Concurrent session limits
"""

import logging
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.tenant.exceptions import TenantQuotaExceededError
from apps.tenant.constants import ResourceType, DEFAULT_TENANT_LIMITS

logger = logging.getLogger(__name__)


class QuotaEnforcer:
    """
    Enforces resource quotas for tenants.

    What it does:
        - Checks if tenant can perform an action before allowing it
        - Tracks current usage against limits
        - Raises exceptions when quotas are exceeded
        - Logs quota violations for monitoring

    Usage:
        enforcer = QuotaEnforcer(tenant_id)

        # Before creating a user
        if enforcer.can_create_user():
            user = User.objects.create(...)
            enforcer.record_user_created()

        # Before API call
        if enforcer.can_make_api_call():
            process_request()
            enforcer.record_api_call()
    """

    def __init__(self, tenant_id):
        """
        Initialize quota enforcer with tenant.

        Args:
            tenant_id: UUID of tenant to enforce quotas for
        """
        self.tenant_id = tenant_id
        self.tenant = None
        self.resources = {}
        self.logger = logging.getLogger(f"{__name__}.{tenant_id}")
        self._load_tenant()
        self._load_resources()

    def _load_tenant(self):
        """Load tenant from database."""
        from apps.tenant.models import Client

        try:
            self.tenant = Client.objects.get(id=self.tenant_id)
        except Client.DoesNotExist:
            self.logger.error(f"Tenant not found: {self.tenant_id}")
            raise

    def _load_resources(self):
        """Load all resources for tenant into cache."""
        from apps.tenant.models import TenantResource

        try:
            resources = TenantResource.objects.filter(
                tenant_id=self.tenant_id,
                is_deleted=False
            )
            self.resources = {r.resource_type: r for r in resources}
        except Exception as e:
            self.logger.warning(f"Failed to load resources: {str(e)}")

    def _get_resource(self, resource_type):
        """
        Get resource object for a resource type.

        Args:
            resource_type: ResourceType enum value

        Returns:
            TenantResource object or None
        """
        if resource_type in self.resources:
            return self.resources[resource_type]

        # Try to create if doesn't exist
        try:
            from apps.tenant.models import TenantResource

            resource, created = TenantResource.objects.get_or_create(
                tenant_id=self.tenant_id,
                resource_type=resource_type,
                defaults={'limit_value': DEFAULT_TENANT_LIMITS.get(
                    resource_type, 100)}
            )
            self.resources[resource_type] = resource
            return resource
        except Exception as e:
            self.logger.error(
                f"Failed to get resource {resource_type}: {str(e)}")
            return None

    def _get_current_value(self, resource_type):
        """Get current usage for a resource type."""
        resource = self._get_resource(resource_type)
        return resource.current_value if resource else 0

    def _get_limit(self, resource_type):
        """Get limit for a resource type."""
        resource = self._get_resource(resource_type)
        return resource.limit_value if resource else DEFAULT_TENANT_LIMITS.get(resource_type, 100)

    def _increment(self, resource_type, amount=1):
        """Increment usage for a resource type."""
        resource = self._get_resource(resource_type)
        if resource:
            if resource.current_value + amount <= resource.limit_value:
                resource.current_value += amount
                resource.save(update_fields=['current_value', 'updated_at'])
                self.resources[resource_type] = resource
                return True
        return False

    def _decrement(self, resource_type, amount=1):
        """Decrement usage for a resource type."""
        resource = self._get_resource(resource_type)
        if resource:
            resource.current_value = max(0, resource.current_value - amount)
            resource.save(update_fields=['current_value', 'updated_at'])
            self.resources[resource_type] = resource

    # ========================================================================
    # USER QUOTA METHODS
    # ========================================================================

    def can_create_user(self):
        """Check if tenant can create a new user."""
        current = self._get_current_value(ResourceType.USERS)
        limit = self._get_limit(ResourceType.USERS)
        return current < limit

    def record_user_created(self):
        """Record that a user was created."""
        if not self._increment(ResourceType.USERS):
            raise TenantQuotaExceededError(
                f"User quota exceeded for tenant {self.tenant_id}"
            )

    def record_user_deleted(self):
        """Record that a user was deleted."""
        self._decrement(ResourceType.USERS)

    def get_user_usage(self):
        """Get current user usage statistics."""
        return {
            'current': self._get_current_value(ResourceType.USERS),
            'limit': self._get_limit(ResourceType.USERS),
            'remaining': self._get_limit(ResourceType.USERS) - self._get_current_value(ResourceType.USERS),
            'percentage': (self._get_current_value(ResourceType.USERS) / self._get_limit(ResourceType.USERS)) * 100 if self._get_limit(ResourceType.USERS) > 0 else 0,
        }

    # ========================================================================
    # STORAGE QUOTA METHODS
    # ========================================================================

    def can_add_storage(self, mb_to_add):
        """Check if tenant can add more storage."""
        current = self._get_current_value(ResourceType.STORAGE_MB)
        limit = self._get_limit(ResourceType.STORAGE_MB)
        return (current + mb_to_add) <= limit

    def record_storage_added(self, mb_added):
        """Record that storage was added."""
        if not self._increment(ResourceType.STORAGE_MB, mb_added):
            raise TenantQuotaExceededError(
                f"Storage quota exceeded for tenant {self.tenant_id}"
            )

    def record_storage_removed(self, mb_removed):
        """Record that storage was removed."""
        self._decrement(ResourceType.STORAGE_MB, mb_removed)

    def get_storage_usage(self):
        """Get current storage usage statistics."""
        return {
            'current_mb': self._get_current_value(ResourceType.STORAGE_MB),
            'limit_mb': self._get_limit(ResourceType.STORAGE_MB),
            'remaining_mb': self._get_limit(ResourceType.STORAGE_MB) - self._get_current_value(ResourceType.STORAGE_MB),
            'percentage': (self._get_current_value(ResourceType.STORAGE_MB) / self._get_limit(ResourceType.STORAGE_MB)) * 100 if self._get_limit(ResourceType.STORAGE_MB) > 0 else 0,
        }

    # ========================================================================
    # API CALL QUOTA METHODS
    # ========================================================================

    def can_make_api_call(self):
        """Check if tenant can make API call (checks daily limit)."""
        # Check if daily reset is needed
        resource = self._get_resource(ResourceType.API_CALLS_PER_DAY)
        if resource and resource.last_reset_at:
            today = timezone.now().date()
            last_reset = resource.last_reset_at.date()
            if last_reset < today:
                # Reset daily counter
                resource.current_value = 0
                resource.last_reset_at = timezone.now()
                resource.save()
                self.resources[ResourceType.API_CALLS_PER_DAY] = resource

        current = self._get_current_value(ResourceType.API_CALLS_PER_DAY)
        limit = self._get_limit(ResourceType.API_CALLS_PER_DAY)
        return current < limit

    def record_api_call(self):
        """Record that an API call was made."""
        if not self._increment(ResourceType.API_CALLS_PER_DAY):
            raise TenantQuotaExceededError(
                f"Daily API call quota exceeded for tenant {self.tenant_id}"
            )

    def get_api_usage(self):
        """Get current API call usage statistics."""
        return {
            'current_today': self._get_current_value(ResourceType.API_CALLS_PER_DAY),
            'limit_per_day': self._get_limit(ResourceType.API_CALLS_PER_DAY),
            'remaining_today': self._get_limit(ResourceType.API_CALLS_PER_DAY) - self._get_current_value(ResourceType.API_CALLS_PER_DAY),
            'percentage': (self._get_current_value(ResourceType.API_CALLS_PER_DAY) / self._get_limit(ResourceType.API_CALLS_PER_DAY)) * 100 if self._get_limit(ResourceType.API_CALLS_PER_DAY) > 0 else 0,
        }

    # ========================================================================
    # KPI QUOTA METHODS
    # ========================================================================

    def can_create_kpi(self):
        """Check if tenant can create a new KPI."""
        current = self._get_current_value(ResourceType.KPIS)
        limit = self._get_limit(ResourceType.KPIS)
        return current < limit

    def record_kpi_created(self):
        """Record that a KPI was created."""
        if not self._increment(ResourceType.KPIS):
            raise TenantQuotaExceededError(
                f"KPI quota exceeded for tenant {self.tenant_id}"
            )

    def record_kpi_deleted(self):
        """Record that a KPI was deleted."""
        self._decrement(ResourceType.KPIS)

    # ========================================================================
    # DEPARTMENT QUOTA METHODS
    # ========================================================================

    def can_create_department(self):
        """Check if tenant can create a new department."""
        current = self._get_current_value(ResourceType.DEPARTMENTS)
        limit = self._get_limit(ResourceType.DEPARTMENTS)
        return current < limit

    def record_department_created(self):
        """Record that a department was created."""
        if not self._increment(ResourceType.DEPARTMENTS):
            raise TenantQuotaExceededError(
                f"Department quota exceeded for tenant {self.tenant_id}"
            )

    def record_department_deleted(self):
        """Record that a department was deleted."""
        self._decrement(ResourceType.DEPARTMENTS)

    # ========================================================================
    # SESSION QUOTA METHODS
    # ========================================================================

    def can_create_session(self):
        """Check if tenant can create a new concurrent session."""
        current = self._get_current_value(ResourceType.CONCURRENT_SESSIONS)
        limit = self._get_limit(ResourceType.CONCURRENT_SESSIONS)
        return current < limit

    def record_session_created(self):
        """Record that a concurrent session was created."""
        if not self._increment(ResourceType.CONCURRENT_SESSIONS):
            raise TenantQuotaExceededError(
                f"Concurrent session quota exceeded for tenant {self.tenant_id}"
            )

    def record_session_ended(self):
        """Record that a concurrent session ended."""
        self._decrement(ResourceType.CONCURRENT_SESSIONS)

    # ========================================================================
    # GENERAL METHODS
    # ========================================================================

    def check_all_quotas(self):
        """
        Check all quotas and return status.

        Returns:
            dict: Status of all quotas
        """
        return {
            'tenant_id': str(self.tenant_id),
            'tenant_name': self.tenant.name if self.tenant else 'Unknown',
            'users': self.get_user_usage(),
            'storage': self.get_storage_usage(),
            'api_calls': self.get_api_usage(),
            'kpis': {
                'current': self._get_current_value(ResourceType.KPIS),
                'limit': self._get_limit(ResourceType.KPIS),
            },
            'departments': {
                'current': self._get_current_value(ResourceType.DEPARTMENTS),
                'limit': self._get_limit(ResourceType.DEPARTMENTS),
            },
            'sessions': {
                'current': self._get_current_value(ResourceType.CONCURRENT_SESSIONS),
                'limit': self._get_limit(ResourceType.CONCURRENT_SESSIONS),
            },
        }

    def is_any_quota_exceeded(self):
        """Check if any quota is currently exceeded."""
        checks = [
            self._get_current_value(
                ResourceType.USERS) >= self._get_limit(ResourceType.USERS),
            self._get_current_value(ResourceType.STORAGE_MB) >= self._get_limit(
                ResourceType.STORAGE_MB),
            self._get_current_value(
                ResourceType.KPIS) >= self._get_limit(ResourceType.KPIS),
            self._get_current_value(ResourceType.DEPARTMENTS) >= self._get_limit(
                ResourceType.DEPARTMENTS),
            self._get_current_value(ResourceType.CONCURRENT_SESSIONS) >= self._get_limit(
                ResourceType.CONCURRENT_SESSIONS),
        ]
        return any(checks)

    def get_warnings(self):
        """
        Get warnings for quotas nearing limits.

        Returns:
            list: Warning messages
        """
        warnings = []
        threshold = 0.8  # 80% threshold

        for resource_type in [
            ResourceType.USERS,
            ResourceType.STORAGE_MB,
            ResourceType.API_CALLS_PER_DAY,
            ResourceType.KPIS,
            ResourceType.DEPARTMENTS,
            ResourceType.CONCURRENT_SESSIONS,
        ]:
            current = self._get_current_value(resource_type)
            limit = self._get_limit(resource_type)

            if limit > 0 and current / limit >= threshold:
                percentage = (current / limit) * 100
                warnings.append(
                    f"{resource_type.replace('_', ' ').title()} usage at {percentage:.1f}% ({current}/{limit})"
                )

        return warnings
