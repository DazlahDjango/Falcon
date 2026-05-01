/**
 * Constants - Central export for implemented features only
 */
// Route Constants (only)
export const ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    // Dashboard
    DASHBOARD: '/dashboard',
    KPI_DASHBOARD: '/kpi/dashboard',
    // KPI
    KPI_MANAGEMENT: '/kpi/management',
    KPI_CREATE: '/kpi/create',
    KPI_DETAIL: '/kpi/detail/:id',
    KPI_EDIT: '/kpi/edit/:id',
    KPI_VALIDATION: '/kpi/validation',
    KPI_ADJUSTMENTS: '/kpi/adjustments',
    KPI_REPORTS: '/kpi/reports',
    // Targets
    TARGETS: '/targets',
    TARGET_PHASING: '/targets/phasing',
    // Actuals
    ACTUALS: '/actuals',
    ACTUAL_SUBMIT: '/actuals/submit',
    // Scores
    SCORES: '/scores',
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    USER_PROFILE: '/profile',
    TEAM: '/team',
    // Roles
    ROLES: '/roles',
    ROLE_DETAIL: '/roles/:id',
    ROLE_CREATE: '/roles/create',
    ROLE_EDIT: '/roles/:id/edit',
    // Sessions
    SESSIONS: '/sessions',
    // Settings
    SETTINGS: '/settings',
    SECURITY: '/security',
    NOTIFICATIONS: '/notifications',
    // Audit
    AUDIT: '/audit',
    // Admin
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_SYSTEM: '/admin/system',
    // Organisation
    ORGANISATION_DASHBOARD: '/organisation',
    ORGANISATION_SETTINGS: '/organisation/settings',
    ORGANISATION_ADMIN: '/organisation/admin',
    ORGANISATION_AUDIT: '/organisation/audit',
    ORGANISATION_BRANDING: '/organisation/branding',
    ORGANISATION_USERS: '/organisation/users',
    ORGANISATION_SUBSCRIPTION: '/organisation/subscription',
    ORGANISATION_REPORTS: '/organisation/reports',
    ORGANISATION_DEPARTMENTS: '/organisation/departments',
    ORGANISATION_TEAMS: '/organisation/teams',
    ORGANISATION_POSITIONS: '/organisation/positions',
    ORGANISATION_DOMAINS: '/organisation/domains',
    ORGANISATION_CONTACTS: '/organisation/contacts',
    ORGANISATION_WORKFLOWS: '/organisation/workflows',
    ORGANISATION_IMPORT: '/organisation/import',
    ORGANISATION_EXPORT: '/organisation/export',
    ORGANISATION_API_TOKENS: '/organisation/api-tokens',
    ORGANISATION_TWO_FACTOR: '/organisation/two-factor',
    ORGANISATION_PROFILE: '/organisation/profile',
    ORGANISATION_HIERARCHY: '/organisation/hierarchy',
    ORGANISATION_FEATURE_FLAGS: '/organisation/feature-flags',
    ORGANISATION_PLANS: '/organisation/plans',
    // Error pages
    UNAUTHORIZED: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404',
};

