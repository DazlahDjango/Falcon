// ============================================
// Report Constants - Full Implementation
// ============================================

// ============================================
// 1. REPORT TYPE CONSTANTS
// ============================================

export const REPORT_TYPES = {
    KPI: 'kpi',
    DEPARTMENTAL: 'departmental',
    EXECUTIVE: 'executive',
    COMPLIANCE: 'compliance',
    TREND: 'trend',
    COMPARATIVE: 'comparative',
    MISSION: 'mission',
    PIP: 'pip',
    CUSTOM: 'custom',
};

export const REPORT_TYPE_LABELS = {
    [REPORT_TYPES.KPI]: 'KPI Performance Report',
    [REPORT_TYPES.DEPARTMENTAL]: 'Departmental Performance Report',
    [REPORT_TYPES.EXECUTIVE]: 'Executive Summary Report',
    [REPORT_TYPES.COMPLIANCE]: 'Compliance Report',
    [REPORT_TYPES.TREND]: 'Trend Analysis Report',
    [REPORT_TYPES.COMPARATIVE]: 'Comparative Report',
    [REPORT_TYPES.MISSION]: 'Mission Status Report',
    [REPORT_TYPES.PIP]: 'PIP Tracking Report',
    [REPORT_TYPES.CUSTOM]: 'Custom Report',
};

export const REPORT_TYPE_ICONS = {
    [REPORT_TYPES.KPI]: '📊',
    [REPORT_TYPES.DEPARTMENTAL]: '🏢',
    [REPORT_TYPES.EXECUTIVE]: '👔',
    [REPORT_TYPES.COMPLIANCE]: '✅',
    [REPORT_TYPES.TREND]: '📈',
    [REPORT_TYPES.COMPARATIVE]: '⚖️',
    [REPORT_TYPES.MISSION]: '🎯',
    [REPORT_TYPES.PIP]: '📋',
    [REPORT_TYPES.CUSTOM]: '⚙️',
};

// ============================================
// 2. REPORT STATUS CONSTANTS
// ============================================

export const REPORT_STATUS = {
    DRAFT: 'draft',
    QUEUED: 'queued',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    ARCHIVED: 'archived',
};

export const REPORT_STATUS_LABELS = {
    [REPORT_STATUS.DRAFT]: 'Draft',
    [REPORT_STATUS.QUEUED]: 'Queued',
    [REPORT_STATUS.GENERATING]: 'Generating',
    [REPORT_STATUS.COMPLETED]: 'Completed',
    [REPORT_STATUS.FAILED]: 'Failed',
    [REPORT_STATUS.ARCHIVED]: 'Archived',
};

export const REPORT_STATUS_COLORS = {
    [REPORT_STATUS.DRAFT]: '#94a3b8',
    [REPORT_STATUS.QUEUED]: '#f59e0b',
    [REPORT_STATUS.GENERATING]: '#3b82f6',
    [REPORT_STATUS.COMPLETED]: '#10b981',
    [REPORT_STATUS.FAILED]: '#ef4444',
    [REPORT_STATUS.ARCHIVED]: '#64748b',
};

export const REPORT_STATUS_ICONS = {
    [REPORT_STATUS.DRAFT]: '📝',
    [REPORT_STATUS.QUEUED]: '⏳',
    [REPORT_STATUS.GENERATING]: '🔄',
    [REPORT_STATUS.COMPLETED]: '✅',
    [REPORT_STATUS.FAILED]: '❌',
    [REPORT_STATUS.ARCHIVED]: '📦',
};

// ============================================
// 3. REPORT CATEGORY CONSTANTS
// ============================================

export const REPORT_CATEGORIES = {
    OPERATIONAL: 'operational',
    STRATEGIC: 'strategic',
    FINANCIAL: 'financial',
    HR: 'hr',
    COMPLIANCE: 'compliance',
    IMPACT: 'impact',
    PROJECT: 'project',
    CUSTOM: 'custom',
};

export const REPORT_CATEGORY_LABELS = {
    [REPORT_CATEGORIES.OPERATIONAL]: 'Operational',
    [REPORT_CATEGORIES.STRATEGIC]: 'Strategic',
    [REPORT_CATEGORIES.FINANCIAL]: 'Financial',
    [REPORT_CATEGORIES.HR]: 'Human Resources',
    [REPORT_CATEGORIES.COMPLIANCE]: 'Compliance',
    [REPORT_CATEGORIES.IMPACT]: 'Impact',
    [REPORT_CATEGORIES.PROJECT]: 'Project',
    [REPORT_CATEGORIES.CUSTOM]: 'Custom',
};

