/**
 * Hook for KPI permission checks
 * Uses AuthContext instead of Redux for user data (following billing pattern)
 */
import { useAuthContext } from '../../contexts/accounts/AuthContext';

const useKPIPermissions = () => {
    // Get user from AuthContext instead of Redux
    const { user, isAuthenticated } = useAuthContext();
    
    const role = user?.role || 'staff';
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';
    const isExecutive = isClientAdmin || role === 'executive';
    const isDashboardChampion = isClientAdmin || role === 'dashboard_champion';
    const isManager = isClientAdmin || role === 'manager' || user?.get_direct_reports?.length > 0;
    const isStaff = role === 'staff' || isSuperAdmin;
    
    // KPI-specific permissions
    const permissions = {
        // View permissions
        canViewKPIs: isAuthenticated,
        canViewKPI: isAuthenticated,
        canViewFrameworks: isAuthenticated,
        canViewSectors: isAuthenticated,
        canViewCategories: isAuthenticated,
        canViewTemplates: isAuthenticated,
        canViewTargets: isAuthenticated,
        canViewActuals: isAuthenticated,
        canViewScores: isAuthenticated,
        canViewValidations: isAuthenticated,
        canViewDashboard: isAuthenticated,
        canViewAnalytics: isExecutive || isClientAdmin || isDashboardChampion || isManager,
        canViewExecutiveDashboard: isExecutive || isClientAdmin || isSuperAdmin,
        canViewManagerDashboard: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        canViewChampionDashboard: isDashboardChampion || isClientAdmin || isSuperAdmin,
        canViewAdminOverview: isClientAdmin || isSuperAdmin,
        canViewAuditLogs: isClientAdmin || isSuperAdmin,
        
        // Create permissions
        canCreateKPI: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canCreateFramework: isClientAdmin || isSuperAdmin,
        canCreateSector: isClientAdmin || isSuperAdmin,
        canCreateCategory: isClientAdmin || isSuperAdmin,
        canCreateTemplate: isClientAdmin || isSuperAdmin,
        canCreateTarget: isAuthenticated,
        canCreateActual: isAuthenticated,
        canCreateValidation: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        canCreateEscalation: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        
        // Update permissions
        canUpdateKPI: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canUpdateFramework: isClientAdmin || isSuperAdmin,
        canUpdateSector: isClientAdmin || isSuperAdmin,
        canUpdateCategory: isClientAdmin || isSuperAdmin,
        canUpdateTemplate: isClientAdmin || isSuperAdmin,
        canUpdateTarget: isAuthenticated,
        canUpdateActual: isAuthenticated,
        
        // Delete permissions
        canDeleteKPI: isClientAdmin || isSuperAdmin,
        canDeleteFramework: isClientAdmin || isSuperAdmin,
        canDeleteSector: isClientAdmin || isSuperAdmin,
        canDeleteCategory: isClientAdmin || isSuperAdmin,
        canDeleteTemplate: isClientAdmin || isSuperAdmin,
        canDeleteTarget: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canDeleteActual: isClientAdmin || isSuperAdmin,
        
        // Action permissions
        canActivateKPI: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canDeactivateKPI: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canPublishFramework: isClientAdmin || isSuperAdmin,
        canArchiveFramework: isClientAdmin || isSuperAdmin,
        canPublishTemplate: isClientAdmin || isSuperAdmin,
        canUseTemplate: isAuthenticated,
        canValidateActuals: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        canApproveActual: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        canRejectActual: isManager || isExecutive || isClientAdmin || isSuperAdmin,
        canCascadeTargets: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canTriggerCalculations: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canBulkUpload: isClientAdmin || isSuperAdmin || isDashboardChampion,
        canExportData: isClientAdmin || isSuperAdmin || isExecutive || isDashboardChampion || isManager,
        
        // Weight permissions
        canSetWeights: isAuthenticated,
        canValidateWeights: isManager || isExecutive || isClientAdmin || isSuperAdmin,
    };
    
    // ADD DIRECT PROPERTIES FOR EASY ACCESS
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
        
        // Direct permission access (ADD THESE!)
        canManageKPIs: permissions.canCreateKPI,
        canManageFrameworks: permissions.canCreateFramework,
        canManageSectors: permissions.canCreateSector,
        canManageCategories: permissions.canCreateCategory,
        canManageTemplates: permissions.canCreateTemplate,
        canValidateActuals: permissions.canValidateActuals,
        canCascadeTargets: permissions.canCascadeTargets,
        canViewAnalytics: permissions.canViewAnalytics,
        canViewExecutiveDashboard: permissions.canViewExecutiveDashboard,
        canViewManagerDashboard: permissions.canViewManagerDashboard,
        canViewChampionDashboard: permissions.canViewChampionDashboard,
        canBulkUpload: permissions.canBulkUpload,
        canTriggerCalculations: permissions.canTriggerCalculations,
        canViewAuditLogs: permissions.canViewAuditLogs,
        
        // Convenience methods
        hasAnyRole: (roles) => roles.some(r => r === role),
        hasAllRoles: (roles) => roles.every(r => r === role),
        can: (permission) => permissions[permission] || false,
    };
};

export default useKPIPermissions;