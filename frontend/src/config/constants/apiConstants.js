// API Base Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================
export const AUTH_API = {
    LOGIN: `${API_BASE}/auth/login/`,
    LOGOUT: `${API_BASE}/auth/logout/`,
    REFRESH: `${API_BASE}/auth/refresh/`,
    ME: `${API_BASE}/auth/me/`,
    CHANGE_PASSWORD: `${API_BASE}/auth/me/change-password/`,
    INVITATIONS: `${API_BASE}/auth/invitations/`,
    ACCEPT_INVITATION: `${API_BASE}/auth/invitation/accept/`,
    STEP_UP_VERIFY: `${API_BASE}/auth/step-up/verify/`,
};

// ============================================================
// MFA (Multi-Factor Authentication) ENDPOINTS
// Based on actual backend from show_urls:
// - /api/v1/mfa/devices/
// - /api/v1/mfa/devices/setup-totp/
// - /api/v1/mfa/devices/verify-totp-setup/
// - /api/v1/mfa/devices/verify-backup/
// - /api/v1/mfa/devices/generate-backup-codes/
// - /api/v1/mfa/devices/backup-codes-status/
// - /api/v1/mfa/devices/status/
// - /api/v1/mfa/devices/activity/
// - /api/v1/mfa/devices/failure-rate/
// - /api/v1/mfa/devices/disable/
// - /api/v1/mfa/devices/<pk>/verify/
// - /api/v1/mfa/devices/<pk>/set-primary/
// ============================================================
export const MFA_API = {
    // Device Management
    DEVICES: `${API_BASE}/mfa/devices/`,
    DEVICE_DETAIL: (deviceId) => `${API_BASE}/mfa/devices/${deviceId}/`,
    SETUP_TOTP: `${API_BASE}/mfa/devices/setup-totp/`,
    VERIFY_TOTP_SETUP: `${API_BASE}/mfa/devices/verify-totp-setup/`,
    VERIFY_DEVICE: (deviceId) => `${API_BASE}/mfa/devices/${deviceId}/verify/`,
    VERIFY_BACKUP: `${API_BASE}/mfa/devices/verify-backup/`,
    SET_PRIMARY: (deviceId) => `${API_BASE}/mfa/devices/${deviceId}/set-primary/`,
    GENERATE_BACKUP_CODES: `${API_BASE}/mfa/devices/generate-backup-codes/`,
    BACKUP_CODES_STATUS: `${API_BASE}/mfa/devices/backup-codes-status/`,
    STATUS: `${API_BASE}/mfa/devices/status/`,
    ACTIVITY: `${API_BASE}/mfa/devices/activity/`,
    FAILURE_RATE: `${API_BASE}/mfa/devices/failure-rate/`,
    DISABLE: `${API_BASE}/mfa/devices/disable/`,
    
    // Audit Logs
    AUDIT_LOGS: `${API_BASE}/mfa/audit-logs/`,
    AUDIT_LOG_DETAIL: (logId) => `${API_BASE}/mfa/audit-logs/${logId}/`,
    AUDIT_LOG_SUMMARY: `${API_BASE}/mfa/audit-logs/summary/`,
};

