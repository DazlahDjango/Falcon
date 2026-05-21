// frontend/src/config/constants/dashboardConstants.js

// ===================== DASHBOARD TYPES =====================

export const DASHBOARD_TYPES = {
  EXECUTIVE: 'executive',
  CLIENT_ADMIN: 'client_admin',
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CHAMPION: 'champion',
  READ_ONLY: 'read_only'
}

export const DASHBOARD_LABELS = {
  [DASHBOARD_TYPES.EXECUTIVE]: 'Executive Dashboard',
  [DASHBOARD_TYPES.CLIENT_ADMIN]: 'Client Admin Dashboard',
  [DASHBOARD_TYPES.SUPER_ADMIN]: 'Super Admin Dashboard',
  [DASHBOARD_TYPES.MANAGER]: 'Manager Dashboard',
  [DASHBOARD_TYPES.STAFF]: 'My Dashboard',
  [DASHBOARD_TYPES.CHAMPION]: 'Dashboard Champion',
  [DASHBOARD_TYPES.READ_ONLY]: 'Read-Only Dashboard'
}

// ===================== WIDGET TYPES =====================

export const WIDGET_TYPES = {
  KPI_LIST: 'kpi_list',
  TREND_CHART: 'trend_chart',
  DEPARTMENT_HEATMAP: 'department_heatmap',
  COMPLIANCE: 'compliance',
  RED_ALERT: 'red_alert',
  PENDING_APPROVALS: 'pending_approvals',
  MISSING_DATA: 'missing_data',
  TENANT_SUMMARY: 'tenant_summary',
  SUBSCRIPTION_STATUS: 'subscription_status',
  ORG_TREE: 'org_tree',
  EXECUTIVE_SCORECARD: 'executive_scorecard',
  CLIENT_KPI_BREAKDOWN: 'client_kpi_breakdown',
  TEAM_PERFORMANCE: 'team_performance'
}

export const WIDGET_LABELS = {
  [WIDGET_TYPES.KPI_LIST]: 'KPI List',
  [WIDGET_TYPES.TREND_CHART]: 'Trend Chart',
  [WIDGET_TYPES.DEPARTMENT_HEATMAP]: 'Department Performance',
  [WIDGET_TYPES.COMPLIANCE]: 'Compliance Status',
  [WIDGET_TYPES.RED_ALERT]: 'Critical Alerts',
  [WIDGET_TYPES.PENDING_APPROVALS]: 'Pending Approvals',
  [WIDGET_TYPES.MISSING_DATA]: 'Missing Data',
  [WIDGET_TYPES.TENANT_SUMMARY]: 'Tenant Overview',
  [WIDGET_TYPES.SUBSCRIPTION_STATUS]: 'Subscription Status',
  [WIDGET_TYPES.ORG_TREE]: 'Organization Structure',
  [WIDGET_TYPES.EXECUTIVE_SCORECARD]: 'Executive Scorecard',
  [WIDGET_TYPES.CLIENT_KPI_BREAKDOWN]: 'KPI Breakdown',
  [WIDGET_TYPES.TEAM_PERFORMANCE]: 'Team Performance'
}

// ===================== TRAFFIC LIGHT =====================

export const TRAFFIC_LIGHT = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
  GREY: 'grey'
}

export const TRAFFIC_LIGHT_LABELS = {
  [TRAFFIC_LIGHT.GREEN]: 'On Track',
  [TRAFFIC_LIGHT.YELLOW]: 'At Risk',
  [TRAFFIC_LIGHT.RED]: 'Off Track',
  [TRAFFIC_LIGHT.GREY]: 'No Data'
}

export const TRAFFIC_LIGHT_COLORS = {
  [TRAFFIC_LIGHT.GREEN]: '#10b981',
  [TRAFFIC_LIGHT.YELLOW]: '#f59e0b',
  [TRAFFIC_LIGHT.RED]: '#ef4444',
  [TRAFFIC_LIGHT.GREY]: '#9ca3af'
}

export const TRAFFIC_LIGHT_BG_COLORS = {
  [TRAFFIC_LIGHT.GREEN]: '#d1fae5',
  [TRAFFIC_LIGHT.YELLOW]: '#fed7aa',
  [TRAFFIC_LIGHT.RED]: '#fee2e2',
  [TRAFFIC_LIGHT.GREY]: '#e5e7eb'
}

// ===================== ALERT TYPES =====================

