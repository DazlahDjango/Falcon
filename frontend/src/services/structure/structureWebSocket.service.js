import { store } from '../../store';
import { STRUCTURE_WS, websocketBase } from '../../config/constants/websocketApiConstants';
import { websocketService } from '../websocket';

class StructureWebSocketService {
  constructor() {
    this.tenantId = null;
    this.connectionKey = null;
    this.listeners = new Map();
  }

  async connect(tenantId) {
    if (!tenantId) {
      console.error('[StructureWS] Tenant ID is required');
      return;
    }

    this.tenantId = tenantId;
    this.connectionKey = `structure_${tenantId}`;

    if (websocketService.isConnected(this.connectionKey)) {
      return;
    }

    const token = store.getState().auth?.accessToken;
    if (token) {
      websocketService.setAuthToken(token);
    }

    const endpoint = STRUCTURE_WS.EVENTS(tenantId);
    websocketService.init(websocketBase, token);

    websocketService.connect(
      this.connectionKey,
      endpoint,
      (data) => this._handleIncomingData(data),
      () => {
        console.log(`[StructureWS] Connected to structure events for tenant ${tenantId}`);
        this.subscribeAll();
      },
      (err) => {
        console.error('[StructureWS] Connection error:', err);
      },
      (event) => {
        console.log(`[StructureWS] Closed: ${event?.code}`);
      },
      { shouldReconnect: true }
    );
  }

  subscribeAll() {
    return websocketService.send(this.connectionKey, { type: 'subscribe_all' });
  }

  subscribeToDepartment(departmentId) {
    return websocketService.send(this.connectionKey, {
      type: 'subscribe_department',
      department_id: departmentId,
    });
  }

  subscribeToTeam(teamId) {
    return websocketService.send(this.connectionKey, {
      type: 'subscribe_team',
      team_id: teamId,
    });
  }

  _handleIncomingData(data) {
    if (data.type === 'pong') return;
    const callbacks = this.listeners.get(data.type) || [];
    callbacks.forEach(cb => cb(data));
  }

  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  removeEventListener(eventType, callback) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) callbacks.splice(idx, 1);
    }
  }

  disconnect() {
    if (this.connectionKey) {
      websocketService.disconnect(this.connectionKey);
      this.connectionKey = null;
    }
    this.listeners.clear();
  }

  isConnected() {
    return this.connectionKey ? websocketService.isConnected(this.connectionKey) : false;
  }
}

export const structureWebSocketService = new StructureWebSocketService();
export default structureWebSocketService;