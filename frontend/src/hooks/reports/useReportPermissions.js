// ============================================
// frontend/src/hooks/reports/useReportPermissions.js
// ============================================

import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useReportPermissions = () => {
    const { user, isAuthenticated } = useAuthContext();

    const permissionsData = useMemo(() => {
        const role = user?.role || 'staff';
        const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
        const isClientAdmin = isSuperAdmin || role === 'client_admin';
        const isExecutive = isClientAdmin || role === 'executive';
        const isDashboardChampion = isClientAdmin || role === 'dashboard_champion';
        const isManager = isClientAdmin || role === 'supervisor' || user?.is_manager === true;
        const isStaff = role === 'staff' || isSuperAdmin;

        const permissions = {
            // View permissions
            canViewReports: isAuthenticated,
            canViewReport: isAuthenticated,
            canViewPublicReports: isAuthenticated,
            canViewMyReports: isAuthenticated,
            canViewTemplates: isAuthenticated,
            canViewSchedules: isAuthenticated,
            canViewExecutions: isAuthenticated,
            canViewExports: isAuthenticated,
            canViewDashboards: isAuthenticated,
            canViewWidgets: isAuthenticated,
            canViewFilters: isAuthenticated,
            canViewShares: isAuthenticated,
            canViewAudits: isClientAdmin || isSuperAdmin || isExecutive,
            canViewAnalytics: isExecutive || isClientAdmin || isSuperAdmin || isDashboardChampion,
            canViewExecutiveDashboard: isExecutive || isClientAdmin || isSuperAdmin,
            canViewAdminOverview: isClientAdmin || isSuperAdmin,

            // Create permissions
            canCreateReport: isClientAdmin || isSuperAdmin || isDashboardChampion || isExecutive || isManager,
            canCreateTemplate: isClientAdmin || isSuperAdmin || isDashboardChampion,
            canCreateSchedule: isClientAdmin || isSuperAdmin || isDashboardChampion || isExecutive,
            canCreateExport: isAuthenticated,
            canCreateDashboard: isAuthenticated,
            canCreateWidget: isAuthenticated,
            canCreateFilter: isAuthenticated,
            canCreateShare: isClientAdmin || isSuperAdmin || isExecutive || isDashboardChampion,

            // Update permissions
            canUpdateReport: isClientAdmin || isSuperAdmin || isDashboardChampion,
            canUpdateTemplate: isClientAdmin || isSuperAdmin || isDashboardChampion,
            canUpdateSchedule: isClientAdmin || isSuperAdmin || isDashboardChampion,
            canUpdateDashboard: isAuthenticated,
            canUpdateWidget: isAuthenticated,
            canUpdateFilter: isAuthenticated,
            canUpdateShare: isClientAdmin || isSuperAdmin,

            // Delete permissions
            canDeleteReport: isClientAdmin || isSuperAdmin,
            canDeleteTemplate: isClientAdmin || isSuperAdmin,
            canDeleteSchedule: isClientAdmin || isSuperAdmin,
            canDeleteDashboard: isAuthenticated,
            canDeleteWidget: isAuthenticated,
            canDeleteFilter: isAuthenticated,
            canDeleteShare: isClientAdmin || isSuperAdmin,

            // Action permissions
            canGenerateReport: isAuthenticated,
            canExportReport: isAuthenticated,
            canPublishReport: isClientAdmin || isSuperAdmin,
            canArchiveReport: isClientAdmin || isSuperAdmin,
            canScheduleReport: isClientAdmin || isSuperAdmin || isDashboardChampion || isExecutive,
            canRefreshDashboard: isAuthenticated,
            canShareReport: isClientAdmin || isSuperAdmin || isExecutive || isDashboardChampion,
            canApplyTemplate: isAuthenticated,
            canPublishTemplate: isClientAdmin || isSuperAdmin || isDashboardChampion,
            canBulkExport: isClientAdmin || isSuperAdmin || isExecutive,

            // Special permissions
            canViewAuditLogs: isClientAdmin || isSuperAdmin,
            canViewSharedReports: isAuthenticated,
            canAccessPublicLink: isAuthenticated,
        };

        return {
            user,
            role,
            isAuthenticated,
            isSuperAdmin,
            isClientAdmin,
            isExecutive,
            isDashboardChampion,
            isManager,
            isStaff,
            permissions,

            // Direct permission access
            canManageReports: permissions.canCreateReport,
            canManageTemplates: permissions.canCreateTemplate,
            canManageSchedules: permissions.canCreateSchedule,
            canManageDashboards: permissions.canCreateDashboard,
            canManageShares: permissions.canCreateShare,
            canViewAnalytics: permissions.canViewAnalytics,
            canViewExecutiveDashboard: permissions.canViewExecutiveDashboard,
            canViewAdminOverview: permissions.canViewAdminOverview,
            canBulkExport: permissions.canBulkExport,
            canViewAuditLogs: permissions.canViewAuditLogs,

            // Convenience methods
            hasAnyRole: (roles) => roles.some(r => r === role),
            hasAllRoles: (roles) => roles.every(r => r === role),
            can: (permission) => permissions[permission] || false,
        };
    }, [user, isAuthenticated]);

    if (import.meta.env.DEV && user) {
        console.log('[Report Permissions]', {
            role: permissionsData.role,
            isSuperAdmin: permissionsData.isSuperAdmin,
            isClientAdmin: permissionsData.isClientAdmin,
            canViewAdminOverview: permissionsData.permissions.canViewAdminOverview,
            canViewAnalytics: permissionsData.permissions.canViewAnalytics,
            canManageReports: permissionsData.permissions.canCreateReport,
        });
    }

    return permissionsData;
};

export default useReportPermissions;