// ============================================
// 4. REPORT FORMAT CONSTANTS
// ============================================

export const REPORT_FORMATS = {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
    JSON: 'json',
    PPTX: 'pptx',
    HTML: 'html',
    XML: 'xml',
};

export const REPORT_FORMAT_LABELS = {
    [REPORT_FORMATS.PDF]: 'PDF',
    [REPORT_FORMATS.EXCEL]: 'Excel',
    [REPORT_FORMATS.CSV]: 'CSV',
    [REPORT_FORMATS.JSON]: 'JSON',
    [REPORT_FORMATS.PPTX]: 'PowerPoint',
    [REPORT_FORMATS.HTML]: 'HTML',
    [REPORT_FORMATS.XML]: 'XML',
};

export const REPORT_FORMAT_EXTENSIONS = {
    [REPORT_FORMATS.PDF]: '.pdf',
    [REPORT_FORMATS.EXCEL]: '.xlsx',
    [REPORT_FORMATS.CSV]: '.csv',
    [REPORT_FORMATS.JSON]: '.json',
    [REPORT_FORMATS.PPTX]: '.pptx',
    [REPORT_FORMATS.HTML]: '.html',
    [REPORT_FORMATS.XML]: '.xml',
};

export const REPORT_FORMAT_MIME_TYPES = {
    [REPORT_FORMATS.PDF]: 'application/pdf',
    [REPORT_FORMATS.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    [REPORT_FORMATS.CSV]: 'text/csv',
    [REPORT_FORMATS.JSON]: 'application/json',
    [REPORT_FORMATS.PPTX]: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    [REPORT_FORMATS.HTML]: 'text/html',
    [REPORT_FORMATS.XML]: 'application/xml',
};

// ============================================
// 5. SCHEDULE FREQUENCY CONSTANTS
// ============================================

export const SCHEDULE_FREQUENCIES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    BIANNUAL: 'biannual',
    ANNUAL: 'annual',
    CUSTOM: 'custom',
};

export const SCHEDULE_FREQUENCY_LABELS = {
    [SCHEDULE_FREQUENCIES.DAILY]: 'Daily',
    [SCHEDULE_FREQUENCIES.WEEKLY]: 'Weekly',
    [SCHEDULE_FREQUENCIES.BIWEEKLY]: 'Bi-Weekly',
    [SCHEDULE_FREQUENCIES.MONTHLY]: 'Monthly',
    [SCHEDULE_FREQUENCIES.QUARTERLY]: 'Quarterly',
    [SCHEDULE_FREQUENCIES.BIANNUAL]: 'Bi-Annual',
    [SCHEDULE_FREQUENCIES.ANNUAL]: 'Annual',
    [SCHEDULE_FREQUENCIES.CUSTOM]: 'Custom',
};

export const SCHEDULE_FREQUENCY_CRON = {
    [SCHEDULE_FREQUENCIES.DAILY]: '0 0 * * *',
    [SCHEDULE_FREQUENCIES.WEEKLY]: '0 0 * * 0',
    [SCHEDULE_FREQUENCIES.BIWEEKLY]: '0 0 */14 * *',
    [SCHEDULE_FREQUENCIES.MONTHLY]: '0 0 1 * *',
    [SCHEDULE_FREQUENCIES.QUARTERLY]: '0 0 1 */3 *',
    [SCHEDULE_FREQUENCIES.BIANNUAL]: '0 0 1 */6 *',
    [SCHEDULE_FREQUENCIES.ANNUAL]: '0 0 1 1 *',
};

// ============================================
// 6. DASHBOARD TYPE CONSTANTS
// ============================================

export const DASHBOARD_TYPES = {
    EXECUTIVE: 'executive',
    DEPARTMENTAL: 'departmental',
    TEAM: 'team',
    PERSONAL: 'personal',
    CUSTOM: 'custom',
};

