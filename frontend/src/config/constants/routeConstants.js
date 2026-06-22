/**
 * Accounts Module Route Paths
 * Centralized route definitions for accounts module
 */

export const ROUTES = {
    // ============ Auth Routes ============
    LOGIN: '/login',
    REGISTER: '/register',
    MFA_VERIFY: '/mfa-verify',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    ACCEPT_INVITATION: '/accept-invitation',
    
    // ============ Dashboard ============
    DASHBOARD: '/dashboard',
    
    // ============ User Management ============
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    USER_PROFILE: '/profile',
    
    // ============ Profile ============
    PROFILE: '/profile',
    PROFILE_SETTINGS: '/profile/settings',
    
    // ============ Team ============
    TEAM: '/team',
    TEAM_DETAIL: '/team/:id',
    
    // ============ Roles & Permissions ============
    ROLES: '/roles',
    ROLE_DETAIL: '/roles/:id',
    ROLE_CREATE: '/roles/create',
    ROLE_EDIT: '/roles/:id/edit',
    
    // ============ Sessions ============
    SESSIONS: '/sessions',
    
    // ============ Settings ============
    SETTINGS: '/settings',
    SECURITY: '/security',
    NOTIFICATIONS: '/notifications',
    
    // ============ Audit ============
    AUDIT: '/audit',
    AUDIT_LOGS: '/audit/logs',
    
    // ============ Invitations ============
    INVITATIONS: '/invitations',
    
    // ============ Reports ============
    REPORTS: '/reports',
    
    // ============ MFA - User ============
    MFA_DASHBOARD: '/security/mfa/dashboard',
    MFA_DEVICES: '/security/mfa/devices',
    MFA_SETUP: '/security/mfa/setup',
    MFA_BACKUP_CODES: '/security/mfa/backup-codes',
    MFA_ACTIVITY: '/security/mfa/activity',
    
    // ============ MFA Policy (Admin) ============
    MFA_POLICY_TENANT: '/security/mfa/policy',
    MFA_POLICY_USERS: '/security/mfa/users',
    MFA_USER_STATUS: '/security/mfa/users/:userId/status',
    
    // ============ MFA Admin ============
    ADMIN_MFA_RESET: '/admin/mfa/reset',
    ADMIN_MFA_USERS: '/admin/mfa/users',
    ADMIN_MFA_DEVICES_CLEAR: '/admin/mfa/devices/:userId',
    ADMIN_MFA_STATUS: '/admin/mfa/status/:userId',
    
    // ============ System Settings ============
    SYSTEM_SETTINGS: '/system-settings',
    
    // ============ Admin ============
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_SYSTEM: '/admin/system',
};

// Helper function to build paths with parameters
export const buildPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, encodeURIComponent(value));
    });
    return result;
};

// Extract parameters from URL
export const extractParams = (path, url) => {
    const pathParts = path.split('/');
    const urlParts = url.split('/');
    const params = {};
    
    pathParts.forEach((part, index) => {
        if (part.startsWith(':')) {
            params[part.slice(1)] = decodeURIComponent(urlParts[index]);
        }
    });
    
    return params;
};

// Check if route matches current path
export const routeMatches = (routePath, currentPath) => {
    const routeParts = routePath.split('/');
    const currentParts = currentPath.split('/');
    
    if (routeParts.length !== currentParts.length) return false;
    
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) continue;
        if (routeParts[i] !== currentParts[i]) return false;
    }
    
    return true;
};