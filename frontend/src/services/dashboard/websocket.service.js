import { WEBSOCKET_PATHS } from '../../config/constants/dashboardApiConstants';
import { getAccessToken } from '../accounts/storage/secureStorage';

class DashboardWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
  }

  async connect(dashboardType, onMessage, onError, onClose) {
    const token = await getAccessToken();
    if (!token) {
      console.error('[WebSocket] No access token available');
      return false;
    }

    const wsUrl = WEBSOCKET_PATHS.DASHBOARD(dashboardType);
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log(`[WebSocket] Connected to ${dashboardType} dashboard`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') return;
        if (onMessage) onMessage(data);
        this.notifyListeners(data);
      } catch (error) {
        console.error('[WebSocket] Message parse error:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      if (onError) onError(error);
    };

    this.socket.onclose = (event) => {
      console.log(`[WebSocket] Disconnected: ${event.code} - ${event.reason}`);
      this.stopHeartbeat();
      if (onClose) onClose(event);
      this.reconnect(dashboardType, onMessage, onError, onClose);
    };

    return true;
  }

  reconnect(dashboardType, onMessage, onError, onClose) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(dashboardType, onMessage, onError, onClose);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
    this.listeners.clear();
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    console.warn('[WebSocket] Cannot send message: socket not open');
    return false;
  }

  refresh() {
    return this.send({ action: 'refresh' });
  }

  subscribeKpi(kpiId) {
    return this.send({ action: 'subscribe_kpi', kpi_id: kpiId });
  }

  addListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  removeListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
  }

  notifyListeners(data) {
    const eventType = data.type;
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => callback(data));
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({ action: 'ping' });
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export const dashboardWebSocket = new DashboardWebSocketService();