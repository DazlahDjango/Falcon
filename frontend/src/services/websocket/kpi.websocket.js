import websocketService from './websocket.service';

class KPIWebSocket {
    constructor() {
        this.service = websocketService;
        this.connections = {
            dashboard: null,
            team: null,
            executive: null,
            notifications: null,
            scores: null,
            validation: null
        };
    }
    init(baseUrl, authToken) {
        this.service.init(baseUrl, authToken);
    }
    connectDashboard(userId, onMessage, onOpen = null) {
        const key = `dashboard_${userId}`;
        const endpoint = `/ws/kpi/dashboard/${userId}/`;
        this.connections.dashboard = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.dashboard;
    }
    disconnectDashboard(userId) {
        const key = `dashboard_${userId}`;
        this.service.disconnect(key);
        this.connections.dashboard = null;
    }
    connectTeamDashboard(managerId, onMessage, onOpen = null) {
        const key = `team_${managerId}`;
        const endpoint = `/ws/kpi/team/${managerId}/`;
        this.connections.team = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.team;
    }
    disconnectTeamDashboard(managerId) {
        const key = `team_${managerId}`;
        this.service.disconnect(key);
        this.connections.team = null;
    }
    connectExecutiveDashboard(tenantId, onMessage, onOpen = null) {
        const key = `executive_${tenantId}`;
        const endpoint = `/ws/kpi/executive/${tenantId}/`;
        
        this.connections.executive = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.executive;
    }
    disconnectExecutiveDashboard(tenantId) {
        const key = `executive_${tenantId}`;
        this.service.disconnect(key);
        this.connections.executive = null;
    }
    connectNotifications(userId, onMessage, onOpen = null) {
        const key = `notifications_${userId}`;
        const endpoint = `/ws/kpi/notifications/${userId}/`;
        this.connections.notifications = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.notifications;
    }
    disconnectNotifications(userId) {
        const key = `notifications_${userId}`;
        this.service.disconnect(key);
        this.connections.notifications = null;
    }
    connectScores(userId, onMessage, onOpen = null) {
        const key = `scores_${userId}`;
        const endpoint = `/ws/kpi/scores/${userId}/`;
        
        this.connections.scores = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.scores;
    }
    disconnectScores(userId) {
        const key = `scores_${userId}`;
        this.service.disconnect(key);
        this.connections.scores = null;
    }
    connectValidation(userId, onMessage, onOpen = null) {
        const key = `validation_${userId}`;
        const endpoint = `/ws/kpi/validation/${userId}/`;
        
        this.connections.validation = this.service.connect(
            key, endpoint, onMessage, onOpen
        );
        return this.connections.validation;
    }
    disconnectValidation(userId) {
        const key = `validation_${userId}`;
        this.service.disconnect(key);
        this.connections.validation = null;
    }
    refreshDashboard(userId, dashboardType) {
        const key = `${dashboardType}_${userId}`;
        return this.service.send(key, { type: 'refresh' });
    }
    subscribe(userId, dashboardType, subscription) {
        const key = `${dashboardType}_${userId}`;
        return this.service.send(key, {
            type: 'subscribe',
            subscription
        });
    }
    addListener(userId, connectionType, callback) {
        const key = `${connectionType}_${userId}`;
        this.service.addListener(key, callback);
    }
    removeListener(userId, connectionType, callback) {
        const key = `${connectionType}_${userId}`;
        this.service.removeListener(key, callback);
    }
    disconnectAll() {
        this.service.disconnectAll();
        this.connections = {
            dashboard: null,
            team: null,
            executive: null,
            notifications: null,
            scores: null,
            validation: null
        };
    }
}

export default new KPIWebSocket();