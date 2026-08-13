// ============================================
// Report API Constants - Following KPI App Pattern
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const REPORT_API_BASE = `${API_BASE}/reportplt/`;
export const API_VERSION = 'v1';
export const REPORT_API_PREFIX = `/api/${API_VERSION}/reportplt`;

// ============================================
// 1. REPORT ENDPOINTS
// ============================================

export const REPORT_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/reports/`,
    DETAIL: (id) => `${API_BASE}/reportplt/reports/${id}/`,
    CREATE: `${API_BASE}/reportplt/reports/`,
    UPDATE: (id) => `${API_BASE}/reportplt/reports/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/reports/${id}/`,
    GENERATE: (id) => `${API_BASE}/reportplt/reports/${id}/generate/`,
    EXPORT: (id) => `${API_BASE}/reportplt/reports/${id}/export/`,
    UPDATE_STATUS: (id) => `${API_BASE}/reportplt/reports/${id}/status/`,
    ACTION: (id) => `${API_BASE}/reportplt/reports/${id}/action/`,
    MY_REPORTS: `${API_BASE}/reportplt/reports/my/`,
    PUBLIC_REPORTS: `${API_BASE}/reportplt/reports/public/`,
    TYPES: `${API_BASE}/reportplt/reports/types/`,
    STATUSES: `${API_BASE}/reportplt/reports/statuses/`,
    QUERY_PARAMS: {
        REPORT_TYPE: 'report_type',
        STATUS: 'status',
        CATEGORY: 'category',
        IS_PUBLISHED: 'is_published',
        IS_ARCHIVED: 'is_archived',
        OWNER: 'owner',
        SEARCH: 'search',
        DATE_RANGE: 'date_range',
        TAGS: 'tags',
        ALLOWED_ROLES: 'allowed_roles',
    },
};

// ============================================
// 2. TEMPLATE ENDPOINTS
// ============================================

export const TEMPLATE_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/templates/`,
    DETAIL: (id) => `${API_BASE}/reportplt/templates/${id}/`,
    CREATE: `${API_BASE}/reportplt/templates/`,
    UPDATE: (id) => `${API_BASE}/reportplt/templates/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/templates/${id}/`,
    ACTION: (id) => `${API_BASE}/reportplt/templates/${id}/action/`,
    APPLY: (id) => `${API_BASE}/reportplt/templates/${id}/apply/`,
    PREBUILT: `${API_BASE}/reportplt/templates/prebuilt/`,
    DEFAULT: `${API_BASE}/reportplt/templates/default/`,
    POPULAR: `${API_BASE}/reportplt/templates/popular/`,
    BY_SECTOR: (sector) => `${API_BASE}/reportplt/templates/sector/${sector}/`,
    TYPES: `${API_BASE}/reportplt/templates/types/`,
    QUERY_PARAMS: {
        TEMPLATE_TYPE: 'template_type',
        SECTOR: 'sector',
        CATEGORY: 'category',
        IS_PUBLISHED: 'is_published',
        IS_SYSTEM: 'is_system',
        IS_DEFAULT: 'is_default',
        IS_POPULAR: 'is_popular',
        SEARCH: 'search',
    },
};

// ============================================
// 3. SCHEDULE ENDPOINTS
// ============================================

