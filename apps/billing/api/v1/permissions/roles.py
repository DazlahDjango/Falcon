# apps/billing/api/v1/permissions/roles.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class HasRole(BasePermission):
    message = _('This action requires a specific role.')

    def __init__(self, role):
        self.required_role = role

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE: Allow superuser flag or super_admin role
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role == self.required_role

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class HasAnyRole(BasePermission):
    message = _("This action requires one of the specified roles")

    def __init__(self, roles):
        self.required_roles = roles if isinstance(roles, list) else [roles]

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE: Allow superuser flag or super_admin role
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role in self.required_roles

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsSuperAdmin(HasRole):
    message = _('Super admin privileges required')

    def __init__(self):
        super().__init__(UserRoles.SUPER_ADMIN)

    # ✅ Override to also check is_superuser
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN


class IsClientAdmin(HasRole):
    message = _('Client admin privileges required')

    def __init__(self):
        super().__init__(UserRoles.CLIENT_ADMIN)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role == UserRoles.CLIENT_ADMIN


class IsExecutive(HasRole):
    message = _("Executive privileges required")

    def __init__(self):
        super().__init__(UserRoles.EXECUTIVE)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        return request.user.role == UserRoles.EXECUTIVE


class IsSupervisor(HasRole):
    message = _("Supervisor privileges required")

    def __init__(self):
        super().__init__(UserRoles.SUPERVISOR)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser:
            return True
        return request.user.role == UserRoles.SUPERVISOR


class IsStaff(HasRole):
    message = _("Staff privileges required")

    def __init__(self):
        super().__init__(UserRoles.STAFF)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser:
            return True
        return request.user.role == UserRoles.STAFF


class IsDashboardChampion(HasRole):
    message = _("Dashboard champion privileges required")

    def __init__(self):
        super().__init__(UserRoles.DASHBOARD_CHAMPION)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True
        return request.user.role == UserRoles.DASHBOARD_CHAMPION


class IsAdminOrExecutive(HasAnyRole):
    message = _("Admin or Executive privileges required")

    def __init__(self):
        super().__init__([UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE])


class IsAdminOrSupervisor(HasAnyRole):
    message = _("Admin or supervisor privilege required")

    def __init__(self):
        super().__init__([UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.SUPERVISOR])
