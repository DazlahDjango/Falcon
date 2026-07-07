from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class IsSuperAdmin(BasePermission):
    message = _('Super admin privileges required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == UserRoles.SUPER_ADMIN

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOrganizationAdmin(BasePermission):
    message = _('Organization admin privileges required')

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
        return True

    def _get_organization_id(self, user):
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
        if hasattr(obj, 'id') and hasattr(obj, '_meta'):
            if hasattr(obj, 'organization_id'):
                return obj.organization_id
        return None


class IsOrganizationUser(BasePermission):
    message = _('Organization user privileges required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role in [
            UserRoles.CLIENT_ADMIN,
            UserRoles.DASHBOARD_CHAMPION,
            UserRoles.EXECUTIVE,
            UserRoles.SUPERVISOR,
            UserRoles.STAFF,
            UserRoles.READ_ONLY
        ]

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return self._check_organization_access(request, obj)

    def _check_organization_access(self, request, obj):
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return True

    def _get_organization_id(self, user):
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


class CanManageOrganization(BasePermission):
    message = _('Organization management privileges required')

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
        return True

    def _get_organization_id(self, user):
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


class CanViewOrganization(BasePermission):
    message = _('Organization viewing privileges required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role in [
            UserRoles.CLIENT_ADMIN,
            UserRoles.DASHBOARD_CHAMPION,
            UserRoles.EXECUTIVE,
            UserRoles.SUPERVISOR,
            UserRoles.STAFF,
            UserRoles.READ_ONLY
        ]

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role == UserRoles.READ_ONLY:
            return self._check_organization_access(request, obj)
        return self._check_organization_access(request, obj)

    def _check_organization_access(self, request, obj):
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return True

    def _get_organization_id(self, user):
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


class CanManageDomain(BasePermission):
    message = _('Domain management privileges required')

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
        return True

    def _get_organization_id(self, user):
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


class CanManageSchema(BasePermission):
    message = _('Schema management privileges required')

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
        return True

    def _get_organization_id(self, user):
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


class CanViewResource(BasePermission):
    message = _('Resource viewing privileges required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role in [
            UserRoles.CLIENT_ADMIN,
            UserRoles.DASHBOARD_CHAMPION,
            UserRoles.EXECUTIVE,
            UserRoles.SUPERVISOR,
        ]

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return self._check_organization_access(request, obj)

    def _check_organization_access(self, request, obj):
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return True

    def _get_organization_id(self, user):
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


class IsAuthenticatedOrReadOnlyForOrganization(BasePermission):
    message = _('Authentication required for write operations')

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        if request.user.role == UserRoles.READ_ONLY:
            return False
        return self._check_organization_access(request, obj)

    def _check_organization_access(self, request, obj):
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return True

    def _get_organization_id(self, user):
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


class IsOrganizationMember(BasePermission):
    message = _('Organization membership required')

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return bool(self._get_organization_id(request.user))

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        user_org_id = self._get_organization_id(request.user)
        obj_org_id = self._get_object_organization_id(obj)
        if user_org_id and obj_org_id:
            return str(user_org_id) == str(obj_org_id)
        return bool(user_org_id)

    def _get_organization_id(self, user):
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


class IsOrganizationAdminOrSuperAdmin(BasePermission):
    message = _('Organization admin or super admin privileges required')

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
        return True

    def _get_organization_id(self, user):
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