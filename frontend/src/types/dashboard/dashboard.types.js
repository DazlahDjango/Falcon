// frontend/src/types/dashboard/dashboard.types.js
/**
 * Dashboard core type definitions
 * Following 3S strategy: Security, Stability, Solidity
 */

// Dashboard Types
export const DASHBOARD_TYPE = {
  EXECUTIVE: 'executive',
  CLIENT_ADMIN: 'client_admin',
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CHAMPION: 'champion',
  READ_ONLY: 'read_only'
};

// Dashboard State Types
export const DASHBOARD_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  REFRESHING: 'refreshing'
};

// Dashboard Configuration Types
/**
 * @typedef {Object} DashboardLayout
 * @property {Array<DashboardWidget>} widgets - Widget configurations
 * @property {number} columns - Number of grid columns (default: 12)
 * @property {number} cellHeight - Height of each grid cell in pixels
 * @property {number} margin - Margin between widgets in pixels
 */

/**
 * @typedef {Object} DashboardFilter
 * @property {string} period - Time period (daily, weekly, monthly, quarterly, yearly)
 * @property {string} dateFrom - Start date (ISO format)
 * @property {string} dateTo - End date (ISO format)
 * @property {string[]} departmentIds - Selected department IDs
 * @property {string[]} kpiCategories - Selected KPI categories
 * @property {string} status - Status filter (green, yellow, red)
 * @property {string} search - Search query
 */

/**
 * @typedef {Object} DashboardConfig
 * @property {string} id - Dashboard configuration ID
 * @property {string} tenantId - Tenant ID
 * @property {string} userId - User ID
 * @property {string} dashboardType - Type of dashboard
 * @property {DashboardLayout} layout - Layout configuration
 * @property {DashboardFilter} defaultFilters - Default filter settings
 * @property {string} defaultTimePeriod - Default time period
 * @property {string} defaultView - Default view mode
 * @property {boolean} isDefault - Whether this is default dashboard
 * @property {boolean} isShared - Whether dashboard is shared
 * @property {string[]} sharedWithRoles - Roles that can access shared dashboard
 * @property {string} name - Dashboard name
 * @property {string} description - Dashboard description
 * @property {number} version - Configuration version
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} DashboardError
 * @property {boolean} success - Whether request succeeded
 * @property {number} status - HTTP status code
 * @property {string} message - Error message
 * @property {Object} errors - Detailed validation errors
 * @property {string} timestamp - Error timestamp
 */

/**
 * @typedef {Object} DashboardResponse
 * @property {boolean} success - Whether request succeeded
 * @property {*} data - Response data
 * @property {number} status - HTTP status code
 * @property {string} message - Response message
 * @property {string} timestamp - Response timestamp
 */