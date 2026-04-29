"""
Isolation Enforcer Service - Ensures no cross-tenant data access.

This is the SECURITY GUARD of the multi-tenant system.
It prevents users from accessing data from other tenants.
"""

import logging
from apps.tenant.exceptions import TenantIsolationError

logger = logging.getLogger(__name__)


class IsolationEnforcer:
    """
    Enforces tenant isolation at application level.

    What it does:
        - Validates current user belongs to requested tenant
        - Ensures queries are scoped to current tenant
        - Blocks cross-tenant access attempts
        - Logs isolation violations for audit

    Usage:
        enforcer = IsolationEnforcer(request)
        enforcer.validate_tenant_access(tenant_id)
        enforcer.enforce_query_isolation(queryset, tenant_id)
    """

    def __init__(self, request=None):
        """
        Initialize with request context.

        Args:
            request: Django request object (optional)
        """
        self.request = request
        self.logger = logging.getLogger(__name__)

    def validate_tenant_access(self, requested_tenant_id, user=None):
        """
        Validate that user has access to requested tenant.

        Args:
            requested_tenant_id: Tenant ID being accessed
            user: User object (uses request.user if not provided)

        Raises:
            TenantIsolationError: If user doesn't have access
        """
        if not requested_tenant_id:
            raise TenantIsolationError("No tenant specified")

        # Get user from request or parameter
        if user is None and self.request:
            user = self.request.user

        if not user or not user.is_authenticated:
            # Anonymous users - let tenant resolution handle
            return True

        # Check if user belongs to this tenant
        user_tenant_id = self._get_user_tenant_id(user)

        if user_tenant_id and str(user_tenant_id) != str(requested_tenant_id):
            self.logger.warning(
                f"Isolation violation: User {user.id} tried to access "
                f"tenant {requested_tenant_id} but belongs to {user_tenant_id}"
            )
            raise TenantIsolationError(
                f"Access denied: User does not belong to tenant {requested_tenant_id}"
            )

        return True

    def _get_user_tenant_id(self, user):
        """Extract tenant ID from user object."""
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        if hasattr(user, 'tenant') and user.tenant:
            return user.tenant.id
        return None

    def enforce_query_isolation(self, queryset, tenant_id):
        """
        Ensure queryset is filtered by tenant.

        Args:
            queryset: Django queryset to validate
            tenant_id: Expected tenant ID

        Returns:
            QuerySet: Filtered queryset
        """
        # Check if queryset already has tenant filter
        current_tenant = self._extract_tenant_from_queryset(queryset)

        if current_tenant and str(current_tenant) != str(tenant_id):
            raise TenantIsolationError(
                f"Query isolation violation: Queryset filtered for tenant {current_tenant}, "
                f"but access requested for tenant {tenant_id}"
            )

        # Add tenant filter if not present
        if not current_tenant:
            return queryset.filter(tenant_id=tenant_id)

        return queryset

    def _extract_tenant_from_queryset(self, queryset):
        """Extract tenant filter from queryset if present."""
        try:
            query = str(queryset.query)
            if '"tenant_id"' in query or 'tenant_id' in query:
                # Simple extraction - in production use proper SQL parsing
                import re
                match = re.search(r'tenant_id\s*=\s*([a-f0-9\-]+)', query)
                if match:
                    return match.group(1)
        except Exception:
            pass
        return None

    def validate_cross_tenant_operation(self, source_tenant_id, target_tenant_id):
        """
        Validate cross-tenant operation.

        Args:
            source_tenant_id: Tenant initiating operation
            target_tenant_id: Target tenant being accessed

        Raises:
            TenantIsolationError: If cross-tenant access not allowed
        """
        if source_tenant_id and target_tenant_id:
            if str(source_tenant_id) != str(target_tenant_id):
                self.logger.error(
                    f"Cross-tenant operation blocked: {source_tenant_id} -> {target_tenant_id}"
                )
                raise TenantIsolationError(
                    f"Cross-tenant operations not allowed: {source_tenant_id} cannot access {target_tenant_id}"
                )
        return True

    def get_tenant_scope_filter(self, tenant_id):
        """
        Get a filter dictionary for tenant scoping.

        Args:
            tenant_id: Tenant ID to filter by

        Returns:
            dict: Filter dictionary {'tenant_id': tenant_id}
        """
        return {'tenant_id': tenant_id}

    def assert_tenant_context(self, obj, expected_tenant_id):
        """
        Assert that an object belongs to the expected tenant.

        Args:
            obj: Any model instance
            expected_tenant_id: Expected tenant ID

        Raises:
            TenantIsolationError: If object doesn't belong to expected tenant
        """
        obj_tenant = self._get_object_tenant(obj)

        if obj_tenant and str(obj_tenant) != str(expected_tenant_id):
            raise TenantIsolationError(
                f"Object {obj._meta.model_name}.{obj.id} belongs to tenant {obj_tenant}, "
                f"but operation requested for tenant {expected_tenant_id}"
            )

    def _get_object_tenant(self, obj):
        """Extract tenant ID from any model object."""
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return obj.tenant_id
        if hasattr(obj, 'tenant') and obj.tenant:
            return obj.tenant.id
        return None

    def is_safe_cross_tenant_reference(self, from_obj, to_obj):
        """
        Check if cross-tenant reference is allowed.

        Args:
            from_obj: Source object
            to_obj: Target object being referenced

        Returns:
            bool: True if reference is allowed
        """
        from_tenant = self._get_object_tenant(from_obj)
        to_tenant = self._get_object_tenant(to_obj)

        # Same tenant or not set = allowed
        if not from_tenant or not to_tenant:
            return True

        return str(from_tenant) == str(to_tenant)
