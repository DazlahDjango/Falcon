import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useStructurePermissions = () => {
    const { user, isAuthenticated } = useAuthContext();

    const permissionsData = useMemo(() => {
        const role = user?.role || 'staff';

        const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
        const isClientAdmin = isSuperAdmin || role === 'client_admin';
        const isExecutive = isClientAdmin || role === 'executive';
        const isDashboardChampion = isClientAdmin || isExecutive || role === 'dashboard_champion';
        const isSupervisor = isDashboardChampion || role === 'supervisor';
        const isTeamLead = isSupervisor || role === 'team_lead';
        const isStaff = isTeamLead || role === 'staff';
        const isReadOnly = isStaff || role === 'read_only';

        const permissions = {
            canViewStructureDashboard: isAuthenticated,
            canViewDepartments: isAuthenticated,
            canManageDepartments: isClientAdmin || isSupervisor,
            canViewTeams: isAuthenticated,
            canManageTeams: isClientAdmin || isSupervisor,
            canViewPositions: isClientAdmin || isSupervisor || isDashboardChampion || isExecutive,
            canManagePositions: isClientAdmin,
            canViewEmployments: isAuthenticated,
            canViewOwnEmployment: isAuthenticated,
            canManageEmployments: isClientAdmin || isSupervisor,
            canViewReportingLines: isAuthenticated,
            canManageReportingLines: isClientAdmin || isSupervisor,
            canViewCostCenters: isClientAdmin || isSupervisor || isExecutive,
            canManageCostCenters: isClientAdmin,
            canViewLocations: isAuthenticated,
            canManageLocations: isClientAdmin || isSupervisor,
            canViewOrgChart: isAuthenticated,
            canViewDepartmentTrees: isClientAdmin || isSupervisor || isDashboardChampion || isExecutive,
            canViewTeamHierarchies: isAuthenticated,
            canViewHierarchyVersions: isClientAdmin || isSupervisor,
            canManageHierarchyVersions: isClientAdmin,
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