// ============================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================
export const USER_API = {
    // CRUD Operations
    LIST: `${API_BASE}/users/`,
    DETAIL: (userId) => `${API_BASE}/users/${userId}/`,
    CREATE: `${API_BASE}/users/`,
    UPDATE: (userId) => `${API_BASE}/users/${userId}/`,
    DELETE: (userId) => `${API_BASE}/users/${userId}/`,
    
    // Current User
    ME: `${API_BASE}/users/me/`,
    MY_TEAM: `${API_BASE}/users/me/team/`,
    MY_REPORTING_CHAIN: `${API_BASE}/users/me/reporting-chain/`,
    
    // User Actions
    ACTIVATE: (userId) => `${API_BASE}/users/${userId}/activate/`,
    DEACTIVATE: (userId) => `${API_BASE}/users/${userId}/deactivate/`,
    UNLOCK: (userId) => `${API_BASE}/users/${userId}/unlock/`,
    ASSIGN_ROLE: (userId) => `${API_BASE}/users/${userId}/assign-role/`,
    CHANGE_PASSWORD: (userId) => `${API_BASE}/users/${userId}/change-password/`,
    
    // Team & Hierarchy
    TEAM: (userId) => `${API_BASE}/users/${userId}/team/`,
    REPORTING_CHAIN: (userId) => `${API_BASE}/users/${userId}/reporting-chain/`,
    
    // Invitations
    INVITE: `${API_BASE}/users/invite/`,
    
    // User MFA (Admin nested)
    USER_MFA_DEVICES: (userId) => `${API_BASE}/users/${userId}/mfa-devices/`,
    USER_MFA_SETUP_TOTP: (userId) => `${API_BASE}/users/${userId}/mfa-devices/setup-totp/`,
    USER_MFA_VERIFY_TOTP: (userId) => `${API_BASE}/users/${userId}/mfa-devices/verify-totp-setup/`,
    USER_MFA_DISABLE: (userId) => `${API_BASE}/users/${userId}/mfa-devices/disable/`,
    USER_MFA_STATUS: (userId) => `${API_BASE}/users/${userId}/mfa-devices/status/`,
    USER_MFA_ACTIVITY: (userId) => `${API_BASE}/users/${userId}/mfa-devices/activity/`,
    USER_MFA_BACKUP_STATUS: (userId) => `${API_BASE}/users/${userId}/mfa-devices/backup-codes-status/`,
    USER_MFA_GENERATE_BACKUP: (userId) => `${API_BASE}/users/${userId}/mfa-devices/generate-backup-codes/`,
    
    // User Preferences (nested)
    USER_PREFERENCES: (userId) => `${API_BASE}/users/${userId}/preferences/`,
    USER_PREFERENCE_DETAIL: (userId, prefId) => `${API_BASE}/users/${userId}/preferences/${prefId}/`,
    MY_PREFERENCES: `${API_BASE}/preferences/users/my/`,
    
    // User Profile (nested)
    USER_PROFILE: (userId) => `${API_BASE}/users/${userId}/profile/`,
    USER_PROFILE_DETAIL: (userId, profileId) => `${API_BASE}/users/${userId}/profile/${profileId}/`,
    MY_PROFILE: `${API_BASE}/profiles/my/`,
    
    // User Sessions (nested)
    USER_SESSIONS: (userId) => `${API_BASE}/users/${userId}/sessions/`,
    USER_SESSION_DETAIL: (userId, sessionId) => `${API_BASE}/users/${userId}/sessions/${sessionId}/`,
    USER_SESSION_TERMINATE: (userId, sessionId) => `${API_BASE}/users/${userId}/sessions/${sessionId}/terminate/`,
    USER_SESSIONS_TERMINATE_ALL: (userId) => `${API_BASE}/users/${userId}/sessions/terminate-all/`,
};

// ============================================================
// ROLES & PERMISSIONS ENDPOINTS
// ============================================================
export const ROLE_API = {
    LIST: `${API_BASE}/roles/`,
    DETAIL: (roleId) => `${API_BASE}/roles/${roleId}/`,
    SYSTEM: `${API_BASE}/roles/system/`,
    ASSIGNABLE: `${API_BASE}/roles/assignable/`,
    PERMISSIONS: (roleId) => `${API_BASE}/roles/${roleId}/permissions/`,
    ASSIGN_PERMISSIONS: (roleId) => `${API_BASE}/roles/${roleId}/permissions/`,
};

export const PERMISSION_API = {
    LIST: `${API_BASE}/permissions/`,
    DETAIL: (permId) => `${API_BASE}/permissions/${permId}/`,
    BY_CATEGORY: (category) => `${API_BASE}/permissions/by-category/${category}/`,
    BY_LEVEL: (level) => `${API_BASE}/permissions/by-level/${level}/`,
};

// ============================================================
// SESSION ENDPOINTS
// ============================================================
export const SESSION_API = {
    LIST: `${API_BASE}/sessions/`,
    DETAIL: (sessionId) => `${API_BASE}/sessions/${sessionId}/`,
    ACTIVE: `${API_BASE}/sessions/active/`,
    CURRENT: `${API_BASE}/sessions/current/`,
    TENANT_ACTIVE: `${API_BASE}/sessions/tenant-active/`,
    TERMINATE_ALL: `${API_BASE}/sessions/terminate-all/`,
    TERMINATE: (sessionId) => `${API_BASE}/sessions/${sessionId}/terminate/`,
};

