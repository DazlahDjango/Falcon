/**
 * Permissions - Permission helper functions
 */

// ============================================================================
// Permission Constants
// ============================================================================

export const PERMISSIONS = {
    // KPI Permissions
    VIEW_KPI: 'view_kpi',
    CREATE_KPI: 'create_kpi',
    EDIT_KPI: 'edit_kpi',
    DELETE_KPI: 'delete_kpi',
    VALIDATE_KPI: 'validate_kpi_entry',
    APPROVE_KPI_CHANGE: 'approve_kpi_change',
    CASCADE_TARGETS: 'cascade_targets',
    PHASE_TARGETS: 'phase_targets',
    
    // Review Permissions
    VIEW_REVIEW: 'view_review',
    CREATE_REVIEW: 'create_review',
    SUBMIT_SELF_ASSESSMENT: 'submit_self_assessment',
    APPROVE_REVIEW: 'approve_review',
    INITIATE_PIP: 'initiate_pip',
    VIEW_PIP: 'view_pip',
    
    // User Permissions
    VIEW_USER: 'view_user',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    ASSIGN_ROLE: 'assign_role',
    MANAGE_TEAM: 'manage_team',
    
    // Dashboard Permissions
    VIEW_EXECUTIVE_DASHBOARD: 'view_executive_dashboard',
    VIEW_TEAM_DASHBOARD: 'view_team_dashboard',
    VIEW_INDIVIDUAL_DASHBOARD: 'view_individual_dashboard',
    EXPORT_REPORT: 'export_report',
    
    // Tenant Permissions
    MANAGE_TENANT: 'manage_tenant',
    VIEW_BILLING: 'view_billing',
    CONFIGURE_BRANDING: 'configure_branding',
    MANAGE_SUBSCRIPTION: 'manage_subscription',
    
    // Workflow Permissions
    APPROVE_WORKFLOW: 'approve_workflow',
    ESCALATE_WORKFLOW: 'escalate_workflow'
};

// ============================================================================
// Role Constants
// ============================================================================

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    EXECUTIVE: 'executive',
    SUPERVISOR: 'supervisor',
    DASHBOARD_CHAMPION: 'dashboard_champion',
    STAFF: 'staff',
    READ_ONLY: 'read_only'
};

export const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 0,
    [ROLES.CLIENT_ADMIN]: 1,
    [ROLES.EXECUTIVE]: 2,
    [ROLES.SUPERVISOR]: 3,
    [ROLES.DASHBOARD_CHAMPION]: 3,
    [ROLES.STAFF]: 4,
    [ROLES.READ_ONLY]: 5
};

// ============================================================================
// Permission Helpers
// ============================================================================

export const hasPermission = (userPermissions, permission) => {
    if (!userPermissions) return false;
    return userPermissions.includes(permission);
};

export const hasAnyPermission = (userPermissions, permissions) => {
    if (!userPermissions) return false;
    return permissions.some(p => userPermissions.includes(p));
};

export const hasAllPermissions = (userPermissions, permissions) => {
    if (!userPermissions) return false;
    return permissions.every(p => userPermissions.includes(p));
};

// ============================================================================
// Role Helpers
// ============================================================================

export const hasRole = (userRole, role) => {
    return userRole === role;
};

export const hasAnyRole = (userRole, roles) => {
    return roles.includes(userRole);
};

export const isHigherRole = (userRole, targetRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;
    return userLevel < targetLevel;
};

export const isLowerRole = (userRole, targetRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;
    return userLevel > targetLevel;
};

export const canAssignRole = (userRole, targetRole) => {
    if (userRole === ROLES.SUPER_ADMIN) return true;
    if (userRole === ROLES.CLIENT_ADMIN) return targetRole !== ROLES.SUPER_ADMIN;
    if (userRole === ROLES.EXECUTIVE) {
        return [ROLES.EXECUTIVE, ROLES.SUPERVISOR, ROLES.STAFF, ROLES.READ_ONLY].includes(targetRole);
    }
    if (userRole === ROLES.SUPERVISOR) {
        return [ROLES.STAFF, ROLES.READ_ONLY].includes(targetRole);
    }
    return false;
};

// ============================================================================
// Access Helpers
// ============================================================================

export const canAccessUser = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;
    if (currentUser.role === ROLES.CLIENT_ADMIN) return currentUser.tenant_id === targetUser.tenant_id;
    if (currentUser.role === ROLES.EXECUTIVE) return currentUser.tenant_id === targetUser.tenant_id;
    if (currentUser.role === ROLES.SUPERVISOR) {
        return targetUser.id === currentUser.id || targetUser.manager_id === currentUser.id;
    }
    if (currentUser.role === ROLES.STAFF) return targetUser.id === currentUser.id;
    return false;
};

export const canManageUser = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;
    if (currentUser.role === ROLES.CLIENT_ADMIN) return currentUser.tenant_id === targetUser.tenant_id;
    if (currentUser.role === ROLES.EXECUTIVE) return currentUser.tenant_id === targetUser.tenant_id;
    if (currentUser.role === ROLES.SUPERVISOR) return targetUser.manager_id === currentUser.id;
    return false;
};

export const canViewTeam = (currentUser) => {
    if (!currentUser) return false;
    return [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.EXECUTIVE, ROLES.SUPERVISOR].includes(currentUser.role);
};

export const canManageTenant = (currentUser) => {
    if (!currentUser) return false;
    return [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN].includes(currentUser.role);
};

export const isManagement = (currentUser) => {
    if (!currentUser) return false;
    return [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.EXECUTIVE, ROLES.SUPERVISOR].includes(currentUser.role);
};

// ============================================================================
// Module Access Helpers
// ============================================================================

export const canAccessModule = (userRole, module) => {
    const moduleAccess = {
        dashboard: true,
        kpi: true,
        reviews: true,
        missions: true,
        team: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.EXECUTIVE, ROLES.SUPERVISOR],
        users: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN],
        reports: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.EXECUTIVE],
        settings: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN],
        admin: [ROLES.SUPER_ADMIN],
        audit: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.EXECUTIVE]
    };
    
    const allowed = moduleAccess[module];
    if (allowed === true) return true;
    if (Array.isArray(allowed)) return allowed.includes(userRole);
    return false;
};