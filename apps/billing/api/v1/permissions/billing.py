# apps/billing/api/v1/permissions/billing.py
from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class CanViewBilling(BasePermission):
    """Permission to view billing information."""
    message = _("You do not have permission to view billing information")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Super admin and client admin can view all billing
        if request.user.role in [UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True

        # Dashboard champion can view billing
        if request.user.role == UserRoles.DASHBOARD_CHAMPION:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        # Check tenant isolation
        if hasattr(obj, 'tenant_id'):
            if str(obj.tenant_id) != str(request.user.tenant_id):
                return False

        return self.has_permission(request, view)


class CanManageSubscriptions(BasePermission):
    """Permission to manage subscriptions (create, cancel, upgrade, downgrade)."""
    message = _("You do not have permission to manage subscriptions")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Super admin and client admin can manage subscriptions
        if request.user.role in [UserRoles.CLIENT_ADMIN]:
            return True

        # Dashboard champion can manage subscriptions
        if request.user.role == UserRoles.DASHBOARD_CHAMPION:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        # Check tenant isolation
        if hasattr(obj, 'tenant_id'):
            if str(obj.tenant_id) != str(request.user.tenant_id):
                return False

        return self.has_permission(request, view)


class CanViewInvoices(BasePermission):
    """Permission to view invoices."""
    message = _("You do not have permission to view invoices")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # All authenticated users in the tenant can view their invoices
        return True

    def has_object_permission(self, request, view, obj):
        # User can only see invoices from their tenant
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)

        # For list views, check tenant from request
        tenant_id = getattr(request, 'tenant_id', None)
        if tenant_id and hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(tenant_id)

        return True


class CanMakePayment(BasePermission):
    """Permission to make payments."""
    message = _("You do not have permission to make payments")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Any authenticated user can make payments
        return True

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanViewTransactions(BasePermission):
    """Permission to view transaction history."""
    message = _("You do not have permission to view transactions")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Super admin, client admin, executive can view all transactions
        if request.user.role in [UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True

        # Dashboard champion can view transactions
        if request.user.role == UserRoles.DASHBOARD_CHAMPION:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True


class CanViewPlans(BasePermission):
    """Permission to view subscription plans (public)."""
    message = _("Plans are publicly available")

    def has_permission(self, request, view):
        # Plans are public - anyone can view
        return True

    def has_object_permission(self, request, view, obj):
        return True


class CanManagePaymentMethods(BasePermission):
    """Permission to manage saved payment methods."""
    message = _("You do not have permission to manage payment methods")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        return True

    def has_object_permission(self, request, view, obj):
        # User can only manage their tenant's payment methods
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True


class CanProcessWebhook(BasePermission):
    """
    Permission for webhook endpoint.
    This is special - no authentication, but signature verification happens separately.
    """
    message = _("Webhook processing requires valid signature")

    def has_permission(self, request, view):
        # Webhook endpoint is public but signature verified in view
        return True

    def has_object_permission(self, request, view, obj):
        return True


class CanViewBillingAnalytics(BasePermission):
    """Permission to view billing analytics and reports."""
    message = _("You do not have permission to view billing analytics")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Super admin and client admin can view analytics
        if request.user.role in [UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True


class CanInitiateRefund(BasePermission):
    """Permission to initiate refunds (admin only)."""
    message = _("Refunds can only be initiated by super admin")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE - Only super_admin can do this
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanAccessBillingPortal(BasePermission):
    """Permission to access customer billing portal."""
    message = _("You do not have access to the billing portal")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        return True

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanAccessBillingAdmin(BasePermission):
    """Permission to access billing admin panel (super admin only)."""
    message = _("Super admin access required for billing admin panel")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE - Only super_admin can access admin panel
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanManagePlans(BasePermission):
    """Permission to manage subscription plans (super admin only)."""
    message = _("Super admin access required to manage plans")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE - Only super_admin can manage plans
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanManageBillingSettings(BasePermission):
    """Permission to manage billing system settings (super admin only)."""
    message = _("Super admin access required to manage billing settings")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # ✅ SUPER_ADMIN OVERRIDE - Only super_admin can manage settings
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission to check if user is object owner or admin.
    """
    message = _("You do not have permission to access this resource")

    def has_object_permission(self, request, view, obj):
        # ✅ SUPER_ADMIN OVERRIDE
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True

        # Check if user owns this object (tenant-wise)
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)

        if hasattr(obj, 'owner'):
            return obj.owner == request.user

        return False