export const ALERT_TYPES = {
  RED_KPI: 'red_kpi',
  MISSING_DATA: 'missing_data',
  PENDING_APPROVAL: 'pending_approval',
  SUBMISSION_DUE: 'submission_due',
  TARGET_ACHIEVED: 'target_achieved',
  KPI_TREND: 'kpi_trend',
  TENANT_EXPIRY: 'tenant_expiry',
  LOW_UTILIZATION: 'low_utilization'
}

export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
}

export const ALERT_SEVERITY_COLORS = {
  [ALERT_SEVERITY.CRITICAL]: '#ef4444',
  [ALERT_SEVERITY.WARNING]: '#f59e0b',
  [ALERT_SEVERITY.INFO]: '#3b82f6'
}

export const ALERT_FREQUENCY = {
  REALTIME: 'realtime',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly'
}

// ===================== EXPORT FORMATS =====================

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  PNG: 'png'
}

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.PDF]: 'PDF Document',
  [EXPORT_FORMATS.EXCEL]: 'Excel Spreadsheet',
  [EXPORT_FORMATS.CSV]: 'CSV File',
  [EXPORT_FORMATS.PNG]: 'PNG Image'
}

// ===================== SCHEDULE TYPES =====================

export const SCHEDULE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly'
}

export const SCHEDULE_LABELS = {
  [SCHEDULE_TYPES.DAILY]: 'Daily',
  [SCHEDULE_TYPES.WEEKLY]: 'Weekly',
  [SCHEDULE_TYPES.MONTHLY]: 'Monthly',
  [SCHEDULE_TYPES.QUARTERLY]: 'Quarterly'
}

// ===================== COMPARISON TYPES =====================

export const COMPARISON_TYPES = {
  MONTH_OVER_MONTH: 'mom',
  QUARTER_OVER_QUARTER: 'qoq',
  YEAR_OVER_YEAR: 'yoy',
  CUSTOM: 'custom'
}

export const COMPARISON_LABELS = {
  [COMPARISON_TYPES.MONTH_OVER_MONTH]: 'Month over Month',
  [COMPARISON_TYPES.QUARTER_OVER_QUARTER]: 'Quarter over Quarter',
  [COMPARISON_TYPES.YEAR_OVER_YEAR]: 'Year over Year',
  [COMPARISON_TYPES.CUSTOM]: 'Custom Period'
}

// ===================== PERIOD TYPES =====================

export const PERIOD_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CURRENT: 'current'
}

// ===================== MANAGER DASHBOARD CONSTANTS =====================

export const TEAM_VIEW_MODES = {
  LIST: 'list',
  CARDS: 'cards',
  GRID: 'grid'
}

export const TEAM_VIEW_MODE_LABELS = {
  [TEAM_VIEW_MODES.LIST]: 'List View',
  [TEAM_VIEW_MODES.CARDS]: 'Card View',
  [TEAM_VIEW_MODES.GRID]: 'Grid View'
}

export const TEAM_SORT_OPTIONS = [
  { value: 'name', label: 'By Name' },
  { value: 'score', label: 'By Score' },
  { value: 'status', label: 'By Status' }
]

// ===================== STAFF DASHBOARD CONSTANTS =====================

export const KPI_DISPLAY_MODES = {
  LIST: 'list',
  CARDS: 'cards',
  COMPACT: 'compact'
}

export const KPI_DISPLAY_MODE_LABELS = {
  [KPI_DISPLAY_MODES.LIST]: 'List View',
  [KPI_DISPLAY_MODES.CARDS]: 'Card View',
  [KPI_DISPLAY_MODES.COMPACT]: 'Compact View'
}

export const KPI_SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NOT_SUBMITTED: 'not_submitted',
  SUBMITTED: 'submitted'
}

export const KPI_SUBMISSION_STATUS_LABELS = {
  [KPI_SUBMISSION_STATUS.PENDING]: 'Pending Approval',
  [KPI_SUBMISSION_STATUS.APPROVED]: 'Approved',
  [KPI_SUBMISSION_STATUS.REJECTED]: 'Rejected',
  [KPI_SUBMISSION_STATUS.NOT_SUBMITTED]: 'Not Submitted',
  [KPI_SUBMISSION_STATUS.SUBMITTED]: 'Submitted'
}

export const KPI_SUBMISSION_STATUS_COLORS = {
  [KPI_SUBMISSION_STATUS.PENDING]: '#f59e0b',
  [KPI_SUBMISSION_STATUS.APPROVED]: '#10b981',
  [KPI_SUBMISSION_STATUS.REJECTED]: '#ef4444',
  [KPI_SUBMISSION_STATUS.NOT_SUBMITTED]: '#9ca3af',
  [KPI_SUBMISSION_STATUS.SUBMITTED]: '#3b82f6'
}

