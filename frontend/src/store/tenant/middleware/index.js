import { tenantContextMiddleware } from './tenantContext.middleware';
import { paginationMiddlewareInstance } from './pagination.middleware';
import { cacheMiddlewareInstance } from './cache.middleware';
import { errorHandlerMiddlewareInstance } from './errorHandler.middleware';

export const tenantMiddlewares = [
  tenantContextMiddleware,
  paginationMiddlewareInstance,
  cacheMiddlewareInstance,
  errorHandlerMiddlewareInstance,
];

export {
  tenantContextMiddleware,
  paginationMiddlewareInstance,
  cacheMiddlewareInstance,
  errorHandlerMiddlewareInstance,
};