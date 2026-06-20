const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const ACCOUNTS_ADMIN_API = {
    // Base
    BASE: `${API_BASE}/`,

    // System Settings
    SYSTEM_SETTINGS: `${API_BASE}/system-settings/`,
    SYSTEM_SETTINGS_RESET: `${API_BASE}/system-settings/reset/`,
    SYSTEM_SETTINGS_SYNC: `${API_BASE}/system-settings/sync-policy/`,

    // MFA Policy - Tenant Level
    TENANT_MFA_POLICY: `${API_BASE}/security/mfa/policy/`,

    // MFA Policy - User Level
    USER_MFA_POLICY_LIST: `${API_BASE}/security/mfa/users/`,
    USER_MFA_POLICY_DETAIL: (userId) => `${API_BASE}/security/mfa/users/${userId}/`,
    USER_MFA_STATUS: (userId) => `${API_BASE}/security/mfa/users/${userId}/status/`,

    // Admin MFA Reset
    ADMIN_MFA_RESET: (userId) => `${API_BASE}/admin/mfa/reset/${userId}/`,
    ADMIN_MFA_DEVICES_CLEAR: (userId) => `${API_BFA}/admin/mfa/devices/${userId}/`,
    ADMIN_MFA_DEVICE_CLEAR: (userId, deviceId) => `${API_BASE}/admin/mfa/devices/${userId}/${deviceId}/`,
    ADMIN_MFA_STATUS: (userId) => `${API_BASE}/admin/mfa/status/${userId}/`,

    // Step-Up Authentication
    STEP_UP_VERIFY: `${API_BASE}/auth/step-up/verify/`,
};

export const ACCOUNTS_ADMIN_QUERY_KEYS = {
    SYSTEM_SETTINGS: 'system-settings',
    TENANT_MFA_POLICY: 'tenant-mfa-policy',
    USER_MFA_POLICY: 'user-mfa-policy',
    USER_MFA_STATUS: 'user-mfa-status',
    ADMIN_MFA_STATUS: 'admin-mfa-status',
    MFA_POLICY_USERS: 'mfa-policy-users',
};

export const ACCOUNTS_ADMIN_MUTATION_KEYS = {
    UPDATE_SYSTEM_SETTINGS: 'update-system-settings',
    RESET_SYSTEM_SETTINGS: 'reset-system-settings',
    SYNC_POLICY: 'sync-policy',
    UPDATE_TENANT_MFA_POLICY: 'update-tenant-mfa-policy',
    UPDATE_USER_MFA_OVERRIDE: 'update-user-mfa-override',
    CLEAR_USER_MFA_OVERRIDE: 'clear-user-mfa-override',
    RESET_USER_MFA: 'reset-user-mfa',
    CLEAR_USER_DEVICES: 'clear-user-devices',
    VERIFY_STEP_UP: 'verify-step-up',
};