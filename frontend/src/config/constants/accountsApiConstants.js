// ============================================
// ACCOUNTS API CONSTANTS
// Following the established pattern from Config, KPI, Billing apps
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const ACCOUNTS_API_BASE = `${API_BASE}/`;
export const API_VERSION = 'v1';
export const ACCOUNTS_API_PREFIX = `/api/${API_VERSION}`;

// ============================================
// 1. AUTHENTICATION ENDPOINTS
// ============================================

export const AUTH_ENDPOINTS = {
    // Core Auth
    LOGIN: `${API_BASE}/auth/login/`,
    LOGOUT: `${API_BASE}/auth/logout/`,
    REFRESH: `${API_BASE}/auth/refresh/`,
    REGISTER: `${API_BASE}/auth/register/`,
    REGISTER_TENANT: `${API_BASE}/auth/register-tenant/`,
    
    // MFA - Direct endpoints (legacy support)
    MFA_VERIFY: `${API_BASE}/auth/mfa-verify/`,
    MFA_SETUP: `${API_BASE}/auth/mfa-setup/`,
    MFA_DEVICES: `${API_BASE}/auth/mfa-devices/`,
    MFA_BACKUP_CODES: `${API_BASE}/auth/mfa-backup-codes/`,
    
    // User Management
    CURRENT_USER: `${API_BASE}/auth/me/`,
    CHANGE_PASSWORD: `${API_BASE}/auth/me/change-password/`,
    INVITATIONS: `${API_BASE}/auth/invitations/`,
    ACCEPT_INVITATION: `${API_BASE}/auth/invitation/accept/`,
    
    // Step-Up Authentication
    STEP_UP_VERIFY: `${API_BASE}/auth/step-up/verify/`,

    // Password Reset
    PASSWORD_RESET: `${API_BASE}/auth/password-reset/`,
    PASSWORD_RESET_CONFIRM: `${API_BASE}/auth/password-reset/confirm/`,
    
    // Email Verification
    VERIFY_EMAIL: `${API_BASE}/auth/verify-email/`,
    RESEND_VERIFICATION: `${API_BASE}/auth/resend-verification/`,
};

// ============================================
// 2. USER ENDPOINTS
// ============================================

export const USER_ENDPOINTS = {
    LIST: `${API_BASE}/users/`,
    DETAIL: (id) => `${API_BASE}/users/${id}/`,
    CREATE: `${API_BASE}/users/`,
    UPDATE: (id) => `${API_BASE}/users/${id}/`,
    DELETE: (id) => `${API_BASE}/users/${id}/`,
    
    // User Actions
    CHANGE_PASSWORD: (id) => `${API_BASE}/users/${id}/change-password/`,
    ASSIGN_ROLE: (id) => `${API_BASE}/users/${id}/assign-role/`,
    ACTIVATE: (id) => `${API_BASE}/users/${id}/activate/`,
    DEACTIVATE: (id) => `${API_BASE}/users/${id}/deactivate/`,
    UNLOCK: (id) => `${API_BASE}/users/${id}/unlock/`,
    VERIFY: (id) => `${API_BASE}/users/${id}/verify/`,
    
    // User Relationships
    TEAM: (id) => `${API_BASE}/users/${id}/team/`,
    REPORTING_CHAIN: (id) => `${API_BASE}/users/${id}/reporting-chain/`,
    
    // Current User
    ME: `${API_BASE}/users/me/`,
    MY_TEAM: `${API_BASE}/users/me/team/`,
    MY_REPORTING_CHAIN: `${API_BASE}/users/me/reporting-chain/`,
    
    // Invitations
    INVITE: `${API_BASE}/users/invite/`,
    
    // Query Params
    QUERY_PARAMS: {
        SEARCH: 'search',
        ROLE: 'role',
        IS_ACTIVE: 'is_active',
        IS_VERIFIED: 'is_verified',
        DEPARTMENT: 'department',
        TENANT_ID: 'tenant_id',
    },
};

// ============================================
// 3. PROFILE ENDPOINTS
// ============================================

