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

import { websocketService } from '../../../services/websocket';
import { DASHBOARD_WS, websocketBase } from '../../../config/constants/websocketApiConstants';
import { getAccessToken } from '../../../services/accounts/storage/secureStorage';

let wsConnections = new Map();

const createWebSocketConnection = async (dashboardType, dispatch, getState) => {
  const token = getState()?.auth?.accessToken || (await getAccessToken()) || localStorage.getItem('access_token');
  if (!token) return null;

  websocketService.init(websocketBase, token);
  const key = `dashboard_${dashboardType}`;
  if (wsConnections.has(key) && websocketService.isConnected(key)) return wsConnections.get(key);

  const endpoint = DASHBOARD_WS.DASHBOARD(dashboardType);
  const ws = websocketService.connect(
    key,
    endpoint,
    (data) => {
      try {
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
    },
    () => console.log(`WebSocket connected: ${key}`),
    (err) => console.error(`WebSocket error: ${key}`, err),
    () => dispatch(showToast({ message: `Real-time updates for ${dashboardType} dashboard are unavailable. Please refresh the page.`, type: 'error' }))
  );

  wsConnections.set(key, true);
  // auto-subscribe
  websocketService.send(key, { action: 'subscribe', dashboard_type: dashboardType });
  return key;
};

export const dashboardWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const activeDashboard = state.dashboard?.activeDashboard;

  if (action.type === 'dashboard/setActiveDashboard') {
    const newDashboard = action.payload;

    // Close other dashboards
    wsConnections.forEach((connKey, type) => {
      if (type !== newDashboard) {
        websocketService.disconnect(connKey);
        wsConnections.delete(type);
      }
    });

    if (newDashboard && !wsConnections.has(newDashboard)) {
      const connKey = createWebSocketConnection(newDashboard, store.dispatch, store.getState);
      if (connKey) {
        wsConnections.set(newDashboard, connKey);
      }
    }
  }

  // Existing refresh
  if (action.type === 'dashboard/refreshAllDashboards/fulfilled') {
    const connKey = wsConnections.get(activeDashboard);
    if (connKey && websocketService.isConnected(connKey)) {
      websocketService.send(connKey, { action: 'refresh' });
    }
  }

  // ===== ADD NEW REFRESH ACTIONS =====
  if (action.type === 'managerDashboard/refreshAll/fulfilled') {
    const connKey = wsConnections.get('manager');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'refresh' });
  }
  
  if (action.type === 'staffDashboard/refreshAll/fulfilled') {
    const connKey = wsConnections.get('staff');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'refresh' });
  }
  
  if (action.type === 'championDashboard/refreshAll/fulfilled') {
    const connKey = wsConnections.get('champion');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'refresh' });
  }
  
  if (action.type === 'readOnlyDashboard/refresh/fulfilled') {
    const connKey = wsConnections.get('read_only');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'refresh' });
  }

  // ===== ADD NEW ACTION SENDERS =====
  
  // Manager approval actions
  if (action.type === 'managerDashboard/approveSubmission/fulfilled') {
    const connKey = wsConnections.get('manager');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'approval_action', submission_id: action.meta.arg.submissionId, approval_action: 'approve' });
  }
  
  if (action.type === 'managerDashboard/rejectSubmission/fulfilled') {
    const connKey = wsConnections.get('manager');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'approval_action', submission_id: action.meta.arg.submissionId, approval_action: 'reject' });
  }
  
  // Staff submission action
  if (action.type === 'staffDashboard/submitKPI/fulfilled') {
    const connKey = wsConnections.get('staff');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'submit_kpi', kpi_id: action.meta.arg.kpiId, value: action.meta.arg.value });
  }
  
  // Champion config update action
  if (action.type === 'championDashboard/updateConfig/fulfilled') {
    const connKey = wsConnections.get('champion');
    if (connKey && websocketService.isConnected(connKey)) websocketService.send(connKey, { action: 'update_config', user_id: action.meta.arg.targetUserId, config: action.meta.arg.config });
  }

  // Logout
  if (action.type === 'auth/logout') {
    wsConnections.forEach((connKey) => websocketService.disconnect(connKey));
    wsConnections.clear();
  }

  return result;
};

export const disconnectAllWebSockets = () => {
  wsConnections.forEach((connKey) => websocketService.disconnect(connKey));
  wsConnections.clear();
};