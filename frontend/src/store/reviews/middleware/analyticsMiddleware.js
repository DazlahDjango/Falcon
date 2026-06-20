// src/store/reviews/middleware/analyticsMiddleware.js
// Redux middleware for analytics API calls, WebSocket events, and caching

import {
    fetchCompanyAnalytics,
    fetchDepartmentsAnalytics,
    fetchManagersAnalytics,
    fetchCompanyTrends,
    refreshAllAnalytics,
    clearAnalyticsErrors,
} from '../slices/analyticsSlice';

import {
    fetchInsights,
    generateInsights,
    dismissInsight,
    fetchUnreadCount,
} from '../slices/insightSlice';

import {
    fetchPredictions,
    fetchHighRiskEmployees,
} from '../slices/predictionSlice';

import {
    fetchDashboardWidgets,
    fetchWidgetData,
    refreshWidget,
} from '../slices/analyticsDashboardSlice';

// ========== Action Types for Loading Tracking ==========
const ANALYTICS_LOADING_ACTIONS = [
    // Analytics actions
    'reviews/analytics/fetchCompany/pending',
    'reviews/analytics/fetchDepartments/pending',
    'reviews/analytics/fetchManagers/pending',
    'reviews/analytics/fetchCompanyTrends/pending',
    'reviews/analytics/refreshAll/pending',
    
    // Insight actions
    'reviews/insights/fetchAll/pending',
    'reviews/insights/generate/pending',
    
    // Prediction actions
    'reviews/predictions/fetchAll/pending',
    'reviews/predictions/fetchHighRisk/pending',
    
    // Dashboard actions
    'reviews/analyticsDashboard/fetchAll/pending',
    'reviews/analyticsDashboard/fetchWidgetData/pending',
    'reviews/analyticsDashboard/refreshWidget/pending',
];

const ANALYTICS_SUCCESS_ACTIONS = ANALYTICS_LOADING_ACTIONS.map(a => a.replace('/pending', '/fulfilled'));
const ANALYTICS_FAILURE_ACTIONS = ANALYTICS_LOADING_ACTIONS.map(a => a.replace('/pending', '/rejected'));

// ========== Analytics Cache ==========
const analyticsCache = new Map();
const ANALYTICS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedAnalytics = (key) => {
    const cached = analyticsCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ANALYTICS_CACHE_TTL) {
        return cached.data;
    }
    return null;
};

export const setCachedAnalytics = (key, data) => {
    analyticsCache.set(key, {
        data,
        timestamp: Date.now(),
    });
};

export const clearAnalyticsCache = () => {
    analyticsCache.clear();
};

export const clearAnalyticsCacheForKey = (keyPattern) => {
    for (const key of analyticsCache.keys()) {
        if (key.includes(keyPattern)) {
            analyticsCache.delete(key);
        }
    }
};

// ========== WebSocket Message Handlers for Analytics ==========
const analyticsWebSocketHandlers = {
    // Analytics update handlers
    analytics_updated: (store, data) => {
        console.log('[WebSocket] Analytics updated:', data.analytics_type);
        
        switch (data.analytics_type) {
            case 'company':
                store.dispatch(fetchCompanyAnalytics({ force: true }));
                store.dispatch(fetchCompanyTrends({ force: true }));
                break;
            case 'departments':
                store.dispatch(fetchDepartmentsAnalytics({ force: true }));
                break;
            case 'managers':
                store.dispatch(fetchManagersAnalytics({ force: true }));
                break;
            default:
                store.dispatch(refreshAllAnalytics());
        }
    },

    // Insights update handlers
    insights_updated: (store, data) => {
        console.log('[WebSocket] Insights updated:', data.generated_at);
        store.dispatch(fetchInsights({ status: 'unread' }));
        store.dispatch(fetchUnreadCount());
    },

    // Predictions update handlers
    predictions_updated: (store, data) => {
        console.log('[WebSocket] Predictions updated:', data.high_risk_count);
        store.dispatch(fetchPredictions());
        store.dispatch(fetchHighRiskEmployees());
    },

    // Snapshot refresh handler
    snapshot_refreshed: (store, data) => {
        console.log('[WebSocket] Snapshot refreshed:', data.snapshot_type);
        store.dispatch(fetchCompanyAnalytics());
        store.dispatch(fetchDepartmentsAnalytics());
        store.dispatch(fetchManagersAnalytics());
    },

    // Widget refresh handler
    widget_refreshed: (store, data) => {
        console.log('[WebSocket] Widget refreshed:', data.widget_id);
        store.dispatch(fetchWidgetData({ widgetId: data.widget_id }));
    },

    // Dashboard metrics update
    metrics_updated: (store, data) => {
        console.log('[WebSocket] Dashboard metrics updated');
        store.dispatch(fetchDashboardWidgets());
    },
};

