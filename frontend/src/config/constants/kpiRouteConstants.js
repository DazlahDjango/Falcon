// ============================================
// KPI Route Constants
// ============================================

export const KPI_ROUTES = {
    // Base
    BASE: '/kpi',
    DASHBOARD: '/kpi/dashboard',
    MANAGER_DASHBOARD: '/kpi/dashboard/manager',
    EXECUTIVE_DASHBOARD: '/kpi/dashboard/executive',
    CHAMPION_DASHBOARD: '/kpi/dashboard/champion',

    // KPI Management
    KPI_LIST: '/kpi/kpis',
    KPI_MANAGEMENT: '/kpi/management',
    KPI_CREATE: '/kpi/create',
    KPI_DETAIL: (id = ':id') => `/kpi/detail/${id}`,
    KPI_EDIT: (id = ':id') => `/kpi/edit/${id}`,
    KPI_MY_KPIS: '/kpi/my-kpis',
    KPI_VALIDATION: '/kpi/validation',
    KPI_SETTINGS: '/kpi/settings',
    KPI_ADJUSTMENTS: '/kpi/adjustments',
    KPI_REPORTS: '/kpi/reports',
    KPI_ANALYTICS: '/kpi/analytics',
    KPI_HEATMAP: '/kpi/analytics/heatmap',

    // KPI Weights & Dependencies
    KPI_WEIGHTS: (kpiId = ':kpiId') => `/kpi/detail/${kpiId}/weights`,
    KPI_DEPENDENCIES: (kpiId = ':kpiId') => `/kpi/detail/${kpiId}/dependencies`,
    KPI_STRATEGIC_LINKAGES: (kpiId = ':kpiId') => `/kpi/detail/${kpiId}/strategic-linkages`,

    // Target Management
    TARGETS: '/kpi/targets',
    TARGET_PHASING: (targetId = ':targetId') => `/kpi/targets/${targetId}/phasing`,
    TARGET_CASCADE: '/kpi/targets/cascade',
    TARGET_CASCADE_RULES: '/kpi/targets/cascade/rules',
    TARGET_CASCADE_MAP: '/kpi/targets/cascade/map',

    // Actual Data
    ACTUALS: '/kpi/actuals',
    ACTUAL_SUBMIT: '/kpi/actuals/submit',
    ACTUAL_HISTORY: '/kpi/actuals/history',
    ACTUAL_ADJUSTMENTS: '/kpi/actuals/adjustments',
    ACTUAL_EVIDENCE: (actualId = ':actualId') => `/kpi/actuals/${actualId}/evidence`,

    // Scores
    SCORES: '/kpi/scores',
    SCORE_MY_SCORES: '/kpi/scores/my-scores',
    SCORE_TEAM_SCORES: '/kpi/scores/team-scores',
    SCORE_STATISTICS: '/kpi/scores/statistics',
    SCORE_TRAFFIC_LIGHTS: '/kpi/scores/traffic-lights',
    SCORE_RED_ALERTS: '/kpi/scores/red-alerts',

    // Aggregated Scores
    AGGREGATED_SCORES: '/kpi/aggregated-scores',
    AGGREGATED_SCORES_ORGANIZATION: '/kpi/aggregated-scores/organization',
    AGGREGATED_SCORES_DEPARTMENTS: '/kpi/aggregated-scores/departments',
    AGGREGATED_SCORES_RANKING: '/kpi/aggregated-scores/ranking',

    // Validations
    VALIDATIONS: '/kpi/validations',
    VALIDATIONS_PENDING: '/kpi/validations/pending',
    VALIDATIONS_HISTORY: '/kpi/validations/history',

    // Escalations
    ESCALATIONS: '/kpi/escalations',
    ESCALATIONS_MY: '/kpi/escalations/my',

    // Reports & Analytics
    REPORTS: '/kpi/reports',
    REPORTS_CUSTOM: '/kpi/reports/custom',
    REPORTS_EXPORT: '/kpi/reports/export',
    ANALYTICS_INSIGHTS: '/kpi/analytics/insights',
    ANALYTICS_PREDICTIONS: '/kpi/analytics/predictions',

    // Organization Health
    ORGANIZATION_HEALTH: '/kpi/organization-health',

    // Bulk Operations
    BULK_UPLOAD: '/kpi/bulk',
    BULK_FORM: '/kpi/bulk/form',
    BULK_KPI_UPLOAD: '/kpi/bulk/kpi-upload',
    BULK_ACTUAL_UPLOAD: '/kpi/bulk/actual-upload',
    BULK_TARGET_UPLOAD: '/kpi/bulk/target-upload',

    // Calculations
    CALCULATIONS: '/kpi/calculations',
    CALCULATIONS_TRIGGER: '/kpi/calculations/trigger',
    CALCULATIONS_STATUS: (taskId = ':taskId') => `/kpi/calculations/status/${taskId}`,

    // System
    SYSTEM_SETTINGS: '/kpi/system-settings',
    REFERENCE_DATA: '/kpi/reference-data',
    NOTIFICATION_PREFERENCES: '/kpi/notifications',
    AUDIT_LOGS: '/kpi/audit-logs',

    // Admin KPI Modules
    ADMIN_OVERVIEW: '/kpi/admin/overview',
    ADMIN_CATEGORIES: '/kpi/admin/categories',
    ADMIN_CATEGORY_CREATE: '/kpi/admin/categories/create',
    ADMIN_CATEGORY_EDIT: (id = ':id') => `/kpi/admin/categories/${id}/edit`,

    // User nested routes
    USER_KPIS: (userId = ':userId') => `/kpi/users/${userId}/kpis`,
    USER_TARGETS: (userId = ':userId') => `/kpi/users/${userId}/targets`,
    USER_SCORES: (userId = ':userId') => `/kpi/users/${userId}/scores`,
    USER_ACTUALS: (userId = ':userId') => `/kpi/users/${userId}/actuals`,
};

