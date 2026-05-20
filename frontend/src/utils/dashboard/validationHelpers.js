// frontend/src/utils/dashboard/validationHelpers.js
/**
 * Validation utility functions for dashboard data
 */

/**
 * Validate dashboard type
 * @param {string} dashboardType - Dashboard type to validate
 * @returns {boolean} True if valid
 */
export const isValidDashboardType = (dashboardType) => {
  const validTypes = ['executive', 'client_admin', 'super_admin', 'manager', 'staff', 'champion', 'read_only'];
  return validTypes.includes(dashboardType);
};

/**
 * Validate widget type
 * @param {string} widgetType - Widget type to validate
 * @returns {boolean} True if valid
 */
export const isValidWidgetType = (widgetType) => {
  const validTypes = [
    'kpi_list', 'trend_chart', 'department_heatmap', 'compliance',
    'red_alert', 'pending_approvals', 'missing_data', 'tenant_summary',
    'subscription_status', 'org_tree', 'executive_scorecard',
    'client_kpi_breakdown', 'team_performance'
  ];
  return validTypes.includes(widgetType);
};

/**
 * Validate score value
 * @param {number} score - Score to validate
 * @returns {boolean} True if valid
 */
export const isValidScore = (score) => {
  if (score === null || score === undefined) return false;
  if (typeof score !== 'number') return false;
  if (isNaN(score)) return false;
  return score >= 0 && score <= 100;
};

/**
 * Validate date range
 * @param {Object} dateRange - Date range object
 * @param {Date} dateRange.start - Start date
 * @param {Date} dateRange.end - End date
 * @returns {boolean} True if valid
 */
export const isValidDateRange = (dateRange) => {
  if (!dateRange) return false;
  if (!dateRange.start || !dateRange.end) return false;
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return start <= end;
};

/**
 * Validate period type
 * @param {string} period - Period type
 * @returns {boolean} True if valid
 */
export const isValidPeriod = (period) => {
  const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  return validPeriods.includes(period);
};

/**
 * Validate filter object
 * @param {Object} filters - Filter object
 * @returns {boolean} True if valid
 */
export const isValidFilters = (filters) => {
  if (!filters) return true;
  
  const allowedKeys = ['period', 'department_ids', 'kpi_categories', 'status', 'date_from', 'date_to', 'search'];
  
  for (const key of Object.keys(filters)) {
    if (!allowedKeys.includes(key)) return false;
  }
  
  if (filters.period && !isValidPeriod(filters.period)) return false;
  if (filters.status && !['green', 'yellow', 'red', 'pending', 'approved', 'rejected'].includes(filters.status)) {
    return false;
  }
  
  return true;
};

/**
 * Validate dashboard layout
 * @param {Object} layout - Layout object
 * @returns {boolean} True if valid
 */
export const isValidLayout = (layout) => {
  if (!layout) return false;
  if (typeof layout.columns !== 'number' || layout.columns < 1 || layout.columns > 24) return false;
  if (typeof layout.cellHeight !== 'number' || layout.cellHeight < 20) return false;
  if (layout.margin && (typeof layout.margin !== 'number' || layout.margin < 0)) return false;
  
  return true;
};

/**
 * Validate widget position
 * @param {Object} position - Position object
 * @param {number} columns - Number of columns
 * @returns {boolean} True if valid
 */
export const isValidWidgetPosition = (position, columns = 12) => {
  if (!position) return false;
  if (typeof position.row !== 'number' || position.row < 0) return false;
  if (typeof position.col !== 'number' || position.col < 0) return false;
  if (typeof position.width !== 'number' || position.width < 1 || position.width > columns) return false;
  if (typeof position.height !== 'number' || position.height < 1) return false;
  if (position.col + position.width > columns) return false;
  
  return true;
};

/**
 * Sanitize filter values (prevent injection)
 * @param {Object} filters - Filter object
 * @returns {Object} Sanitized filters
 */
export const sanitizeFilters = (filters) => {
  if (!filters) return {};
  
  const sanitized = {};
  
  if (filters.period && isValidPeriod(filters.period)) {
    sanitized.period = filters.period;
  }
  
  if (filters.department_ids && Array.isArray(filters.department_ids)) {
    sanitized.department_ids = filters.department_ids.filter(id => typeof id === 'string' && id.length > 0);
  }
  
  if (filters.kpi_categories && Array.isArray(filters.kpi_categories)) {
    sanitized.kpi_categories = filters.kpi_categories.filter(cat => typeof cat === 'string');
  }
  
  if (filters.status && ['green', 'yellow', 'red'].includes(filters.status)) {
    sanitized.status = filters.status;
  }
  
  if (filters.date_from && /^\d{4}-\d{2}-\d{2}$/.test(filters.date_from)) {
    sanitized.date_from = filters.date_from;
  }
  
  if (filters.date_to && /^\d{4}-\d{2}-\d{2}$/.test(filters.date_to)) {
    sanitized.date_to = filters.date_to;
  }
  
  if (filters.search && typeof filters.search === 'string') {
    sanitized.search = filters.search.substring(0, 100);
  }
  
  return sanitized;
};

/**
 * Validate email for export recipients
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate export schedule config
 * @param {Object} config - Schedule configuration
 * @param {string} scheduleType - Schedule type
 * @returns {boolean} True if valid
 */
export const isValidScheduleConfig = (config, scheduleType) => {
  if (!config) return false;
  
  if (scheduleType === 'weekly') {
    if (typeof config.day_of_week !== 'number' || config.day_of_week < 0 || config.day_of_week > 6) return false;
  }
  
  if (scheduleType === 'monthly') {
    if (typeof config.day_of_month !== 'number' || config.day_of_month < 1 || config.day_of_month > 28) return false;
  }
  
  if (config.time_of_day && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(config.time_of_day)) {
    return false;
  }
  
  return true;
};