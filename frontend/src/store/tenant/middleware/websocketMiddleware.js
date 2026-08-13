import tenantWebSocketService from '../../../services/tenant/websocket.service';

export const tenantWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'tenant/initializeWebSocket' && action.payload?.tenantId) {
    const { tenantId } = action.payload;
    tenantWebSocketService.connect(tenantId, {
      onStatusChange: (data) => {
        store.dispatch({ type: 'tenant/statusChanged', payload: data });
      },
      onQuotaWarning: (data) => {
        store.dispatch({ type: 'tenant/quotaWarning', payload: data });
      },
      onProvisioningProgress: (data) => {
        store.dispatch({ type: 'provision/updateProgress', payload: data });
      },
      onProvisioningComplete: (data) => {
        store.dispatch({ type: 'provision/complete', payload: data });
      },
      onProvisioningFailed: (data) => {
        store.dispatch({ type: 'provision/failed', payload: data });
      },
      onMessage: (data) => {
        store.dispatch({ type: 'tenant/wsMessage', payload: data });
      }
    }).catch(err => console.error('[TenantWSMiddleware] Error:', err));
  }

  if (action.type === 'tenant/closeWebSocket') {
    tenantWebSocketService.disconnect();
  }

  if (action.type === 'tenant/sendWebSocketMessage') {
    tenantWebSocketService.send(action.payload);
  }

  return result;
};

export const connectWebSocket = (tenantId) => (dispatch) => {
  dispatch({ type: 'tenant/initializeWebSocket', payload: { tenantId } });
};

export const disconnectWebSocket = () => (dispatch) => {
  dispatch({ type: 'tenant/closeWebSocket' });
};

export const disconnectAllWebSockets = () => (dispatch) => {
  dispatch({ type: 'tenant/closeWebSocket' });
};

export default tenantWebsocketMiddleware;
