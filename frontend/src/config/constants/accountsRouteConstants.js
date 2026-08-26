// ============================================
// ACCOUNTS ROUTE CONSTANTS
// Following the established pattern from KPI, Billing apps
// ============================================

export const ACCOUNTS_ROUTES = {
    // Base
    BASE: '/accounts',

    // ============================================
    // AUTHENTICATION ROUTES
    // ============================================
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    REGISTER_TENANT: '/register/tenant',

    // Password
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/change-password',

    // Verification
    VERIFY_EMAIL: '/verify-email',
    RESEND_VERIFICATION: '/resend-verification',

    // MFA
    MFA_SETUP: '/mfa/setup',
    MFA_VERIFY: '/mfa/verify',
    MFA_DEVICES: '/mfa/devices',
    MFA_BACKUP_CODES: '/mfa/backup-codes',
    MFA_RECOVER: '/mfa/recover',

    // Invitations
    ACCEPT_INVITATION: '/accept-invitation',

    // ============================================
    // DASHBOARD & HOME
    // ============================================
    DASHBOARD: '/dashboard',
    HOME: '/',

    // ============================================
    // USER MANAGEMENT
    // ============================================
    USERS: '/users',
    USER_DETAIL: (id = ':id') => `/users/${id}`,
    USER_CREATE: '/users/create',
    USER_EDIT: (id = ':id') => `/users/${id}/edit`,
    USER_BULK_IMPORT: '/users/bulk-import',
    USER_TEAM: (id = ':id') => `/users/${id}/team`,
    USER_REPORTING_CHAIN: (id = ':id') => `/users/${id}/reporting-chain`,

    // Current User
    MY_PROFILE: '/profile',
    MY_PROFILE_EDIT: '/profile/edit',
    MY_TEAM: '/team',
    MY_REPORTING_CHAIN: '/reporting-chain',
    MY_SETTINGS: '/settings',

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================
    PROFILES: '/profiles',
    PROFILE_DETAIL: (id = ':id') => `/profiles/${id}`,
    PROFILE_EDIT: (id = ':id') => `/profiles/${id}/edit`,

    // ============================================
    // ROLE & PERMISSION MANAGEMENT
    // ============================================
    ROLES: '/roles',
    ROLE_DETAIL: (id = ':id') => `/roles/${id}`,
    ROLE_CREATE: '/roles/create',
    ROLE_EDIT: (id = ':id') => `/roles/${id}/edit`,
    ROLE_PERMISSIONS: (id = ':id') => `/roles/${id}/permissions`,

    PERMISSIONS: '/permissions',
    PERMISSION_DETAIL: (id = ':id') => `/permissions/${id}`,

    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    SESSIONS: '/sessions',
    SESSION_DETAIL: (id = ':id') => `/sessions/${id}`,
    ACTIVE_SESSIONS: '/sessions/active',

    // ============================================
    // AUDIT & SECURITY
    // ============================================
    AUDIT_LOGS: '/audit-logs',
    AUDIT_LOG_DETAIL: (id = ':id') => `/audit-logs/${id}`,
    AUDIT_COMPLIANCE: '/audit/compliance',
    AUDIT_SECURITY_EVENTS: '/audit/security-events',
    AUDIT_ANOMALY: '/audit/anomaly',

    SECURITY: '/security',
    SECURITY_LOGIN_ATTEMPTS: '/security/login-attempts',
    SECURITY_LOCKOUT_SUMMARY: '/security/lockout-summary',
    SECURITY_MFA_POLICY: '/security/mfa-policy',

    // ============================================
    // SYSTEM SETTINGS
    // ============================================
    SYSTEM_SETTINGS: '/system-settings',
    SYSTEM_POLICY: '/system-policy',

    // Tenant Settings
    ORGANIZATION_SETTINGS: '/tenant/settings',
    TENANT_PREFERENCES: '/tenant/preferences',
    TENANT_BRANDING: '/tenant/branding',
    TENANT_USERS: '/tenant/users',

    // ============================================
    // ADMIN ROUTES
    // ============================================
    ADMIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',

    // Admin Users
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id = ':id') => `/admin/users/${id}`,
    ADMIN_USER_EDIT: (id = ':id') => `/admin/users/${id}/edit`,

    // Admin Roles
    ADMIN_ROLES: '/admin/roles',
    ADMIN_ROLE_CREATE: '/admin/roles/create',
    ADMIN_ROLE_EDIT: (id = ':id') => `/admin/roles/${id}/edit`,

    // Admin Permissions
    ADMIN_PERMISSIONS: '/admin/permissions',
    ADMIN_PERMISSION_INIT: '/admin/permissions/init',

    // Admin Tenants
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_TENANT_DETAIL: (id = ':id') => `/admin/tenants/${id}`,
    ADMIN_TENANT_CREATE: '/admin/tenants/create',
    ADMIN_TENANT_EDIT: (id = ':id') => `/admin/tenants/${id}/edit`,

    // Admin MFA
    ADMIN_MFA: '/admin/mfa',
    ADMIN_MFA_USER: (userId = ':userId') => `/admin/mfa/users/${userId}`,
    ADMIN_MFA_RESET: (userId = ':userId') => `/admin/mfa/users/${userId}/reset`,

    // Admin System
    ADMIN_SYSTEM: '/admin/system',
    ADMIN_SYSTEM_HEALTH: '/admin/system/health',
    ADMIN_SYSTEM_CACHE: '/admin/system/cache',
    ADMIN_SYSTEM_STATS: '/admin/system/stats',

    // ============================================
    // INVITATIONS
    // ============================================
    INVITATIONS: '/invitations',
    INVITATION_ACCEPT: '/invitation/accept',

    // Reports
    REPORTS: '/reports',
    REPORT_USER_DIRECTORY: '/reports/user-directory',
    REPORT_ROLE_DISTRIBUTION: '/reports/role-distribution',
    REPORT_DEPARTMENT_DISTRIBUTION: '/reports/department-distribution',
    REPORT_INACTIVE_USERS: '/reports/inactive-users',
    REPORT_RECENTLY_ADDED: '/reports/recently-added',
    REPORT_ACTIVITY_SUMMARY: '/reports/activity-summary',
    REPORT_AUDIT_TRAIL: '/reports/audit-trail',
    REPORT_LOGIN_ACTIVITY: '/reports/login-activity',
    REPORT_PASSWORD_CHANGES: '/reports/password-changes',
    REPORT_ROLE_CHANGES: '/reports/role-changes',
    REPORT_SUSPENSION_LOG: '/reports/suspension-log',
    REPORT_COMPLIANCE_SUMMARY: '/reports/compliance-summary',
};

