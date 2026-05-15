from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles


class BasePermission(BasePermission):
    """Base permission class for billing."""
    message = _("You do not have permissions to perform this action")
    code = 'permission_denied'
    
    def get_message(self, request, view, obj=None):
        return self.message
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        return True


class AllowAny(BasePermission):
    """Allow any access (public endpoints)."""
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        return True


class IsAuthenticated(BasePermission):
    """Allow only authenticated users."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated)


class IsAuthenticatedOrReadOnly(BasePermission):
    """Allow read-only for unauthenticated, write requires auth."""
    message = _("Authentication required for write operations")
    
    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or 
            (request.user and request.user.is_authenticated)
        )
    
    def has_object_permission(self, request, view, obj):
        return bool(
            request.method in SAFE_METHODS or 
            (request.user and request.user.is_authenticated)
        )


class IsSuperAdmin(BasePermission):
    """Allow only super admin users."""
    message = _("Super admin privileges required")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsClientAdmin(BasePermission):
    """Allow only client admin users."""
    message = _("Client admin privileges required")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


# ============================================================================
# Billing Specific Permissions
# ============================================================================

class CanViewBilling(BasePermission):
    """Permission to view billing information."""
    message = _("You do not have permission to view billing information")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admin and client admin can view all billing
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
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
        
        # Super admin and client admin can manage subscriptions
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
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
        
        # Super admin, client admin, executive can view all transactions
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
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
        
        # Super admin and client admin can view analytics
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
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
        
        # Only super admin can initiate refunds
        return request.user.role == UserRoles.SUPER_ADMIN or request.user.is_superuser
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanAccessBillingPortal(BasePermission):
    """Permission to access customer billing portal."""
    message = _("You do not have access to the billing portal")
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


# ============================================================================
# Object-level permission helpers
# ============================================================================

class IsOwnerOrAdmin(BasePermission):
    """Allow access if user is owner of the object or admin."""
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin has full access
        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return True
        
        # Check if user owns the object (based on tenant)
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        
        if hasattr(obj, 'user_id'):
            return str(obj.user_id) == str(request.user.id)
        
        return False


class IsSameTenant(BasePermission):
    """Ensure the object belongs to the same tenant as the user."""
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        
        return True