export const DASHBOARD_TYPE_LABELS = {
    [DASHBOARD_TYPES.EXECUTIVE]: 'Executive Dashboard',
    [DASHBOARD_TYPES.DEPARTMENTAL]: 'Departmental Dashboard',
    [DASHBOARD_TYPES.TEAM]: 'Team Dashboard',
    [DASHBOARD_TYPES.PERSONAL]: 'Personal Dashboard',
    [DASHBOARD_TYPES.CUSTOM]: 'Custom Dashboard',
};

// ============================================
// 7. WIDGET TYPE CONSTANTS
// ============================================

export const WIDGET_TYPES = {
    KPI: 'kpi',
    CHART: 'chart',
    TABLE: 'table',
    HEATMAP: 'heatmap',
    TREND: 'trend',
    GAUGE: 'gauge',
    PIE: 'pie',
    BAR: 'bar',
    LINE: 'line',
    AREA: 'area',
    SCATTER: 'scatter',
    MAP: 'map',
    LIST: 'list',
    SUMMARY: 'summary',
    MISSION: 'mission',
    PIP: 'pip',
    COMPLIANCE: 'compliance',
    CUSTOM: 'custom',
};

export const WIDGET_TYPE_LABELS = {
    [WIDGET_TYPES.KPI]: 'KPI Card',
    [WIDGET_TYPES.CHART]: 'Chart',
    [WIDGET_TYPES.TABLE]: 'Table',
    [WIDGET_TYPES.HEATMAP]: 'Heatmap',
    [WIDGET_TYPES.TREND]: 'Trend Chart',
    [WIDGET_TYPES.GAUGE]: 'Gauge',
    [WIDGET_TYPES.PIE]: 'Pie Chart',
    [WIDGET_TYPES.BAR]: 'Bar Chart',
    [WIDGET_TYPES.LINE]: 'Line Chart',
    [WIDGET_TYPES.AREA]: 'Area Chart',
    [WIDGET_TYPES.SCATTER]: 'Scatter Plot',
    [WIDGET_TYPES.MAP]: 'Map',
    [WIDGET_TYPES.LIST]: 'List',
    [WIDGET_TYPES.SUMMARY]: 'Summary Card',
    [WIDGET_TYPES.MISSION]: 'Mission Status',
    [WIDGET_TYPES.PIP]: 'PIP Tracker',
    [WIDGET_TYPES.COMPLIANCE]: 'Compliance Status',
    [WIDGET_TYPES.CUSTOM]: 'Custom Widget',
};

export const WIDGET_TYPE_DEFAULT_SIZES = {
    [WIDGET_TYPES.KPI]: { w: 3, h: 2 },
    [WIDGET_TYPES.CHART]: { w: 6, h: 4 },
    [WIDGET_TYPES.TABLE]: { w: 6, h: 4 },
    [WIDGET_TYPES.HEATMAP]: { w: 6, h: 4 },
    [WIDGET_TYPES.TREND]: { w: 6, h: 4 },
    [WIDGET_TYPES.GAUGE]: { w: 3, h: 3 },
    [WIDGET_TYPES.PIE]: { w: 4, h: 3 },
    [WIDGET_TYPES.BAR]: { w: 6, h: 4 },
    [WIDGET_TYPES.LINE]: { w: 6, h: 4 },
    [WIDGET_TYPES.AREA]: { w: 6, h: 4 },
    [WIDGET_TYPES.SCATTER]: { w: 6, h: 4 },
    [WIDGET_TYPES.MAP]: { w: 8, h: 5 },
    [WIDGET_TYPES.LIST]: { w: 4, h: 3 },
    [WIDGET_TYPES.SUMMARY]: { w: 4, h: 2 },
    [WIDGET_TYPES.MISSION]: { w: 6, h: 4 },
    [WIDGET_TYPES.PIP]: { w: 6, h: 4 },
    [WIDGET_TYPES.COMPLIANCE]: { w: 6, h: 4 },
    [WIDGET_TYPES.CUSTOM]: { w: 4, h: 3 },
};

// ============================================
// 8. FILTER TYPE CONSTANTS
// ============================================

export const FILTER_TYPES = {
    DATE_RANGE: 'date_range',
    DROPDOWN: 'dropdown',
    MULTI_SELECT: 'multi_select',
    TEXT: 'text',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    HIERARCHY: 'hierarchy',
    CUSTOM: 'custom',
};