export const SCHEDULE_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/schedules/`,
    DETAIL: (id) => `${API_BASE}/reportplt/schedules/${id}/`,
    CREATE: `${API_BASE}/reportplt/schedules/`,
    UPDATE: (id) => `${API_BASE}/reportplt/schedules/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/schedules/${id}/`,
    ACTION: (id) => `${API_BASE}/reportplt/schedules/${id}/action/`,
    HISTORY: (id) => `${API_BASE}/reportplt/schedules/${id}/history/`,
    UPCOMING: (id) => `${API_BASE}/reportplt/schedules/${id}/upcoming/`,
    DUE: `${API_BASE}/reportplt/schedules/due/`,
    OVERDUE: `${API_BASE}/reportplt/schedules/overdue/`,
    FREQUENCIES: `${API_BASE}/reportplt/schedules/frequencies/`,
    QUERY_PARAMS: {
        FREQUENCY: 'frequency',
        STATUS: 'status',
        IS_ACTIVE: 'is_active',
        REPORT: 'report',
        OWNER: 'owner',
        SEARCH: 'search',
        NEXT_RUN_AFTER: 'next_run_after',
        NEXT_RUN_BEFORE: 'next_run_before',
    },
};

// ============================================
// 4. EXECUTION ENDPOINTS
// ============================================

export const EXECUTION_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/executions/`,
    DETAIL: (id) => `${API_BASE}/reportplt/executions/${id}/`,
    LOGS: (id) => `${API_BASE}/reportplt/executions/${id}/logs/`,
    BY_REPORT: (reportId) => `${API_BASE}/reportplt/executions/report/${reportId}/`,
    STATUSES: `${API_BASE}/reportplt/executions/statuses/`,
    QUERY_PARAMS: {
        REPORT: 'report',
        STATUS: 'status',
        TRIGGERED_BY: 'triggered_by',
        STARTED_AFTER: 'started_after',
        STARTED_BEFORE: 'started_before',
    },
};

// ============================================
// 5. EXPORT ENDPOINTS
// ============================================

export const EXPORT_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/exports/`,
    DETAIL: (id) => `${API_BASE}/reportplt/exports/${id}/`,
    CREATE: `${API_BASE}/reportplt/exports/`,
    DOWNLOAD: (id) => `${API_BASE}/reportplt/exports/${id}/download/`,
    REGENERATE: (id) => `${API_BASE}/reportplt/exports/${id}/regenerate/`,
    MY_EXPORTS: `${API_BASE}/reportplt/exports/my/`,
    FORMATS: `${API_BASE}/reportplt/exports/formats/`,
    QUERY_PARAMS: {
        FORMAT: 'format',
        STATUS: 'status',
        REPORT: 'report',
        EXPORTED_BY: 'exported_by',
        FILE_NAME: 'file_name',
        CREATED_AFTER: 'created_after',
        CREATED_BEFORE: 'created_before',
    },
};

// ============================================
// 6. DASHBOARD ENDPOINTS
// ============================================

export const DASHBOARD_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/dashboards/`,
    DETAIL: (id) => `${API_BASE}/reportplt/dashboards/${id}/`,
    CREATE: `${API_BASE}/reportplt/dashboards/`,
    UPDATE: (id) => `${API_BASE}/reportplt/dashboards/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/dashboards/${id}/`,
    ACTION: (id) => `${API_BASE}/reportplt/dashboards/${id}/action/`,
    LAYOUT: (id) => `${API_BASE}/reportplt/dashboards/${id}/layout/`,
    REFRESH: (id) => `${API_BASE}/reportplt/dashboards/${id}/refresh/`,
    RECORD_VIEW: (id) => `${API_BASE}/reportplt/dashboards/${id}/record-view/`,
    MY_DASHBOARDS: `${API_BASE}/reportplt/dashboards/my/`,
    DEFAULT: `${API_BASE}/reportplt/dashboards/default/`,
    TYPES: `${API_BASE}/reportplt/dashboards/types/`,
    QUERY_PARAMS: {
        DASHBOARD_TYPE: 'dashboard_type',
        IS_DEFAULT: 'is_default',
        IS_SHARED: 'is_shared',
        IS_PUBLISHED: 'is_published',
        OWNER: 'owner',
        SEARCH: 'search',
    },
};

// ============================================
// 7. WIDGET ENDPOINTS
// ============================================

