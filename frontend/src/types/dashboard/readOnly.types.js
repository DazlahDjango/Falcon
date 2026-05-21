// frontend/src/types/dashboard/readOnly.types.js

/**
 * Read-Only Dashboard type definitions
 */

// Read-Only Dashboard Data Types
/**
 * @typedef {Object} ReadOnlyDashboardData
 * @property {string} dashboardType - Dashboard type (executive, manager, staff)
 * @property {string} period - Current period
 * @property {boolean} readOnly - Whether dashboard is in read-only mode
 * @property {boolean} canEdit - Whether user can edit (always false)
 * @property {boolean} canSubmit - Whether user can submit (always false)
 * @property {boolean} canApprove - Whether user can approve (always false)
 * @property {boolean} canConfigure - Whether user can configure (always false)
 * @property {boolean} canExport - Whether user can export data
 * @property {Object} data - Dashboard data (executive, manager, or staff data)
 * @property {string} lastUpdated - Last update timestamp
 */

// Read-Only View Types
/**
 * @typedef {Object} ReadOnlyViewOptions
 * @property {string} value - View type value (executive, manager, staff)
 * @property {string} label - Display label
 * @property {string} icon - Emoji icon
 * @property {string} description - View description
 */

// Read-Only Filter Types
/**
 * @typedef {Object} ReadOnlyFilter
 * @property {string} period - Time period
 * @property {string} viewType - View type (executive, manager, staff)
 * @property {string|null} department - Department filter
 */

// Export Options
/**
 * @typedef {Object} ExportOptions
 * @property {string} format - Export format (pdf, excel, csv)
 * @property {boolean} includeKpis - Whether to include KPI data
 * @property {boolean} includeCharts - Whether to include charts
 * @property {boolean} includeComments - Whether to include comments
 */

// Sensitive Data Masking
/**
 * @typedef {Object} MaskingOptions
 * @property {boolean} maskFinancials - Whether to mask financial data
 * @property {boolean} hideIndividualScores - Whether to hide individual scores
 * @property {boolean} showAggregatedOnly - Whether to show only aggregated data
 */

// Read-Only User Info
/**
 * @typedef {Object} ReadOnlyUserInfo
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role (should be 'read_only')
 * @property {string[]} allowedViewTypes - Allowed dashboard view types
 * @property {boolean} hideSensitiveData - Whether sensitive data is hidden
 */

// Read-Only Preferences
/**
 * @typedef {Object} ReadOnlyPreferences
 * @property {string} defaultViewType - Default dashboard view
 * @property {string[]} allowedViews - Allowed view types
 * @property {number} autoRefreshInterval - Auto-refresh interval in seconds
 * @property {boolean} showExportButton - Whether to show export button
 * @property {boolean} showWatermark - Whether to show watermark
 * @property {string} watermarkText - Watermark text
 */