export const FILTER_TYPE_LABELS = {
    [FILTER_TYPES.DATE_RANGE]: 'Date Range',
    [FILTER_TYPES.DROPDOWN]: 'Dropdown',
    [FILTER_TYPES.MULTI_SELECT]: 'Multi-Select',
    [FILTER_TYPES.TEXT]: 'Text',
    [FILTER_TYPES.NUMBER]: 'Number',
    [FILTER_TYPES.BOOLEAN]: 'Boolean',
    [FILTER_TYPES.HIERARCHY]: 'Hierarchical',
    [FILTER_TYPES.CUSTOM]: 'Custom',
};

// ============================================
// 9. SHARE TYPE & PERMISSION CONSTANTS
// ============================================

export const SHARE_TYPES = {
    INTERNAL: 'internal',
    EXTERNAL: 'external',
    PUBLIC: 'public',
};

export const SHARE_TYPE_LABELS = {
    [SHARE_TYPES.INTERNAL]: 'Internal Share',
    [SHARE_TYPES.EXTERNAL]: 'External Share',
    [SHARE_TYPES.PUBLIC]: 'Public Link',
};

export const SHARE_PERMISSIONS = {
    VIEW: 'view',
    COMMENT: 'comment',
    EDIT: 'edit',
    EXPORT: 'export',
};

export const SHARE_PERMISSION_LABELS = {
    [SHARE_PERMISSIONS.VIEW]: 'View Only',
    [SHARE_PERMISSIONS.COMMENT]: 'View & Comment',
    [SHARE_PERMISSIONS.EDIT]: 'View, Comment & Edit',
    [SHARE_PERMISSIONS.EXPORT]: 'View, Comment, Edit & Export',
};

// ============================================
// 10. AUDIT ACTION CONSTANTS
// ============================================

export const AUDIT_ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    EXPORT: 'export',
    SHARE: 'share',
    SCHEDULE: 'schedule',
    GENERATE: 'generate',
    REFRESH: 'refresh',
    ARCHIVE: 'archive',
    RESTORE: 'restore',
    PERMISSION_CHANGE: 'permission_change',
    CONFIG_CHANGE: 'config_change',
    LOGIN: 'login',
    LOGOUT: 'logout',
};

export const AUDIT_ACTION_LABELS = {
    [AUDIT_ACTIONS.VIEW]: 'View',
    [AUDIT_ACTIONS.CREATE]: 'Create',
    [AUDIT_ACTIONS.EDIT]: 'Edit',
    [AUDIT_ACTIONS.DELETE]: 'Delete',
    [AUDIT_ACTIONS.EXPORT]: 'Export',
    [AUDIT_ACTIONS.SHARE]: 'Share',
    [AUDIT_ACTIONS.SCHEDULE]: 'Schedule',
    [AUDIT_ACTIONS.GENERATE]: 'Generate',
    [AUDIT_ACTIONS.REFRESH]: 'Refresh',
    [AUDIT_ACTIONS.ARCHIVE]: 'Archive',
    [AUDIT_ACTIONS.RESTORE]: 'Restore',
    [AUDIT_ACTIONS.PERMISSION_CHANGE]: 'Permission Change',
    [AUDIT_ACTIONS.CONFIG_CHANGE]: 'Configuration Change',
    [AUDIT_ACTIONS.LOGIN]: 'Login',
    [AUDIT_ACTIONS.LOGOUT]: 'Logout',
};

// ============================================
// 11. DEFAULT CONFIGURATIONS
// ============================================

export const DEFAULT_REPORT_CONFIG = {
    page_size: 'A4',
    orientation: 'portrait',
    margins: { top: 25, bottom: 25, left: 20, right: 20 },
    font_family: 'Arial',
    font_size: 10,
    show_page_numbers: true,
    show_timestamp: true,
    date_format: '%Y-%m-%d',
    datetime_format: '%Y-%m-%d %H:%M:%S',
};

export const DEFAULT_DASHBOARD_CONFIG = {
    grid_columns: 12,
    row_height: 100,
    spacing: 10,
    theme: 'light',
    auto_refresh: true,
    refresh_interval: 300,
};

export const DEFAULT_CHART_CONFIG = {
    width: 800,
    height: 400,
    responsive: true,
    show_legend: true,
    show_tooltip: true,
    animation: true,
    theme: 'light',
};

