// frontend/src/types/dashboard/widget.types.js
/**
 * Dashboard Widget type definitions
 */

// Widget Types
export const WIDGET_TYPE = {
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
};

// Widget Types
/**
 * @typedef {Object} WidgetConfig
 * @property {string} id - Widget ID
 * @property {string} tenantId - Tenant ID
 * @property {string} dashboardId - Dashboard ID
 * @property {string} widgetType - Widget type
 * @property {number} row - Grid row position
 * @property {number} col - Grid column position
 * @property {number} width - Widget width in grid cells
 * @property {number} height - Widget height in grid cells
 * @property {Object} config - Widget-specific configuration
 * @property {string} title - Widget title
 * @property {boolean} showTitle - Whether to show title
 * @property {number} refreshInterval - Auto-refresh interval in seconds
 * @property {boolean} isVisible - Whether widget is visible
 * @property {number} order - Display order
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

// KPI List Widget Specific Types
/**
 * @typedef {Object} KPIListWidgetConfig
 * @property {string[]} kpiIds - KPI IDs to display
 * @property {string} sortBy - Sort field (score, name, status)
 * @property {string} sortOrder - Sort order (asc, desc)
 * @property {number} maxItems - Maximum items to show
 * @property {boolean} showTrend - Whether to show trend indicators
 * @property {boolean} compact - Compact view mode
 */

// Trend Chart Widget Specific Types
/**
 * @typedef {Object} TrendChartWidgetConfig
 * @property {string} kpiId - KPI ID for trend
 * @property {string} chartType - Chart type (line, bar, area)
 * @property {number} period - Period in months
 * @property {boolean} showTarget - Whether to show target line
 */

// Department Heatmap Widget Specific Types
/**
 * @typedef {Object} DepartmentHeatmapWidgetConfig
 * @property {string[]} departmentIds - Department IDs to include
 * @property {string} sortBy - Sort field (score, name, employees)
 * @property {boolean} showEmployeeCount - Whether to show employee count
 */

// Red Alert Widget Specific Types
/**
 * @typedef {Object} RedAlertWidgetConfig
 * @property {number} thresholdDays - Days threshold for red alert
 * @property {number} maxItems - Maximum items to show
 */

// Team Performance Widget Specific Types
/**
 * @typedef {Object} TeamPerformanceWidgetConfig
 * @property {string} teamId - Team ID
 * @property {boolean} showAggregate - Whether to show aggregate metrics
 * @property {string} sortBy - Sort field
 */

// Widget Props Types
/**
 * @typedef {Object} WidgetProps
 * @property {*} data - Widget data
 * @property {boolean} loading - Loading state
 * @property {string} error - Error message
 * @property {string} title - Widget title
 * @property {Function} onRefresh - Refresh callback
 * @property {Function} onExport - Export callback
 * @property {Function} onKpiClick - KPI click callback
 * @property {Function} onDepartmentClick - Department click callback
 * @property {Function} onUserClick - User click callback
 * @property {Function} onAlertClick - Alert click callback
 */

// Widget Position Update Types
/**
 * @typedef {Object} WidgetPositionUpdate
 * @property {string} id - Widget ID
 * @property {number} row - New row position
 * @property {number} col - New column position
 */

// Bulk Widget Update Types
/**
 * @typedef {Object} BulkWidgetUpdate
 * @property {Array<WidgetPositionUpdate>} updates - Position updates
 * @property {string} dashboardId - Dashboard ID
 */