// Routes that should have minimal header/footer
export const KPI_MINIMAL_CHROME_PATHS = [
    KPI_ROUTES.BULK_UPLOAD,
    KPI_ROUTES.CALCULATIONS_TRIGGER,
];

// Helper function
export const buildKpiPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// Add to existing kpiRouteConstants.js

export const KPI_ADMIN_ROUTES = {
    OVERVIEW: '/kpi/admin/overview',
    CATEGORIES: '/kpi/admin/categories',
};

// Also add to the main export
export const ROUTES = {
    // ... existing routes ...

    // KPI Admin Routes
    KPI_ADMIN_OVERVIEW: '/kpi/admin/overview',
    KPI_ADMIN_CATEGORIES: '/kpi/admin/categories',
};

// Legacy redirects
export const LEGACY_KPI_REDIRECTS = [
    ['/app/kpi/dashboard', KPI_ROUTES.DASHBOARD],
    ['/app/kpi/manager', KPI_ROUTES.MANAGER_DASHBOARD],
    ['/app/kpi/executive', KPI_ROUTES.EXECUTIVE_DASHBOARD],
    ['/app/kpi/champion', KPI_ROUTES.CHAMPION_DASHBOARD],
    ['/app/kpi/admin', KPI_ROUTES.ADMIN_OVERVIEW],
    ['/app/kpi/my-kpis', KPI_ROUTES.KPI_MY_KPIS],
    ['/app/kpi/create', KPI_ROUTES.KPI_CREATE],
    ['/app/kpi/validations', KPI_ROUTES.VALIDATIONS],
    ['/app/kpi/reports', KPI_ROUTES.REPORTS],
    ['/app/kpi/analytics', KPI_ROUTES.ANALYTICS_INSIGHTS],
    ['/app/kpi/settings', KPI_ROUTES.SYSTEM_SETTINGS],
    ['/app/kpi/bulk', KPI_ROUTES.BULK_UPLOAD],
    ['/app/kpi/audit', KPI_ROUTES.AUDIT_LOGS],
    ['/app/kpi/categories', KPI_ROUTES.ADMIN_CATEGORIES],
];

export default {
    KPI_ROUTES,
    KPI_MINIMAL_CHROME_PATHS,
    buildKpiPath,
    LEGACY_KPI_REDIRECTS,
};