import wsClient, { authWsClient } from '../../../services/accounts/websocket/client';
import { showAlert } from '../slice/uiSlice';

export const accountsWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'accounts/initializeWebSockets') {
    const namespace = action.payload?.namespace || 'notifications';
    wsClient.connect(namespace).catch((err) => {
      console.error('[AccountsWSMiddleware] Connection error:', err);
    });

    wsClient.on('notification', (data) => {
      store.dispatch({ type: 'notifications/received', payload: data });
      if (data?.title || data?.message) {
        store.dispatch(showAlert({ type: 'info', message: data.title || data.message }));
      }
    });

    wsClient.on('security_event', (data) => {
      store.dispatch({ type: 'security/eventReceived', payload: data });
      store.dispatch(showAlert({ type: 'warning', message: `Security Alert: ${data.event_type || 'Event detected'}` }));
    });
  }

  if (action.type === 'accounts/initializeAuthWebSocket') {
    authWsClient.connect('auth').catch((err) => {
      console.error('[AccountsWSMiddleware] Auth WS error:', err);
    });

    authWsClient.on('security_alert', (data) => {
      store.dispatch({ type: 'security/alertReceived', payload: data });
      store.dispatch(showAlert({ type: 'error', message: data.message || 'Critical Security Alert' }));
    });
  }

  if (action.type === 'accounts/closeWebSockets') {
    wsClient.disconnect();
    authWsClient.disconnect();
  }

  if (action.type === 'accounts/sendWebSocketMessage') {
    wsClient.send(action.payload);
  }

  return result;
};

export const connectWebSocket = (namespace = 'notifications') => (dispatch) => {
  dispatch({ type: 'accounts/initializeWebSockets', payload: { namespace } });
};

export const disconnectWebSocket = () => (dispatch) => {
  dispatch({ type: 'accounts/closeWebSockets' });
};

export const disconnectAllWebSockets = () => (dispatch) => {
  dispatch({ type: 'accounts/closeWebSockets' });
};

export default accountsWebsocketMiddleware;
