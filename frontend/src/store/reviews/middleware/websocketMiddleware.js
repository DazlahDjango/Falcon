import reviewsWebSocketService from '../../../services/reviews/websocket.service';

const WS_EVENT_HANDLERS = {
  'review_submitted': (store, payload) => {
    store.dispatch({ type: 'cycle/setProgress', payload: payload.progress });
  },
  'review_approved': (store, payload) => {
    store.dispatch({ type: 'finalRating/selectItem', payload });
  },
  'review_completed': (store, payload) => {
    store.dispatch({ type: 'cycle/setProgress', payload: payload.progress });
  },
  'review_rejected': (store, payload) => {
    store.dispatch({ type: 'cycle/setProgress', payload: payload.progress });
  },
  'calibration_adjustment': (store, payload) => {
    store.dispatch({ type: 'calibrationSessions/updateItem', payload });
  },
  'calibration_chat': (store, payload) => {
    store.dispatch({ type: 'calibrationSessions/addComment', payload });
  },
  'notification': (store, payload) => {
    store.dispatch({ type: 'notification/websocketNotification', payload });
  },
  'dashboard_metrics': (store, payload) => {
    store.dispatch({ type: 'dashboard/setMetrics', payload });
  },
};

export const websocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'reviews/initializeWebSockets') {
    const handleWsData = (data) => {
      const handler = WS_EVENT_HANDLERS[data.type];
      if (handler) {
        handler(store, data.payload || data);
      }
    };

    if (action.payload?.cycleId) {
      reviewsWebSocketService.connectStatus(action.payload.cycleId, handleWsData).catch(err => console.error('[ReviewsWSMiddleware] Error:', err));
    }

    if (action.payload?.sessionId) {
      reviewsWebSocketService.connectCalibration(action.payload.sessionId, handleWsData).catch(err => console.error('[ReviewsWSMiddleware] Error:', err));
    }

    reviewsWebSocketService.connectNotifications(handleWsData).catch(err => console.error('[ReviewsWSMiddleware] Error:', err));
    reviewsWebSocketService.connectDashboard(handleWsData).catch(err => console.error('[ReviewsWSMiddleware] Error:', err));
  }

  if (action.type === 'reviews/closeWebSockets') {
    reviewsWebSocketService.disconnectAll();
  }

  return result;
};

export const connectWebSocket = (payload) => (dispatch) => {
  dispatch({ type: 'reviews/initializeWebSockets', payload });
};

export const disconnectWebSocket = () => (dispatch) => {
  dispatch({ type: 'reviews/closeWebSockets' });
};

export const disconnectAllWebSockets = () => (dispatch) => {
  dispatch({ type: 'reviews/closeWebSockets' });
};

export const websocketActions = {
  connect: (payload) => ({ type: 'reviews/initializeWebSockets', payload }),
  disconnect: () => ({ type: 'reviews/closeWebSockets' }),
  send: (payload) => ({ type: 'reviews/sendWebSocketMessage', payload }),
  subscribe: (channels) => ({ type: 'reviews/subscribeWebSockets', payload: channels }),
};

export default websocketMiddleware;