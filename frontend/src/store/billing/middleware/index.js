import billingMiddleware from './billingMiddleware';
import webhookMiddleware from './webhookMiddleware';
import analyticsMiddleware from './analyticsMiddleware';

export const billingMiddlewares = [billingMiddleware, webhookMiddleware, analyticsMiddleware];

export { billingMiddleware, webhookMiddleware, analyticsMiddleware };
export default billingMiddlewares;