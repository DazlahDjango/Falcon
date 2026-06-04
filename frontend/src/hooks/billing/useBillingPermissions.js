import { useSelector } from 'react-redux';

export const useBillingPermissions = () => {
    const user = useSelector((state) => state.accounts?.user);
    const role = user?.role || 'staff';
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = role === 'client_admin' || isSuperAdmin;
    const isDashboardChampion = role === 'dashboard_champion' || isClientAdmin;
    const isExecutive = role === 'executive' || isClientAdmin;
    const isSupervisor = role === 'supervisor' || isClientAdmin;
    const isStaff = role === 'staff' || isSupervisor;

    const permissions = {
        canViewBilling: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canManageSubscriptions: isSuperAdmin || isClientAdmin,
        canCancelSubscriptions: isSuperAdmin || isClientAdmin,
        canUpgradeDowngrade: isSuperAdmin || isClientAdmin,
        canViewInvoices: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canPayInvoices: isSuperAdmin || isClientAdmin || isDashboardChampion,
        canDownloadInvoices: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion || isSupervisor,
        canViewTransactions: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
        canRefundTransactions: isSuperAdmin || isClientAdmin,
        canManagePaymentMethods: isSuperAdmin || isClientAdmin || isDashboardChampion,
        canViewAnalytics: isSuperAdmin || isClientAdmin || isExecutive,
        canAccessAdminPanel: isSuperAdmin,
        canManagePlans: isSuperAdmin,
        canViewWebhookLogs: isSuperAdmin || isClientAdmin,
        canRetryWebhooks: isSuperAdmin,
        canManageEnterpriseOverrides: isSuperAdmin,
    };

    return { user, role, isSuperAdmin, isClientAdmin, isDashboardChampion, isExecutive, isSupervisor, isStaff, permissions };
};

export default useBillingPermissions;