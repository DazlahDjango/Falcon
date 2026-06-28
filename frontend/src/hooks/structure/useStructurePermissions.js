// src/hooks/structure/useStructurePermissions.js
// Hook for Structure app permission checks

import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useStructurePermissions = () => {
  // Get user from AuthContext
  const { user, isAuthenticated } = useAuthContext();

  const permissionsData = useMemo(() => {
    const role = user?.role || 'staff';
    
    // Role calculations (including new TEAM_LEAD role)
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';
    const isExecutive = isClientAdmin || role === 'executive';
    const isDashboardChampion = isClientAdmin || isExecutive || role === 'dashboard_champion';
    const isSupervisor = isDashboardChampion || role === 'supervisor';
    const isTeamLead = isSupervisor || role === 'team_lead'; // NEW TEAM LEAD ROLE!
    const isStaff = isTeamLead || role === 'staff';
    const isReadOnly = isStaff || role === 'read_only';

    // Permissions
    const permissions = {
      canViewStructureDashboard: isAuthenticated,
      
      // Departments
      canViewDepartments: isAuthenticated,
      canManageDepartments: isClientAdmin || isSupervisor,
      
      // Teams
      canViewTeams: isAuthenticated,
      canManageTeams: isClientAdmin || isSupervisor,
      
      // Positions
      canViewPositions: isClientAdmin || isSupervisor || isDashboardChampion || isExecutive,
      canManagePositions: isClientAdmin,
      
      // Employments
      canViewEmployments: isAuthenticated,
      canViewOwnEmployment: isAuthenticated,
      canManageEmployments: isClientAdmin || isSupervisor,
      
      // Reporting Lines
      canViewReportingLines: isAuthenticated,
      canManageReportingLines: isClientAdmin || isSupervisor,
      
      // Cost Centers
      canViewCostCenters: isClientAdmin || isSupervisor || isExecutive,
      canManageCostCenters: isClientAdmin,
      
      // Locations
      canViewLocations: isAuthenticated,
      canManageLocations: isClientAdmin || isSupervisor,
      
      // Organization Chart
      canViewOrgChart: isAuthenticated,
      
      // Department Trees
      canViewDepartmentTrees: isClientAdmin || isSupervisor || isDashboardChampion || isExecutive,
      
      // Team Hierarchies
      canViewTeamHierarchies: isAuthenticated,
      
      // Hierarchy Versions
      canViewHierarchyVersions: isClientAdmin || isSupervisor,
      canManageHierarchyVersions: isClientAdmin,
      
      // Structure Settings
      canViewStructureSettings: isClientAdmin,
      canManageStructureSettings: isClientAdmin,
    };

    return {
      user,
      role,
      isAuthenticated,
      isSuperAdmin,
      isClientAdmin,
      isExecutive,
      isDashboardChampion,
      isSupervisor,
      isTeamLead,
      isStaff,
      isReadOnly,
      permissions,
      hasAnyRole: (roles) => roles.includes(role),
      hasAllRoles: (roles) => roles.every((r) => r === role),
      can: (permission) => permissions[permission] || false,
    };
  }, [user, isAuthenticated]);

  return permissionsData;
};

export default useStructurePermissions;
