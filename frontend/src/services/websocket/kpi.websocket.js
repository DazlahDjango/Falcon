import websocketService from './websocket.service';
import { KPI_WS } from '../../config/constants/websocketApiConstants';

class KPIWebSocket {
    constructor() {
        this.service = websocketService;
        this.connections = {
            dashboard: null,
            team: null,
            executive: null,
            notifications: null,
            scores: null,
            validation: null,
            reports: null,
            analytics: null,
            alerts: null
        };
    }

    init(baseUrl, authToken) {
        this.service.init(baseUrl, authToken);
    }

    // Dashboard Connections
    connectDashboard(userId, onMessage, onOpen = null) {
        const key = `dashboard_${userId}`;
        const endpoint = KPI_WS.DASHBOARD(userId);
        this.connections.dashboard = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.dashboard;
    }

    disconnectDashboard(userId) {
        const key = `dashboard_${userId}`;
        this.service.disconnect(key);
        this.connections.dashboard = null;
    }

    // Team Connections
    connectTeamDashboard(managerId, onMessage, onOpen = null) {
        const key = `team_${managerId}`;
        const endpoint = KPI_WS.TEAM(managerId);
        this.connections.team = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.team;
    }

    disconnectTeamDashboard(managerId) {
        const key = `team_${managerId}`;
        this.service.disconnect(key);
        this.connections.team = null;
    }

    // Executive Connections
    connectExecutiveDashboard(tenantId, onMessage, onOpen = null) {
        const key = `executive_${tenantId}`;
        const endpoint = KPI_WS.EXECUTIVE(tenantId);
        this.connections.executive = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.executive;
    }

    disconnectExecutiveDashboard(tenantId) {
        const key = `executive_${tenantId}`;
        this.service.disconnect(key);
        this.connections.executive = null;
    }

    // Notifications Connections
    connectNotifications(userId, onMessage, onOpen = null) {
        const key = `notifications_${userId}`;
        const endpoint = KPI_WS.NOTIFICATIONS(userId);
        this.connections.notifications = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.notifications;
    }

    disconnectNotifications(userId) {
        const key = `notifications_${userId}`;
        this.service.disconnect(key);
        this.connections.notifications = null;
    }

    // Scores Connections
    connectScores(userId, onMessage, onOpen = null) {
        const key = `scores_${userId}`;
        const endpoint = KPI_WS.SCORES(userId);
        this.connections.scores = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.scores;
    }

    disconnectScores(userId) {
        const key = `scores_${userId}`;
        this.service.disconnect(key);
        this.connections.scores = null;
    }

    // Validation Connections
    connectValidation(userId, onMessage, onOpen = null) {
        const key = `validation_${userId}`;
        const endpoint = KPI_WS.VALIDATION(userId);
        this.connections.validation = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.validation;
    }

    disconnectValidation(userId) {
        const key = `validation_${userId}`;
        this.service.disconnect(key);
        this.connections.validation = null;
    }

    // Reports Connections
    connectReports(reportId, onMessage, onOpen = null) {
        const key = `report_${reportId}`;
        const endpoint = KPI_WS.REPORTS(reportId);
        this.connections.reports = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.reports;
    }

    disconnectReports(reportId) {
        const key = `report_${reportId}`;
        this.service.disconnect(key);
        this.connections.reports = null;
    }

    // Analytics Connections
    connectAnalytics(tenantId, onMessage, onOpen = null) {
        const key = `analytics_${tenantId}`;
        const endpoint = KPI_WS.ANALYTICS(tenantId);
        this.connections.analytics = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.analytics;
    }

    disconnectAnalytics(tenantId) {
        const key = `analytics_${tenantId}`;
        this.service.disconnect(key);
        this.connections.analytics = null;
    }

    // Alerts Connections
    connectAlerts(tenantId, onMessage, onOpen = null) {
        const key = `alerts_${tenantId}`;
        const endpoint = KPI_WS.ALERTS(tenantId);
        this.connections.alerts = this.service.connect(key, endpoint, onMessage, onOpen);
        return this.connections.alerts;
    }

    disconnectAlerts(tenantId) {
        const key = `alerts_${tenantId}`;
        this.service.disconnect(key);
        this.connections.alerts = null;
    }

    // Utility Methods
    refreshDashboard(userId, dashboardType) {
        const key = `${dashboardType}_${userId}`;
        return this.service.send(key, { type: 'refresh' });
    }

    subscribe(userId, dashboardType, subscription) {
        const key = `${dashboardType}_${userId}`;
        return this.service.send(key, { type: 'subscribe', subscription });
    }

    addListener(userId, connectionType, callback) {
        const key = `${connectionType}_${userId}`;
        this.service.addListener(key, callback);
    }

    removeListener(userId, connectionType, callback) {
        const key = `${connectionType}_${userId}`;
        this.service.removeListener(key, callback);
    }

    getConnectionStatus(connectionType, userId) {
        const key = `${connectionType}_${userId}`;
        return this.service.isConnected(key);
    }

    getAllConnectionStatuses(userId) {
        return {
            dashboard: this.service.isConnected(`dashboard_${userId}`),
            scores: this.service.isConnected(`scores_${userId}`),
            validation: this.service.isConnected(`validation_${userId}`),
            notifications: this.service.isConnected(`notifications_${userId}`)
        };
    }

    disconnectAll() {
        this.service.disconnectAll();
        this.connections = {
            dashboard: null,
            team: null,
            executive: null,
            notifications: null,
            scores: null,
            validation: null,
            reports: null,
            analytics: null,
            alerts: null
        };
    }
}

export default new KPIWebSocket();