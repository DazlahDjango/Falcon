import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useBillingPermissions = () => {
    // Get user from AuthContext instead of Redux
    const { user, isAuthenticated } = useAuthContext();

    const role = user?.role || 'staff';
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';
    const isDashboardChampion = isClientAdmin || role === 'dashboard_champion';
    const isExecutive = isClientAdmin || role === 'executive';
    const isSupervisor = role === 'supervisor' || isSuperAdmin;
    const isStaff = role === 'staff' || isSuperAdmin;

    const permissions = {
        canViewBilling: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canManageSubscriptions: isSuperAdmin || isClientAdmin,
        canCancelSubscriptions: isSuperAdmin || isClientAdmin,
        canUpgradeDowngrade: isSuperAdmin || isClientAdmin,
        canViewInvoices: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canPayInvoices: !!user,
        canDownloadInvoices: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion || isSupervisor,
        canViewTransactions: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canRefundTransactions: isSuperAdmin,
        canManagePaymentMethods: !!user,
        canViewAnalytics: isSuperAdmin || isClientAdmin || isExecutive,
        canAccessAdminPanel: isSuperAdmin,
        canManagePlans: isSuperAdmin,
        canViewWebhookLogs: isSuperAdmin || isClientAdmin,
        canRetryWebhooks: isSuperAdmin,
        canManageEnterpriseOverrides: isSuperAdmin,
    };

    console.log('isSuperAdmin:', isSuperAdmin);
    console.log('permissions.canAccessAdminPanel:', permissions.canAccessAdminPanel);

    return {
        user,
        role,
        isSuperAdmin,
        isClientAdmin,
        isDashboardChampion,
        isExecutive,
        isSupervisor,
        isStaff,
        permissions,
    };
};

export default useBillingPermissions;