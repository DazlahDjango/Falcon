import { DASHBOARD_WS } from '../../config/constants/websocketApiConstants';
import { getAccessToken } from '../accounts/storage/secureStorage';
import { websocketService } from '../websocket';

class DashboardWebSocketService {
  constructor() {
    this.connectionKey = null;
    this.currentDashboardType = null;
  }

  async connect(dashboardType, onMessage, onError, onClose) {
    const token = await getAccessToken();
    if (!token) {
      console.error('[DashboardWS] No access token available');
      return false;
    }

    if (!dashboardType || typeof dashboardType !== 'string') {
      console.error('[DashboardWS] Invalid dashboardType:', dashboardType);
      return false;
    }

    this.currentDashboardType = dashboardType;
    const endpoint = DASHBOARD_WS.DASHBOARD(dashboardType);
    const key = `dashboard_${dashboardType}`;
    this.connectionKey = key;

    websocketService.setAuthToken(token);
    websocketService.connect(
      key,
      endpoint,
      (data) => {
        if (onMessage) onMessage(data);
      },
      () => {
        console.log(`[DashboardWS] Connected to ${dashboardType} dashboard`);
      },
      (error) => {
        console.error('[DashboardWS] Error:', error);
        if (onError) onError(error);
      },
      (event) => {
        console.log(`[DashboardWS] Disconnected (${dashboardType}): ${event?.code}`);
        if (onClose) onClose(event);
      },
      { shouldReconnect: true }
    );

    return true;
  }

  disconnect() {
    if (this.connectionKey) {
      websocketService.disconnect(this.connectionKey);
      this.connectionKey = null;
    }
    this.currentDashboardType = null;
  }

  send(data) {
    if (this.connectionKey) {
      return websocketService.send(this.connectionKey, data);
    }
    return false;
  }

  refresh() {
    return this.send({ action: 'refresh' });
  }

  ping() {
    return this.send({ action: 'ping' });
  }

  isConnected() {
    return this.connectionKey ? websocketService.isConnected(this.connectionKey) : false;
  }
}

export const dashboardWebSocket = new DashboardWebSocketService();
export default dashboardWebSocket;