// ============================================
// ROUTES THAT SHOULD HAVE MINIMAL HEADER/FOOTER
// ============================================

export const ACCOUNTS_MINIMAL_CHROME_PATHS = [
    ACCOUNTS_ROUTES.LOGIN,
    ACCOUNTS_ROUTES.REGISTER,
    ACCOUNTS_ROUTES.REGISTER_TENANT,
    ACCOUNTS_ROUTES.FORGOT_PASSWORD,
    ACCOUNTS_ROUTES.RESET_PASSWORD,
    ACCOUNTS_ROUTES.VERIFY_EMAIL,
    ACCOUNTS_ROUTES.ACCEPT_INVITATION,
    ACCOUNTS_ROUTES.MFA_VERIFY,
    ACCOUNTS_ROUTES.MFA_RECOVER,
];

// ============================================
// ROUTES THAT REQUIRE MFA
// ============================================

export const ACCOUNTS_MFA_REQUIRED_PATHS = [
    ACCOUNTS_ROUTES.DASHBOARD,
    ACCOUNTS_ROUTES.USERS,
    ACCOUNTS_ROUTES.PROFILES,
    ACCOUNTS_ROUTES.ROLES,
    ACCOUNTS_ROUTES.SESSIONS,
    ACCOUNTS_ROUTES.AUDIT_LOGS,
    ACCOUNTS_ROUTES.ADMIN,
    ACCOUNTS_ROUTES.ORGANIZATION_SETTINGS,
    ACCOUNTS_ROUTES.SYSTEM_SETTINGS,
];

// ============================================
// ROUTES THAT REQUIRE ADMIN ACCESS
// ============================================