// API Endpoints (only implemented - matches your backend)
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    REGISTER: '/auth/register/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESEND_VERIFICATION: '/auth/resend-verification/',
    FORGOT_PASSWORD: '/auth/password-reset/',
    RESET_PASSWORD: '/auth/password-reset/confirm/',
    CHANGE_PASSWORD: '/auth/change-password/',
    // MFA
    MFA_SETUP: '/auth/mfa/setup/',
    MFA_VERIFY: '/auth/mfa/verify/',
    MFA_VERIFY_SETUP: '/auth/mfa/verify-setup/',
    MFA_DISABLE: '/auth/mfa/disable/',
    MFA_DEVICES: '/auth/mfa/devices/',
    MFA_BACKUP_CODES: '/auth/mfa/backup-codes/',
    // Invitations
    INVITATIONS: '/auth/invitations/',
    ACCEPT_INVITATION: '/auth/invitations/accept/',
    // Users
    USERS: '/users/',
    USER_DETAIL: '/users/{id}/',
    USER_ME: '/users/me/',
    USER_AVATAR: '/users/me/avatar/',
    USER_TEAM: '/users/me/team/',
    USER_REPORTING_CHAIN: '/users/me/reporting-chain/',
    // Roles
    ROLES: '/roles/',
    ROLE_DETAIL: '/roles/{id}/',
    ROLE_SYSTEM: '/roles/system/',
    ROLE_ASSIGNABLE: '/roles/assignable/',
    ROLE_PERMISSIONS: '/roles/{id}/permissions/',
    // Permissions
    PERMISSIONS: '/permissions/',
    // Sessions
    SESSIONS: '/sessions/',
    SESSIONS_ACTIVE: '/sessions/active/',
    SESSIONS_CURRENT: '/sessions/current/',
    SESSIONS_TERMINATE_ALL: '/sessions/terminate-all/',
    // Dashboard
    INDIVIDUAL_DASHBOARD: '/kpis/dashboard/individual/',
    MANAGER_DASHBOARD: '/kpis/dashboard/manager/',
    EXECUTIVE_DASHBOARD: '/kpis/dashboard/executive/',
    CHAMPION_DASHBOARD: '/kpis/dashboard/champion/',

    // KPI
    // ==========
    KPI_LIST: '/kpis/kpis/',
    KPI_DETAIL: '/kpis/kpis/{id}/',
    KPI_CREATE: '/kpis/kpis/',
    KPI_UPDATE: '/kpis/kpis/{id}/',
    KPI_DELETE: '/kpis/kpis/{id}/',
    KPI_ACTIVATE: '/kpis/kpis/{id}/activate/',
    KPI_DEACTIVATE: '/kpis/kpis/{id}/deactivate/',
    KPI_VALIDATE: '/kpis/kpis/{id}/validate/',
    KPI_WEIGHTS: '/kpis/kpis/{id}/weights/',
    KPI_STRATEGIC_LINKAGES: '/kpis/kpis/{id}/strategic-linkages/',
    KPI_DEPENDENCIES: '/kpis/kpis/{id}/dependencies/',
    // Frameworks
    SECTORS: '/kpis/sectors/',
    FRAMEWORKS: '/kpis/frameworks/',
    CATEGORIES: '/kpis/categories/',
    TEMPLATES: '/kpis/templates/',
    // Targets
    TARGETS: '/kpis/targets/',
    TARGET_DETAIL: '/kpis/targets/{id}/',
    TARGET_PHASING: '/kpis/targets/{id}/phasing/',
    TARGET_VALIDATE: '/kpis/targets/{id}/validate/',
    TARGET_CASCADE: '/kpis/targets/cascade/',
    MONTHLY_PHASING: '/kpis/monthly-phasing/',
    // Actuals
    ACTUALS: '/kpis/actuals/',
    ACTUAL_DETAIL: '/kpis/actuals/{id}/',
    ACTUAL_SUBMIT: '/kpis/actuals/{id}/submit/',
    ACTUAL_APPROVE: '/kpis/actuals/{id}/approve/',
    ACTUAL_REJECT: '/kpis/actuals/{id}/reject/',
    ACTUAL_EVIDENCE: '/kpis/actuals/{id}/evidence/',
    // Scores
    SCORES: '/kpis/scores/',
    SCORE_DETAIL: '/kpis/scores/{id}/',
    AGGREGATED_SCORES: '/kpis/aggregated-scores/',
    TRAFFIC_LIGHTS: '/kpis/traffic-lights/',
     // Stats
    KPI_SUMMARIES: '/kpis/kpi-summaries/',           
    DEPARTMENT_ROLLUPS: '/kpis/department-rollups/',
    ORGANIZATION_HEALTH: '/kpis/organization-health/',
    
    // Organisations
    // ================
    ORGANISATIONS: '/organisations/',
    ORGANISATION_CURRENT: '/organisations/current/',
    ORGANISATION_SETTINGS: '/organisations/settings/',
    ORGANISATION_BRANDING: '/organisations/branding/',
    ORGANISATION_USERS: '/organisations/users/',
    ORGANISATION_TEAMS: '/organisations/teams/',
    ORGANISATION_DEPARTMENTS: '/organisations/departments/',
    ORGANISATION_POSITIONS: '/organisations/positions/',
    ORGANISATION_SUBSCRIPTION: '/organisations/subscription/',
    
    // Admin
    ADMIN_USERS: '/admin/users/',
    ADMIN_TENANTS: '/admin/tenants/',
    ADMIN_SYSTEM: '/admin/system/',
    ADMIN_CLEAR_CACHE: '/admin/system/clear-cache/',
    ADMIN_SYSTEM_HEALTH: '/admin/system/health/',
    
    // Audit
    AUDIT_LOGS: '/audit-logs/',
    AUDIT_EXPORT: '/audit-logs/export/',
    AUDIT_COMPLIANCE: '/audit-logs/compliance-report/',
    
    // Bulk Operations
    BULK_KPI_UPLOAD: '/bulk/kpi-upload/',
    BULK_ACTUAL_UPLOAD: '/bulk/actual-upload/',
    BULK_TARGET_UPLOAD: '/bulk/target-upload/',
    
    // Calculations
    CALCULATIONS_TRIGGER: '/calculations/trigger/',
    CALCULATIONS_STATUS: '/calculations/status/{taskId}/',
    
    // Exports
    EXPORT_KPIS: '/export/kpis/',
    EXPORT_SCORES: '/export/scores/',
    EXPORT_REPORTS: '/export/reports/',
};

// Role Constants
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
    [ROLES.DASHBOARD_CHAMPION]: 3,
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

// App Constants
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'falcon_access_token',
    REFRESH_TOKEN: 'falcon_refresh_token',
    USER: 'falcon_user',
    TENANT: 'falcon_tenant',
    TENANT_ID: 'falcon_tenant_id',
    THEME: 'falcon_theme',
};

export const API_TIMEOUT = 30000;
export const DEFAULT_PAGE_SIZE = 20;

// KPI Status
export const KPI_STATUS = {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    OFF_TRACK: 'off_track',
};

export const KPI_STATUS_COLORS = {
    [KPI_STATUS.ON_TRACK]: '#10b981',
    [KPI_STATUS.AT_RISK]: '#f59e0b',
    [KPI_STATUS.OFF_TRACK]: '#ef4444',
};

// Helper functions
export const buildPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

export const isHigherRole = (role, compareToRole) => {
    return ROLE_HIERARCHY[role] < ROLE_HIERARCHY[compareToRole];
};