export const PROFILE_ENDPOINTS = {
    LIST: `${API_BASE}/profiles/`,
    DETAIL: (id) => `${API_BASE}/profiles/${id}/`,
    UPDATE: (id) => `${API_BASE}/profiles/${id}/`,
    DELETE: (id) => `${API_BASE}/profiles/${id}/`,
    
    // Avatar
    UPLOAD_AVATAR: (id) => `${API_BASE}/profiles/${id}/avatar/`,
    DELETE_AVATAR: (id) => `${API_BASE}/profiles/${id}/avatar/`,
    
    // Skills
    SKILLS: (id) => `${API_BASE}/profiles/${id}/skills/`,
    SKILL_DETAIL: (id, skillName) => `${API_BASE}/profiles/${id}/skills/${skillName}/`,
    SKILLS_SUMMARY: (id) => `${API_BASE}/profiles/${id}/skills-summary/`,
    
    // Certifications
    CERTIFICATIONS: (id) => `${API_BASE}/profiles/${id}/certifications/`,
    CERTIFICATION_DETAIL: (id, certName) => `${API_BASE}/profiles/${id}/certifications/${certName}/`,
    CERTIFICATIONS_SUMMARY: (id) => `${API_BASE}/profiles/${id}/certifications-summary/`,
    
    // Current User Profile
    MY_PROFILE: `${API_BASE}/profiles/my/`,
    MY_SKILLS_SUMMARY: `${API_BASE}/profiles/my/skills-summary/`,
    MY_CERTIFICATIONS_SUMMARY: `${API_BASE}/profiles/my/certifications-summary/`,
    
    // Query Params
    QUERY_PARAMS: {
        USER: 'user',
        EMPLOYEE_TYPE: 'employee_type',
        DEPARTMENT: 'department',
    },
};

// ============================================
// 4. MFA DEVICE ENDPOINTS (ViewSet)
// ============================================

export const MFA_DEVICE_ENDPOINTS = {
    LIST: `${API_BASE}/mfa/devices/`,
    DETAIL: (id) => `${API_BASE}/mfa/devices/${id}/`,
    CREATE: `${API_BASE}/mfa/devices/`,
    UPDATE: (id) => `${API_BASE}/mfa/devices/${id}/`,
    DELETE: (id) => `${API_BASE}/mfa/devices/${id}/`,
    
    // TOTP Setup
    SETUP_TOTP: `${API_BASE}/mfa/devices/setup-totp/`,
    VERIFY_TOTP_SETUP: `${API_BASE}/mfa/devices/verify-totp-setup/`,
    
    // Device Verification
    VERIFY_DEVICE: (id) => `${API_BASE}/mfa/devices/${id}/verify/`,
    VERIFY_BACKUP: `${API_BASE}/mfa/devices/verify-backup/`,
    
    // Backup Codes
    GENERATE_BACKUP_CODES: `${API_BASE}/mfa/devices/generate-backup-codes/`,
    BACKUP_CODES_STATUS: `${API_BASE}/mfa/devices/backup-codes-status/`,
    
    // Device Management
    SET_PRIMARY: (id) => `${API_BASE}/mfa/devices/${id}/set-primary/`,
    DISABLE_MFA: `${API_BASE}/mfa/devices/disable/`,
    
    // Status & Activity
    MFA_STATUS: `${API_BASE}/mfa/devices/status/`,
    RECENT_ACTIVITY: `${API_BASE}/mfa/devices/activity/`,
    FAILURE_RATE: `${API_BASE}/mfa/devices/failure-rate/`,
    
    // Query Params
    QUERY_PARAMS: {
        DEVICE_TYPE: 'device_type',
        IS_ACTIVE: 'is_active',
        IS_VERIFIED: 'is_verified',
        USER: 'user',
    },
};

// ============================================
// 5. MFA AUDIT LOG ENDPOINTS
// ============================================

export const MFA_AUDIT_LOG_ENDPOINTS = {
    LIST: `${API_BASE}/mfa/audit-logs/`,
    DETAIL: (id) => `${API_BASE}/mfa/audit-logs/${id}/`,
    SUMMARY: `${API_BASE}/mfa/audit-logs/summary/`,
    
    QUERY_PARAMS: {
        EVENT_TYPE: 'event_type',
        SUCCESS: 'success',
        DEVICE_TYPE: 'device__device_type',
        USER: 'user',
    },
};

// ============================================
// 6. ROLE ENDPOINTS
// ============================================

export const ROLE_ENDPOINTS = {
    LIST: `${API_BASE}/roles/`,
    DETAIL: (id) => `${API_BASE}/roles/${id}/`,
    CREATE: `${API_BASE}/roles/`,
    UPDATE: (id) => `${API_BASE}/roles/${id}/`,
    DELETE: (id) => `${API_BASE}/roles/${id}/`,
    
    // System Roles
    SYSTEM_ROLES: `${API_BASE}/roles/system/`,
    ASSIGNABLE_ROLES: `${API_BASE}/roles/assignable/`,
    
    // Permissions
    ROLE_PERMISSIONS: (id) => `${API_BASE}/roles/${id}/permissions/`,
    ASSIGN_PERMISSIONS: (id) => `${API_BASE}/roles/${id}/permissions/`,
    
    // Query Params
    QUERY_PARAMS: {
        ROLE_TYPE: 'role_type',
        IS_SYSTEM: 'is_system',
        IS_ASSIGNABLE: 'is_assignable',
    },
};

// ============================================
// 7. PERMISSION ENDPOINTS
// ============================================

