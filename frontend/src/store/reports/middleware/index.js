// ============================================
// apps/reportplt/middleware/index.js
// ============================================

import { reportCacheMiddleware } from './reportCache.middleware';
import { reportErrorHandler } from './reportErrorHandler.middleware';
import { reportPaginationMiddleware } from './reportPagination.middleware';
import { reportWebSocketMiddleware } from './reportWebSocket.middleware';

export const reportMiddlewares = [
    reportCacheMiddleware,
    reportErrorHandler,
    reportPaginationMiddleware,
    reportWebSocketMiddleware,
];

export {
    reportCacheMiddleware,
    reportErrorHandler,
    reportPaginationMiddleware,
    reportWebSocketMiddleware,
};

export {
    generateCacheKey,
    invalidateCacheByPrefix,
    clearAllCache,
    getCachedData,
    selectCachedReport,
    selectCachedReports,
} from './reportCache.middleware';

export {
    setError,
    clearError,
    clearAllErrors,
    normalizeError,
    handleUnauthorized,
    handleForbidden,
    handleNotFound,
    handleRateLimit,
    handleServerError,
    selectError,
    selectIsError,
    selectErrorHistory,
    selectLastError,
} from './reportErrorHandler.middleware';

export {
    getPagination,
    setPaginationCache,
    getPaginationCache,
    clearPaginationCache,
    selectReportPagination,
    selectReportPage,
    selectReportPageSize,
    selectReportTotal,
    selectReportTotalPages,
    selectHasNextPage,
    selectHasPreviousPage,
    selectIsLastPage,
    selectIsFirstPage,
    buildPaginationParams,
    updatePaginationFromResponse,
} from './reportPagination.middleware';

export {
    connectWebSocket,
    disconnectWebSocket,
    disconnectAllWebSockets,
    reconnectWebSocket,
    getWebSocketStatus,
    isWebSocketConnected,
    sendWebSocketMessage,
    getWebSocketUrl,
    handleMessage,
    handleDashboardMessage,
    handleReportStatusMessage,
    handleNotificationMessage,
    handleReportProgressMessage,
} from './reportWebSocket.middleware';