export const ACCOUNTS_ADMIN_ONLY_PATHS = [
    ACCOUNTS_ROUTES.ADMIN,
    ACCOUNTS_ROUTES.ADMIN_DASHBOARD,
    ACCOUNTS_ROUTES.ADMIN_USERS,
    ACCOUNTS_ROUTES.ADMIN_ROLES,
    ACCOUNTS_ROUTES.ADMIN_PERMISSIONS,
    ACCOUNTS_ROUTES.ADMIN_TENANTS,
    ACCOUNTS_ROUTES.ADMIN_MFA,
    ACCOUNTS_ROUTES.ADMIN_SYSTEM,
    ACCOUNTS_ROUTES.SYSTEM_SETTINGS,
    ACCOUNTS_ROUTES.SYSTEM_POLICY,
];

// ============================================
// BUILD PATH HELPER
// ============================================

export const buildAccountsPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// ============================================
// LEGACY REDIRECTS
// ============================================

export const LEGACY_ACCOUNTS_REDIRECTS = [
    // Auth
    ['/app/login', ACCOUNTS_ROUTES.LOGIN],
    ['/app/logout', ACCOUNTS_ROUTES.LOGOUT],
    ['/app/register', ACCOUNTS_ROUTES.REGISTER],
    ['/app/forgot-password', ACCOUNTS_ROUTES.FORGOT_PASSWORD],
    ['/app/reset-password', ACCOUNTS_ROUTES.RESET_PASSWORD],
    ['/app/verify-email', ACCOUNTS_ROUTES.VERIFY_EMAIL],

    // MFA
    ['/app/mfa/setup', ACCOUNTS_ROUTES.MFA_SETUP],
    ['/app/mfa/verify', ACCOUNTS_ROUTES.MFA_VERIFY],
    ['/app/mfa/devices', ACCOUNTS_ROUTES.MFA_DEVICES],
    ['/app/mfa/backup-codes', ACCOUNTS_ROUTES.MFA_BACKUP_CODES],

    // Users
    ['/app/users', ACCOUNTS_ROUTES.USERS],
    ['/app/users/create', ACCOUNTS_ROUTES.USER_CREATE],
    ['/app/profile', ACCOUNTS_ROUTES.MY_PROFILE],
    ['/app/team', ACCOUNTS_ROUTES.MY_TEAM],
    ['/app/settings', ACCOUNTS_ROUTES.MY_SETTINGS],

    // Roles & Permissions
    ['/app/roles', ACCOUNTS_ROUTES.ROLES],
    ['/app/permissions', ACCOUNTS_ROUTES.PERMISSIONS],

    // Sessions
    ['/app/sessions', ACCOUNTS_ROUTES.SESSIONS],

    // Audit
    ['/app/audit', ACCOUNTS_ROUTES.AUDIT_LOGS],
    ['/app/audit/compliance', ACCOUNTS_ROUTES.AUDIT_COMPLIANCE],
    ['/app/audit/security', ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS],

    // Admin
    ['/app/admin', ACCOUNTS_ROUTES.ADMIN_DASHBOARD],
    ['/app/admin/users', ACCOUNTS_ROUTES.ADMIN_USERS],
    ['/app/admin/roles', ACCOUNTS_ROUTES.ADMIN_ROLES],
    ['/app/admin/permissions', ACCOUNTS_ROUTES.ADMIN_PERMISSIONS],
    ['/app/admin/tenants', ACCOUNTS_ROUTES.ADMIN_TENANTS],
    ['/app/admin/system', ACCOUNTS_ROUTES.ADMIN_SYSTEM],

    // Settings
    ['/app/system-settings', ACCOUNTS_ROUTES.SYSTEM_SETTINGS],
    ['/app/tenant-settings', ACCOUNTS_ROUTES.ORGANIZATION_SETTINGS],
];

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    ACCOUNTS_ROUTES,
    ACCOUNTS_MINIMAL_CHROME_PATHS,
    ACCOUNTS_MFA_REQUIRED_PATHS,
    ACCOUNTS_ADMIN_ONLY_PATHS,
    buildAccountsPath,
    LEGACY_ACCOUNTS_REDIRECTS,
};