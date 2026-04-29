# apps/tenant/api/v1/permissions/tenant_access.py
"""
Tenant access control permissions.
Handles tenant isolation and cross-tenant access prevention.
"""

from rest_framework import permissions


class HasTenantAccess(permissions.BasePermission):
    """
    Check if user has access to the tenant from request headers.

    This permission reads the X-Tenant-ID header and verifies that
    the authenticated user belongs to that tenant.
    """

    def has_permission(self, request, view):
        """Check tenant access at the request level."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins can access any tenant
        if request.user.is_superuser:
            return True

        # Get tenant_id from request headers
        requested_tenant_id = request.headers.get('X-Tenant-ID')

        # If no tenant header is provided, assume access is granted
        # (tenant resolution middleware will handle this)
        if not requested_tenant_id:
            return True

        # Check if user belongs to this tenant
        user_tenant_id = getattr(request.user, 'tenant_id', None)

        return str(user_tenant_id) == str(requested_tenant_id)

    def has_object_permission(self, request, view, obj):
        """Check tenant access at the object level."""
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        user_tenant_id = getattr(request.user, 'tenant_id', None)

        # Get object's tenant ID
        obj_tenant_id = None

        if hasattr(obj, 'tenant_id'):
            obj_tenant_id = obj.tenant_id
        elif hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id
        elif hasattr(obj, 'id') and hasattr(obj, 'name'):
            # Object is a tenant itself
            obj_tenant_id = obj.id

        return str(user_tenant_id) == str(obj_tenant_id)


class IsSameTenant(permissions.BasePermission):
    """
    Ensure object belongs to the same tenant as the user.

    This is a stricter version of HasTenantAccess that always requires
    the object's tenant to match the user's tenant.
    """

    def has_permission(self, request, view):
        """Basic permission at request level."""
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Check if object belongs to user's tenant."""
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        user_tenant_id = getattr(request.user, 'tenant_id', None)

        # Get object's tenant ID
        obj_tenant_id = None

        if hasattr(obj, 'tenant_id'):
            obj_tenant_id = obj.tenant_id
        elif hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id
        elif hasattr(obj, 'id') and hasattr(obj, 'name'):
            obj_tenant_id = obj.id

        # If no tenant ID found, deny access (safety)
        if not obj_tenant_id:
            return False

        return str(user_tenant_id) == str(obj_tenant_id)


class TenantHeaderRequired(permissions.BasePermission):
    """
    Require X-Tenant-ID header for all requests.

    Use this for endpoints that must always have a tenant context.
    """

    def has_permission(self, request, view):
        """Check if tenant header is present."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins are exempt
        if request.user.is_superuser:
            return True

        requested_tenant_id = request.headers.get('X-Tenant-ID')

        if not requested_tenant_id:
            return False

        return True


class AllowTenantCreation(permissions.BasePermission):
    """
    Allow tenant creation without tenant header.

    This is a special permission for the tenant creation endpoint
    since new tenants don't have a tenant ID yet.
    """

    def has_permission(self, request, view):
        """Allow tenant creation for authenticated users."""
        # Tenant creation endpoint
        if view.action == 'create':
            return request.user and request.user.is_authenticated

        # Other actions require tenant header
        requested_tenant_id = request.headers.get('X-Tenant-ID')
        return requested_tenant_id is not None


class IsTenantOwner(permissions.BasePermission):
    """
    Check if user is the owner of the tenant.

    Tenant owner has special privileges like deleting the tenant.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        # Check if user is the tenant owner
        user_tenant_id = getattr(request.user, 'tenant_id', None)
        obj_tenant_id = obj.id if hasattr(obj, 'id') else None

        # Also check if user is marked as tenant owner
        is_owner = getattr(request.user, 'is_tenant_owner', False)

        return (str(user_tenant_id) == str(obj_tenant_id)) and is_owner
