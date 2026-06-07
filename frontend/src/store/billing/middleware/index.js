import billingMiddleware from './billingMiddleware';
import webhookMiddleware from './webhookMiddleware';
import analyticsMiddleware from './analyticsMiddleware';

// Export as an array for easy concatenation
export const billingMiddlewares = [
    billingMiddleware,
    webhookMiddleware,
    analyticsMiddleware
];

// Also export individually
export {
    billingMiddleware,
    webhookMiddleware,
    analyticsMiddleware
};