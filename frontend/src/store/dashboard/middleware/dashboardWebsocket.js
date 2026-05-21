// frontend/src/store/dashboard/middleware/dashboardWebsocket.js

import { showToast } from '../../ui/slices/uiSlice';
import {
  updateExecutiveData,
  updateClientAdminData,
  updateSuperAdminData,
  setRefreshInProgress
} from '../slices/dashboardSlice';
import { addLocalAlert } from '../slices/dashboardAlertsSlice';

// ===== ADD NEW SLICE ACTIONS =====
import { updateManagerData } from '../slices/managerDashboardSlice';
import { updateStaffData, addLocalSubmission } from '../slices/staffDashboardSlice';
import { updateChampionData } from '../slices/championDashboardSlice';
import { updateReadOnlyData } from '../slices/readOnlyDashboardSlice';

let wsConnections = new Map();
let reconnectAttempts = new Map();
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

const createWebSocketConnection = (dashboardType, dispatch, getState) => {
  const token = getState()?.auth?.accessToken || localStorage.getItem('access_token');
  if (!token) return null;

  const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}/dashboard/${dashboardType}?token=${token}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`[WebSocket] Connected to ${dashboardType} dashboard`);
    reconnectAttempts.set(dashboardType, 0);
    
    ws.send(JSON.stringify({ action: 'subscribe', dashboard_type: dashboardType }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'update':
        case 'initial':
          // Existing dashboards
          if (dashboardType === 'executive') {
            dispatch(updateExecutiveData(data.data));
          } else if (dashboardType === 'client_admin') {
            dispatch(updateClientAdminData(data.data));
          } else if (dashboardType === 'super_admin') {
            dispatch(updateSuperAdminData(data.data));
          }
          // ===== ADD NEW DASHBOARD TYPES =====
          else if (dashboardType === 'manager') {
            dispatch(updateManagerData(data.data));
          } else if (dashboardType === 'staff') {
            dispatch(updateStaffData(data.data));
          } else if (dashboardType === 'champion') {
            dispatch(updateChampionData(data.data));
          } else if (dashboardType === 'read_only') {
            dispatch(updateReadOnlyData(data.data));
          }
          break;
          
        case 'kpi_update':
          dispatch(updateExecutiveData({ 
            last_kpi_update: { kpi_id: data.kpi_id, new_score: data.new_score, timestamp: data.timestamp }
          }));
          break;
          
        // ===== ADD NEW EVENT TYPES =====
        case 'team_member_update':
          if (dashboardType === 'manager') {
            dispatch(updateManagerData({ team_update: data.data, timestamp: data.timestamp }));
          }
          break;
          
        case 'pending_approval_update':
          if (dashboardType === 'manager') {
            dispatch(updateManagerData({ pending_approvals_update: data.data, timestamp: data.timestamp }));
          }
          break;
          
        case 'submission_status_update':
          if (dashboardType === 'staff') {
            dispatch(addLocalSubmission(data.data));
            dispatch(updateStaffData({ submission_status: data.data, timestamp: data.timestamp }));
          }
          break;
          
        case 'config_update':
          if (dashboardType === 'champion') {
            dispatch(updateChampionData({ config_update: data.data, timestamp: data.timestamp }));
          }
          break;
          
        case 'alert':
          dispatch(addLocalAlert({
            id: data.alert_id,
            type: data.alert_type,
            severity: data.severity,
            message: data.message,
            created_at: data.timestamp
          }));
          dispatch(showToast({ message: data.message, type: 'warning' }));
          break;
          
        case 'dashboard_update':
          dispatch(setRefreshInProgress(true));
          setTimeout(() => dispatch(setRefreshInProgress(false)), 1000);
          break;
          
        default:
          console.log('[WebSocket] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error(`[WebSocket] Error for ${dashboardType}:`, error);
  };

  ws.onclose = (event) => {
    console.log(`[WebSocket] Disconnected from ${dashboardType}: ${event.code} - ${event.reason}`);
    
    const attempts = reconnectAttempts.get(dashboardType) || 0;
    if (attempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_DELAY * Math.pow(2, attempts);
      console.log(`[WebSocket] Reconnecting to ${dashboardType} in ${delay}ms (attempt ${attempts + 1})`);
      
      setTimeout(() => {
        reconnectAttempts.set(dashboardType, attempts + 1);
        const newWs = createWebSocketConnection(dashboardType, dispatch, getState);
        if (newWs) {
          wsConnections.set(dashboardType, newWs);
        }
      }, delay);
    } else {
      console.error(`[WebSocket] Max reconnect attempts reached for ${dashboardType}`);
      dispatch(showToast({ 
        message: `Real-time updates for ${dashboardType} dashboard are unavailable. Please refresh the page.`, 
        type: 'error' 
      }));
    }
  };

  return ws;
};

export const dashboardWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const activeDashboard = state.dashboard?.activeDashboard;

  if (action.type === 'dashboard/setActiveDashboard') {
    const newDashboard = action.payload;
    
    wsConnections.forEach((ws, type) => {
      if (type !== newDashboard && ws.readyState === WebSocket.OPEN) {
        ws.close();
        wsConnections.delete(type);
      }
    });
    
    if (newDashboard && !wsConnections.has(newDashboard)) {
      const ws = createWebSocketConnection(newDashboard, store.dispatch, store.getState);
      if (ws) {
        wsConnections.set(newDashboard, ws);
      }
    }
  }

  // Existing refresh
  if (action.type === 'dashboard/refreshAllDashboards/fulfilled') {
    const ws = wsConnections.get(activeDashboard);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }

  // ===== ADD NEW REFRESH ACTIONS =====
  if (action.type === 'managerDashboard/refreshAll/fulfilled') {
    const ws = wsConnections.get('manager');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }
  
  if (action.type === 'staffDashboard/refreshAll/fulfilled') {
    const ws = wsConnections.get('staff');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }
  
  if (action.type === 'championDashboard/refreshAll/fulfilled') {
    const ws = wsConnections.get('champion');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }
  
  if (action.type === 'readOnlyDashboard/refresh/fulfilled') {
    const ws = wsConnections.get('read_only');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }

  // ===== ADD NEW ACTION SENDERS =====
  
  // Manager approval actions
  if (action.type === 'managerDashboard/approveSubmission/fulfilled') {
    const ws = wsConnections.get('manager');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        action: 'approval_action', 
        submission_id: action.meta.arg.submissionId,
        approval_action: 'approve'
      }));
    }
  }
  
  if (action.type === 'managerDashboard/rejectSubmission/fulfilled') {
    const ws = wsConnections.get('manager');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        action: 'approval_action', 
        submission_id: action.meta.arg.submissionId,
        approval_action: 'reject'
      }));
    }
  }
  
  // Staff submission action
  if (action.type === 'staffDashboard/submitKPI/fulfilled') {
    const ws = wsConnections.get('staff');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        action: 'submit_kpi', 
        kpi_id: action.meta.arg.kpiId,
        value: action.meta.arg.value
      }));
    }
  }
  
  // Champion config update action
  if (action.type === 'championDashboard/updateConfig/fulfilled') {
    const ws = wsConnections.get('champion');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        action: 'update_config', 
        user_id: action.meta.arg.targetUserId,
        config: action.meta.arg.config
      }));
    }
  }

  // Logout
  if (action.type === 'auth/logout') {
    wsConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    wsConnections.clear();
    reconnectAttempts.clear();
  }

  return result;
};

export const disconnectAllWebSockets = () => {
  wsConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
  wsConnections.clear();
  reconnectAttempts.clear();
};