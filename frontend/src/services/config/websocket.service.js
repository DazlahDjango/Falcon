import { CONFIG_WS } from '../../config/constants/configApiConstants';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';
import { websocketService } from '../websocket';

class ConfigWebSocketService {
  constructor() {
    this.sockets = new Map();
    this.listeners = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }
  async connectMaintenance(tenantId = null, onMessage, onError, onClose) {
    const wsTenantId = tenantId || await getTenantId() || 'system';
    const connectionId = `maintenance_${wsTenantId}`;
    const url = CONFIG_WS.MAINTENANCE_STATUS(wsTenantId);
    const token = await getAccessToken();
    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    return this._connect(connectionId, wsUrl, onMessage, onError, onClose);
  }
  async connectBackupProgress(backupJobId, onMessage, onError, onClose) {
    const url = CONFIG_WS.BACKUP_PROGRESS(backupJobId);
    const token = await getAccessToken();
    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    return this._connect(`backup_${backupJobId}`, wsUrl, onMessage, onError, onClose);
  }
  async connectDRProgress(executionId, onMessage, onError, onClose) {
    const url = CONFIG_WS.DR_PROGRESS(executionId);
    const token = await getAccessToken();
    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    return this._connect(`dr_${executionId}`, wsUrl, onMessage, onError, onClose);
  }
  _connect(id, url, onMessage, onError, onClose) {
    if (this.sockets.has(id) && websocketService.isConnected(id)) {
      return this.sockets.get(id);
    }

    // Ensure websocketService has the correct auth token if present in URL
    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    if (tokenMatch && tokenMatch[1]) {
      websocketService.setAuthToken(decodeURIComponent(tokenMatch[1]));
    }

    const ws = websocketService.connect(
      id,
      url,
      (data) => {
        if (onMessage) onMessage(data);
        const listeners = this.listeners.get(id);
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      },
      () => {
        console.log(`[ConfigWS] Connected: ${id}`);
        this.reconnectAttempts.set(id, 0);
      },
      (error) => {
        console.error(`[ConfigWS] Error: ${id}`, error);
        if (onError) onError(error);
      },
      () => {
        console.log(`[ConfigWS] Closed: ${id}`);
        if (onClose) onClose();
      },
      { shouldReconnect: true }
    );

    this.sockets.set(id, ws);
    return ws;
  }
  _reconnect(id, url, onMessage, onError, onClose) {
    // Reconnect is handled by websocketService
  }
  disconnect(id) {
    websocketService.disconnect(id);
    this.sockets.delete(id);
    this.listeners.delete(id);
    this.reconnectAttempts.delete(id);
  }
  disconnectAll() {
    this.sockets.forEach((socket, id) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
    this.sockets.clear();
    this.listeners.clear();
    this.reconnectAttempts.clear();
  }
  addListener(id, listener) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id).add(listener);
  }
  removeListener(id, listener) {
    if (this.listeners.has(id)) {
      this.listeners.get(id).delete(listener);
    }
  }
  isConnected(id) {
    const socket = this.sockets.get(id);
    return socket && socket.readyState === WebSocket.OPEN;
  }
}

export const configWebSocketService = new ConfigWebSocketService();