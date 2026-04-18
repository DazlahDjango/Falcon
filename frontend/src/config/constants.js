
// Route Paths
// ================
export const ROUTES = {
    // Public Routes
    HOME: '/',
    ABOUT: '/about',
    HELP: '/help',
    // Auth Routes
    LOGIN: '/login',
    REGISTER: '/register',
    MFA_VERIFY: '/mfa-verify',
    MFA_SETUP: '/mfa-setup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    ACCEPT_INVITATION: '/accept-invitation',
    // Dashboard
    DASHBOARD: '/dashboard',
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    USER_PROFILE: '/profile',
    // Team Management
    TEAM: '/team',
    // Role Management
    ROLES: '/roles',
    ROLE_DETAIL: '/roles/:id',
    ROLE_CREATE: '/roles/create',
    ROLE_EDIT: '/roles/:id/edit',
    // Session Management
    SESSIONS: '/sessions',
    // Settings
    SETTINGS: '/settings',
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
    // Error Pages
    UNAUTHORIZED: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404'
};

// API Endpoints
// ===============
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
    // Preferences
    USER_PREFERENCES: '/preferences/users/my/',
    TENANT_PREFERENCES: '/preferences/tenants/my-tenant/',
    TENANT_BRANDING: '/preferences/tenants/my-tenant/branding/',
    // Audit
    AUDIT_LOGS: '/audit-logs/',
    AUDIT_EXPORT: '/audit-logs/export/',
    AUDIT_COMPLIANCE: '/audit-logs/compliance-report/',
    AUDIT_USER_ACTIVITY: '/audit-logs/user/{id}/',
    AUDIT_SECURITY_EVENTS: '/audit-logs/security-events/',
    // Admin
    ADMIN_USERS: '/admin/users/',
    ADMIN_TENANTS: '/admin/tenants/',
    ADMIN_SYSTEM: '/admin/system/',
    ADMIN_CLEAR_CACHE: '/admin/system/clear-cache/',
    ADMIN_SYSTEM_HEALTH: '/admin/system/health/',
    // Reports
    REPORTS: '/reports/',
    REPORTS_EXPORT: '/reports/export/',
    REPORTS_DEPARTMENT: '/reports/department/',
    REPORTS_EXECUTIVE: '/reports/executive/',
    // KPI
    KPI: '/kpi/',
    KPI_DETAIL: '/kpi/{id}/',
    KPI_VALIDATE: '/kpi/{id}/validate/',
    KPI_TARGETS: '/kpi/targets/',
    KPI_PHASING: '/kpi/phasing/',
    // Reviews
    REVIEWS: '/reviews/',
    REVIEW_DETAIL: '/reviews/{id}/',
    REVIEW_APPROVE: '/reviews/{id}/approve/',
    REVIEW_SELF_ASSESSMENT: '/reviews/self-assessment/',
    // Missions
    MISSIONS: '/missions/',
    MISSION_DETAIL: '/missions/{id}/',
    MISSION_EXPORT: '/missions/export/',
    // Organisation
    ORGANISATIONS: '/organisations/',
    ORGANISATION_CURRENT: '/organisations/current/',
    ORGANISATION_SETTINGS: '/organisations/settings/',
    ORGANISATION_BRANDING: '/organisations/branding/',
    ORGANISATION_USERS: '/organisations/users/',
    ORGANISATION_TEAMS: '/organisations/teams/',
    ORGANISATION_DEPARTMENTS: '/organisations/departments/',
    ORGANISATION_POSITIONS: '/organisations/positions/',
    ORGANISATION_DOMAINS: '/organisations/domains/',
    ORGANISATION_CONTACTS: '/organisations/contacts/',
    ORGANISATION_WORKFLOWS: '/organisations/workflows/',
    ORGANISATION_SUBSCRIPTION: '/organisations/subscription/',
    ORGANISATION_PLANS: '/organisations/plans/',
    ORGANISATION_AUDIT: '/organisations/audit/',
    ORGANISATION_REPORTS: '/organisations/reports/',
    ORGANISATION_IMPORT: '/organisations/import/',
    ORGANISATION_EXPORT: '/organisations/export/',
    ORGANISATION_API_TOKENS: '/organisations/api-tokens/',
    ORGANISATION_TWO_FACTOR: '/organisations/two-factor/',
    ORGANISATION_PROFILE: '/organisations/profile/'
};

// Storage Keys
// ================
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    TENANT: 'tenant',
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar_state',
    NOTIFICATION_SETTINGS: 'notification_settings',
    LAST_VISITED: 'last_visited',
    LANGUAGE: 'language',
    PERSIST_ROOT: 'persist:root'
};

// User Roles
// ===========
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
export const ROLE_DISPLAY_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.CLIENT_ADMIN]: 'Admin',
    [ROLES.EXECUTIVE]: 'Executive',
    [ROLES.SUPERVISOR]: 'Supervisor',
    [ROLES.DASHBOARD_CHAMPION]: 'Dashboard Champion',
    [ROLES.STAFF]: 'Staff',
    [ROLES.READ_ONLY]: 'Read Only'
};