export const PERMISSION_ENDPOINTS = {
    LIST: `${API_BASE}/permissions/`,
    DETAIL: (id) => `${API_BASE}/permissions/${id}/`,
    
    // Filtered Lists
    BY_CATEGORY: (category) => `${API_BASE}/permissions/by-category/${category}/`,
    BY_LEVEL: (level) => `${API_BASE}/permissions/by-level/${level}/`,
    
    // Query Params
    QUERY_PARAMS: {
        CATEGORY: 'category',
        LEVEL: 'level',
        IS_ACTIVE: 'is_active',
    },
};

// ============================================
// 8. SESSION ENDPOINTS
// ============================================

export const SESSION_ENDPOINTS = {
    LIST: `${API_BASE}/sessions/`,
    DETAIL: (id) => `${API_BASE}/sessions/${id}/`,
    
    // Current User Sessions
    ACTIVE_SESSIONS: `${API_BASE}/sessions/active/`,
    CURRENT_SESSION: `${API_BASE}/sessions/current/`,
    TERMINATE_ALL: `${API_BASE}/sessions/terminate-all/`,
    
    // Admin/Tenant Sessions
    TENANT_ACTIVE: `${API_BASE}/sessions/tenant-active/`,
    
    // Session Actions
    TERMINATE: (id) => `${API_BASE}/sessions/${id}/terminate/`,
    BLACKLIST: `${API_BASE}/sessions/blacklist/`,
    
    // Query Params
    QUERY_PARAMS: {
        STATUS: 'status',
        DEVICE_TYPE: 'device_type',
        USER: 'user',
        TENANT_ID: 'tenant_id',
    },
};

// ============================================
// 9. AUDIT LOG ENDPOINTS
// ============================================

export const AUDIT_LOG_ENDPOINTS = {
    LIST: `${API_BASE}/audit-logs/`,
    DETAIL: (id) => `${API_BASE}/audit-logs/${id}/`,
    
    // User Activity
    USER_ACTIVITY: (userId) => `${API_BASE}/audit-logs/user/${userId}/`,
    USER_SUMMARY: `${API_BASE}/audit-logs/user-summary/`,
    
    // Tenant Activity
    TENANT_SUMMARY: `${API_BASE}/audit-logs/tenant-summary/`,
    
    // Security Events
    SECURITY_EVENTS: `${API_BASE}/audit-logs/security-events/`,
    ANOMALY_DETECTION: `${API_BASE}/audit-logs/anomaly-detection/`,
    
    // Reports
    COMPLIANCE_REPORT: `${API_BASE}/audit-logs/compliance-report/`,
    OBJECT_HISTORY: `${API_BASE}/audit-logs/object-history/`,
    EXPORT: `${API_BASE}/audit-logs/export/`,
    
    // Query Params
    QUERY_PARAMS: {
        ACTION: 'action',
        ACTION_TYPE: 'action_type',
        SEVERITY: 'severity',
        USER: 'user',
        TENANT_ID: 'tenant_id',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
        CONTENT_TYPE: 'content_type',
        OBJECT_ID: 'object_id',
        DAYS: 'days',
        LIMIT: 'limit',
        OFFSET: 'offset',
    },
};

// ============================================
// 10. USER PREFERENCE ENDPOINTS
// ============================================

export const USER_PREFERENCE_ENDPOINTS = {
    LIST: `${API_BASE}/preferences/users/`,
    DETAIL: (id) => `${API_BASE}/preferences/users/${id}/`,
    UPDATE: (id) => `${API_BASE}/preferences/users/${id}/`,
    
    // Current User
    MY_PREFERENCES: `${API_BASE}/preferences/users/my/`,
    UPDATE_NOTIFICATIONS: `${API_BASE}/preferences/users/notifications/`,
    
    // Query Params
    QUERY_PARAMS: {
        USER: 'user',
    },
};

// ============================================
// 11. TENANT PREFERENCE ENDPOINTS
// ============================================

export const TENANT_PREFERENCE_ENDPOINTS = {
    LIST: `${API_BASE}/preferences/tenants/`,
    DETAIL: (id) => `${API_BASE}/preferences/tenants/${id}/`,
    UPDATE: (id) => `${API_BASE}/preferences/tenants/${id}/`,
    
    // Current Tenant
    MY_TENANT_PREFERENCES: `${API_BASE}/preferences/tenants/my-tenant/`,
    UPDATE_BRANDING: `${API_BASE}/preferences/tenants/my-tenant/branding/`,
    
    // Query Params
    QUERY_PARAMS: {
        CLIENT_ID: 'client_id',
    },
};

// ============================================
// 12. ADMIN ENDPOINTS
// ============================================

