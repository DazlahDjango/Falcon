// ============================================
// Report Route Constants
// ============================================

export const REPORT_ROUTES = {
    // Base
    BASE: '/reports',
    DASHBOARD: '/reports/dashboard',
    OVERVIEW: '/reports',

    // Report Management
    REPORTS: '/reports/list',
    REPORT_CREATE: '/reports/create',
    REPORT_DETAIL: (id = ':id') => `/reports/${id}`,
    REPORT_EDIT: (id = ':id') => `/reports/${id}/edit`,
    REPORT_VIEW: (id = ':id') => `/reports/${id}/view`,
    REPORT_GENERATE: (id = ':id') => `/reports/${id}/generate`,
    REPORT_EXPORT: (id = ':id') => `/reports/${id}/export`,
    REPORT_SETTINGS: (id = ':id') => `/reports/${id}/settings`,
    REPORT_HISTORY: (id = ':id') => `/reports/${id}/history`,
    MY_REPORTS: '/reports/my',
    PUBLIC_REPORTS: '/reports/public',

    // Templates
    TEMPLATES: '/reports/templates',
    TEMPLATE_CREATE: '/reports/templates/create',
    TEMPLATE_DETAIL: (id = ':id') => `/reports/templates/${id}`,
    TEMPLATE_EDIT: (id = ':id') => `/reports/templates/${id}/edit`,
    TEMPLATE_APPLY: (id = ':id') => `/reports/templates/${id}/apply`,
    TEMPLATE_PREBUILT: '/reports/templates/prebuilt',

    // Schedules
    SCHEDULES: '/reports/schedules',
    SCHEDULE_CREATE: '/reports/schedules/create',
    SCHEDULE_DETAIL: (id = ':id') => `/reports/schedules/${id}`,
    SCHEDULE_EDIT: (id = ':id') => `/reports/schedules/${id}/edit`,
    SCHEDULE_HISTORY: (id = ':id') => `/reports/schedules/${id}/history`,
    SCHEDULE_DUE: '/reports/schedules/due',
    SCHEDULER: '/reports/schedules',

    // Executions
    EXECUTIONS: '/reports/executions',
    EXECUTION_DETAIL: (id = ':id') => `/reports/executions/${id}`,

    // Exports
    EXPORTS: '/reports/exports',
    EXPORT_DETAIL: (id = ':id') => `/reports/exports/${id}`,
    EXPORT_DOWNLOAD: (id = ':id') => `/reports/exports/${id}/download`,
    MY_EXPORTS: '/reports/exports/my',
    EXPORT_CREATE: '/reports/exports/create',

    // Dashboards
    DASHBOARDS: '/reports/dashboards',
    DASHBOARD_CREATE: '/reports/dashboards/create',
    DASHBOARD_DETAIL: (id = ':id') => `/reports/dashboards/${id}`,
    DASHBOARD_EDIT: (id = ':id') => `/reports/dashboards/${id}/edit`,
    DASHBOARD_VIEW: (id = ':id') => `/reports/dashboards/${id}/view`,
    DASHBOARD_SHARE: (id = ':id') => `/reports/dashboards/${id}/share`,
    MY_DASHBOARDS: '/reports/dashboards/my',
    DEFAULT_DASHBOARD: '/reports/dashboards/default',

    // Widgets
    WIDGETS: '/reports/widgets',
    WIDGET_DETAIL: (id = ':id') => `/reports/widgets/${id}`,
    WIDGET_DATA: (id = ':id') => `/reports/widgets/${id}/data`,

    // Filters
    FILTERS: '/reports/filters',
    FILTER_CREATE: '/reports/filters/create',
    FILTER_EDIT: (id = ':id') => `/reports/filters/${id}/edit`,
    MY_FILTERS: '/reports/filters/my',
    GLOBAL_FILTERS: '/reports/filters/global',

    // Shares
    SHARES: '/reports/shares',
    SHARE_ACCESS: (token = ':token') => `/reports/shares/access/${token}`,
    SHARED_WITH_ME: '/reports/shares/shared-with-me',
    SHARE_CREATE: '/reports/shares/create',
    SHARE_DETAIL: (id = ':id') => `/reports/shares/${id}`,

    // Audits
    AUDITS: '/reports/audits',
    AUDIT_DETAIL: (id = ':id') => `/reports/audits/${id}`,
    SYSTEM_AUDIT: '/reports/audits',

    // Analytics
    ANALYTICS: '/reports/analytics',
    ANALYTICS_TREND: '/reports/analytics/trend',
    ANALYTICS_PERFORMANCE: '/reports/analytics/performance',
    ANALYTICS_COMPARATIVE: '/reports/analytics/comparative',
    ANALYTICS_PREDICTIVE: '/reports/analytics/predictive',
    ANALYTICS_ANOMALY: '/reports/analytics/anomaly',
    UNIFIED_360: '/reports/analytics',

    // Reporting
    REPORTING: '/reports/reporting',
    REPORTING_GENERATE: '/reports/reporting/generate',
    REPORTING_EXPORT: '/reports/reporting/export',
    REPORTING_BULK: '/reports/reporting/bulk',
    REPORTING_STATUS: (taskId = ':taskId') => `/reports/reporting/status/${taskId}`,

    // Admin
    ADMIN: '/reports/admin',
    ADMIN_OVERVIEW: '/reports/admin/overview',
    ADMIN_SETTINGS: '/reports/admin/settings',
};

// Routes that should have minimal header/footer
export const REPORT_MINIMAL_CHROME_PATHS = [
    REPORT_ROUTES.REPORT_VIEW(),
    REPORT_ROUTES.REPORT_GENERATE(),
    REPORT_ROUTES.DASHBOARD_VIEW(),
    REPORT_ROUTES.SHARE_ACCESS(),
];

// Helper function
export const buildReportPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// ============================================
// LEGACY REDIRECTS
// ============================================

export const LEGACY_REPORT_REDIRECTS = [
    ['/app/reports', REPORT_ROUTES.REPORTS],
    ['/app/reports/dashboard', REPORT_ROUTES.DASHBOARD],
    ['/app/reports/create', REPORT_ROUTES.REPORT_CREATE],
    ['/app/reports/templates', REPORT_ROUTES.TEMPLATES],
    ['/app/reports/schedules', REPORT_ROUTES.SCHEDULES],
    ['/app/reports/exports', REPORT_ROUTES.EXPORTS],
    ['/app/reports/dashboards', REPORT_ROUTES.DASHBOARDS],
    ['/app/reports/analytics', REPORT_ROUTES.ANALYTICS],
    ['/app/reports/admin', REPORT_ROUTES.ADMIN_OVERVIEW],
    ['/app/reports/my', REPORT_ROUTES.MY_REPORTS],
];

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    REPORT_ROUTES,
    REPORT_MINIMAL_CHROME_PATHS,
    buildReportPath,
    LEGACY_REPORT_REDIRECTS,
};