import { CONFIG_WS } from '../../config/constants/configApiConstants';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';

class ConfigWebSocketService {
  constructor() {
    this.sockets = new Map();
    this.listeners = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }
  connectMaintenance(tenantId = null, onMessage, onError, onClose) {
    const wsTenantId = tenantId || getTenantId() || 'system';
    const connectionId = `maintenance_${wsTenantId}`;
    const url = CONFIG_WS.MAINTENANCE_STATUS(wsTenantId);
    return this._connect(connectionId, url, onMessage, onError, onClose);
  }
  connectBackupProgress(backupJobId, onMessage, onError, onClose) {
    const url = CONFIG_WS.BACKUP_PROGRESS(backupJobId);
    return this._connect(`backup_${backupJobId}`, url, onMessage, onError, onClose);
  }
  connectDRProgress(executionId, onMessage, onError, onClose) {
    const url = CONFIG_WS.DR_PROGRESS(executionId);
    return this._connect(`dr_${executionId}`, url, onMessage, onError, onClose);
  }
  _connect(id, url, onMessage, onError, onClose) {
    if (this.sockets.has(id) && this.sockets.get(id).readyState === WebSocket.OPEN) {
      return this.sockets.get(id);
    }
    const ws = new WebSocket(url);
    this.sockets.set(id, ws);
    ws.onopen = () => {
      console.log(`[ConfigWS] Connected: ${id}`);
      this.reconnectAttempts.set(id, 0);
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
        const listeners = this.listeners.get(id);
        if (listeners) {
          listeners.forEach(listener => listener(data));
        }
      } catch (error) {
        console.error(`[ConfigWS] Message parse error:`, error);
      }
    };
    ws.onerror = (error) => {
      console.error(`[ConfigWS] Error: ${id}`, error);
      if (onError) onError(error);
    };
    ws.onclose = () => {
      console.log(`[ConfigWS] Closed: ${id}`);
      this._reconnect(id, url, onMessage, onError, onClose);
      if (onClose) onClose();
    };
    return ws;
  }
  _reconnect(id, url, onMessage, onError, onClose) {
    const attempts = this.reconnectAttempts.get(id) || 0;
    if (attempts >= this.maxReconnectAttempts) {
      console.warn(`[ConfigWS] Max reconnect attempts reached for ${id}`);
      this.sockets.delete(id);
      this.reconnectAttempts.delete(id);
      return;
    }
    this.reconnectAttempts.set(id, attempts + 1);
    setTimeout(() => {
      console.log(`[ConfigWS] Reconnecting ${id} (attempt ${attempts + 1})`);
      this._connect(id, url, onMessage, onError, onClose);
    }, this.reconnectDelay * Math.pow(2, attempts));
  }
  disconnect(id) {
    const socket = this.sockets.get(id);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
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