export const ADMIN_ENDPOINTS = {
    // Users
    USERS: `${API_BASE}/admin/users/`,
    USER_DETAIL: (id) => `${API_BASE}/admin/users/${id}/`,
    USER_IMPERSONATE: (id) => `${API_BASE}/admin/users/${id}/impersonate/`,
    USER_FORCE_PASSWORD_RESET: (id) => `${API_BASE}/admin/users/${id}/force-password-reset/`,
    USER_VERIFY: (id) => `${API_BASE}/admin/users/${id}/verify/`,
    USER_STATS: `${API_BASE}/admin/users/stats/`,
    USER_MAP_TO_ORGANIZATION: (id) => `${API_BASE}/admin/users/${id}/map-to-organization/`,
    
    // Roles
    ROLES: `${API_BASE}/admin/roles/`,
    ROLE_DETAIL: (id) => `${API_BASE}/admin/roles/${id}/`,
    INIT_SYSTEM_ROLES: `${API_BASE}/admin/roles/init-system-roles/`,
    
    // Permissions
    PERMISSIONS: `${API_BASE}/admin/permissions/`,
    PERMISSION_DETAIL: (id) => `${API_BASE}/admin/permissions/${id}/`,
    INIT_PERMISSIONS: `${API_BASE}/admin/permissions/init-permissions/`,
    
    // Tenants
    TENANTS: `${API_BASE}/admin/tenants/`,
    TENANT_DETAIL: (id) => `${API_BASE}/admin/tenants/${id}/`,
    TENANT_CREATE_WITH_ADMIN: `${API_BASE}/admin/tenants/create-with-admin/`,
    TENANT_SUSPEND: (id) => `${API_BASE}/admin/tenants/${id}/suspend/`,
    TENANT_ACTIVATE: (id) => `${API_BASE}/admin/tenants/${id}/activate/`,
    TENANT_STATS: `${API_BASE}/admin/tenants/stats/`,
    TENANT_MAP_USER: (id) => `${API_BASE}/admin/tenants/${id}/map-user/`,
    
    // System
    SYSTEM: `${API_BASE}/admin/system/`,
    SYSTEM_CLEAR_CACHE: `${API_BASE}/admin/system/clear-cache/`,
    SYSTEM_HEALTH: `${API_BASE}/admin/system/health/`,
    SYSTEM_CONFIG: `${API_BASE}/admin/system/config/`,
    CLEAR_USER_CACHE: `${API_BASE}/admin/system/clear-user-cache/`,
    CLEAR_TENANT_CACHE: `${API_BASE}/admin/system/clear-tenant-cache/`,
};

// ============================================
// 13. ADMIN MFA ENDPOINTS
// ============================================

export const ADMIN_MFA_ENDPOINTS = {
    RESET: (userId) => `${API_BASE}/admin/mfa/reset/${userId}/`,
    CLEAR_DEVICES: (userId) => `${API_BASE}/admin/mfa/devices/${userId}/`,
    CLEAR_DEVICE: (userId, deviceId) => `${API_BASE}/admin/mfa/devices/${userId}/${deviceId}/`,
    STATUS: (userId) => `${API_BASE}/admin/mfa/status/${userId}/`,
};

// ============================================
// 14. SYSTEM SETTINGS ENDPOINTS
// ============================================

export const SYSTEM_SETTINGS_ENDPOINTS = {
    GET: `${API_BASE}/system-settings/`,
    UPDATE: `${API_BASE}/system-settings/`,
    RESET: `${API_BASE}/system-settings/reset/`,
    SYNC_POLICY: `${API_BASE}/system-settings/sync-policy/`,
};

// ============================================
// 15. SECURITY ENDPOINTS
// ============================================

export const SECURITY_ENDPOINTS = {
    // Login Attempts
    LOGIN_ATTEMPTS: `${API_BASE}/security/login-attempts/`,
    LOGIN_ATTEMPT_DETAIL: (id) => `${API_BASE}/security/login-attempts/${id}/`,
    
    // Policy
    TENANT_POLICY: `${API_BASE}/security/policy/`,
    LOCKOUT_SUMMARY: `${API_BASE}/security/lockout-summary/`,
    
    // MFA Policy
    TENANT_MFA_POLICY: `${API_BASE}/security/mfa/policy/`,
    USER_MFA_POLICY_LIST: `${API_BASE}/security/mfa/users/`,
    USER_MFA_POLICY_DETAIL: (userId) => `${API_BASE}/security/mfa/users/${userId}/`,
    USER_MFA_STATUS: (userId) => `${API_BASE}/security/mfa/users/${userId}/status/`,
    
    // Query Params
    QUERY_PARAMS: {
        HOURS: 'hours',
        SYNC: 'sync',
        RESULT: 'result',
        FAILURE_REASON: 'failure_reason',
        IDENTIFIER: 'identifier',
        IP_ADDRESS: 'ip_address',
    },
};

// ============================================
// 16. USER NESTED ENDPOINTS (via router)
// ============================================

