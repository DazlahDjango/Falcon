from .base import BasePermission, AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from .roles import HasRole, HasAnyRole, IsSuperAdmin, IsClientAdmin, IsExecutive, IsSupervisor, IsStaff, IsDashboardChampion, IsAdminOrExecutive, IsAdminOrSupervisor
from .billing import CanViewBilling, CanManageSubscriptions, CanViewInvoices, CanMakePayment, CanViewTransactions, CanViewPlans, CanManagePaymentMethods, CanProcessWebhook, CanViewBillingAnalytics, CanInitiateRefund, CanAccessBillingPortal, CanAccessBillingAdmin, CanManagePlans, CanManageBillingSettings, IsOwnerOrAdmin

CanAccessAdminPanel = CanAccessBillingAdmin


__all__ = [
    # Base
    'BasePermission',
    'AllowAny',
    'IsAuthenticated',
    'IsAuthenticatedOrReadOnly',
    # Role-based
    'HasRole',
    'HasAnyRole',
    'IsSuperAdmin',
    'IsClientAdmin',
    'IsExecutive',
    'IsSupervisor',
    'IsStaff',
    'IsDashboardChampion',
    'IsAdminOrExecutive',
    'IsAdminOrSupervisor',
    # Billing-specific
    'CanViewBilling',
    'CanManageSubscriptions',
    'CanViewInvoices',
    'CanMakePayment',
    'CanViewTransactions',
    'CanViewPlans',
    'CanManagePaymentMethods',
    'CanProcessWebhook',
    'CanViewBillingAnalytics',
    'CanInitiateRefund',
    'CanAccessBillingPortal',
    'CanAccessBillingAdmin',
    'CanAccessAdminPanel',
    'CanManagePlans',
    'CanManageBillingSettings',
    'IsOwnerOrAdmin',
]