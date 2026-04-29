// src/config/constants/roleConstants.js
/**
 * User Roles and Permissions
 * Matches your Falcon PMS requirements: Staff, Manager/Supervisor, Executive, Dashboard Champion, Admin
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    EXECUTIVE: 'executive',
    SUPERVISOR: 'supervisor',
    DASHBOARD_CHAMPION: 'dashboard_champion',
    STAFF: 'staff',
    READ_ONLY: 'read_only',
};

export const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 0,
    [ROLES.CLIENT_ADMIN]: 1,
    [ROLES.EXECUTIVE]: 2,
    [ROLES.SUPERVISOR]: 3,
    [ROLES.DASHBOARD_CHAMPION]: 3,  // Same level as Supervisor
    [ROLES.STAFF]: 4,
    [ROLES.READ_ONLY]: 5,
};

export const ROLE_DISPLAY_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.CLIENT_ADMIN]: 'Organization Admin',
    [ROLES.EXECUTIVE]: 'Executive',
    [ROLES.SUPERVISOR]: 'Supervisor',
    [ROLES.DASHBOARD_CHAMPION]: 'Dashboard Champion',
    [ROLES.STAFF]: 'Staff Member',
    [ROLES.READ_ONLY]: 'Read Only',
};

// Permission Codes
export const PERMISSIONS = {
    // Dashboard Permissions
    VIEW_INDIVIDUAL_DASHBOARD: 'view_individual_dashboard',
    VIEW_MANAGER_DASHBOARD: 'view_manager_dashboard',
    VIEW_EXECUTIVE_DASHBOARD: 'view_executive_dashboard',
    VIEW_CHAMPION_DASHBOARD: 'view_champion_dashboard',
    
    // KPI Permissions
    VIEW_KPI: 'view_kpi',
    CREATE_KPI: 'create_kpi',
    EDIT_KPI: 'edit_kpi',
    DELETE_KPI: 'delete_kpi',
    VALIDATE_KPI_ENTRY: 'validate_kpi_entry',
    APPROVE_KPI_CHANGE: 'approve_kpi_change',
    CASCADE_TARGETS: 'cascade_targets',
    PHASE_TARGETS: 'phase_targets',
    
    // Target Permissions
    VIEW_TARGETS: 'view_targets',
    CREATE_TARGETS: 'create_targets',
    EDIT_TARGETS: 'edit_targets',
    APPROVE_TARGETS: 'approve_targets',
    
    // Actual Entry Permissions
    SUBMIT_ACTUALS: 'submit_actuals',
    APPROVE_ACTUALS: 'approve_actuals',
    REJECT_ACTUALS: 'reject_actuals',
    ADJUST_ACTUALS: 'adjust_actuals',
    
    // Review Permissions
    VIEW_REVIEW: 'view_review',
    CREATE_REVIEW: 'create_review',
    SUBMIT_SELF_ASSESSMENT: 'submit_self_assessment',
    APPROVE_REVIEW: 'approve_review',
    INITIATE_PIP: 'initiate_pip',
    VIEW_PIP: 'view_pip',
    
    // Mission Report Permissions
    VIEW_MISSIONS: 'view_missions',
    CREATE_MISSION: 'create_mission',
    EDIT_MISSION: 'edit_mission',
    EXPORT_MISSION: 'export_mission',
    
    // Workflow Permissions
    VIEW_VALIDATION_QUEUE: 'view_validation_queue',
    APPROVE_VALIDATION: 'approve_validation',
    ESCALATE_ISSUE: 'escalate_issue',
    RESOLVE_ESCALATION: 'resolve_escalation',
    // User Permissions
    VIEW_USER: 'view_user',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    ASSIGN_ROLE: 'assign_role',
    MANAGE_TEAM: 'manage_team',
    // Organisation Permissions
    MANAGE_ORGANISATION: 'manage_organisation',
    VIEW_BILLING: 'view_billing',
    CONFIGURE_BRANDING: 'configure_branding',
    MANAGE_SUBSCRIPTION: 'manage_subscription',
    VIEW_ORGANISATION_REPORTS: 'view_organisation_reports',
    // Tenant Permissions (Super Admin only)
    MANAGE_TENANT: 'manage_tenant',
    VIEW_TENANT_ANALYTICS: 'view_tenant_analytics',
    // Analytics Permissions
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_PREDICTIONS: 'view_predictions',
    EXPORT_ANALYTICS: 'export_analytics',
    // Report Permissions
    VIEW_REPORTS: 'view_reports',
    CREATE_REPORT: 'create_report',
    SCHEDULE_REPORT: 'schedule_report',
    EXPORT_REPORT: 'export_report',
    // Admin Permissions
    MANAGE_SYSTEM: 'manage_system',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    MANAGE_ALL_TENANTS: 'manage_all_tenants',
};
// Permission Categories
export const PERMISSION_CATEGORIES = {
    DASHBOARD: 'dashboard',
    KPI: 'kpi',
    TARGET: 'target',
    ACTUAL: 'actual',
    REVIEW: 'review',
    MISSION: 'mission',
    WORKFLOW: 'workflow',
    USER: 'user',
    ORGANISATION: 'organisation',
    TENANT: 'tenant',
    ANALYTICS: 'analytics',
    REPORT: 'report',
    ADMIN: 'admin',
};
export const PERMISSION_CATEGORY_LABELS = {
    [PERMISSION_CATEGORIES.DASHBOARD]: 'Dashboards',
    [PERMISSION_CATEGORIES.KPI]: 'KPI Management',
    [PERMISSION_CATEGORIES.TARGET]: 'Target Management',
    [PERMISSION_CATEGORIES.ACTUAL]: 'Actual Entry',
    [PERMISSION_CATEGORIES.REVIEW]: 'Performance Reviews',
    [PERMISSION_CATEGORIES.MISSION]: 'Mission Reports',
    [PERMISSION_CATEGORIES.WORKFLOW]: 'Workflow & Validation',
    [PERMISSION_CATEGORIES.USER]: 'User Management',
    [PERMISSION_CATEGORIES.ORGANISATION]: 'Organisation Settings',
    [PERMISSION_CATEGORIES.TENANT]: 'Tenant Management',
    [PERMISSION_CATEGORIES.ANALYTICS]: 'Analytics & Insights',
    [PERMISSION_CATEGORIES.REPORT]: 'Reports',
    [PERMISSION_CATEGORIES.ADMIN]: 'System Administration',
};
// Role to Permissions mapping (simplified - expand as needed)
export const ROLE_PERMISSIONS = {
    [ROLES.STAFF]: [
        PERMISSIONS.VIEW_INDIVIDUAL_DASHBOARD,
        PERMISSIONS.VIEW_KPI,
        PERMISSIONS.SUBMIT_ACTUALS,
        PERMISSIONS.SUBMIT_SELF_ASSESSMENT,
        PERMISSIONS.VIEW_MISSIONS,
        PERMISSIONS.CREATE_MISSION,
    ],
    [ROLES.SUPERVISOR]: [
        ...ROLE_PERMISSIONS[ROLES.STAFF],
        PERMISSIONS.VIEW_MANAGER_DASHBOARD,
        PERMISSIONS.APPROVE_ACTUALS,
        PERMISSIONS.REJECT_ACTUALS,
        PERMISSIONS.APPROVE_REVIEW,
        PERMISSIONS.INITIATE_PIP,
        PERMISSIONS.VIEW_VALIDATION_QUEUE,
        PERMISSIONS.APPROVE_VALIDATION,
        PERMISSIONS.VIEW_TEAM,
        PERMISSIONS.MANAGE_TEAM,
    ],
    [ROLES.DASHBOARD_CHAMPION]: [
        PERMISSIONS.VIEW_CHAMPION_DASHBOARD,
        PERMISSIONS.VIEW_KPI,
        PERMISSIONS.CASCADE_TARGETS,
        PERMISSIONS.PHASE_TARGETS,
        PERMISSIONS.VIEW_TARGETS,
        PERMISSIONS.CREATE_TARGETS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORT,
        PERMISSIONS.VIEW_ORGANISATION_REPORTS,
    ],
    [ROLES.EXECUTIVE]: [
        PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD,
        PERMISSIONS.VIEW_KPI,
        PERMISSIONS.VIEW_REVIEW,
        PERMISSIONS.VIEW_PIP,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_PREDICTIONS,
        PERMISSIONS.VIEW_AUDIT_LOGS,
    ],
    [ROLES.CLIENT_ADMIN]: [
        ...ROLE_PERMISSIONS[ROLES.EXECUTIVE],
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.ASSIGN_ROLE,
        PERMISSIONS.MANAGE_ORGANISATION,
        PERMISSIONS.CONFIGURE_BRANDING,
        PERMISSIONS.MANAGE_SUBSCRIPTION,
        PERMISSIONS.VIEW_BILLING,
        PERMISSIONS.MANAGE_TEAM,
        PERMISSIONS.CREATE_REPORT,
        PERMISSIONS.SCHEDULE_REPORT,
    ],
    [ROLES.SUPER_ADMIN]: [
        // All permissions
        ...Object.values(PERMISSIONS),
    ],
    [ROLES.READ_ONLY]: [
        PERMISSIONS.VIEW_INDIVIDUAL_DASHBOARD,
        PERMISSIONS.VIEW_KPI,
        PERMISSIONS.VIEW_REPORTS,
    ],
};
// Helper functions
export const isHigherRole = (role, compareToRole) => {
    return ROLE_HIERARCHY[role] < ROLE_HIERARCHY[compareToRole];
};
export const getHighestRole = (roles) => {
    if (!roles || roles.length === 0) return null;
    return roles.reduce((highest, current) => {
        return ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest;
    });
};