export const USER_NESTED_ENDPOINTS = {
    PROFILE: (userId) => `${API_BASE}/users/${userId}/profile/`,
    PROFILE_DETAIL: (userId, profileId) => `${API_BASE}/users/${userId}/profile/${profileId}/`,
    
    SESSIONS: (userId) => `${API_BASE}/users/${userId}/sessions/`,
    SESSION_DETAIL: (userId, sessionId) => `${API_BASE}/users/${userId}/sessions/${sessionId}/`,
    
    MFA_DEVICES: (userId) => `${API_BASE}/users/${userId}/mfa-devices/`,
    MFA_DEVICE_DETAIL: (userId, deviceId) => `${API_BASE}/users/${userId}/mfa-devices/${deviceId}/`,
    
    PREFERENCES: (userId) => `${API_BASE}/users/${userId}/preferences/`,
    PREFERENCE_DETAIL: (userId, prefId) => `${API_BASE}/users/${userId}/preferences/${prefId}/`,
};

// ============================================
// 17. WEBSOCKET ENDPOINTS
// ============================================

export const ACCOUNTS_WS = {
    USER: (userId) => `${WS_BASE}/accounts/user/${userId}/`,
    TENANT: (tenantId) => `${WS_BASE}/accounts/tenant/${tenantId}/`,
    SESSION: (sessionId) => `${WS_BASE}/accounts/session/${sessionId}/`,
    AUDIT: (tenantId) => `${WS_BASE}/accounts/audit/${tenantId}/`,
    SECURITY: (tenantId) => `${WS_BASE}/accounts/security/${tenantId}/`,
    MFA: (userId) => `${WS_BASE}/accounts/mfa/${userId}/`,
    ADMIN: `${WS_BASE}/accounts/admin/`,
};

// ============================================
// 18. QUERY KEYS (for TanStack Query)
// ============================================

export const ACCOUNTS_QUERY_KEYS = {
    // Auth
    CURRENT_USER: 'current-user',
    SESSION_INFO: 'session-info',
    MFA_STATUS: 'mfa-status',
    
    // Users
    USERS: 'users',
    USER: 'user',
    USER_TEAM: 'user-team',
    REPORTING_CHAIN: 'reporting-chain',
    MY_TEAM: 'my-team',
    MY_REPORTING_CHAIN: 'my-reporting-chain',
    INVITATIONS: 'invitations',
    
    // Profiles
    PROFILES: 'profiles',
    PROFILE: 'profile',
    MY_PROFILE: 'my-profile',
    SKILLS: 'skills',
    CERTIFICATIONS: 'certifications',
    
    // MFA
    MFA_DEVICES: 'mfa-devices',
    MFA_DEVICE: 'mfa-device',
    BACKUP_CODES_STATUS: 'backup-codes-status',
    MFA_AUDIT_LOGS: 'mfa-audit-logs',
    MFA_ACTIVITY: 'mfa-activity',
    MFA_FAILURE_RATE: 'mfa-failure-rate',
    
    // Roles & Permissions
    ROLES: 'roles',
    ROLE: 'role',
    SYSTEM_ROLES: 'system-roles',
    ASSIGNABLE_ROLES: 'assignable-roles',
    PERMISSIONS: 'permissions',
    ROLE_PERMISSIONS: 'role-permissions',
    
    // Sessions
    SESSIONS: 'sessions',
    SESSION: 'session',
    ACTIVE_SESSIONS: 'active-sessions',
    CURRENT_SESSION: 'current-session',
    TENANT_ACTIVE_SESSIONS: 'tenant-active-sessions',
    
    // Audit
    AUDIT_LOGS: 'audit-logs',
    AUDIT_LOG: 'audit-log',
    USER_ACTIVITY: 'user-activity',
    USER_ACTIVITY_SUMMARY: 'user-activity-summary',
    TENANT_ACTIVITY: 'tenant-activity',
    SECURITY_EVENTS: 'security-events',
    ANOMALY_DETECTION: 'anomaly-detection',
    COMPLIANCE_REPORT: 'compliance-report',
    OBJECT_HISTORY: 'object-history',
    
    // Preferences
    USER_PREFERENCES: 'user-preferences',
    TENANT_PREFERENCES: 'tenant-preferences',
    
    // Admin
    ADMIN_USERS: 'admin-users',
    ADMIN_USER: 'admin-user',
    ADMIN_USER_STATS: 'admin-user-stats',
    ADMIN_ROLES: 'admin-roles',
    ADMIN_ROLE: 'admin-role',
    ADMIN_PERMISSIONS: 'admin-permissions',
    ADMIN_TENANTS: 'admin-tenants',
    ADMIN_TENANT: 'admin-tenant',
    ADMIN_TENANT_STATS: 'admin-tenant-stats',
    ADMIN_SYSTEM: 'admin-system',
    ADMIN_SYSTEM_HEALTH: 'admin-system-health',
    ADMIN_MFA_STATUS: 'admin-mfa-status',
    
    // Security
    LOGIN_ATTEMPTS: 'login-attempts',
    TENANT_POLICY: 'tenant-policy',
    LOCKOUT_SUMMARY: 'lockout-summary',
    TENANT_MFA_POLICY: 'tenant-mfa-policy',
    USER_MFA_POLICY: 'user-mfa-policy',
    USER_MFA_STATUS: 'user-mfa-status',
    
    // System Settings
    SYSTEM_SETTINGS: 'system-settings',
    
    // Policy
    MFA_POLICY: 'mfa-policy',
    SESSION_POLICY: 'session-policy',
    LOCKOUT_POLICY: 'lockout-policy',
    PASSWORD_POLICY: 'password-policy',
};