// ========== Process Analytics WebSocket Messages ==========
export const processAnalyticsWebSocketMessage = (store, data) => {
    const handler = analyticsWebSocketHandlers[data.type];
    if (handler) {
        handler(store, data);
    }
};

// ========== Analytics Error Handler ==========
const handleAnalyticsError = (store, action) => {
    const error = action.payload;
    const errorMessage = error?.message || error?.detail || 'Failed to fetch analytics data';
    const statusCode = error?.status || error?.status_code || 500;

    console.error(`[Analytics Error] ${action.type}:`, error);

    // Don't show error for background refresh failures
    if (action.type.includes('/refreshAll') && statusCode === 404) {
        return;
    }

    // Dispatch error notification
    try {
        store.dispatch({
            type: 'reviewsNotifications/addNotification',
            payload: {
                type: 'error',
                title: 'Analytics Error',
                message: errorMessage,
                createdAt: new Date().toISOString(),
            },
        });
    } catch (e) {
        console.error('Failed to dispatch analytics error notification:', e);
    }

    // Clear any stale analytics errors after 5 seconds
    setTimeout(() => {
        store.dispatch(clearAnalyticsErrors());
    }, 5000);
};

// ========== Analytics Request Logger ==========
const logAnalyticsRequest = (action) => {
    if (import.meta.env.DEV) {
        console.log(`[Analytics Request] ${action.type}`, {
            params: action.meta?.arg,
            timestamp: new Date().toISOString(),
        });
    }
};

const logAnalyticsResponse = (action, data) => {
    if (import.meta.env.DEV) {
        console.log(`[Analytics Response] ${action.type}`, {
            success: true,
            dataSize: data?.length || Object.keys(data || {}).length,
            timestamp: new Date().toISOString(),
        });
    }
};

// ========== Cache Check Middleware ==========
export const analyticsCacheMiddleware = (store) => (next) => (action) => {
    // Check if we should use cache for GET requests
    if (action.type?.includes('/fetch') && action.type?.endsWith('/pending')) {
        const cacheKey = `${action.type}_${JSON.stringify(action.meta?.arg || '')}`;
        const cachedData = getCachedAnalytics(cacheKey);
        
        if (cachedData && !action.meta?.arg?.force) {
            // Return cached data instead of making API call
            console.log(`[Analytics Cache] Using cached data for ${action.type}`);
            store.dispatch({
                type: action.type.replace('/pending', '/fulfilled'),
                payload: cachedData,
                meta: action.meta,
            });
            return;
        }
    }

    return next(action);
};

