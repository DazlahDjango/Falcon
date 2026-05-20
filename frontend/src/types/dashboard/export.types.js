// frontend/src/types/dashboard/export.types.js
/**
 * Dashboard Export type definitions
 */

// Export Format Types
export const EXPORT_FORMAT = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  PNG: 'png'
};

// Schedule Type Types
export const SCHEDULE_TYPE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly'
};

// Export Status Types
export const EXPORT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
};

// Export Types
/**
 * @typedef {Object} ExportSchedule
 * @property {string} id - Export schedule ID
 * @property {string} tenantId - Tenant ID
 * @property {string} userId - User ID
 * @property {string} dashboardType - Dashboard type to export
 * @property {string} format - Export format
 * @property {string} scheduleType - Schedule type
 * @property {Object} scheduleConfig - Schedule configuration
 * @property {Object} filters - Filters to apply on export
 * @property {string[]} recipients - Email recipients
 * @property {boolean} isActive - Whether schedule is active
 * @property {string} lastRunAt - Last run timestamp
 * @property {string} lastRunStatus - Last run status
 * @property {string} nextRunAt - Next scheduled run
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

// Schedule Configuration Types
/**
 * @typedef {Object} DailyScheduleConfig
 * @property {string} timeOfDay - Time of day (HH:MM)
 */

/**
 * @typedef {Object} WeeklyScheduleConfig
 * @property {number} dayOfWeek - Day of week (0=Monday, 6=Sunday)
 * @property {string} timeOfDay - Time of day (HH:MM)
 */

/**
 * @typedef {Object} MonthlyScheduleConfig
 * @property {number} dayOfMonth - Day of month (1-28)
 * @property {string} timeOfDay - Time of day (HH:MM)
 */

/**
 * @typedef {Object} QuarterlyScheduleConfig
 * @property {number} monthOfQuarter - Month in quarter (1, 2, 3)
 * @property {number} dayOfMonth - Day of month
 * @property {string} timeOfDay - Time of day
 */

// Export History Types
/**
 * @typedef {Object} ExportHistoryItem
 * @property {string} id - Export ID
 * @property {string} name - Export name
 * @property {string} dashboardType - Dashboard type
 * @property {string} format - Export format
 * @property {string} status - Export status
 * @property {string} createdAt - Creation timestamp
 * @property {number} fileSize - File size in bytes
 * @property {string} downloadUrl - Download URL
 * @property {string} errorMessage - Error message if failed
 */

// Export Request Types
/**
 * @typedef {Object} ExportRequest
 * @property {string} dashboardType - Dashboard type to export
 * @property {string} format - Export format
 * @property {Object} filters - Filters to apply
 * @property {string} dateRange - Date range preset
 * @property {string} dateFrom - Start date
 * @property {string} dateTo - End date
 */

// Export Response Types
/**
 * @typedef {Object} ExportResponse
 * @property {string} exportId - Export ID
 * @property {string} status - Export status
 * @property {string} downloadUrl - Download URL when ready
 * @property {string} message - Status message
 */

// Export List Response Types
/**
 * @typedef {Object} ExportListResponse
 * @property {ExportSchedule[]} results - Export list
 * @property {number} count - Total count
 * @property {string} next - Next page URL
 * @property {string} previous - Previous page URL
 */

// Export History Response Types
/**
 * @typedef {Object} ExportHistoryResponse
 * @property {ExportHistoryItem[]} results - History items
 * @property {number} count - Total count
 * @property {string} next - Next page URL
 * @property {string} previous - Previous page URL
 */