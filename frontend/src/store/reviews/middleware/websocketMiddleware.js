// src/store/middleware/websocketMiddleware.js
import { notificationActions } from '../reviews/slices/notification.slice';
import { dashboardActions } from '../reviews/slices/dashboard.slice';
import { cycleActions } from '../reviews/slices/cycle.slice';
import { finalRatingActions } from '../reviews/slices/finalRating.slice';

// WebSocket event handlers mapping
const WS_EVENT_HANDLERS = {
  'review_submitted': (store, payload) => {
    // Handle review submitted event
    store.dispatch(cycleActions.setProgress(payload.progress));
  },
  'review_approved': (store, payload) => {
    store.dispatch(finalRatingActions.selectItem(payload));
  },
  'review_completed': (store, payload) => {
    store.dispatch(cycleActions.setProgress(payload.progress));
  },
  'review_rejected': (store, payload) => {
    store.dispatch(cycleActions.setProgress(payload.progress));
  },
  'cycle_progress': (store, payload) => {
    store.dispatch(cycleActions.setProgress(payload));
  },
  'pip_updated': (store, payload) => {
    store.dispatch({ type: 'pips/updateItem', payload });
  },
  'calibration_adjustment': (store, payload) => {
    store.dispatch({ type: 'calibrationSessions/updateItem', payload });
  },
  'calibration_chat': (store, payload) => {
    store.dispatch({ type: 'calibrationSessions/addComment', payload });
  },
  'notification': (store, payload) => {
    store.dispatch(notificationActions.websocketNotification(payload));
  },
  'dashboard_metrics': (store, payload) => {
    store.dispatch(dashboardActions.setMetrics(payload));
  },
  'dependency_sync': (store, payload) => {
    // Handle dependency sync events
    if (payload.source === 'structure') {
      store.dispatch({ type: 'referenceData/updateDepartments', payload: payload.departments });
    } else if (payload.source === 'accounts') {
      store.dispatch({ type: 'referenceData/updateUsers', payload: payload.users });
    } else if (payload.source === 'kpi') {
      store.dispatch(dashboardActions.setMetrics(payload));
    }
  },
};

export const websocketMiddleware = (store) => {
  let socket = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connect = () => {
    const token = localStorage.getItem('access_token');
    const tenantId = localStorage.getItem('tenant_id');
    
    if (!token || !tenantId) {
      console.warn('WebSocket: Missing token or tenant ID');
      return;
    }

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/reviews/?token=${token}&tenant=${tenantId}`;
    
    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket: Connected successfully');
        reconnectAttempts = 0;
        // Send subscription message
        socket.send(JSON.stringify({
          type: 'subscribe',
          channels: ['reviews', 'notifications', 'dashboard'],
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          // Find and execute handler
          const handler = WS_EVENT_HANDLERS[type];
          if (handler) {
            handler(store, payload);
          } else {
            console.debug('WebSocket: Unhandled event type:', type);
          }
        } catch (error) {
          console.error('WebSocket: Error processing message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket: Disconnected', event.code, event.reason);
        socket = null;
        attemptReconnect();
      };

      socket.onerror = (error) => {
        console.error('WebSocket: Error:', error);
        socket?.close();
      };

    } catch (error) {
      console.error('WebSocket: Connection error:', error);
      attemptReconnect();
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts += 1;
      console.log(`WebSocket: Reconnecting attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(connect, RECONNECT_DELAY * reconnectAttempts);
    } else {
      console.warn('WebSocket: Max reconnection attempts reached');
      store.dispatch({ type: 'websocket/maxReconnectAttempts' });
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close(1000, 'Client disconnecting');
      socket = null;
    }
  };

  const send = (data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket: Cannot send - socket not open');
    return false;
  };

  // Return middleware API
  return (next) => (action) => {
    // Handle WebSocket actions
    switch (action.type) {
      case 'WEBSOCKET_CONNECT':
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          connect();
        }
        break;
      case 'WEBSOCKET_DISCONNECT':
        disconnect();
        break;
      case 'WEBSOCKET_SEND':
        send(action.payload);
        break;
      case 'WEBSOCKET_RECONNECT':
        disconnect();
        setTimeout(connect, RECONNECT_DELAY);
        break;
      default:
        break;
    }

    return next(action);
  };
};

// Action creators for WebSocket
export const websocketActions = {
  connect: () => ({ type: 'WEBSOCKET_CONNECT' }),
  disconnect: () => ({ type: 'WEBSOCKET_DISCONNECT' }),
  reconnect: () => ({ type: 'WEBSOCKET_RECONNECT' }),
  send: (payload) => ({ type: 'WEBSOCKET_SEND', payload }),
  subscribe: (channels) => ({ type: 'WEBSOCKET_SEND', payload: { type: 'subscribe', channels } }),
};