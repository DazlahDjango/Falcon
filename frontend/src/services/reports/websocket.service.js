import { websocketService } from '../websocket';
import { getAccessToken } from '../accounts/storage/secureStorage';
import { REPORTPLT_WS, websocketBase } from '../../config/constants/websocketApiConstants';

class ReportsWebSocketService {
  constructor() {
    this.connections = {
      dashboard: null,
      reportStatus: null,
      notifications: null
    };
  }

  async connectDashboard(dashboardId, onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = `reportplt_dashboard_${dashboardId}`;
    const endpoint = REPORTPLT_WS.DASHBOARD(dashboardId);
    this.connections.dashboard = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.dashboard;
  }

  disconnectDashboard(dashboardId) {
    const key = `reportplt_dashboard_${dashboardId}`;
    websocketService.disconnect(key);
    this.connections.dashboard = null;
  }

  async connectReportStatus(reportId, onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = `reportplt_status_${reportId}`;
    const endpoint = REPORTPLT_WS.REPORT_STATUS(reportId);
    this.connections.reportStatus = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.reportStatus;
  }

  disconnectReportStatus(reportId) {
    const key = `reportplt_status_${reportId}`;
    websocketService.disconnect(key);
    this.connections.reportStatus = null;
  }

  async connectNotifications(onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = 'reportplt_notifications';
    const endpoint = REPORTPLT_WS.NOTIFICATIONS;
    this.connections.notifications = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.notifications;
  }

  disconnectNotifications() {
    websocketService.disconnect('reportplt_notifications');
    this.connections.notifications = null;
  }

  send(key, message) {
    return websocketService.send(key, message);
  }

  disconnectAll() {
    websocketService.disconnectAll();
    this.connections = { dashboard: null, reportStatus: null, notifications: null };
  }
}

export const reportsWebSocketService = new ReportsWebSocketService();
export default reportsWebSocketService;
