// frontend/src/types/dashboard/executive.types.js
/**
 * Executive Dashboard type definitions
 */

// Executive Dashboard Data Types
/**
 * @typedef {Object} ExecutiveDashboardData
 * @property {ExecutiveInfo} executiveInfo - Executive user information
 * @property {OrganizationOverview} organizationOverview - Org-wide metrics
 * @property {DepartmentPerformance[]} departmentPerformance - Department performance list
 * @property {TopIssue[]} topIssues - Critical issues requiring attention
 * @property {KPITrend[]} kpiTrends - KPI trend data
 * @property {Alert[]} recentAlerts - Recent alerts
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} ExecutiveInfo
 * @property {string} id - Executive user ID
 * @property {string} name - Executive full name
 * @property {string} role - User role
 * @property {string} title - Job title
 */

/**
 * @typedef {Object} OrganizationOverview
 * @property {number} totalEmployees - Total number of employees
 * @property {number} totalDepartments - Total number of departments
 * @property {number} totalKpis - Total active KPIs
 * @property {Object} kpiStatus - KPI status distribution
 * @property {number} kpiStatus.green - Number of green KPIs
 * @property {number} kpiStatus.yellow - Number of yellow KPIs
 * @property {number} kpiStatus.red - Number of red KPIs
 * @property {number} overallSubmissionRate - Data submission rate percentage
 * @property {number} activeKpiPercentage - Percentage of active KPIs
 */

/**
 * @typedef {Object} DepartmentPerformance
 * @property {string} id - Department ID
 * @property {string} name - Department name
 * @property {number} employeeCount - Number of employees
 * @property {number} averageScore - Average performance score
 * @property {string} status - Performance status (green, yellow, red)
 * @property {string} trend - Performance trend (up, down, stable)
 */

/**
 * @typedef {Object} TopIssue
 * @property {string} type - Issue type (red_kpi, active_pips, etc.)
 * @property {string} kpiName - KPI name (for red_kpi type)
 * @property {string} ownerId - Owner ID
 * @property {number} currentScore - Current KPI score
 * @property {string} severity - Issue severity (critical, warning, info)
 * @property {number} count - Count (for active_pips type)
 */

/**
 * @typedef {Object} KPITrend
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {number} currentScore - Current score
 * @property {string} status - Status (green, yellow, red)
 * @property {Array<TrendDataPoint>} trend - Trend data points
 */

/**
 * @typedef {Object} TrendDataPoint
 * @property {string} month - Month label (YYYY-MM)
 * @property {number} actual - Actual value
 * @property {number} target - Target value (optional)
 */

// Executive Filter Types
/**
 * @typedef {Object} ExecutiveFilter
 * @property {string} period - Time period (daily, weekly, monthly, quarterly, yearly)
 * @property {string} departmentId - Department ID filter
 * @property {string} kpiStatus - KPI status filter
 * @property {string} dateFrom - Start date
 * @property {string} dateTo - End date
 */

// Executive View Preset Types
/**
 * @typedef {Object} ExecutiveViewPreset
 * @property {string} id - Preset ID
 * @property {string} tenantId - Tenant ID
 * @property {string} userId - User ID
 * @property {string} name - Preset name
 * @property {string} viewType - View type (department, strategic_objective, region, cost_center)
 * @property {Object} filters - Saved filter configuration
 * @property {string} sortBy - Sort field
 * @property {string} sortOrder - Sort order (asc, desc)
 * @property {boolean} showTrafficLights - Whether to show traffic lights
 * @property {boolean} showTrendIndicators - Whether to show trend indicators
 * @property {boolean} isDefault - Whether this is default view
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */