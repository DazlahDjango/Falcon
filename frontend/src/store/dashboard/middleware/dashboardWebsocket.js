import { showToast } from '../../ui/slices/uiSlice';
import {
  updateExecutiveData,
  updateClientAdminData,
  updateSuperAdminData,
} from '../slices/dashboardSlice';
import { addLocalAlert } from '../slices/dashboardAlertsSlice';

import { updateManagerData } from '../slices/managerDashboardSlice';
import { updateStaffData, addLocalSubmission } from '../slices/staffDashboardSlice';
import { updateChampionData } from '../slices/championDashboardSlice';
import { updateReadOnlyData } from '../slices/readOnlyDashboardSlice';

import { dashboardWebSocket } from '../../../services/dashboard/websocket.service';

export const dashboardWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'dashboard/initializeWebSocket' && action.payload?.dashboardType) {
    const { dashboardType } = action.payload;
    dashboardWebSocket.connect(
      dashboardType,
      (data) => {
        switch (data.type) {
          case 'update':
          case 'initial':
            if (dashboardType === 'executive') store.dispatch(updateExecutiveData(data.data));
            else if (dashboardType === 'client_admin') store.dispatch(updateClientAdminData(data.data));
            else if (dashboardType === 'super_admin') store.dispatch(updateSuperAdminData(data.data));
            else if (dashboardType === 'manager') store.dispatch(updateManagerData(data.data));
            else if (dashboardType === 'staff') store.dispatch(updateStaffData(data.data));
            else if (dashboardType === 'champion') store.dispatch(updateChampionData(data.data));
            else if (dashboardType === 'read_only') store.dispatch(updateReadOnlyData(data.data));
            break;

          case 'alert':
            store.dispatch(addLocalAlert({
              id: data.alert_id,
              type: data.alert_type,
              severity: data.severity,
              message: data.message,
              created_at: data.timestamp
            }));
            break;

          default:
            break;
        }
      },
      (err) => console.error('[DashboardWSMiddleware] Error:', err),
      () => console.log('[DashboardWSMiddleware] Closed')
    ).catch(err => console.error('[DashboardWSMiddleware] Connect error:', err));
  }

  if (action.type === 'dashboard/closeWebSocket') {
    dashboardWebSocket.disconnect();
  }

  if (action.type === 'dashboard/sendWebSocketMessage') {
    dashboardWebSocket.send(action.payload);
  }

  return result;
};

// Helper Action Creators & Functions
export const connectWebSocket = (dashboardType) => (dispatch) => {
  dispatch({ type: 'dashboard/initializeWebSocket', payload: { dashboardType } });
};

export const disconnectWebSocket = () => (dispatch) => {
  dispatch({ type: 'dashboard/closeWebSocket' });
};

export const disconnectAllWebSockets = () => (dispatch) => {
  dispatch({ type: 'dashboard/closeWebSocket' });
};

export default dashboardWebsocketMiddleware;