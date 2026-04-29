/**
 * Route Paths - Centralized route definitions
 * Single source of truth for all application routes
 */
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
    // Dashboard Routes
    DASHBOARD: '/dashboard',
    INDIVIDUAL_DASHBOARD: '/dashboard/individual',
    MANAGER_DASHBOARD: '/dashboard/manager',
    EXECUTIVE_DASHBOARD: '/dashboard/executive',
    CHAMPION_DASHBOARD: '/dashboard/champion',
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    USER_PROFILE: '/profile',
    // Team Management
    TEAM: '/team',
    TEAM_DETAIL: '/team/:id',
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
    // Admin Routes (Super Admin only)
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_SYSTEM: '/admin/system',
    // Organisation Routes
    ORGANISATION: '/organisation',
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
    // KPI Routes
    KPI: '/kpi',
    KPI_DASHBOARD: '/kpi/dashboard',
    KPI_MANAGEMENT: '/kpi/management',
    KPI_CREATE: '/kpi/create',
    KPI_DETAIL: '/kpi/detail/:id',
    KPI_EDIT: '/kpi/edit/:id',
    KPI_VALIDATION: '/kpi/validation',
    KPI_ADJUSTMENTS: '/kpi/adjustments',
    KPI_TARGETS: '/kpi/targets',
    KPI_TRACKING: '/kpi/tracking',
    KPI_REPORTS: '/kpi/reports',
    // Target Routes
    TARGETS: '/targets',
    TARGET_PHASING: '/targets/phasing',
    TARGET_CASCADE: '/targets/cascade',
    // Actual Routes
    ACTUALS: '/actuals',
    ACTUAL_SUBMIT: '/actuals/submit',
    ACTUAL_VALIDATION: '/actuals/validation',
    ACTUAL_EVIDENCE: '/actuals/evidence/:id',
    // Score Routes
    SCORES: '/scores',
    SCORE_DETAIL: '/scores/:id',
    AGGREGATED_SCORES: '/scores/aggregated',
    // Error Pages
    UNAUTHORIZED: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404',
    
    // // Review Routes
    // REVIEWS: '/reviews',
    // REVIEW_DETAIL: '/reviews/:id',
    // REVIEW_SELF_ASSESSMENT: '/reviews/self-assessment',
    // SUPERVISOR_EVALUATION: '/reviews/supervisor/:userId',
    // REVIEW_APPROVAL: '/reviews/approval',
    // PIP_MANAGEMENT: '/reviews/pip',
    // // Mission Routes
    // MISSIONS: '/missions',
    // MISSION_CREATE: '/missions/create',
    // MISSION_DETAIL: '/missions/:id',
    // MISSION_EDIT: '/missions/:id/edit',
    // MISSION_EXPORT: '/missions/export',
    // // Workflow Routes
    // WORKFLOWS: '/workflows',
    // VALIDATION_QUEUE: '/workflows/validation',
    // APPROVAL_PENDING: '/workflows/pending',
    // ESCALATIONS: '/workflows/escalations',
    // WORKFLOW_HISTORY: '/workflows/history',
    // // Analytics Routes
    // ANALYTICS: '/analytics',
    // KPI_INSIGHTS: '/analytics/insights',
    // PREDICTIONS: '/analytics/predictions',
    // TRENDS: '/analytics/trends',
    // ANOMALY_DETECTION: '/analytics/anomalies',
    // RECOMMENDATIONS: '/analytics/recommendations',
    // // Report Routes
    // REPORTS: '/reports',
    // REPORT_BUILDER: '/reports/builder',
    // SCHEDULED_REPORTS: '/reports/scheduled',
    // EXPORT_CENTER: '/reports/export',
    // COMPLIANCE_REPORTS: '/reports/compliance',
    // // Notification Routes
    // NOTIFICATIONS: '/notifications',
    // NOTIFICATION_PREFERENCES: '/notifications/preferences',
    // RED_ALERTS: '/notifications/alerts',
    // // Tenant Routes (Super Admin only)
    // TENANTS: '/tenants',
    // TENANT_DETAIL: '/tenants/:id',
    // TENANT_CREATE: '/tenants/create',
    // TENANT_EDIT: '/tenants/:id/edit',
    // SUBSCRIPTION_MANAGEMENT: '/tenants/subscriptions',
    // // ML Routes
    // ML_DASHBOARD: '/ml',
    // MODEL_TRAINING: '/ml/training',
    // PREDICTION_VIEWS: '/ml/predictions',
    // MODEL_PERFORMANCE: '/ml/performance',
    
};

// Helper function to build paths with parameters
export const buildPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
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
            params[part.slice(1)] = urlParts[index];
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