export const WIDGET_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/widgets/`,
    DETAIL: (id) => `${API_BASE}/reportplt/widgets/${id}/`,
    CREATE: `${API_BASE}/reportplt/widgets/`,
    UPDATE: (id) => `${API_BASE}/reportplt/widgets/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/widgets/${id}/`,
    DATA: (id) => `${API_BASE}/reportplt/widgets/${id}/data/`,
    ACTION: (id) => `${API_BASE}/reportplt/widgets/${id}/action/`,
    REFRESH: (id) => `${API_BASE}/reportplt/widgets/${id}/refresh/`,
    TYPES: `${API_BASE}/reportplt/widgets/types/`,
    BY_DASHBOARD: (dashboardId) => `${API_BASE}/reportplt/widgets/dashboard/${dashboardId}/`,
    QUERY_PARAMS: {
        WIDGET_TYPE: 'widget_type',
        IS_ACTIVE: 'is_active',
        IS_VISIBLE: 'is_visible',
        DASHBOARD: 'dashboard',
        SEARCH: 'search',
    },
};

// ============================================
// 8. FILTER ENDPOINTS
// ============================================

export const FILTER_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/filters/`,
    DETAIL: (id) => `${API_BASE}/reportplt/filters/${id}/`,
    CREATE: `${API_BASE}/reportplt/filters/`,
    UPDATE: (id) => `${API_BASE}/reportplt/filters/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/filters/${id}/`,
    APPLY: (id) => `${API_BASE}/reportplt/filters/${id}/apply/`,
    SET_DEFAULT: (id) => `${API_BASE}/reportplt/filters/${id}/set-default/`,
    DUPLICATE: (id) => `${API_BASE}/reportplt/filters/${id}/duplicate/`,
    GLOBAL: `${API_BASE}/reportplt/filters/global/`,
    MY_FILTERS: `${API_BASE}/reportplt/filters/my/`,
    TYPES: `${API_BASE}/reportplt/filters/types/`,
    QUERY_PARAMS: {
        FILTER_TYPE: 'filter_type',
        IS_GLOBAL: 'is_global',
        IS_SYSTEM: 'is_system',
        IS_DEFAULT: 'is_default',
        OWNER: 'owner',
        SEARCH: 'search',
    },
};

// ============================================
// 9. SHARE ENDPOINTS
// ============================================

