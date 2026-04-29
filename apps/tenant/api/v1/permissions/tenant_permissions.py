# apps/tenant/api/v1/permissions/tenant_permissions.py
"""
Custom permission classes for Tenant API.
Controls who can access which tenant endpoints.
"""

from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Allow access only to super admins.

    Super admins have full access to all tenants and all operations.
    """

    def has_permission(self, request, view):
        """Check if user is authenticated and is super admin."""
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        """Super admins can access any object."""
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser


class IsTenantAdmin(permissions.BasePermission):
    """
    Allow access only to tenant admins.

    Tenant admins have access to their own tenant's data.
    Super admins also have access.
    """

    def has_permission(self, request, view):
        """Check if user is authenticated and has admin role."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins have access
        if request.user.is_superuser:
            return True

        # Check if user has admin role
        user_role = getattr(request.user, 'role', '')
        return user_role in ['admin', 'super_admin', 'tenant_admin']

    def has_object_permission(self, request, view, obj):
        """Check if user owns this object."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins can access anything
        if request.user.is_superuser:
            return True

        # Get user's tenant ID
        user_tenant_id = getattr(request.user, 'tenant_id', None)

        # Get object's tenant ID (handles different object types)
        obj_tenant_id = None

        # If object is a tenant itself (Client model)
        if hasattr(obj, 'id') and hasattr(obj, 'name'):
            obj_tenant_id = obj.id

        # If object has tenant_id attribute
        if hasattr(obj, 'tenant_id'):
            obj_tenant_id = obj.tenant_id

        # If object has tenant attribute
        if hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id

        return user_tenant_id == obj_tenant_id


class IsTenantUser(permissions.BasePermission):
    """
    Allow access to any authenticated user belonging to the tenant.

    Regular users can view their own tenant's data but cannot modify settings.
    """

    def has_permission(self, request, view):
        """Check if user is authenticated."""
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Check if user belongs to same tenant as object."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins have access
        if request.user.is_superuser:
            return True

        # Safe methods (GET, HEAD, OPTIONS) are allowed for read-only
        if request.method in permissions.SAFE_METHODS:
            user_tenant_id = getattr(request.user, 'tenant_id', None)
            obj_tenant_id = None

            if hasattr(obj, 'tenant_id'):
                obj_tenant_id = obj.tenant_id
            elif hasattr(obj, 'tenant') and obj.tenant:
                obj_tenant_id = obj.tenant.id
            elif hasattr(obj, 'id') and hasattr(obj, 'name'):
                obj_tenant_id = obj.id

            return user_tenant_id == obj_tenant_id

        # Write methods require additional checks
        return False


class CanManageTenant(permissions.BasePermission):
    """
    Allow users to manage tenants (create, update, delete).

    - Super admins: full CRUD access
    - Tenant admins: can update their own tenant, cannot delete
    - Regular users: no management access
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Create tenant - only super admins
        if view.action == 'create':
            return request.user.is_superuser

        # Update/Delete - depends on role
        if view.action in ['update', 'partial_update', 'destroy']:
            user_role = getattr(request.user, 'role', '')
            return request.user.is_superuser or user_role in ['admin', 'super_admin', 'tenant_admin']

        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins can manage any tenant
        if request.user.is_superuser:
            return True

        # Delete - only super admins
        if view.action == 'destroy':
            return False

        # Update - tenant admins can update their own tenant
        if view.action in ['update', 'partial_update']:
            user_tenant_id = getattr(request.user, 'tenant_id', None)
            return user_tenant_id == obj.id

        return True


class CanViewTenant(permissions.BasePermission):
    """
    Allow users to view tenant information.

    - Super admins: can view all tenants
    - Tenant admins: can view their own tenant
    - Regular users: can view their own tenant
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins can view any tenant
        if request.user.is_superuser:
            return True

        # Users can view their own tenant
        user_tenant_id = getattr(request.user, 'tenant_id', None)
        return user_tenant_id == obj.id


class CanManageDomain(permissions.BasePermission):
    """
    Allow users to manage domains.

    - Super admins: can manage any domain
    - Tenant admins: can manage domains for their tenant
    - Regular users: cannot manage domains
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, 'role', '')
        return request.user.is_superuser or user_role in ['admin', 'super_admin', 'tenant_admin']

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins can manage any domain
        if request.user.is_superuser:
            return True

        # Tenant admins can manage domains for their tenant
        user_tenant_id = getattr(request.user, 'tenant_id', None)
        obj_tenant_id = getattr(obj, 'tenant_id', None)

        if hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id

        return user_tenant_id == obj_tenant_id


class CanManageBackup(permissions.BasePermission):
    """
    Allow users to manage backups.

    - Super admins: can manage any backup
    - Tenant admins: can manage backups for their tenant
    - Regular users: cannot manage backups
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, 'role', '')
        return request.user.is_superuser or user_role in ['admin', 'super_admin', 'tenant_admin']

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        user_tenant_id = getattr(request.user, 'tenant_id', None)
        obj_tenant_id = getattr(obj, 'tenant_id', None)

        if hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id

        return user_tenant_id == obj_tenant_id


class CanViewResource(permissions.BasePermission):
    """
    Allow users to view resource usage.

    - Super admins: can view all resources
    - Tenant admins: can view resources for their tenant
    - Regular users: can view resources for their tenant
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        user_tenant_id = getattr(request.user, 'tenant_id', None)
        obj_tenant_id = getattr(obj, 'tenant_id', None)

        if hasattr(obj, 'tenant') and obj.tenant:
            obj_tenant_id = obj.tenant.id

        return user_tenant_id == obj_tenant_id


class IsAuthenticatedOrReadOnlyForTenant(permissions.BasePermission):
    """
    Allow read-only access for authenticated users.
    Write operations require tenant admin role.
    """

    def has_permission(self, request, view):
        # Read-only for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write operations require admin role
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, 'role', '')
        return request.user.is_superuser or user_role in ['admin', 'super_admin', 'tenant_admin']

    def has_object_permission(self, request, view, obj):
        # Read-only allowed if user belongs to same tenant
        if request.method in permissions.SAFE_METHODS:
            if not request.user or not request.user.is_authenticated:
                return False

            if request.user.is_superuser:
                return True

            user_tenant_id = getattr(request.user, 'tenant_id', None)
            obj_tenant_id = None

            if hasattr(obj, 'tenant_id'):
                obj_tenant_id = obj.tenant_id
            elif hasattr(obj, 'tenant') and obj.tenant:
                obj_tenant_id = obj.tenant.id
            elif hasattr(obj, 'id') and hasattr(obj, 'name'):
                obj_tenant_id = obj.id

            return user_tenant_id == obj_tenant_id

        # Write operations require admin role
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, 'role', '')
        return request.user.is_superuser or user_role in ['admin', 'super_admin', 'tenant_admin']