// Permission Codes
// ====================
export const PERMISSIONS = {
    // KPI
    VIEW_KPI: 'view_kpi',
    CREATE_KPI: 'create_kpi',
    EDIT_KPI: 'edit_kpi',
    DELETE_KPI: 'delete_kpi',
    VALIDATE_KPI: 'validate_kpi_entry',
    APPROVE_KPI_CHANGE: 'approve_kpi_change',
    CASCADE_TARGETS: 'cascade_targets',
    PHASE_TARGETS: 'phase_targets',
    // Review
    VIEW_REVIEW: 'view_review',
    CREATE_REVIEW: 'create_review',
    SUBMIT_SELF_ASSESSMENT: 'submit_self_assessment',
    APPROVE_REVIEW: 'approve_review',
    INITIATE_PIP: 'initiate_pip',
    VIEW_PIP: 'view_pip',
    // User
    VIEW_USER: 'view_user',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    ASSIGN_ROLE: 'assign_role',
    MANAGE_TEAM: 'manage_team',
    // Dashboard
    VIEW_EXECUTIVE_DASHBOARD: 'view_executive_dashboard',
    VIEW_TEAM_DASHBOARD: 'view_team_dashboard',
    VIEW_INDIVIDUAL_DASHBOARD: 'view_individual_dashboard',
    EXPORT_REPORT: 'export_report',
    // Tenant
    MANAGE_TENANT: 'manage_tenant',
    VIEW_BILLING: 'view_billing',
    CONFIGURE_BRANDING: 'configure_branding',
    MANAGE_SUBSCRIPTION: 'manage_subscription',
    // Workflow
    APPROVE_WORKFLOW: 'approve_workflow',
    ESCALATE_WORKFLOW: 'escalate_workflow'
};

// Permission Categories
// ========================
export const PERMISSION_CATEGORIES = {
    KPI: 'kpi',
    REVIEW: 'review',
    USER: 'user',
    TENANT: 'tenant',
    REPORT: 'report',
    WORKFLOW: 'workflow',
    ADMIN: 'admin'
};
export const PERMISSION_CATEGORY_LABELS = {
    [PERMISSION_CATEGORIES.KPI]: 'KPI Management',
    [PERMISSION_CATEGORIES.REVIEW]: 'Performance Reviews',
    [PERMISSION_CATEGORIES.USER]: 'User Management',
    [PERMISSION_CATEGORIES.TENANT]: 'Tenant Management',
    [PERMISSION_CATEGORIES.REPORT]: 'Reports',
    [PERMISSION_CATEGORIES.WORKFLOW]: 'Workflow',
    [PERMISSION_CATEGORIES.ADMIN]: 'Administration'
};

// Notification Types
// ===================
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};
export const NOTIFICATION_POSITIONS = {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left'
};

// KPI Status
// ============
export const KPI_STATUS = {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    OFF_TRACK: 'off_track'
};
export const KPI_STATUS_LABELS = {
    [KPI_STATUS.ON_TRACK]: 'On Track',
    [KPI_STATUS.AT_RISK]: 'At Risk',
    [KPI_STATUS.OFF_TRACK]: 'Off Track'
};
export const KPI_STATUS_COLORS = {
    [KPI_STATUS.ON_TRACK]: '#10b981',
    [KPI_STATUS.AT_RISK]: '#f59e0b',
    [KPI_STATUS.OFF_TRACK]: '#ef4444'
};

// Session Status
// ===============
export const SESSION_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    LOGGED_OUT: 'logged_out'
};

// Audit Severity
// =================
export const AUDIT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};
export const AUDIT_SEVERITY_LABELS = {
    [AUDIT_SEVERITY.INFO]: 'Info',
    [AUDIT_SEVERITY.WARNING]: 'Warning',
    [AUDIT_SEVERITY.ERROR]: 'Error',
    [AUDIT_SEVERITY.CRITICAL]: 'Critical'
};

// Subscription Plans
// ====================
export const SUBSCRIPTION_PLANS = {
    TRIAL: 'trial',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
};
export const PLAN_LABELS = {
    [SUBSCRIPTION_PLANS.TRIAL]: 'Trial',
    [SUBSCRIPTION_PLANS.BASIC]: 'Basic',
    [SUBSCRIPTION_PLANS.PROFESSIONAL]: 'Professional',
    [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise'
};

// Date Formats
// ===============
export const DATE_FORMATS = {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    FULL: 'EEEE, MMMM dd, yyyy',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
    API: 'YYYY-MM-DD'
};

// File Upload
// ==============
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_SPREADSHEET_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

// Pagination
// ============
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Timeouts
// =========
export const API_TIMEOUT = 30000;
export const DEBOUNCE_DELAY = 500;
export const TOAST_DURATION = 5000;
export const AUTO_REFRESH_INTERVAL = 30000;
export const SESSION_CHECK_INTERVAL = 60000;
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Themes
// ==========
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

// Languages
// ============
export const LANGUAGES = {
    EN: 'en',
    FR: 'fr',
    ES: 'es',
    SW: 'sw'
};
export const LANGUAGE_LABELS = {
    [LANGUAGES.EN]: 'English',
    [LANGUAGES.FR]: 'French',
    [LANGUAGES.ES]: 'Spanish',
    [LANGUAGES.SW]: 'Swahili'
};

// Timezones
// ==========
export const TIMEZONES = [
    { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
];

// Currencies
// ============
export const CURRENCIES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    KES: 'KES'
};
export const CURRENCY_SYMBOLS = {
    [CURRENCIES.USD]: '$',
    [CURRENCIES.EUR]: '€',
    [CURRENCIES.GBP]: '£',
    [CURRENCIES.KES]: 'KSh'
};