// frontend/src/services/dashboard/websocket.service.js

import { WEBSOCKET_PATHS } from '../../config/constants/dashboardApiConstants';
import { getAccessToken } from '../accounts/storage/secureStorage';

// ===================== WEBSOCKET CHANNELS =====================

export const WEBSOCKET_CHANNELS = {
  // Executive & Admin channels
  EXECUTIVE: 'dashboard_executive',
  CLIENT_ADMIN: 'dashboard_client_admin',
  SUPER_ADMIN: 'dashboard_super_admin',
  
  // New dashboard channels
  MANAGER: 'dashboard_manager',
  STAFF: 'dashboard_staff',
  CHAMPION: 'dashboard_champion',
  READ_ONLY: 'dashboard_read_only',
  
  // Shared channels
  HIERARCHY: 'hierarchy',
  NOTIFICATIONS: 'notifications',
  ALERTS: 'alerts',
  
  // Dynamic channels
  USER_DASHBOARD: (userId) => `dashboard_user_${userId}`,
  TEAM_DASHBOARD: (managerId) => `dashboard_team_${managerId}`,
}

// ===================== EVENT TYPES =====================

export const EVENT_TYPES = {
  // Existing events
  KPI_UPDATE: 'kpi_update',
  DASHBOARD_UPDATE: 'dashboard_update',
  ALERT_TRIGGER: 'alert_trigger',
  NOTIFICATION: 'send_notification',
  CACHE_INVALIDATION: 'cache_invalidation',
  
  // New events for Manager dashboard
  TEAM_MEMBER_UPDATE: 'team_member_update',
  PENDING_APPROVAL_UPDATE: 'pending_approval_update',
  
  // New events for Staff dashboard
  SUBMISSION_STATUS_UPDATE: 'submission_status_update',
  MISSION_STATUS_UPDATE: 'mission_status_update',
  
  // New events for Champion dashboard
  CONFIG_UPDATE: 'config_update',
  TEMPLATE_UPDATE: 'template_update',
  
  // New events for Read-Only dashboard
  DATA_REFRESH: 'data_refresh',
  
  // Drill-down events
  DRILL_DOWN_DATA: 'drill_down_data',
  
  // Connection events
  CONNECTION_ESTABLISHED: 'connection_established',
  PONG: 'pong',
  ERROR: 'error'
}

class DashboardWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.currentDashboardType = null;
    this.subscribedChannels = new Set();
  }

  // ===================== CONNECTION METHODS =====================

  async connect(dashboardType, onMessage, onError, onClose) {
    const token = await getAccessToken();
    if (!token) {
      console.error('[WebSocket] No access token available');
      return false;
    }

    this.currentDashboardType = dashboardType;
    const wsUrl = WEBSOCKET_PATHS.DASHBOARD(dashboardType);
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log(`[WebSocket] Connected to ${dashboardType} dashboard`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.notifyListeners(EVENT_TYPES.CONNECTION_ESTABLISHED, {
        dashboardType,
        timestamp: new Date().toISOString()
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === EVENT_TYPES.PONG) return;
        if (onMessage) onMessage(data);
        this.notifyListeners(data.type, data);
      } catch (error) {
        console.error('[WebSocket] Message parse error:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      if (onError) onError(error);
      this.notifyListeners(EVENT_TYPES.ERROR, { error });
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
      this.notifyListeners(EVENT_TYPES.ERROR, { 
        error: 'Max reconnect attempts reached',
        fatal: true 
      });
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
    this.currentDashboardType = null;
    this.subscribedChannels.clear();
    this.listeners.clear();
  }

  // ===================== SEND METHODS =====================

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

  ping() {
    return this.send({ action: 'ping', timestamp: Date.now() });
  }

  subscribeKpi(kpiId) {
    return this.send({ action: 'subscribe_kpi', kpi_id: kpiId });
  }

  unsubscribeKpi(kpiId) {
    return this.send({ action: 'unsubscribe_kpi', kpi_id: kpiId });
  }

  // ===================== DASHBOARD SPECIFIC SUBSCRIPTIONS =====================

  /**
   * Subscribe to Manager Dashboard updates
   * @param {Function} onMessage - Callback for all messages
   * @param {Function} onTeamUpdate - Callback for team member updates
   * @param {Function} onApprovalUpdate - Callback for pending approval updates
   */
  subscribeToManagerDashboard(onMessage, onTeamUpdate, onApprovalUpdate) {
    this.addListener(EVENT_TYPES.TEAM_MEMBER_UPDATE, onTeamUpdate);
    this.addListener(EVENT_TYPES.PENDING_APPROVAL_UPDATE, onApprovalUpdate);
    
    return () => {
      this.removeListener(EVENT_TYPES.TEAM_MEMBER_UPDATE, onTeamUpdate);
      this.removeListener(EVENT_TYPES.PENDING_APPROVAL_UPDATE, onApprovalUpdate);
    };
  }

  /**
   * Subscribe to Staff Dashboard updates
   * @param {Function} onMessage - Callback for all messages
   * @param {Function} onSubmissionUpdate - Callback for submission status updates
   * @param {Function} onMissionUpdate - Callback for mission status updates
   */
  subscribeToStaffDashboard(onMessage, onSubmissionUpdate, onMissionUpdate) {
    this.addListener(EVENT_TYPES.SUBMISSION_STATUS_UPDATE, onSubmissionUpdate);
    this.addListener(EVENT_TYPES.MISSION_STATUS_UPDATE, onMissionUpdate);
    
    return () => {
      this.removeListener(EVENT_TYPES.SUBMISSION_STATUS_UPDATE, onSubmissionUpdate);
      this.removeListener(EVENT_TYPES.MISSION_STATUS_UPDATE, onMissionUpdate);
    };
  }

  /**
   * Subscribe to Champion Dashboard updates
   * @param {Function} onMessage - Callback for all messages
   * @param {Function} onConfigUpdate - Callback for config updates
   * @param {Function} onTemplateUpdate - Callback for template updates
   */
  subscribeToChampionDashboard(onMessage, onConfigUpdate, onTemplateUpdate) {
    this.addListener(EVENT_TYPES.CONFIG_UPDATE, onConfigUpdate);
    this.addListener(EVENT_TYPES.TEMPLATE_UPDATE, onTemplateUpdate);
    
    return () => {
      this.removeListener(EVENT_TYPES.CONFIG_UPDATE, onConfigUpdate);
      this.removeListener(EVENT_TYPES.TEMPLATE_UPDATE, onTemplateUpdate);
    };
  }

  /**
   * Subscribe to Read-Only Dashboard updates
   * @param {Function} onMessage - Callback for all messages
   * @param {Function} onDataRefresh - Callback for data refresh
   */
  subscribeToReadOnlyDashboard(onMessage, onDataRefresh) {
    this.addListener(EVENT_TYPES.DATA_REFRESH, onDataRefresh);
    
    return () => {
      this.removeListener(EVENT_TYPES.DATA_REFRESH, onDataRefresh);
    };
  }

  /**
   * Subscribe to specific user's dashboard (for drill-down)
   * @param {string} userId - User ID
   * @param {Function} onMessage - Callback for incoming messages
   */
  subscribeToUserDashboard(userId, onMessage) {
    const channel = WEBSOCKET_CHANNELS.USER_DASHBOARD(userId);
    this.subscribeToChannel(channel, onMessage);
    
    return () => this.unsubscribeFromChannel(channel, onMessage);
  }

  /**
   * Subscribe to team dashboard (for managers)
   * @param {string} managerId - Manager user ID
   * @param {Function} onMessage - Callback for incoming messages
   */
  subscribeToTeamDashboard(managerId, onMessage) {
    const channel = WEBSOCKET_CHANNELS.TEAM_DASHBOARD(managerId);
    this.subscribeToChannel(channel, onMessage);
    
    return () => this.unsubscribeFromChannel(channel, onMessage);
  }

  /**
   * Subscribe to a custom channel
   * @param {string} channel - Channel name
   * @param {Function} onMessage - Callback for incoming messages
   */
  subscribeToChannel(channel, onMessage) {
    if (!this.subscribedChannels.has(channel)) {
      this.subscribedChannels.add(channel);
      this.send({ action: 'subscribe', channel });
    }
    this.addListener(channel, onMessage);
  }

  /**
   * Unsubscribe from a custom channel
   * @param {string} channel - Channel name
   * @param {Function} onMessage - Callback to remove
   */
  unsubscribeFromChannel(channel, onMessage) {
    this.removeListener(channel, onMessage);
    
    // Check if there are no more listeners for this channel
    if (!this.listeners.has(channel) || this.listeners.get(channel).length === 0) {
      this.subscribedChannels.delete(channel);
      this.send({ action: 'unsubscribe', channel });
    }
  }

  // ===================== ACTION METHODS =====================

  /**
   * Request approval update (for managers)
   * @param {string} submissionId - Submission ID
   * @param {string} action - 'approve' or 'reject'
   * @param {string} comments - Optional comments
   */
  sendApprovalAction(submissionId, action, comments = '') {
    return this.send({
      action: 'approval_action',
      submission_id: submissionId,
      approval_action: action,
      comments
    });
  }

  /**
   * Request KPI submission (for staff)
   * @param {string} kpiId - KPI ID
   * @param {number} value - Actual value
   * @param {string} comments - Optional comments
   */
  sendKpiSubmission(kpiId, value, comments = '') {
    return this.send({
      action: 'submit_kpi',
      kpi_id: kpiId,
      value,
      comments
    });
  }

  /**
   * Request config update (for champion)
   * @param {string} targetUserId - Target user ID
   * @param {Object} config - New configuration
   */
  sendConfigUpdate(targetUserId, config) {
    return this.send({
      action: 'update_config',
      user_id: targetUserId,
      config
    });
  }

  /**
   * Request drill-down data
   * @param {string} userId - User ID to drill down to
   */
  sendDrillDownRequest(userId) {
    return this.send({
      action: 'drill_down',
      user_id: userId
    });
  }

  // ===================== LISTENER METHODS =====================

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
      
      // Clean up empty listener arrays
      if (callbacks.length === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Listener error for ${eventType}:`, error);
        }
      });
    }
  }

  removeAllListeners() {
    this.listeners.clear();
    this.subscribedChannels.clear();
  }

  // ===================== HEARTBEAT METHODS =====================

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.ping();
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // ===================== UTILITY METHODS =====================

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  getCurrentDashboardType() {
    return this.currentDashboardType;
  }

  setReconnectConfig(maxAttempts, delay) {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectDelay = delay;
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const dashboardWebSocket = new DashboardWebSocketService();

// Export helper functions for easy access
export const connectWebSocket = (dashboardType, onMessage, onError, onClose) => 
  dashboardWebSocket.connect(dashboardType, onMessage, onError, onClose);

export const disconnectWebSocket = () => dashboardWebSocket.disconnect();

export const sendWebSocketMessage = (data) => dashboardWebSocket.send(data);

export const refreshDashboard = () => dashboardWebSocket.refresh();

export const isWebSocketConnected = () => dashboardWebSocket.isConnected();