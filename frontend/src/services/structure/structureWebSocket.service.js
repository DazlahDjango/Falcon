import { store } from '../../store';
import { addNotification } from '../../store/slices/notificationSlice';
import { updateDepartment, updateTeam, updateEmployment } from '../../store/slices/structure/structureUiSlice';

class StructureWebSocketService {
  constructor() {
    this.socket = null;
    this.tenantId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.heartbeatInterval = null;
  }

  connect(tenantId) {
    if (!tenantId) {
      console.error('[WebSocket] Tenant ID is required');
      return;
    }
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }
    if (this.isConnecting) {
      console.log('[WebSocket] Connection already in progress');
      return;
    }
    this.tenantId = tenantId;
    this.isConnecting = true;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
    const token = store.getState().auth?.accessToken;
    const wsUrl = `${wsHost}/ws/structure/${tenantId}/events/?token=${token}`;
    try {
      this.socket = new WebSocket(wsUrl);
      this.socket.onopen = this._handleOpen.bind(this);
      this.socket.onmessage = this._handleMessage.bind(this);
      this.socket.onclose = this._handleClose.bind(this);
      this.socket.onerror = this._handleError.bind(this);
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      this._scheduleReconnect();
    }
  }

  _handleOpen() {
    console.log('[WebSocket] Connected to structure events');
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this._startHeartbeat();
    this._subscribeToEvents();
  }

  _startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
  }
 
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  _subscribeToEvents() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe_all' }));
    }
  }

  subscribeToDepartment(departmentId) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe_department',
        department_id: departmentId,
      }));
    }
  }

  subscribeToTeam(teamId) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe_team',
        team_id: teamId,
      }));
    }
  }

  _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'pong':
          break;
        case 'org_event':
          this._handleOrgEvent(data);
          break;
        case 'department_change':
          this._handleDepartmentChange(data);
          break;
        case 'team_change':
          this._handleTeamChange(data);
          break;
        case 'employment_change':
          this._handleEmploymentChange(data);
          break;
        case 'reporting_change':
          this._handleReportingChange(data);
          break;
        case 'chain_updated':
          this._handleChainUpdate(data);
          break;
        case 'manager_changed':
          this._handleManagerChange(data);
          break;
        case 'new_subordinate':
          this._handleNewSubordinate(data);
          break;
        default:
          console.log('[WebSocket] Unknown event type:', data.type);
      }
      if (this.listeners.has(data.type)) {
        this.listeners.get(data.type).forEach(callback => callback(data));
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  }
  
  _handleOrgEvent(data) {
    console.log('[WebSocket] Org event:', data.event_type, data.data);
    if (data.event_type === 'department_updated' && data.data?.department_id) {
      store.dispatch(updateDepartment({
        id: data.data.department_id,
        changes: data.data,
      }));
    } else if (data.event_type === 'team_updated' && data.data?.team_id) {
      store.dispatch(updateTeam({
        id: data.data.team_id,
        changes: data.data,
      }));
    } else if (data.event_type === 'employment_updated' && data.data?.user_id) {
      store.dispatch(updateEmployment({
        user_id: data.data.user_id,
        changes: data.data,
      }));
    }
    const importantEvents = ['restructure', 'manager_change', 'transfer'];
    if (importantEvents.includes(data.event_type)) {
      store.dispatch(addNotification({
        type: 'info',
        title: 'Structure Update',
        message: data.data?.message || 'Organizational structure has been updated',
        timestamp: Date.now(),
      }));
    }
  }

  _handleDepartmentChange(data) {
    console.log('[WebSocket] Department change:', data.change_type, data.department_id);
    store.dispatch(updateDepartment({
      id: data.department_id,
      changes: data.data,
      changeType: data.change_type,
    }));
  }

  _handleTeamChange(data) {
    console.log('[WebSocket] Team change:', data.change_type, data.team_id);
    store.dispatch(updateTeam({
      id: data.team_id,
      changes: data.data,
      changeType: data.change_type,
    }));
  }

  _handleEmploymentChange(data) {
    console.log('[WebSocket] Employment change:', data.change_type, data.user_id);
    store.dispatch(updateEmployment({
      user_id: data.user_id,
      changes: data.data,
      changeType: data.change_type,
    }));
  }

  _handleReportingChange(data) {
    console.log('[WebSocket] Reporting change:', data.change_type, data.employee_id, data.manager_id);
    this._invalidateReportingCache(data.employee_id, data.manager_id);
  }

  _handleChainUpdate(data) {
    console.log('[WebSocket] Chain updated for user:', data.user_id);
    if (this.listeners.has('chain_invalidated')) {
      this.listeners.get('chain_invalidated').forEach(callback => callback(data.user_id));
    }
  }

  _handleManagerChange(data) {
    console.log('[WebSocket] Manager changed:', data.old_manager, '→', data.new_manager);
    store.dispatch(addNotification({
      type: 'warning',
      title: 'Manager Changed',
      message: `Your manager has been changed. ${data.new_manager ? 'New manager assigned.' : 'Manager removed.'}`,
      timestamp: Date.now(),
    }));
  }

  _handleNewSubordinate(data) {
    console.log('[WebSocket] New subordinate assigned:', data.subordinate);
    store.dispatch(addNotification({
      type: 'info',
      title: 'Team Update',
      message: 'A new team member has been assigned to you.',
      timestamp: Date.now(),
    }));
  }
 
  _invalidateReportingCache(employeeId, managerId) {
    if (this.listeners.has('cache_invalidate')) {
      this.listeners.get('cache_invalidate').forEach(callback => callback({
        type: 'reporting_chain',
        employee_id: employeeId,
        manager_id: managerId,
      }));
    }
  }

  _handleClose(event) {
    console.log(`[WebSocket] Disconnected: ${event.code} - ${event.reason}`);
    this._stopHeartbeat();
    this.socket = null;
    this.isConnecting = false;
    if (event.code !== 1000) {
      this._scheduleReconnect();
    }
  }

  _handleError(event) {
    console.error('[WebSocket] Error:', event);
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    setTimeout(() => {
      this.reconnectAttempts++;
      if (this.tenantId) {
        this.connect(this.tenantId);
      }
    }, delay);
  }

  disconnect() {
    this._stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    console.log('[WebSocket] Disconnected');
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }

  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  removeEventListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const structureWebSocketService = new StructureWebSocketService();

export default structureWebSocketService;