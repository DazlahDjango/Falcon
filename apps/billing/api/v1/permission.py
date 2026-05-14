from rest_framework.permissions import BasePermission
from django.utils.translation import gettext_lazy as _
from apps.accounts.constants import UserRoles

class BillingBasePermission(BasePermission):
    message = _("You don't have permissions to perform this billing action")
    code = 'billing_permission_denied'
    def get_message(self, request, view, obj=None):
        return self.message
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return True
    
class CanViewBilling(BillingBasePermission):
    message = _("You need billing view permission.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE, UserRoles.DASHBOARD_CHAMPION]
    
class CanManageBilling(BillingBasePermission):
    message = _("You need billing management permission.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]

class CanViewInvoices(BillingBasePermission):
    message = _("You need invoice view permission.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE, UserRoles.DASHBOARD_CHAMPION]
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'tenant') and hasattr(request.user, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True

class CanManagePaymentMethods(BillingBasePermission):
    message = _("You need payment method management permission.")
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN
        ]
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'tenant') and hasattr(request.user, 'tenant_id'):
            return str(obj.tenant_id) == str(request.user.tenant_id)
        return True

class CanViewQuota(BillingBasePermission):
    message = _("You need quota view permission.")    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.DASHBOARD_CHAMPION
        ]

class IsSuperAdminOrSystem(BillingBasePermission):
    def has_permission(self, request, view):
        if view.__class__.__name__ == 'WebhookView' and request.path.endswith('/webhook/'):
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == UserRoles.SUPER_ADMIN

class HasBillingFeatureAccess(BillingBasePermission):
    def __init__(self, feature_name):
        self.feature_name = feature_name
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRoles.SUPER_ADMIN:
            return True
        from apps.billing.services.feature_service import FeatureService
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=request.user.tenant_id)
            feature_service = FeatureService()
            return feature_service.has_feature(tenant, self.feature_name)
        except Exception:
            return False