export const DEFAULT_TABLE_CONFIG = {
    responsive: true,
    striped: true,
    bordered: true,
    hover: true,
    small: false,
    show_footer: true,
};

// ============================================
// 12. CACHE TTL CONSTANTS
// ============================================

export const CACHE_TTL = {
    SHORT: 300,
    MEDIUM: 1800,
    DEFAULT: 3600,
    LONG: 86400,
    VERY_LONG: 604800,
};

// ============================================
// 13. PAGINATION CONSTANTS
// ============================================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE: 1,
};

// ============================================
// 14. EXPORT LIMITS
// ============================================

export const EXPORT_LIMITS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    MAX_ROWS: 100000,
    MAX_PAGES: 1000,
};

// ============================================
// 15. SECTOR TYPES
// ============================================

export const SECTOR_TYPES = {
    COMMERCIAL: 'commercial',
    NGO: 'ngo',
    PUBLIC: 'public',
    CONSULTING: 'consulting',
    ALL: 'all',
};

export const SECTOR_TYPE_LABELS = {
    [SECTOR_TYPES.COMMERCIAL]: 'Commercial/Corporate',
    [SECTOR_TYPES.NGO]: 'NGO/Non-Profit',
    [SECTOR_TYPES.PUBLIC]: 'Public Sector',
    [SECTOR_TYPES.CONSULTING]: 'Consulting',
    [SECTOR_TYPES.ALL]: 'All Sectors',
};

// ============================================
// 16. TEMPLATE TYPES
// ============================================

export const TEMPLATE_TYPES = {
    EXECUTIVE: 'executive',
    DEPARTMENTAL: 'departmental',
    KPI: 'kpi',
    MISSION: 'mission',
    COMPLIANCE: 'compliance',
    TREND: 'trend',
    COMPARATIVE: 'comparative',
    PIP: 'pip',
    CUSTOM: 'custom',
};

export const TEMPLATE_TYPE_LABELS = {
    [TEMPLATE_TYPES.EXECUTIVE]: 'Executive Dashboard',
    [TEMPLATE_TYPES.DEPARTMENTAL]: 'Departmental Scorecard',
    [TEMPLATE_TYPES.KPI]: 'KPI Report',
    [TEMPLATE_TYPES.MISSION]: 'Mission Status Report',
    [TEMPLATE_TYPES.COMPLIANCE]: 'Compliance Report',
    [TEMPLATE_TYPES.TREND]: 'Trend Analysis',
    [TEMPLATE_TYPES.COMPARATIVE]: 'Comparative Analysis',
    [TEMPLATE_TYPES.PIP]: 'PIP Report',
    [TEMPLATE_TYPES.CUSTOM]: 'Custom Template',
};

// ============================================
// 17. DATA SOURCE TYPES
// ============================================

export const DATA_SOURCE_TYPES = {
    KPI: 'kpi',
    REVIEWS: 'reviews',
    TASKS: 'tasks',
    PIP: 'pip',
    COMBINED: 'combined',
};

export const DATA_SOURCE_LABELS = {
    [DATA_SOURCE_TYPES.KPI]: 'KPI Data',
    [DATA_SOURCE_TYPES.REVIEWS]: 'Review Data',
    [DATA_SOURCE_TYPES.TASKS]: 'Task Data',
    [DATA_SOURCE_TYPES.PIP]: 'PIP Data',
    [DATA_SOURCE_TYPES.COMBINED]: 'Combined Data',
};

// ============================================
// 18. DELIVERY METHODS
// ============================================

export const DELIVERY_METHODS = {
    DOWNLOAD: 'download',
    EMAIL: 'email',
    S3: 's3',
    WEBHOOK: 'webhook',
};

export const DELIVERY_METHOD_LABELS = {
    [DELIVERY_METHODS.DOWNLOAD]: 'Download',
    [DELIVERY_METHODS.EMAIL]: 'Email',
    [DELIVERY_METHODS.S3]: 'S3 Storage',
    [DELIVERY_METHODS.WEBHOOK]: 'Webhook',
};

// ============================================
// 19. EXECUTION STATUS
// ============================================

export const EXECUTION_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',
};