// ============================================================
// AUDIT LOG ENDPOINTS
// ============================================================
export const AUDIT_API = {
    LIST: `${API_BASE}/audit-logs/`,
    DETAIL: (logId) => `${API_BASE}/audit-logs/${logId}/`,
    USER_SUMMARY: `${API_BASE}/audit-logs/user-summary/`,
    TENANT_SUMMARY: `${API_BASE}/audit-logs/tenant-summary/`,
    SECURITY_EVENTS: `${API_BASE}/audit-logs/security-events/`,
    ANOMALY_DETECTION: `${API_BASE}/audit-logs/anomaly-detection/`,
    COMPLIANCE_REPORT: `${API_BASE}/audit-logs/compliance-report/`,
    EXPORT: `${API_BASE}/audit-logs/export/`,
    OBJECT_HISTORY: `${API_BASE}/audit-logs/object-history/`,
    USER_ACTIVITY: (userId) => `${API_BASE}/audit-logs/user/${userId}/`,
};

// ============================================================
// PROFILE ENDPOINTS
// ============================================================
export const PROFILE_API = {
    LIST: `${API_BASE}/profiles/`,
    DETAIL: (profileId) => `${API_BASE}/profiles/${profileId}/`,
    MY: `${API_BASE}/profiles/my/`,
    MY_SKILLS_SUMMARY: `${API_BASE}/profiles/my/skills-summary/`,
    MY_CERTIFICATIONS_SUMMARY: `${API_BASE}/profiles/my/certifications-summary/`,
    ADD_SKILL: (profileId) => `${API_BASE}/profiles/${profileId}/skills/`,
    UPDATE_SKILL: (profileId, skillName) => `${API_BASE}/profiles/${profileId}/skills/${skillName}/`,
    REMOVE_SKILL: (profileId, skillName) => `${API_BASE}/profiles/${profileId}/skills/${skillName}/`,
    ADD_CERTIFICATION: (profileId) => `${API_BASE}/profiles/${profileId}/certifications/`,
    REMOVE_CERTIFICATION: (profileId, certName) => `${API_BASE}/profiles/${profileId}/certifications/${certName}/`,
    UPLOAD_AVATAR: (profileId) => `${API_BASE}/profiles/${profileId}/avatar/`,
    DELETE_AVATAR: (profileId) => `${API_BASE}/profiles/${profileId}/avatar/`,
};

// ============================================================
// PREFERENCES ENDPOINTS
// ============================================================
export const PREFERENCE_API = {
    // User Preferences
    USER_LIST: `${API_BASE}/preferences/users/`,
    USER_DETAIL: (prefId) => `${API_BASE}/preferences/users/${prefId}/`,
    USER_MY: `${API_BASE}/preferences/users/my/`,
    USER_NOTIFICATIONS: `${API_BASE}/preferences/users/notifications/`,
    
    // Tenant Preferences
    TENANT_LIST: `${API_BASE}/preferences/tenants/`,
    TENANT_DETAIL: (prefId) => `${API_BASE}/preferences/tenants/${prefId}/`,
    TENANT_MY: `${API_BASE}/preferences/tenants/my-tenant/`,
    TENANT_BRANDING: `${API_BASE}/preferences/tenants/my-tenant/branding/`,
};

// ============================================================
// SECURITY ENDPOINTS
// ============================================================
export const SECURITY_API = {
    LOGIN_ATTEMPTS: `${API_BASE}/security/login-attempts/`,
    POLICY: `${API_BASE}/security/policy/`,
    LOCKOUT_SUMMARY: `${API_BASE}/security/lockout-summary/`,
    
    // MFA Policy
    TENANT_MFA_POLICY: `${API_BASE}/security/mfa/policy/`,
    USER_MFA_POLICY_LIST: `${API_BASE}/security/mfa/users/`,
    USER_MFA_POLICY_DETAIL: (userId) => `${API_BASE}/security/mfa/users/${userId}/`,
    USER_MFA_STATUS: (userId) => `${API_BASE}/security/mfa/users/${userId}/status/`,
};

// ============================================================
// SYSTEM SETTINGS ENDPOINTS (Admin)
// ============================================================
export const SYSTEM_API = {
    SETTINGS: `${API_BASE}/system-settings/`,
    RESET: `${API_BASE}/system-settings/reset/`,
    SYNC_POLICY: `${API_BASE}/system-settings/sync-policy/`,
};