// ============================================
// 19. MUTATION KEYS (for TanStack Query)
// ============================================

export const ACCOUNTS_MUTATION_KEYS = {
    // Auth
    LOGIN: 'login',
    LOGOUT: 'logout',
    REFRESH_TOKEN: 'refresh-token',
    MFA_VERIFY: 'mfa-verify',
    MFA_SETUP: 'mfa-setup',
    CHANGE_PASSWORD: 'change-password',
    RESET_PASSWORD: 'reset-password',
    CONFIRM_RESET: 'confirm-reset',
    STEP_UP_VERIFY: 'step-up-verify',
    
    // Users
    CREATE_USER: 'create-user',
    UPDATE_USER: 'update-user',
    DELETE_USER: 'delete-user',
    ACTIVATE_USER: 'activate-user',
    DEACTIVATE_USER: 'deactivate-user',
    UNLOCK_USER: 'unlock-user',
    ASSIGN_ROLE: 'assign-role',
    SEND_INVITATION: 'send-invitation',
    ACCEPT_INVITATION: 'accept-invitation',
    
    // Profiles
    UPDATE_PROFILE: 'update-profile',
    UPLOAD_AVATAR: 'upload-avatar',
    DELETE_AVATAR: 'delete-avatar',
    ADD_SKILL: 'add-skill',
    UPDATE_SKILL: 'update-skill',
    REMOVE_SKILL: 'remove-skill',
    ADD_CERTIFICATION: 'add-certification',
    REMOVE_CERTIFICATION: 'remove-certification',
    
    // MFA
    SETUP_TOTP: 'setup-totp',
    VERIFY_TOTP_SETUP: 'verify-totp-setup',
    VERIFY_DEVICE: 'verify-device',
    VERIFY_BACKUP: 'verify-backup',
    GENERATE_BACKUP_CODES: 'generate-backup-codes',
    SET_PRIMARY_DEVICE: 'set-primary-device',
    DISABLE_MFA: 'disable-mfa',
    DELETE_MFA_DEVICE: 'delete-mfa-device',
    
    // Roles & Permissions
    CREATE_ROLE: 'create-role',
    UPDATE_ROLE: 'update-role',
    DELETE_ROLE: 'delete-role',
    ASSIGN_PERMISSIONS: 'assign-permissions',
    INIT_SYSTEM_ROLES: 'init-system-roles',
    INIT_PERMISSIONS: 'init-permissions',
    
    // Sessions
    TERMINATE_SESSION: 'terminate-session',
    TERMINATE_ALL_SESSIONS: 'terminate-all-sessions',
    
    // Preferences
    UPDATE_USER_PREFERENCES: 'update-user-preferences',
    UPDATE_NOTIFICATIONS: 'update-notifications',
    UPDATE_TENANT_PREFERENCES: 'update-tenant-preferences',
    UPDATE_BRANDING: 'update-branding',
    
    // Admin
    IMPERSONATE_USER: 'impersonate-user',
    FORCE_PASSWORD_RESET: 'force-password-reset',
    CREATE_TENANT_WITH_ADMIN: 'create-tenant-with-admin',
    SUSPEND_TENANT: 'suspend-tenant',
    ACTIVATE_TENANT: 'activate-tenant',
    CLEAR_CACHE: 'clear-cache',
    ADMIN_MFA_RESET: 'admin-mfa-reset',
    ADMIN_MFA_CLEAR_DEVICES: 'admin-mfa-clear-devices',
    
    // Security
    UPDATE_TENANT_MFA_POLICY: 'update-tenant-mfa-policy',
    UPDATE_USER_MFA_POLICY: 'update-user-mfa-policy',
    CLEAR_USER_MFA_OVERRIDE: 'clear-user-mfa-override',
    
    // System Settings
    UPDATE_SYSTEM_SETTINGS: 'update-system-settings',
    RESET_SYSTEM_SETTINGS: 'reset-system-settings',
    SYNC_POLICY: 'sync-policy',
};

// ============================================
// 20. ACCOUNTS ERROR CODES
// ============================================

