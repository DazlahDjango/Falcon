// src/hooks/reviews/useReviewsPermissions.js
import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

/**
 * Hook for Reviews permission checks
 * Uses AuthContext instead of Redux for user data (following billing/kpi pattern)
 */
const useReviewsPermissions = () => {
    // Get user from AuthContext
    const { user, isAuthenticated } = useAuthContext();

    const permissionsData = useMemo(() => {
        console.log('=== useReviewsPermissions DEBUG ===');
        console.log('  user:', user);
        console.log('  user.role:', user?.role);
        console.log('  user.is_superuser:', user?.is_superuser);
        console.log('  isAuthenticated:', isAuthenticated);

        const role = user?.role || 'staff';
        // If user has is_superuser set, treat as super admin regardless of role
        const isSuperAdmin = user?.is_superuser || role === 'super_admin' || role === 'superadmin';
        const isClientAdmin = isSuperAdmin || role === 'client_admin';
        const isExecutive = isClientAdmin || role === 'executive';
        const isDashboardChampion = isClientAdmin || role === 'dashboard_champion';
        const isSupervisor = isClientAdmin || role === 'supervisor' || (user?.get_direct_reports?.length > 0);
        const isStaff = role === 'staff' || isSuperAdmin;

        // Reviews-specific permissions
        let permissions = {
            // ========== View Permissions ==========
            canViewReviews: isAuthenticated,
            canViewRatingScales: isAuthenticated,
            canViewCompetencies: isAuthenticated,
            canViewCycles: isAuthenticated,
            canViewSelfAssessment: isAuthenticated,
            canViewSupervisorReview: isAuthenticated,
            canViewFinalRating: isAuthenticated,
            canViewPIPs: isAuthenticated,
            canViewFeedback: isAuthenticated,
            canViewCalibration: isExecutive || isClientAdmin || isSuperAdmin || isSupervisor,
            canViewPromotions: isExecutive || isClientAdmin || isSuperAdmin,
            canViewTemplates: isClientAdmin || isSuperAdmin,
            canViewCoefficients: isClientAdmin || isSuperAdmin,
            canViewReports: isExecutive || isClientAdmin || isSuperAdmin,
            canViewDashboard: isAuthenticated,
            canViewStaffDashboard: isAuthenticated,
            canViewSupervisorDashboard: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canViewExecutiveDashboard: isExecutive || isClientAdmin || isSuperAdmin,
            canViewAdminDashboard: isClientAdmin || isSuperAdmin,
            canViewAuditLogs: isClientAdmin || isSuperAdmin,
            canViewSystemSettings: isClientAdmin || isSuperAdmin,

            // ========== Create Permissions ==========
            canCreateRatingScale: isClientAdmin || isSuperAdmin,
            canCreateCompetency: isClientAdmin || isSuperAdmin,
            canCreateCompetencyCategory: isClientAdmin || isSuperAdmin,
            canCreateCycle: isClientAdmin || isSuperAdmin,
            canCreateSelfAssessment: isAuthenticated,
            canCreateSupervisorReview: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canCreatePIP: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canCreateFeedbackRequest: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canCreateCalibrationSession: isClientAdmin || isSuperAdmin,
            canCreatePromotion: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canCreateTemplate: isClientAdmin || isSuperAdmin,
            canCreateCoefficient: isClientAdmin || isSuperAdmin,
            canCreateComment: isAuthenticated,

            // ========== Update Permissions ==========
            canUpdateRatingScale: isClientAdmin || isSuperAdmin,
            canUpdateCompetency: isClientAdmin || isSuperAdmin,
            canUpdateCompetencyCategory: isClientAdmin || isSuperAdmin,
            canUpdateCycle: isClientAdmin || isSuperAdmin,
            canUpdateSelfAssessment: isAuthenticated,
            canUpdateSupervisorReview: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canUpdatePIP: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canUpdateFeedbackRequest: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canUpdateCalibrationSession: isClientAdmin || isSuperAdmin,
            canUpdatePromotion: isClientAdmin || isSuperAdmin,
            canUpdateTemplate: isClientAdmin || isSuperAdmin,
            canUpdateCoefficient: isClientAdmin || isSuperAdmin,
            canUpdateComment: isAuthenticated,

            // ========== Delete Permissions ==========
            canDeleteRatingScale: isClientAdmin || isSuperAdmin,
            canDeleteCompetency: isClientAdmin || isSuperAdmin,
            canDeleteCompetencyCategory: isClientAdmin || isSuperAdmin,
            canDeleteCycle: isClientAdmin || isSuperAdmin,
            canDeleteSelfAssessment: isSuperAdmin,
            canDeleteSupervisorReview: isClientAdmin || isSuperAdmin,
            canDeletePIP: isClientAdmin || isSuperAdmin,
            canDeleteFeedbackRequest: isClientAdmin || isSuperAdmin,
            canDeleteCalibrationSession: isClientAdmin || isSuperAdmin,
            canDeletePromotion: isClientAdmin || isSuperAdmin,
            canDeleteTemplate: isClientAdmin || isSuperAdmin,
            canDeleteCoefficient: isClientAdmin || isSuperAdmin,
            canDeleteComment: isAuthenticated,

            // ========== Action Permissions ==========
            canSubmitSelfAssessment: isAuthenticated,
            canSubmitSupervisorReview: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canApproveSupervisorReview: isClientAdmin || isSuperAdmin,
            canRejectSupervisorReview: isClientAdmin || isSuperAdmin,
            canApproveFinalRating: isClientAdmin || isSuperAdmin,
            canLockFinalRating: isClientAdmin || isSuperAdmin,
            canCalibrateFinalRating: isClientAdmin || isSuperAdmin,
            canApprovePIP: isClientAdmin || isSuperAdmin,
            canStartPIP: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canCompletePIP: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canExtendPIP: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            canApprovePromotion: isClientAdmin || isSuperAdmin,
            canRejectPromotion: isClientAdmin || isSuperAdmin,
            canCompletePromotion: isClientAdmin || isSuperAdmin,
            canHoldPromotion: isClientAdmin || isSuperAdmin,
            canActivateCycle: isClientAdmin || isSuperAdmin,
            canCompleteCycle: isClientAdmin || isSuperAdmin,
            canArchiveCycle: isClientAdmin || isSuperAdmin,
            canExtendCycle: isClientAdmin || isSuperAdmin,
            canStartCalibration: isClientAdmin || isSuperAdmin,
            canCompleteCalibration: isClientAdmin || isSuperAdmin,
            canCancelCalibration: isClientAdmin || isSuperAdmin,
            canShareFeedbackSummary: isClientAdmin || isSuperAdmin,
            canGeneratePromotionFromRating: isClientAdmin || isSuperAdmin,
            canGeneratePIPFromRating: isClientAdmin || isSuperAdmin,

            // ========== Special Permissions ==========
            canManageAllReviews: isSuperAdmin,
            canViewAllEmployees: isSuperAdmin || isClientAdmin,
            canViewAllCycles: isSuperAdmin || isClientAdmin,
            canExportReports: isExecutive || isClientAdmin || isSuperAdmin,
            canManageSystemSettings: isClientAdmin || isSuperAdmin,
            canViewReferenceData: isAuthenticated,
            canManageNotifications: isAuthenticated,
        };

        // If super admin, override all permissions to true
        console.log('Before super admin override:', {
            isSuperAdmin,
            canCreateCoefficient: permissions.canCreateCoefficient
        });
        
        if (isSuperAdmin) {
            permissions = Object.fromEntries(
                Object.keys(permissions).map(key => [key, true])
            );
            
            console.log('After super admin override:', {
                canCreateCoefficient: permissions.canCreateCoefficient
            });
        }

        return {
            user,
            role,
            isAuthenticated,
            isSuperAdmin,
            isClientAdmin,
            isExecutive,
            isDashboardChampion,
            isSupervisor,
            isStaff,
            permissions,
            ...permissions, // Spread all permissions as top-level properties

            // ========== Direct Permission Access ==========
            canManageRatingScales: permissions.canCreateRatingScale,
            canManageCompetencies: permissions.canCreateCompetency,
            canManageCycles: permissions.canCreateCycle,
            canManagePIPs: permissions.canCreatePIP,
            canManageFeedback: permissions.canCreateFeedbackRequest,
            canManageCalibration: permissions.canCreateCalibrationSession,
            canManagePromotions: permissions.canCreatePromotion,
            canManageTemplates: permissions.canCreateTemplate,
            canManageCoefficients: permissions.canCreateCoefficient,
            canViewAdminDashboard: permissions.canViewAdminDashboard,
            canViewExecutiveDashboard: permissions.canViewExecutiveDashboard,
            canViewSupervisorDashboard: permissions.canViewSupervisorDashboard,
            canViewAuditLogs: permissions.canViewAuditLogs,
            canExportReports: permissions.canExportReports,
            canManageSystemSettings: permissions.canManageSystemSettings,

            // ========== Convenience Methods ==========
            hasAnyRole: (roles) => roles.some(r => r === role),
            hasAllRoles: (roles) => roles.every(r => r === role),
            can: (permission) => permissions[permission] || false,

            // ========== Role Checks ==========
            isReviewer: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
            isAdmin: isClientAdmin || isSuperAdmin,
            hasManagerAccess: isSupervisor || isExecutive || isClientAdmin || isSuperAdmin,
        };
    }, [user, isAuthenticated]);

    // Debug only in development
    if (import.meta.env.DEV && user) {
        console.log('[Reviews Permissions]', {
            role: permissionsData.role,
            isSuperAdmin: permissionsData.isSuperAdmin,
            isClientAdmin: permissionsData.isClientAdmin,
            canViewAdminDashboard: permissionsData.permissions.canViewAdminDashboard,
            canViewExecutiveDashboard: permissionsData.permissions.canViewExecutiveDashboard,
            canManageCycles: permissionsData.permissions.canCreateCycle,
        });
    }

    return permissionsData;
};

export default useReviewsPermissions;