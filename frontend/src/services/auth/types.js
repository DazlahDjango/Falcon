/**
 * Auth Service Type Definitions (JSDoc)
 * 
 * @module Auth Types
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} [fullName] - Full name
 * @property {string} tenantId - Tenant ID
 * @property {string[]} roles - User roles
 * @property {string[]} permissions - User permissions
 * @property {boolean} isActive - Whether user is active
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} username - Username or email
 * @property {string} password - Password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} access - Access token
 * @property {string} refresh - Refresh token
 * @property {User} user - User data
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - User email
 * @property {string} password - Password
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} [tenantId] - Tenant ID (optional for registration)
 */

/**
 * @typedef {Object} PasswordResetRequest
 * @property {string} email - User email
 */

/**
 * @typedef {Object} PasswordResetConfirmRequest
 * @property {string} token - Reset token
 * @property {string} newPassword - New password
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string} oldPassword - Current password
 * @property {string} newPassword - New password
 */

/**
 * @typedef {Object} RefreshTokenRequest
 * @property {string} refresh - Refresh token
 */

/**
 * @typedef {Object} RefreshTokenResponse
 * @property {string} access - New access token
 */

/**
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} [phone] - Phone number
 * @property {Object} [preferences] - User preferences
 */

// User roles constants
export const UserRoles = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    DASHBOARD_CHAMPION: 'dashboard_champion',
    SUPERVISOR: 'supervisor',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    AUDITOR: 'auditor',
    READONLY: 'readonly'
};

// Permission constants
export const Permissions = {
    // KPI permissions
    VIEW_KPIS: 'view_kpis',
    CREATE_KPI: 'create_kpi',
    EDIT_KPI: 'edit_kpi',
    DELETE_KPI: 'delete_kpi',
    ACTIVATE_KPI: 'activate_kpi',
    DEACTIVATE_KPI: 'deactivate_kpi',
    
    // Target permissions
    VIEW_TARGETS: 'view_targets',
    SET_TARGETS: 'set_targets',
    EDIT_TARGETS: 'edit_targets',
    CASCADE_TARGETS: 'cascade_targets',
    
    // Actual permissions
    VIEW_ACTUALS: 'view_actuals',
    ENTER_ACTUALS: 'enter_actuals',
    EDIT_ACTUALS: 'edit_actuals',
    VALIDATE_ACTUALS: 'validate_actuals',
    
    // Score permissions
    VIEW_SCORES: 'view_scores',
    VIEW_AGGREGATED_SCORES: 'view_aggregated_scores',
    VIEW_TEAM_SCORES: 'view_team_scores',
    VIEW_EXECUTIVE_SCORES: 'view_executive_scores',
    
    // Analytics permissions
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
    
    // Admin permissions
    MANAGE_USERS: 'manage_users',
    MANAGE_TENANTS: 'manage_tenants',
    VIEW_AUDIT_LOGS: 'view_audit_logs'
};

// Role permission mapping
export const RolePermissions = {
    [UserRoles.SUPER_ADMIN]: Object.values(Permissions),
    [UserRoles.ADMIN]: [
        Permissions.VIEW_KPIS, Permissions.CREATE_KPI, Permissions.EDIT_KPI, Permissions.DELETE_KPI,
        Permissions.VIEW_TARGETS, Permissions.SET_TARGETS, Permissions.EDIT_TARGETS, Permissions.CASCADE_TARGETS,
        Permissions.VIEW_ACTUALS, Permissions.VALIDATE_ACTUALS,
        Permissions.VIEW_SCORES, Permissions.VIEW_AGGREGATED_SCORES, Permissions.VIEW_TEAM_SCORES, Permissions.VIEW_EXECUTIVE_SCORES,
        Permissions.VIEW_ANALYTICS, Permissions.VIEW_REPORTS, Permissions.EXPORT_DATA,
        Permissions.MANAGE_USERS
    ],
    [UserRoles.DASHBOARD_CHAMPION]: [
        Permissions.VIEW_KPIS, Permissions.CREATE_KPI, Permissions.EDIT_KPI,
        Permissions.VIEW_TARGETS, Permissions.SET_TARGETS, Permissions.EDIT_TARGETS, Permissions.CASCADE_TARGETS,
        Permissions.VIEW_ACTUALS, Permissions.VIEW_SCORES, Permissions.VIEW_AGGREGATED_SCORES, Permissions.VIEW_TEAM_SCORES,
        Permissions.VIEW_ANALYTICS, Permissions.VIEW_REPORTS, Permissions.EXPORT_DATA
    ],
    [UserRoles.MANAGER]: [
        Permissions.VIEW_KPIS,
        Permissions.VIEW_TARGETS,
        Permissions.VIEW_ACTUALS, Permissions.VALIDATE_ACTUALS,
        Permissions.VIEW_SCORES, Permissions.VIEW_TEAM_SCORES,
        Permissions.VIEW_REPORTS
    ],
    [UserRoles.EMPLOYEE]: [
        Permissions.VIEW_KPIS,
        Permissions.VIEW_TARGETS,
        Permissions.VIEW_ACTUALS, Permissions.ENTER_ACTUALS, Permissions.EDIT_ACTUALS,
        Permissions.VIEW_SCORES
    ],
    [UserRoles.AUDITOR]: [
        Permissions.VIEW_KPIS, Permissions.VIEW_TARGETS, Permissions.VIEW_ACTUALS,
        Permissions.VIEW_SCORES, Permissions.VIEW_AGGREGATED_SCORES,
        Permissions.VIEW_ANALYTICS, Permissions.VIEW_REPORTS, Permissions.VIEW_AUDIT_LOGS
    ],
    [UserRoles.READONLY]: [
        Permissions.VIEW_KPIS, Permissions.VIEW_TARGETS, Permissions.VIEW_ACTUALS,
        Permissions.VIEW_SCORES, Permissions.VIEW_AGGREGATED_SCORES
    ]
};

export default {
    UserRoles,
    Permissions,
    RolePermissions
};