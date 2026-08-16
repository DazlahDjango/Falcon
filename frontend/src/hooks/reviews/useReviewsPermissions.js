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
        const isHrAdmin = isClientAdmin || role === 'hr_admin' || role === 'hr' || role === 'dashboard_champion';
        const isExecutive = isClientAdmin || role === 'executive';
        const isSupervisor = isClientAdmin || isHrAdmin || role === 'supervisor' || (user?.get_direct_reports?.length > 0);
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
            canViewCalibration: isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin || isSupervisor,
            canViewPromotions: isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewTemplates: isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewCoefficients: isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewReports: isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewDashboard: isAuthenticated,
            canViewStaffDashboard: isAuthenticated,
            canViewSupervisorDashboard: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewExecutiveDashboard: isExecutive || isClientAdmin || isSuperAdmin,
            canViewAdminDashboard: isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewAuditLogs: isHrAdmin || isClientAdmin || isSuperAdmin,
            canViewSystemSettings: isHrAdmin || isClientAdmin || isSuperAdmin,

            // ========== Create Permissions ==========
            canCreateRatingScale: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateCompetency: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateCompetencyCategory: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateSelfAssessment: isAuthenticated,
            canCreateSupervisorReview: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreatePIP: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateFeedbackRequest: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateCalibrationSession: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreatePromotion: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateTemplate: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateCoefficient: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCreateComment: isAuthenticated,

            // ========== Update Permissions ==========
            canUpdateRatingScale: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateCompetency: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateCompetencyCategory: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateSelfAssessment: isAuthenticated,
            canUpdateSupervisorReview: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdatePIP: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateFeedbackRequest: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateCalibrationSession: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdatePromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateTemplate: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateCoefficient: isHrAdmin || isClientAdmin || isSuperAdmin,
            canUpdateComment: isAuthenticated,

            // ========== Delete Permissions ==========
            canDeleteRatingScale: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteCompetency: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteCompetencyCategory: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteSelfAssessment: isSuperAdmin,
            canDeleteSupervisorReview: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeletePIP: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteFeedbackRequest: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteCalibrationSession: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeletePromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteTemplate: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteCoefficient: isHrAdmin || isClientAdmin || isSuperAdmin,
            canDeleteComment: isAuthenticated,

            // ========== Action Permissions ==========
            canSubmitSelfAssessment: isAuthenticated,
            canSubmitSupervisorReview: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canApproveSupervisorReview: isHrAdmin || isClientAdmin || isSuperAdmin,
            canRejectSupervisorReview: isHrAdmin || isClientAdmin || isSuperAdmin,
            canApproveFinalRating: isHrAdmin || isClientAdmin || isSuperAdmin,
            canLockFinalRating: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCalibrateFinalRating: isHrAdmin || isClientAdmin || isSuperAdmin,
            canApprovePIP: isHrAdmin || isClientAdmin || isSuperAdmin,
            canStartPIP: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canCompletePIP: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canExtendPIP: isSupervisor || isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canApprovePromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canRejectPromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCompletePromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canHoldPromotion: isHrAdmin || isClientAdmin || isSuperAdmin,
            canActivateCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCompleteCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canArchiveCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canExtendCycle: isHrAdmin || isClientAdmin || isSuperAdmin,
            canStartCalibration: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCompleteCalibration: isHrAdmin || isClientAdmin || isSuperAdmin,
            canCancelCalibration: isHrAdmin || isClientAdmin || isSuperAdmin,
            canShareFeedbackSummary: isHrAdmin || isClientAdmin || isSuperAdmin,
            canGeneratePromotionFromRating: isHrAdmin || isClientAdmin || isSuperAdmin,
            canGeneratePIPFromRating: isHrAdmin || isClientAdmin || isSuperAdmin,

            // ========== Special Permissions ==========
            canManageAllReviews: isSuperAdmin || isHrAdmin,
            canViewAllEmployees: isSuperAdmin || isClientAdmin || isHrAdmin,
            canViewAllCycles: isSuperAdmin || isClientAdmin || isHrAdmin,
            canExportReports: isExecutive || isHrAdmin || isClientAdmin || isSuperAdmin,
            canManageSystemSettings: isHrAdmin || isClientAdmin || isSuperAdmin,
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