export const ACCOUNTS_ERROR_CODES = {
    // Auth Errors
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
    MFA_REQUIRED: 'MFA_REQUIRED',
    MFA_INVALID: 'MFA_INVALID',
    MFA_EXPIRED: 'MFA_EXPIRED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    
    // User Errors
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
    CANNOT_DELETE_OWN_ACCOUNT: 'CANNOT_DELETE_OWN_ACCOUNT',
    CANNOT_DEACTIVATE_SELF: 'CANNOT_DEACTIVATE_SELF',
    
    // MFA Errors
    MFA_DEVICE_NOT_FOUND: 'MFA_DEVICE_NOT_FOUND',
    MFA_DEVICE_LOCKED: 'MFA_DEVICE_LOCKED',
    MFA_BACKUP_CODE_USED: 'MFA_BACKUP_CODE_USED',
    MFA_BACKUP_CODE_EXPIRED: 'MFA_BACKUP_CODE_EXPIRED',
    MFA_BACKUP_CODE_INVALID: 'MFA_BACKUP_CODE_INVALID',
    MFA_SETUP_INCOMPLETE: 'MFA_SETUP_INCOMPLETE',
    MFA_ALREADY_ENABLED: 'MFA_ALREADY_ENABLED',
    
    // Permission Errors
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
    CANNOT_ASSIGN_ROLE: 'CANNOT_ASSIGN_ROLE',
    CANNOT_MODIFY_SYSTEM_ROLE: 'CANNOT_MODIFY_SYSTEM_ROLE',
    
    // Tenant Errors
    TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
    TENANT_INACTIVE: 'TENANT_INACTIVE',
    TENANT_ACCESS_DENIED: 'TENANT_ACCESS_DENIED',
    TENANT_QUOTA_EXCEEDED: 'TENANT_QUOTA_EXCEEDED',
    
    // Rate Limit Errors
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    LOGIN_RATE_LIMIT: 'LOGIN_RATE_LIMIT',
    MFA_RATE_LIMIT: 'MFA_RATE_LIMIT',
    
    // Invitation Errors
    INVITATION_INVALID: 'INVITATION_INVALID',
    INVITATION_EXPIRED: 'INVITATION_EXPIRED',
    INVITATION_ALREADY_USED: 'INVITATION_ALREADY_USED',
    
    // Validation Errors
    PASSWORD_WEAK: 'PASSWORD_WEAK',
    PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
    PASSWORD_REUSED: 'PASSWORD_REUSED',
    EMAIL_INVALID: 'EMAIL_INVALID',
    USERNAME_INVALID: 'USERNAME_INVALID',
    
    // Session Errors
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    SESSION_TERMINATED: 'SESSION_TERMINATED',
    MAX_SESSIONS_EXCEEDED: 'MAX_SESSIONS_EXCEEDED',
    
    // Audit Errors
    AUDIT_EXPORT_FAILED: 'AUDIT_EXPORT_FAILED',
    AUDIT_DATE_RANGE_INVALID: 'AUDIT_DATE_RANGE_INVALID',
    
    // System Errors
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR: 'DATABASE_ERROR',
    CACHE_ERROR: 'CACHE_ERROR',
};

// ============================================
// 21. API STATUS & HTTP CONSTANTS
// ============================================

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
    IDLE: 'idle',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

// ============================================
// 22. AUTHENTICATION CONSTANTS
// ============================================

export const AUTH_CONSTANTS = {
    TOKEN_REFRESH_THRESHOLD: Number(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000, // 5 minutes
    SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 28800000, // 8 hours
    MFA_ENABLED: import.meta.env.VITE_ENABLE_MFA === 'true',
    SSO_ENABLED: import.meta.env.VITE_ENABLE_SSO === 'true',
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    TENANT_ID: 'tenant_id',
    USER: 'user',
    SESSION_ID: 'session_id',
    MFA_PENDING: 'mfa_pending',
    MFA_TOKEN: 'mfa_token',
};

// ============================================
// 23. ROLE CONSTANTS (from backend)
// ============================================

export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    EXECUTIVE: 'executive',
    SUPERVISOR: 'supervisor',
    STAFF: 'staff',
    READ_ONLY: 'read_only',
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
    [USER_ROLES.CLIENT_ADMIN]: 'Client Admin',
    [USER_ROLES.EXECUTIVE]: 'Executive',
    [USER_ROLES.SUPERVISOR]: 'Supervisor',
    [USER_ROLES.STAFF]: 'Staff',
    [USER_ROLES.READ_ONLY]: 'Read Only',
};

export const USER_ROLE_COLORS = {
    [USER_ROLES.SUPER_ADMIN]: 'purple',
    [USER_ROLES.CLIENT_ADMIN]: 'blue',
    [USER_ROLES.EXECUTIVE]: 'green',
    [USER_ROLES.SUPERVISOR]: 'orange',
    [USER_ROLES.STAFF]: 'gray',
    [USER_ROLES.READ_ONLY]: 'slate',
};

// ============================================
// 24. MFA CONSTANTS
// ============================================

