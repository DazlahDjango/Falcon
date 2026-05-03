// frontend/src/store/tenant/middleware/index.js
import tenantMiddleware from './tenantMiddleware';
import webSocketMiddleware from './tenantWebSocketMiddleware';
import cacheMiddleware from './tenantCacheMiddleware';

export const tenantMiddlewares = [
    tenantMiddleware,
    webSocketMiddleware,
    cacheMiddleware,
];

export { getCachedTenants, getCachedTenant } from './tenantCacheMiddleware';
export { default as tenantMiddleware } from './tenantMiddleware';
export { default as webSocketMiddleware } from './tenantWebSocketMiddleware';
export { default as cacheMiddleware } from './tenantCacheMiddleware';