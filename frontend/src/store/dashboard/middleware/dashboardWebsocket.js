import { showToast } from '../../ui/slices/uiSlice';
import {
  updateExecutiveData,
  updateClientAdminData,
  updateSuperAdminData,
  setRefreshInProgress
} from '../slices/dashboardSlice';
import { addLocalAlert } from '../slices/dashboardAlertsSlice';

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
          if (dashboardType === 'executive') {
            dispatch(updateExecutiveData(data.data));
          } else if (dashboardType === 'client_admin') {
            dispatch(updateClientAdminData(data.data));
          } else if (dashboardType === 'super_admin') {
            dispatch(updateSuperAdminData(data.data));
          }
          break;
          
        case 'kpi_update':
          dispatch(updateExecutiveData({ 
            last_kpi_update: { kpi_id: data.kpi_id, new_score: data.new_score, timestamp: data.timestamp }
          }));
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

  if (action.type === 'dashboard/refreshAllDashboards/fulfilled') {
    const ws = wsConnections.get(activeDashboard);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'refresh' }));
    }
  }

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