/**
 * WebSocket Service Type Definitions (JSDoc)
 * 
 * @module WebSocket Types
 */

/**
 * @typedef {Object} WebSocketMessage
 * @property {string} type - Message type
 * @property {Object} [data] - Message data
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} ScoreUpdateMessage
 * @property {'score_update'} type - Message type
 * @property {Object} data - Score data
 * @property {string} data.kpiId - KPI ID
 * @property {string} data.kpiName - KPI name
 * @property {number} data.score - Score value
 * @property {string} data.status - Traffic light status
 * @property {string} data.period - Period string
 */

/**
 * @typedef {Object} TeamUpdateMessage
 * @property {'team_update'} type - Message type
 * @property {Object} data - Team update data
 * @property {string} data.userId - User ID
 * @property {string} data.userName - User name
 * @property {number} data.score - Score value
 * @property {string} data.status - Traffic light status
 */

/**
 * @typedef {Object} ValidationUpdateMessage
 * @property {'validation_update'} type - Message type
 * @property {Object} data - Validation update data
 * @property {string} data.actualId - Actual entry ID
 * @property {string} data.status - Validation status
 * @property {string} [data.comment] - Validation comment
 */

/**
 * @typedef {Object} NotificationMessage
 * @property {'notification'} type - Message type
 * @property {Object} data - Notification data
 * @property {string} data.id - Notification ID
 * @property {string} data.title - Notification title
 * @property {string} data.message - Notification message
 * @property {string} data.type - Notification type (info, success, warning, error)
 * @property {string} data.timestamp - Timestamp
 */

/**
 * @typedef {Object} OrganizationHealthUpdate
 * @property {'organization_health_update'} type - Message type
 * @property {Object} data - Health data
 * @property {number} data.overallHealth - Overall health score
 * @property {number} data.redKPICount - Red KPI count
 * @property {number} data.complianceRate - Compliance rate
 */

/**
 * @typedef {Object} RedAlertMessage
 * @property {'red_alert'} type - Message type
 * @property {Object} data - Alert data
 * @property {string} data.kpiId - KPI ID
 * @property {string} data.kpiName - KPI name
 * @property {string} data.userId - User ID
 * @property {string} data.userName - User name
 * @property {number} data.consecutiveMonths - Consecutive red months
 * @property {number} data.score - Current score
 */

// WebSocket connection states
export const WebSocketState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

// Message types
export const WebSocketMessageType = {
    // Dashboard updates
    SCORE_UPDATE: 'score_update',
    TEAM_UPDATE: 'team_update',
    VALIDATION_UPDATE: 'validation_update',
    ORGANIZATION_HEALTH_UPDATE: 'organization_health_update',
    DEPARTMENT_UPDATE: 'department_update',
    
    // Notifications
    NOTIFICATION: 'notification',
    RED_ALERT: 'red_alert',
    
    // Control messages
    PING: 'ping',
    PONG: 'pong',
    SUBSCRIBE: 'subscribe',
    REFRESH: 'refresh',
    
    // Errors
    ERROR: 'error'
};

// Subscription types
export const SubscriptionType = {
    SCORE_UPDATES: 'score_updates',
    TEAM_UPDATES: 'team_updates',
    VALIDATION_UPDATES: 'validation_updates',
    NOTIFICATIONS: 'notifications',
    ORGANIZATION_HEALTH: 'organization_health'
};

// Connection types
export const ConnectionType = {
    DASHBOARD: 'dashboard',
    TEAM: 'team',
    EXECUTIVE: 'executive',
    NOTIFICATIONS: 'notifications',
    SCORES: 'scores',
    VALIDATION: 'validation'
};

export default {
    WebSocketState,
    WebSocketMessageType,
    SubscriptionType,
    ConnectionType
};