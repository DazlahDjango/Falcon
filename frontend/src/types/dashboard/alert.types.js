// frontend/src/types/dashboard/alert.types.js
/**
 * Dashboard Alert type definitions
 */

// Alert Types
export const ALERT_TYPE = {
  RED_KPI: 'red_kpi',
  MISSING_DATA: 'missing_data',
  PENDING_APPROVAL: 'pending_approval',
  SUBMISSION_DUE: 'submission_due',
  TARGET_ACHIEVED: 'target_achieved',
  KPI_TREND: 'kpi_trend',
  TENANT_EXPIRY: 'tenant_expiry',
  LOW_UTILIZATION: 'low_utilization'
};

// Alert Severity Types
export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
};

// Alert Frequency Types
export const ALERT_FREQUENCY = {
  REALTIME: 'realtime',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly'
};

// Alert Types
/**
 * @typedef {Object} DashboardAlert
 * @property {string} id - Alert ID
 * @property {string} tenantId - Tenant ID
 * @property {string} userId - User ID
 * @property {string} alertType - Alert type
 * @property {string} severity - Alert severity (critical, warning, info)
 * @property {Object} config - Alert configuration
 * @property {string} frequency - Alert frequency
 * @property {boolean} sendEmail - Send email notification
 * @property {boolean} sendInApp - Send in-app notification
 * @property {boolean} sendSms - Send SMS notification
 * @property {boolean} isActive - Whether alert is active
 * @property {string} lastTriggeredAt - Last triggered timestamp
 * @property {number} triggerCount - Number of times triggered
 * @property {string} suppressUntil - Suppression end timestamp
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

// Alert Configuration Types
/**
 * @typedef {Object} RedKpiAlertConfig
 * @property {number} thresholdDays - Days threshold for red alert
 */

/**
 * @typedef {Object} MissingDataAlertConfig
 * @property {number} gracePeriodDays - Grace period days
 */

/**
 * @typedef {Object} TenantExpiryAlertConfig
 * @property {number} daysBeforeNotice - Days before expiry to notify
 */

// Alert Response Types
/**
 * @typedef {Object} AlertTriggerResult
 * @property {string} alertId - Alert ID
 * @property {boolean} triggered - Whether alert was triggered
 * @property {string} message - Alert message
 * @property {string} severity - Alert severity
 */

// Alert List Types
/**
 * @typedef {Object} AlertListResponse
 * @property {DashboardAlert[]} results - Alert list
 * @property {number} count - Total count
 * @property {string} next - Next page URL
 * @property {string} previous - Previous page URL
 */