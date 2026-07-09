from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class HasOrganizationAccess(BasePermission):
    message = _('Organization access required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        org_id = self._get_organization_id(request.user)
        return bool(org_id)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return False

    def _get_organization_id(self, user):
        # Check both tenant_id and organization_id for compatibility
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _get_object_organization_id(self, obj):
        if hasattr(obj, 'organization_id'):
            return obj.organization_id
        if hasattr(obj, 'organization') and obj.organization:
            return obj.organization.id
        return None


class IsSameOrganization(BasePermission):
    message = _('User and object must belong to the same organization')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        if user_org_id and not obj_org_id:
            return True
        return False

    def _get_organization_id(self, user):
        # Check both tenant_id and organization_id for compatibility
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _get_object_organization_id(self, obj):
        if hasattr(obj, 'organization_id'):
            return obj.organization_id
        if hasattr(obj, 'organization') and obj.organization:
            return obj.organization.id
        return None


class OrganizationHeaderRequired(BasePermission):
    message = _('X-Tenant-ID header required')

    def has_permission(self, request, view):
        if request.user and request.user.is_superuser:
            return True
        org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
        if not org_id:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_superuser:
            return True
        header_org_id = request.headers.get('X-Tenant-ID') or request.headers.get('X-Organization-ID')
        obj_org_id = self._get_object_organization_id(obj)
        if header_org_id and obj_org_id:
            return str(header_org_id) == str(obj_org_id)
        return bool(header_org_id)

    def _get_object_organization_id(self, obj):
        if hasattr(obj, 'organization_id'):
            return obj.organization_id
        if hasattr(obj, 'organization') and obj.organization:
            return obj.organization.id
        return None


class AllowOrganizationCreation(BasePermission):
    message = _('Organization creation allowed for super admins only')

    def has_permission(self, request, view):
        if view.action == 'create':
            if not request.user or not request.user.is_authenticated:
                return False
            return request.user.role == UserRoles.SUPER_ADMIN
        return True

    def has_object_permission(self, request, view, obj):
        return True


class IsOrganizationOwner(BasePermission):
    message = _('Organization owner privileges required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role == UserRoles.CLIENT_ADMIN

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role != UserRoles.CLIENT_ADMIN:
            return False
        return self._check_organization_access(request, obj)

    def _check_organization_access(self, request, obj):
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return False

    def _get_organization_id(self, user):
        # Check both tenant_id and organization_id for compatibility
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        return None

    def _get_object_organization_id(self, obj):
        if hasattr(obj, 'organization_id'):
            return obj.organization_id
        if hasattr(obj, 'organization') and obj.organization:
            return obj.organization.id
        return None