
// src/hooks/reviews/useReviewsPermissions.js
// Hook for Reviews permission checks

import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useReviewsPermissions = () => {
  // Get user from AuthContext
  const { user, isAuthenticated } = useAuthContext();

  const permissionsData = useMemo(() => {
    const role = user?.role || 'staff';
    
    // Role calculations
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';
    const isDashboardChampion = isClientAdmin || role === 'dashboard_champion';
    const isExecutive = isClientAdmin || isDashboardChampion || role === 'executive';
    const isSupervisor = isExecutive || role === 'supervisor';
    const isStaff = isSupervisor || role === 'staff';

    // Permissions
    const permissions = {
      canViewReviewsDashboard: isAuthenticated,
      canViewReviewCycles: isAuthenticated,
      canViewSelfAssessment: isAuthenticated,
      canViewReviewQueue: isSupervisor,
      canViewFinalRatings: isAuthenticated,
      canViewTeamFinalRatings: isSupervisor,
      canViewMyPIPs: isAuthenticated,
      canViewTeamPIPs: isSupervisor,
      canViewFeedback: isAuthenticated,
      canViewAnalytics: isDashboardChampion || isExecutive || isClientAdmin,
      canViewReports: isDashboardChampion || isExecutive || isClientAdmin,
      canViewCalibration: isClientAdmin,
      canViewReviewsSettings: isClientAdmin,
      canViewRatingScales: isClientAdmin,
      canViewCompetencies: isClientAdmin,
      canViewPredictions: isDashboardChampion || isExecutive || isClientAdmin,
      canViewInsights: isDashboardChampion || isExecutive || isClientAdmin,
    };

    return {
      user,
      role,
      isAuthenticated,
      isSuperAdmin,
      isClientAdmin,
      isDashboardChampion,
      isExecutive,
      isSupervisor,
      isStaff,
      permissions,
      hasAnyRole: (roles) => roles.includes(role),
      hasAllRoles: (roles) => roles.every((r) => r === role),
      can: (permission) => permissions[permission] || false,
    };
  }, [user, isAuthenticated]);

  return permissionsData;
};

export default useReviewsPermissions;