export const EXECUTION_STATUS_LABELS = {
    [EXECUTION_STATUS.PENDING]: 'Pending',
    [EXECUTION_STATUS.RUNNING]: 'Running',
    [EXECUTION_STATUS.COMPLETED]: 'Completed',
    [EXECUTION_STATUS.FAILED]: 'Failed',
    [EXECUTION_STATUS.CANCELLED]: 'Cancelled',
    [EXECUTION_STATUS.TIMEOUT]: 'Timeout',
};

export const EXECUTION_STATUS_COLORS = {
    [EXECUTION_STATUS.PENDING]: '#94a3b8',
    [EXECUTION_STATUS.RUNNING]: '#3b82f6',
    [EXECUTION_STATUS.COMPLETED]: '#10b981',
    [EXECUTION_STATUS.FAILED]: '#ef4444',
    [EXECUTION_STATUS.CANCELLED]: '#64748b',
    [EXECUTION_STATUS.TIMEOUT]: '#f59e0b',
};

// ============================================
// 20. CHART COLORS
// ============================================

export const CHART_COLORS = {
    PRIMARY: '#2563eb',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    PURPLE: '#8b5cf6',
    PINK: '#ec4899',
    TEAL: '#14b8a6',
    ORANGE: '#f97316',
    GRAY: '#64748b',
    SLATE: '#94a3b8',
};

export const CHART_COLOR_PALETTE = [
    CHART_COLORS.PRIMARY,
    CHART_COLORS.SUCCESS,
    CHART_COLORS.WARNING,
    CHART_COLORS.DANGER,
    CHART_COLORS.PURPLE,
    CHART_COLORS.PINK,
    CHART_COLORS.TEAL,
    CHART_COLORS.ORANGE,
];

// ============================================
// 21. STATUS COLOR MAP
// ============================================

export const STATUS_COLORS = {
    'On Track': '#10b981',
    'At Risk': '#f59e0b',
    'Off Track': '#ef4444',
    'Completed': '#10b981',
    'In Progress': '#3b82f6',
    'Pending': '#94a3b8',
    'Failed': '#ef4444',
    'Cancelled': '#64748b',
    'Archived': '#64748b',
    'Draft': '#94a3b8',
    'Generating': '#3b82f6',
    'Queued': '#f59e0b',
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    REPORT_TYPES,
    REPORT_TYPE_LABELS,
    REPORT_TYPE_ICONS,
    REPORT_STATUS,
    REPORT_STATUS_LABELS,
    REPORT_STATUS_COLORS,
    REPORT_STATUS_ICONS,
    REPORT_CATEGORIES,
    REPORT_CATEGORY_LABELS,
    REPORT_FORMATS,
    REPORT_FORMAT_LABELS,
    REPORT_FORMAT_EXTENSIONS,
    REPORT_FORMAT_MIME_TYPES,
    SCHEDULE_FREQUENCIES,
    SCHEDULE_FREQUENCY_LABELS,
    SCHEDULE_FREQUENCY_CRON,
    DASHBOARD_TYPES,
    DASHBOARD_TYPE_LABELS,
    WIDGET_TYPES,
    WIDGET_TYPE_LABELS,
    WIDGET_TYPE_DEFAULT_SIZES,
    FILTER_TYPES,
    FILTER_TYPE_LABELS,
    SHARE_TYPES,
    SHARE_TYPE_LABELS,
    SHARE_PERMISSIONS,
    SHARE_PERMISSION_LABELS,
    AUDIT_ACTIONS,
    AUDIT_ACTION_LABELS,
    DEFAULT_REPORT_CONFIG,
    DEFAULT_DASHBOARD_CONFIG,
    DEFAULT_CHART_CONFIG,
    DEFAULT_TABLE_CONFIG,
    CACHE_TTL,
    PAGINATION,
    EXPORT_LIMITS,
    SECTOR_TYPES,
    SECTOR_TYPE_LABELS,
    TEMPLATE_TYPES,
    TEMPLATE_TYPE_LABELS,
    DATA_SOURCE_TYPES,
    DATA_SOURCE_LABELS,
    DELIVERY_METHODS,
    DELIVERY_METHOD_LABELS,
    EXECUTION_STATUS,
    EXECUTION_STATUS_LABELS,
    EXECUTION_STATUS_COLORS,
    CHART_COLORS,
    CHART_COLOR_PALETTE,
    STATUS_COLORS,
};