// ============================================================
// ADMIN ENDPOINTS
// ============================================================
export const ADMIN_API = {
    USERS: `${API_BASE}/admin/users/`,
    USER_DETAIL: (userId) => `${API_BASE}/admin/users/${userId}/`,
    USER_STATS: `${API_BASE}/admin/users/stats/`,
    USER_FORCE_PASSWORD_RESET: (userId) => `${API_BASE}/admin/users/${userId}/force-password-reset/`,
    USER_IMPERSONATE: (userId) => `${API_BASE}/admin/users/${userId}/impersonate/`,
    
    ROLES: `${API_BASE}/admin/roles/`,
    ROLE_DETAIL: (roleId) => `${API_BASE}/admin/roles/${roleId}/`,
    ROLES_INIT_SYSTEM: `${API_BASE}/admin/roles/init-system-roles/`,
    
    PERMISSIONS: `${API_BASE}/admin/permissions/`,
    PERMISSION_DETAIL: (permId) => `${API_BASE}/admin/permissions/${permId}/`,
    PERMISSIONS_INIT: `${API_BASE}/admin/permissions/init-permissions/`,
    
    TENANTS: `${API_BASE}/admin/tenants/`,
    TENANT_DETAIL: (tenantId) => `${API_BASE}/admin/tenants/${tenantId}/`,
    TENANT_STATS: `${API_BASE}/admin/tenants/stats/`,
    TENANT_SUSPEND: (tenantId) => `${API_BASE}/admin/tenants/${tenantId}/suspend/`,
    TENANT_ACTIVATE: (tenantId) => `${API_BASE}/admin/tenants/${tenantId}/activate/`,
    TENANT_CREATE_WITH_ADMIN: `${API_BASE}/admin/tenants/create-with-admin/`,
    
    SYSTEM: `${API_BASE}/admin/system/`,
    SYSTEM_HEALTH: `${API_BASE}/admin/system/health/`,
    SYSTEM_CLEAR_CACHE: `${API_BASE}/admin/system/clear-cache/`,
    
    // Admin MFA
    ADMIN_MFA_RESET: (userId) => `${API_BASE}/admin/mfa/reset/${userId}/`,
    ADMIN_MFA_DEVICES_CLEAR: (userId) => `${API_BASE}/admin/mfa/devices/${userId}/`,
    ADMIN_MFA_DEVICE_CLEAR: (userId, deviceId) => `${API_BASE}/admin/mfa/devices/${userId}/${deviceId}/`,
    ADMIN_MFA_STATUS: (userId) => `${API_BASE}/admin/mfa/status/${userId}/`,
};

// ============================================================
// HEALTH CHECK
// ============================================================
export const HEALTH_API = {
    CHECK: `${API_BASE}/health/`,
};

// ============================================================
// STORAGE KEYS
// ============================================================
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'falcon_access_token',
    REFRESH_TOKEN: 'falcon_refresh_token',
    SESSION_ID: 'falcon_session_id',
    USER: 'falcon_user',
    TENANT_ID: 'falcon_tenant_id',
    TENANT: 'falcon_tenant',
    THEME: 'falcon_theme',
    MFA_TOKEN: 'falcon_mfa_token',  // Temporary MFA token during verification
    BACKUP_CODES: 'falcon_backup_codes',
};

// ============================================================
// API CONSTANTS (Legacy compatibility - keep for existing code)
// ============================================================
export const API_ENDPOINTS = {
    AUTH: AUTH_API,
    MFA: MFA_API,
    USERS: USER_API,
    ROLES: ROLE_API,
    PERMISSIONS: PERMISSION_API,
    SESSIONS: SESSION_API,
    AUDIT: AUDIT_API,
    PROFILES: PROFILE_API,
    PREFERENCES: PREFERENCE_API,
    SECURITY: SECURITY_API,
    SYSTEM: SYSTEM_API,
    ADMIN: ADMIN_API,
    HEALTH: HEALTH_API,
};

// Export all for convenience
export default {
    API_BASE,
    AUTH_API,
    MFA_API,
    USER_API,
    ROLE_API,
    PERMISSION_API,
    SESSION_API,
    AUDIT_API,
    PROFILE_API,
    PREFERENCE_API,
    SECURITY_API,
    SYSTEM_API,
    ADMIN_API,
    HEALTH_API,
    API_ENDPOINTS,
    STORAGE_KEYS,
};