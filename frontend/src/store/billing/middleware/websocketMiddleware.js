import { billingWebSocketService } from '../../../services/billing/websocket.service';

export const billingWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'billing/initializeWebSocket') {
    billingWebSocketService.connect(
      (data) => {
        if (data.type === 'payment_success') {
          store.dispatch({ type: 'subscription/paymentSuccess', payload: data });
        } else if (data.type === 'payment_failed') {
          store.dispatch({ type: 'subscription/paymentFailed', payload: data });
        } else if (data.type === 'subscription_updated') {
          store.dispatch({ type: 'subscription/updated', payload: data });
        } else {
          store.dispatch({ type: 'billing/wsMessage', payload: data });
        }
      },
      () => store.dispatch({ type: 'billing/wsConnected' }),
      (err) => store.dispatch({ type: 'billing/wsError', payload: err }),
      () => store.dispatch({ type: 'billing/wsDisconnected' })
    ).catch(err => console.error('[BillingWSMiddleware] Error:', err));
  }

  if (action.type === 'billing/closeWebSocket') {
    billingWebSocketService.disconnect();
  }

  if (action.type === 'billing/sendWebSocketMessage') {
    billingWebSocketService.send(action.payload);
  }

  return result;
};
