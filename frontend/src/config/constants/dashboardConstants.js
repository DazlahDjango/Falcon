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

export const TRAFFIC_LIGHT = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red'
}

export const TRAFFIC_LIGHT_LABELS = {
  [TRAFFIC_LIGHT.GREEN]: 'On Track',
  [TRAFFIC_LIGHT.YELLOW]: 'At Risk',
  [TRAFFIC_LIGHT.RED]: 'Off Track'
}

export const TRAFFIC_LIGHT_COLORS = {
  [TRAFFIC_LIGHT.GREEN]: '#10b981',
  [TRAFFIC_LIGHT.YELLOW]: '#f59e0b',
  [TRAFFIC_LIGHT.RED]: '#ef4444'
}

export const TRAFFIC_LIGHT_BG_COLORS = {
  [TRAFFIC_LIGHT.GREEN]: '#d1fae5',
  [TRAFFIC_LIGHT.YELLOW]: '#fed7aa',
  [TRAFFIC_LIGHT.RED]: '#fee2e2'
}

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

export const PERIOD_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
}

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

export const DASHBOARD_FILTERS = {
  PERIOD: 'period',
  DEPARTMENT: 'department',
  KPI_CATEGORY: 'kpi_category',
  STATUS: 'status',
  DATE_FROM: 'date_from',
  DATE_TO: 'date_to',
  USER: 'user'
}

export const DEFAULT_FILTERS = {
  period: PERIOD_TYPES.MONTHLY,
  status: null,
  department: null,
  kpi_category: null
}

export const SCORE_THRESHOLDS = {
  GREEN_MIN: 90,
  YELLOW_MIN: 50,
  RED_MAX: 49
}

export const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  DAY: 86400
}

export const RATE_LIMITS = {
  DASHBOARD_VIEW: { limit: 60, period: 60 },
  EXPORT: { limit: 20, period: 3600 },
  REFRESH: { limit: 10, period: 60 },
  WIDGET_CONFIG: { limit: 30, period: 60 }
}

export const HIERARCHY = {
  MAX_DEPTH: 10,
  DEFAULT_EXPAND_LEVEL: 2
}

export const WEBSOCKET = {
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000
}