export const SHARE_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/shares/`,
    DETAIL: (id) => `${API_BASE}/reportplt/shares/${id}/`,
    CREATE: `${API_BASE}/reportplt/shares/`,
    UPDATE: (id) => `${API_BASE}/reportplt/shares/${id}/`,
    DELETE: (id) => `${API_BASE}/reportplt/shares/${id}/`,
    ACCESS: (id) => `${API_BASE}/reportplt/shares/${id}/access/`,
    DEACTIVATE: (id) => `${API_BASE}/reportplt/shares/${id}/deactivate/`,
    ACTIVATE: (id) => `${API_BASE}/reportplt/shares/${id}/activate/`,
    BY_REPORT: (reportId) => `${API_BASE}/reportplt/shares/report/${reportId}/`,
    TYPES: `${API_BASE}/reportplt/shares/types/`,
    PERMISSIONS: `${API_BASE}/reportplt/shares/permissions/`,
    QUERY_PARAMS: {
        SHARE_TYPE: 'share_type',
        PERMISSION: 'permission',
        IS_ACTIVE: 'is_active',
        REPORT: 'report',
        SHARED_BY: 'shared_by',
        SHARED_WITH: 'shared_with',
    },
};

// ============================================
// 10. AUDIT ENDPOINTS
// ============================================

export const AUDIT_ENDPOINTS = {
    LIST: `${API_BASE}/reportplt/audits/`,
    DETAIL: (id) => `${API_BASE}/reportplt/audits/${id}/`,
    BY_REPORT: (reportId) => `${API_BASE}/reportplt/audits/report/${reportId}/`,
    BY_USER: (userId) => `${API_BASE}/reportplt/audits/user/${userId}/`,
    ACTIONS: `${API_BASE}/reportplt/audits/actions/`,
    STATS: `${API_BASE}/reportplt/audits/stats/`,
    QUERY_PARAMS: {
        ACTION: 'action',
        REPORT: 'report',
        USER: 'user',
        SUCCESS: 'success',
        IP_ADDRESS: 'ip_address',
        CREATED_AFTER: 'created_after',
        CREATED_BEFORE: 'created_before',
    },
};

// ============================================
// 11. ANALYTICS ENDPOINTS
// ============================================

export const ANALYTICS_ENDPOINTS = {
    TREND: `${API_BASE}/reportplt/analytics/trend/`,
    PERFORMANCE: `${API_BASE}/reportplt/analytics/performance/`,
    COMPARATIVE: `${API_BASE}/reportplt/analytics/comparative/`,
    PREDICTIVE: `${API_BASE}/reportplt/analytics/predictive/`,
    ANOMALY: `${API_BASE}/reportplt/analytics/anomaly/`,
    QUERY_PARAMS: {
        REPORT_ID: 'report_id',
        PERIOD: 'period',
        METRIC: 'metric',
        COMPARE_BY: 'compare_by',
        GROUP_BY: 'group_by',
        PREDICTION_TYPE: 'prediction_type',
        PERIODS_AHEAD: 'periods_ahead',
        CONFIDENCE: 'confidence',
        DETECTION_TYPE: 'detection_type',
        THRESHOLD: 'threshold',
        WINDOW_SIZE: 'window_size',
    },
};

// ============================================
// 12. REPORTING ENDPOINTS
// ============================================

export const REPORTING_ENDPOINTS = {
    GENERATE: `${API_BASE}/reportplt/reporting/generate/`,
    EXPORT: `${API_BASE}/reportplt/reporting/export/`,
    BULK_EXPORT: `${API_BASE}/reportplt/reporting/bulk-export/`,
    STATUS: (taskId) => `${API_BASE}/reportplt/reporting/status/${taskId}/`,
};

// ============================================
// WEBSOCKET ENDPOINTS
// ============================================

import { REPORTPLT_WS } from './websocketApiConstants';

export const REPORT_WS = REPORTPLT_WS;

// ============================================
// API STATUS & HTTP CONSTANTS
// ============================================

export const API_STATUS = { SUCCESS: 'success', ERROR: 'error', PENDING: 'pending' };

export const HTTP_STATUS = {
    OK: 200, CREATED: 201, ACCEPTED: 202, NO_CONTENT: 204,
    BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429, INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// REPORT ERROR CODES
// ============================================

export const REPORT_ERROR_CODES = {
    REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
    GENERATION_FAILED: 'GENERATION_FAILED',
    EXPORT_FAILED: 'EXPORT_FAILED',
    INVALID_FORMAT: 'INVALID_FORMAT',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    TENANT_ISOLATION_ERROR: 'TENANT_ISOLATION_ERROR',
    SCHEDULE_ERROR: 'SCHEDULE_ERROR',
    TEMPLATE_ERROR: 'TEMPLATE_ERROR',
    DASHBOARD_ERROR: 'DASHBOARD_ERROR',
    WIDGET_ERROR: 'WIDGET_ERROR',
    FILTER_ERROR: 'FILTER_ERROR',
    SHARE_ERROR: 'SHARE_ERROR',
    CACHE_ERROR: 'CACHE_ERROR',
    CONCURRENT_GENERATION: 'CONCURRENT_GENERATION',
    EXPORT_SIZE_EXCEEDED: 'EXPORT_SIZE_EXCEEDED',
    EXPIRY_ERROR: 'EXPIRY_ERROR',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    SHARE_EXPIRED: 'SHARE_EXPIRED',
};

// ============================================
// REPORT CONSTANTS
// ============================================

export const REPORT_TYPES = [
    { value: 'kpi', label: 'KPI Performance Report' },
    { value: 'departmental', label: 'Departmental Performance Report' },
    { value: 'executive', label: 'Executive Summary Report' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'trend', label: 'Trend Analysis Report' },
    { value: 'comparative', label: 'Comparative Report' },
    { value: 'mission', label: 'Mission Status Report' },
    { value: 'pip', label: 'PIP Tracking Report' },
    { value: 'custom', label: 'Custom Report' },
];

export const REPORT_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'queued', label: 'Queued' },
    { value: 'generating', label: 'Generating' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'archived', label: 'Archived' },
];

export const REPORT_CATEGORIES = [
    { value: 'operational', label: 'Operational' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'financial', label: 'Financial' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'impact', label: 'Impact' },
    { value: 'project', label: 'Project' },
    { value: 'custom', label: 'Custom' },
];

export const REPORT_FORMATS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'pptx', label: 'PowerPoint' },
    { value: 'html', label: 'HTML' },
];

export const SCHEDULE_FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannual', label: 'Bi-Annual' },
    { value: 'annual', label: 'Annual' },
    { value: 'custom', label: 'Custom' },
];

export const DASHBOARD_TYPES = [
    { value: 'executive', label: 'Executive Dashboard' },
    { value: 'departmental', label: 'Departmental Dashboard' },
    { value: 'team', label: 'Team Dashboard' },
    { value: 'personal', label: 'Personal Dashboard' },
    { value: 'custom', label: 'Custom Dashboard' },
];

export const WIDGET_TYPES = [
    { value: 'kpi', label: 'KPI Card' },
    { value: 'chart', label: 'Chart' },
    { value: 'table', label: 'Table' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'trend', label: 'Trend Chart' },
    { value: 'gauge', label: 'Gauge' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'map', label: 'Map' },
    { value: 'list', label: 'List' },
    { value: 'summary', label: 'Summary Card' },
    { value: 'mission', label: 'Mission Status' },
    { value: 'pip', label: 'PIP Tracker' },
    { value: 'compliance', label: 'Compliance Status' },
    { value: 'custom', label: 'Custom Widget' },
];

export const FILTER_TYPES = [
    { value: 'date_range', label: 'Date Range' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multi_select', label: 'Multi-Select' },
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'hierarchy', label: 'Hierarchical' },
    { value: 'custom', label: 'Custom' },
];

export const SHARE_TYPES = [
    { value: 'internal', label: 'Internal Share' },
    { value: 'external', label: 'External Share' },
    { value: 'public', label: 'Public Link' },
];

export const SHARE_PERMISSIONS = [
    { value: 'view', label: 'View Only' },
    { value: 'comment', label: 'View & Comment' },
    { value: 'edit', label: 'View, Comment & Edit' },
    { value: 'export', label: 'View, Comment, Edit & Export' },
];

export const AUDIT_ACTIONS = [
    { value: 'view', label: 'View' },
    { value: 'create', label: 'Create' },
    { value: 'edit', label: 'Edit' },
    { value: 'delete', label: 'Delete' },
    { value: 'export', label: 'Export' },
    { value: 'share', label: 'Share' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'generate', label: 'Generate' },
    { value: 'refresh', label: 'Refresh' },
    { value: 'archive', label: 'Archive' },
    { value: 'restore', label: 'Restore' },
    { value: 'permission_change', label: 'Permission Change' },
    { value: 'config_change', label: 'Configuration Change' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
];

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    REPORT_API_BASE,
    API_VERSION,
    REPORT_API_PREFIX,
    REPORT_ENDPOINTS,
    TEMPLATE_ENDPOINTS,
    SCHEDULE_ENDPOINTS,
    EXECUTION_ENDPOINTS,
    EXPORT_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    WIDGET_ENDPOINTS,
    FILTER_ENDPOINTS,
    SHARE_ENDPOINTS,
    AUDIT_ENDPOINTS,
    ANALYTICS_ENDPOINTS,
    REPORTING_ENDPOINTS,
    REPORT_WS,
    API_STATUS,
    HTTP_STATUS,
    REPORT_ERROR_CODES,
    REPORT_TYPES,
    REPORT_STATUSES,
    REPORT_CATEGORIES,
    REPORT_FORMATS,
    SCHEDULE_FREQUENCIES,
    DASHBOARD_TYPES,
    WIDGET_TYPES,
    FILTER_TYPES,
    SHARE_TYPES,
    SHARE_PERMISSIONS,
    AUDIT_ACTIONS,
};