export const MFA_DEVICE_TYPES = {
    TOTP: 'totp',
    SMS: 'sms',
    EMAIL: 'email',
    HARDWARE: 'hardware',
};

export const MFA_DEVICE_TYPE_LABELS = {
    [MFA_DEVICE_TYPES.TOTP]: 'Authenticator App',
    [MFA_DEVICE_TYPES.SMS]: 'SMS',
    [MFA_DEVICE_TYPES.EMAIL]: 'Email',
    [MFA_DEVICE_TYPES.HARDWARE]: 'Hardware Token',
};

export const MFA_EVENT_TYPES = {
    ENROLL: 'enroll',
    VERIFY: 'verify',
    DISABLE: 'disable',
    RECOVERY: 'recovery',
    FAILED_RECOVERY: 'failed_recovery',
    STEP_UP: 'step_up',
    STEP_UP_FAILED: 'step_up_failed',
};

// ============================================
// 25. AUDIT CONSTANTS
// ============================================

export const AUDIT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical',
};

export const AUDIT_SEVERITY_COLORS = {
    [AUDIT_SEVERITY.INFO]: 'blue',
    [AUDIT_SEVERITY.WARNING]: 'yellow',
    [AUDIT_SEVERITY.ERROR]: 'red',
    [AUDIT_SEVERITY.CRITICAL]: 'darkred',
};

export const AUDIT_ACTION_TYPES = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    SECURITY: 'security',
};

// ============================================
// 26. SESSION CONSTANTS
// ============================================

export const SESSION_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
};

export const SESSION_STATUS_LABELS = {
    [SESSION_STATUS.ACTIVE]: 'Active',
    [SESSION_STATUS.EXPIRED]: 'Expired',
    [SESSION_STATUS.REVOKED]: 'Revoked',
};

export const SESSION_STATUS_COLORS = {
    [SESSION_STATUS.ACTIVE]: 'green',
    [SESSION_STATUS.EXPIRED]: 'gray',
    [SESSION_STATUS.REVOKED]: 'red',
};

export const REPORTS_ENDPOINTS = {
    USER_DIRECTORY: `${API_BASE}/reports/user-directory/`,
    ROLE_DISTRIBUTION: `${API_BASE}/reports/role-distribution/`,
    DEPARTMENT_DISTRIBUTION: `${API_BASE}/reports/department-distribution/`,
    INACTIVE_USERS: `${API_BASE}/reports/inactive-users/`,
    RECENTLY_ADDED: `${API_BASE}/reports/recently-added/`,
    ACTIVITY_SUMMARY: `${API_BASE}/reports/activity-summary/`,
    AUDIT_TRAIL: `${API_BASE}/reports/audit-trail/`,
    LOGIN_ACTIVITY: `${API_BASE}/reports/login-activity/`,
    PASSWORD_CHANGES: `${API_BASE}/reports/password-changes/`,
    ROLE_CHANGES: `${API_BASE}/reports/role-changes/`,
    SUSPENSION_LOG: `${API_BASE}/reports/suspension-log/`,
    COMPLIANCE_SUMMARY: `${API_BASE}/reports/compliance-summary/`,
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    ACCOUNTS_API_BASE,
    API_VERSION,
    ACCOUNTS_API_PREFIX,
    
    AUTH_ENDPOINTS,
    USER_ENDPOINTS,
    PROFILE_ENDPOINTS,
    MFA_DEVICE_ENDPOINTS,
    MFA_AUDIT_LOG_ENDPOINTS,
    ROLE_ENDPOINTS,
    PERMISSION_ENDPOINTS,
    SESSION_ENDPOINTS,
    AUDIT_LOG_ENDPOINTS,
    USER_PREFERENCE_ENDPOINTS,
    TENANT_PREFERENCE_ENDPOINTS,
    ADMIN_ENDPOINTS,
    ADMIN_MFA_ENDPOINTS,
    SYSTEM_SETTINGS_ENDPOINTS,
    SECURITY_ENDPOINTS,
    USER_NESTED_ENDPOINTS,
    ACCOUNTS_WS,
    REPORTS_ENDPOINTS,
    
    ACCOUNTS_QUERY_KEYS,
    ACCOUNTS_MUTATION_KEYS,
    ACCOUNTS_ERROR_CODES,
    
    API_STATUS,
    HTTP_STATUS,
    AUTH_CONSTANTS,
    STORAGE_KEYS,
    
    USER_ROLES,
    USER_ROLE_LABELS,
    USER_ROLE_COLORS,
    
    MFA_DEVICE_TYPES,
    MFA_DEVICE_TYPE_LABELS,
    MFA_EVENT_TYPES,
    
    AUDIT_SEVERITY,
    AUDIT_SEVERITY_COLORS,
    AUDIT_ACTION_TYPES,
    
    SESSION_STATUS,
    SESSION_STATUS_LABELS,
    SESSION_STATUS_COLORS,
};