// ========== Main Analytics Middleware ==========
export const analyticsMiddleware = (store) => (next) => (action) => {
    const actionType = action.type;

    // Log analytics requests
    if (ANALYTICS_LOADING_ACTIONS.includes(actionType)) {
        logAnalyticsRequest(action);
    }

    // Cache successful responses
    if (ANALYTICS_SUCCESS_ACTIONS.includes(actionType) && action.payload) {
        const cacheKey = `${actionType}_${JSON.stringify(action.meta?.arg || '')}`;
        setCachedAnalytics(cacheKey, action.payload);
        logAnalyticsResponse(action, action.payload);
    }

    // Handle errors
    if (ANALYTICS_FAILURE_ACTIONS.includes(actionType)) {
        handleAnalyticsError(store, action);
    }

    // Handle specific analytics actions
    switch (actionType) {
        case 'reviews/websocket/message':
            // Process analytics-related WebSocket messages
            if (action.payload?.type?.includes('analytics') ||
                action.payload?.type?.includes('insights') ||
                action.payload?.type?.includes('predictions') ||
                action.payload?.type?.includes('widget')) {
                processAnalyticsWebSocketMessage(store, action.payload);
            }
            break;

        case 'reviews/cycles/close/fulfilled':
        case 'reviews/cycles/complete/fulfilled':
            // Refresh analytics when a cycle is closed or completed
            console.log('[Analytics] Cycle completed, refreshing analytics');
            setTimeout(() => {
                store.dispatch(refreshAllAnalytics());
            }, 1000);
            break;

        case 'reviews/finalRatings/approve/fulfilled':
        case 'reviews/finalRatings/lock/fulfilled':
            // Refresh analytics when ratings are approved/locked
            console.log('[Analytics] Ratings updated, refreshing analytics');
            store.dispatch(refreshAllAnalytics());
            break;

        case 'reviews/pips/create/fulfilled':
        case 'reviews/pips/update/fulfilled':
        case 'reviews/pips/complete/fulfilled':
            // Refresh predictions when PIPs change
            console.log('[Analytics] PIP changed, refreshing predictions');
            store.dispatch(fetchPredictions());
            store.dispatch(fetchHighRiskEmployees());
            break;

        case 'reviews/calibration/adjustRating/fulfilled':
            // Refresh analytics after calibration adjustments
            console.log('[Analytics] Calibration adjusted, refreshing analytics');
            store.dispatch(refreshAllAnalytics());
            break;

        case 'reviews/analyticsDashboard/addWidget/fulfilled':
        case 'reviews/analyticsDashboard/removeWidget/fulfilled':
        case 'reviews/analyticsDashboard/reorderWidgets/fulfilled':
            // Clear dashboard cache when widgets change
            clearAnalyticsCacheForKey('analyticsDashboard');
            break;
    }

    return next(action);
};

// ========== Periodic Analytics Refresh ==========
let refreshInterval = null;

export const startPeriodicAnalyticsRefresh = (store, intervalMs = 300000) => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(() => {
        console.log('[Analytics] Periodic refresh triggered');
        store.dispatch(refreshAllAnalytics());
        store.dispatch(fetchInsights());
        store.dispatch(fetchPredictions());
        store.dispatch(fetchUnreadCount());
    }, intervalMs);
};

export const stopPeriodicAnalyticsRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

// ========== Loading State Selectors for Analytics ==========
let analyticsLoadingState = {
    analytics: false,
    insights: false,
    predictions: false,
    dashboard: false,
};

const updateAnalyticsLoadingState = (actionType, isLoading) => {
    if (actionType.includes('/analytics/')) {
        analyticsLoadingState.analytics = isLoading;
    } else if (actionType.includes('/insights/')) {
        analyticsLoadingState.insights = isLoading;
    } else if (actionType.includes('/predictions/')) {
        analyticsLoadingState.predictions = isLoading;
    } else if (actionType.includes('/analyticsDashboard/')) {
        analyticsLoadingState.dashboard = isLoading;
    }
};

// Track analytics loading state
let activeAnalyticsRequests = 0;
let analyticsLoadingListeners = [];

export const subscribeToAnalyticsLoading = (listener) => {
    analyticsLoadingListeners.push(listener);
    return () => {
        analyticsLoadingListeners = analyticsLoadingListeners.filter(l => l !== listener);
    };
};

const notifyAnalyticsLoadingListeners = (isLoading) => {
    analyticsLoadingListeners.forEach(listener => listener(isLoading));
};

// ========== Export Analytics Middleware ==========
export const analyticsMiddlewareWithTracking = (store) => (next) => (action) => {
    const actionType = action.type;

    // Track loading start
    if (ANALYTICS_LOADING_ACTIONS.includes(actionType)) {
        activeAnalyticsRequests++;
        if (activeAnalyticsRequests === 1) {
            notifyAnalyticsLoadingListeners(true);
        }
        updateAnalyticsLoadingState(actionType, true);
    }

    // Track loading end
    if (ANALYTICS_SUCCESS_ACTIONS.includes(actionType) || ANALYTICS_FAILURE_ACTIONS.includes(actionType)) {
        activeAnalyticsRequests--;
        if (activeAnalyticsRequests === 0) {
            notifyAnalyticsLoadingListeners(false);
        }
        updateAnalyticsLoadingState(actionType, false);
    }

    return analyticsMiddleware(store)(next)(action);
};

// Export loading state getter
export const getAnalyticsLoadingState = () => ({ ...analyticsLoadingState });
export const isAnalyticsLoading = () => activeAnalyticsRequests > 0;