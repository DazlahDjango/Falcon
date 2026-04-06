// App Configuration
// ===================
export const APP_NAME = 'Falcon PMS';
export const APP_VERSION = '1.0.0';
export const APP_ENV = process.env.NODE_ENV || 'development';
export const API_URL = process.env.REACT_APP_API_URL || '/api/v1';
export const WS_URL = process.env.REACT_APP_WS_URL || '/ws';

// ============================================================================
// Pagination
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================================================
// Date Formats
// ============================================================================

export const DATE_FORMATS = {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    FULL: 'EEEE, MMMM dd, yyyy',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
    API: 'YYYY-MM-DD'
};

// ============================================================================
// Timeouts
// ============================================================================

export const TOAST_DURATION = 5000;
export const API_TIMEOUT = 30000;
export const DEBOUNCE_DELAY = 500;
export const AUTO_REFRESH_INTERVAL = 30000;
export const SESSION_CHECK_INTERVAL = 60000;

// ============================================================================
// File Upload
// ============================================================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar_state',
    NOTIFICATION_SETTINGS: 'notification_settings',
    LAST_VISITED: 'last_visited',
    PERSIST: 'persist:root'
};

// ============================================================================
// Routes
// ============================================================================

export const ROUTES = {
    // Public Routes
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    ACCEPT_INVITATION: '/accept-invitation',
    MFA_VERIFY: '/mfa-verify',
    MFA_SETUP: '/mfa-setup',
    
    // Protected Routes
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    SECURITY: '/security',
    NOTIFICATIONS: '/notifications',
    
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    
    // Team Management
    TEAM: '/team',
    REPORTING_CHAIN: '/reporting-chain',
    INVITATIONS: '/invitations',
    
    // KPI Management
    KPI: '/kpi',
    KPI_CREATE: '/kpi/create',
    KPI_EDIT: '/kpi/:id/edit',
    KPI_DETAIL: '/kpi/:id',
    
    // Reviews
    REVIEWS: '/reviews',
    REVIEW_CREATE: '/reviews/create',
    REVIEW_EDIT: '/reviews/:id/edit',
    
    // Reports
    REPORTS: '/reports',
    AUDIT: '/audit',
    
    // Admin
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_SYSTEM: '/admin/system',
    
    // Misc
    HELP: '/help',
    ABOUT: '/about',
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/403'
};

// ============================================================================
// User Roles
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

// ============================================================================
// Permission Codes
// ============================================================================

export const PERMISSIONS = {
    // KPI
    VIEW_KPI: 'view_kpi',
    CREATE_KPI: 'create_kpi',
    EDIT_KPI: 'edit_kpi',
    DELETE_KPI: 'delete_kpi',
    VALIDATE_KPI: 'validate_kpi_entry',
    
    // User
    VIEW_USER: 'view_user',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    ASSIGN_ROLE: 'assign_role',
    MANAGE_TEAM: 'manage_team',
    
    // Reports
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORT: 'export_report',
    
    // Admin
    MANAGE_TENANT: 'manage_tenant',
    VIEW_AUDIT: 'view_audit'
};

// ============================================================================
// Notification Types
// ============================================================================

export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

// ============================================================================
// KPI Status
// ============================================================================

export const KPI_STATUS = {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    OFF_TRACK: 'off_track'
};

export const KPI_STATUS_COLORS = {
    [KPI_STATUS.ON_TRACK]: '#10b981',
    [KPI_STATUS.AT_RISK]: '#f59e0b',
    [KPI_STATUS.OFF_TRACK]: '#ef4444'
};

// ============================================================================
// Session Status
// ============================================================================

export const SESSION_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    LOGGED_OUT: 'logged_out'
};

// ============================================================================
// Audit Severity
// ============================================================================

export const AUDIT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

// ============================================================================
// Subscription Plans
// ============================================================================

export const SUBSCRIPTION_PLANS = {
    TRIAL: 'trial',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
};

export const PLAN_FEATURES = {
    [SUBSCRIPTION_PLANS.TRIAL]: {
        maxUsers: 10,
        maxKpis: 50,
        customBranding: false,
        apiAccess: false,
        sso: false,
        advancedAnalytics: false
    },
    [SUBSCRIPTION_PLANS.BASIC]: {
        maxUsers: 50,
        maxKpis: 100,
        customBranding: false,
        apiAccess: false,
        sso: false,
        advancedAnalytics: false
    },
    [SUBSCRIPTION_PLANS.PROFESSIONAL]: {
        maxUsers: 500,
        maxKpis: 1000,
        customBranding: true,
        apiAccess: true,
        sso: false,
        advancedAnalytics: true
    },
    [SUBSCRIPTION_PLANS.ENTERPRISE]: {
        maxUsers: 10000,
        maxKpis: 10000,
        customBranding: true,
        apiAccess: true,
        sso: true,
        advancedAnalytics: true
    }
};