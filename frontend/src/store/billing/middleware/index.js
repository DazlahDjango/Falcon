// billing/index.js
import { analyticsMiddleware as analyticsListenerMiddleware } from './analyticsMiddleware';
import { billingMiddleware as billingListenerMiddleware } from './billingMiddleware';
import { webhookMiddleware as webhookListenerMiddleware } from './webhookMiddleware';

// Export the actual middleware functions
export const billingMiddlewareFn = billingListenerMiddleware.middleware;
export const webhookMiddlewareFn = webhookListenerMiddleware.middleware;
export const analyticsMiddlewareFn = analyticsListenerMiddleware.middleware;

// Export the listeners if you need to add more listeners elsewhere
export const billingListener = billingListenerMiddleware;
export const webhookListener = webhookListenerMiddleware;
export const analyticsListener = analyticsListenerMiddleware;