// ===================== CHAMPION DASHBOARD CONSTANTS =====================

export const TEMPLATE_CATEGORIES = {
  SALES: 'sales',
  FINANCE: 'finance',
  HR: 'hr',
  OPERATIONS: 'operations',
  MARKETING: 'marketing',
  CUSTOM: 'custom'
}

export const TEMPLATE_CATEGORY_LABELS = {
  [TEMPLATE_CATEGORIES.SALES]: 'Sales',
  [TEMPLATE_CATEGORIES.FINANCE]: 'Finance',
  [TEMPLATE_CATEGORIES.HR]: 'Human Resources',
  [TEMPLATE_CATEGORIES.OPERATIONS]: 'Operations',
  [TEMPLATE_CATEGORIES.MARKETING]: 'Marketing',
  [TEMPLATE_CATEGORIES.CUSTOM]: 'Custom'
}

// ===================== READ-ONLY DASHBOARD CONSTANTS =====================

export const READ_ONLY_VIEW_TYPES = {
  EXECUTIVE: 'executive',
  MANAGER: 'manager',
  STAFF: 'staff'
}

export const READ_ONLY_VIEW_LABELS = {
  [READ_ONLY_VIEW_TYPES.EXECUTIVE]: 'Executive View',
  [READ_ONLY_VIEW_TYPES.MANAGER]: 'Manager View',
  [READ_ONLY_VIEW_TYPES.STAFF]: 'Staff View'
}

// ===================== GENERIC DASHBOARD CONSTANTS =====================

export const DASHBOARD_FILTERS = {
  PERIOD: 'period',
  DEPARTMENT: 'department',
  KPI_CATEGORY: 'kpi_category',
  STATUS: 'status',
  DATE_FROM: 'date_from',
  DATE_TO: 'date_to',
  USER_ID: 'user_id',
  VIEW_TYPE: 'view_type'
}

export const DEFAULT_FILTERS = {
  period: PERIOD_TYPES.MONTHLY,
  status: null,
  department: null,
  kpi_category: null
}

// ===================== DEFAULT LAYOUTS =====================

export const DEFAULT_DASHBOARD_LAYOUT = {
  widgets: [],
  columns: 12,
  cellHeight: 100,
  margin: 10,
  containerPadding: 20,
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0
  }
}

export const DEFAULT_WIDGET_DIMENSIONS = {
  minWidth: 2,
  maxWidth: 12,
  minHeight: 2,
  maxHeight: 12,
  defaultWidth: 4,
  defaultHeight: 3
}

// ===================== SCORE THRESHOLDS =====================

export const SCORE_THRESHOLDS = {
  GREEN_MIN: 90,
  YELLOW_MIN: 50,
  RED_MAX: 49
}

// ===================== REFRESH INTERVALS =====================

export const REFRESH_INTERVALS = {
  NEVER: 0,
  THIRTY_SECONDS: 30,
  ONE_MINUTE: 60,
  TWO_MINUTES: 120,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600
}

export const REFRESH_INTERVAL_LABELS = {
  [REFRESH_INTERVALS.NEVER]: 'Never',
  [REFRESH_INTERVALS.THIRTY_SECONDS]: '30 seconds',
  [REFRESH_INTERVALS.ONE_MINUTE]: '1 minute',
  [REFRESH_INTERVALS.TWO_MINUTES]: '2 minutes',
  [REFRESH_INTERVALS.FIVE_MINUTES]: '5 minutes',
  [REFRESH_INTERVALS.TEN_MINUTES]: '10 minutes'
}

// ===================== CACHE TTL =====================

export const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  DAY: 86400
}

// ===================== RATE LIMITS =====================

export const RATE_LIMITS = {
  DASHBOARD_VIEW: { limit: 60, period: 60 },
  EXPORT: { limit: 20, period: 3600 },
  REFRESH: { limit: 10, period: 60 },
  WIDGET_CONFIG: { limit: 30, period: 60 }
}

// ===================== HIERARCHY SETTINGS =====================

export const HIERARCHY = {
  MAX_DEPTH: 10,
  DEFAULT_EXPAND_LEVEL: 2
}

// ===================== WEBSOCKET SETTINGS =====================

export const WEBSOCKET = {
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000
}

// ===================== PAGINATION =====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}