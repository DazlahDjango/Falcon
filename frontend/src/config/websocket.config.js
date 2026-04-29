import environment from './environment';

const websocketConfig = {
    baseURL: environment.WS_URL,
    // Connection settings
    reconnect: {
        enabled: true,
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
    },
    // Heartbeat
    heartbeat: {
        enabled: true,
        interval: 30000, // 30 seconds
        timeout: 10000, // 10 seconds
    },
    // Endpoints
    endpoints: {
        dashboard: (userId) => `/ws/kpi/dashboard/${userId}/`,
        team: (managerId) => `/ws/kpi/team/${managerId}/`,
        executive: (tenantId) => `/ws/kpi/executive/${tenantId}/`,
        notifications: (userId) => `/ws/kpi/notifications/${userId}/`,
        scores: (userId) => `/ws/kpi/scores/${userId}/`,
        validation: (userId) => `/ws/kpi/validation/${userId}/`,
        admin: '/ws/kpi/admin/monitor/',
    },
    // Message types
    messageTypes: {
        // Incoming
        SCORE_UPDATE: 'score_update',
        TEAM_UPDATE: 'team_update',
        VALIDATION_UPDATE: 'validation_update',
        ORGANIZATION_HEALTH_UPDATE: 'organization_health_update',
        DEPARTMENT_UPDATE: 'department_update',
        NOTIFICATION: 'notification',
        RED_ALERT: 'red_alert',
        // Outgoing
        PING: 'ping',
        PONG: 'pong',
        SUBSCRIBE: 'subscribe',
        UNSUBSCRIBE: 'unsubscribe',
        REFRESH: 'refresh',
    },
    // Subscription types
    subscriptions: {
        SCORE_UPDATES: 'score_updates',
        TEAM_UPDATES: 'team_updates',
        VALIDATION_UPDATES: 'validation_updates',
        NOTIFICATIONS: 'notifications',
        ORGANIZATION_HEALTH: 'organization_health',
    },
};
export default websocketConfig;