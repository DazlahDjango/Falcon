import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useStructurePermissions = () => {
    const { user, isAuthenticated } = useAuthContext();

    const permissionsData = useMemo(() => {
        const role = user?.role || 'staff';

        const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
        const isClientAdmin = isSuperAdmin || role === 'client_admin';
        const isHRAdmin = isClientAdmin || role === 'hr_admin' || role === 'hr';
        const isExecutive = isHRAdmin || role === 'executive';
        const isDashboardChampion = isExecutive || role === 'dashboard_champion' || role === 'champion';
        const isSupervisor = isDashboardChampion || role === 'supervisor' || role === 'manager';
        const isTeamLead = isSupervisor || role === 'team_lead';
        const isStaff = isTeamLead || role === 'staff';
        const isReadOnly = isStaff || role === 'read_only';

        const permissions = {
            canViewStructureDashboard: isAuthenticated,
            canViewDepartments: isAuthenticated,
            canManageDepartments: isClientAdmin || isHRAdmin || isSupervisor,
            canViewTeams: isAuthenticated,
            canManageTeams: isClientAdmin || isHRAdmin || isSupervisor,
            canViewPositions: isClientAdmin || isHRAdmin || isSupervisor || isDashboardChampion || isExecutive,
            canManagePositions: isClientAdmin || isHRAdmin,
            canViewEmployments: isAuthenticated,
            canViewOwnEmployment: isAuthenticated,
            canManageEmployments: isClientAdmin || isHRAdmin || isSupervisor,
            canViewReportingLines: isAuthenticated,
            canManageReportingLines: isClientAdmin || isHRAdmin || isSupervisor,
            canViewCostCenters: isClientAdmin || isHRAdmin || isSupervisor || isExecutive,
            canManageCostCenters: isClientAdmin || isHRAdmin,
            canViewLocations: isAuthenticated,
            canManageLocations: isClientAdmin || isHRAdmin || isSupervisor,
            canViewOrgChart: isAuthenticated,
            canViewDepartmentTrees: isClientAdmin || isHRAdmin || isSupervisor || isDashboardChampion || isExecutive,
            canViewTeamHierarchies: isAuthenticated,
            canViewHierarchyVersions: isClientAdmin || isHRAdmin || isSupervisor,
            canManageHierarchyVersions: isClientAdmin || isHRAdmin,
            canViewStructureSettings: isClientAdmin || isHRAdmin,
            canManageStructureSettings: isClientAdmin || isHRAdmin,
        };

        return {
            user,
            role,
            isAuthenticated,
            isSuperAdmin,
            isClientAdmin,
            isHRAdmin,
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