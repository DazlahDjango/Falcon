// src/store/reviews/middleware/reviewMiddleware.js
// Redux middleware for review API calls and error handling

// ========== Action Types for Loading Tracking ==========
const LOADING_ACTIONS = [
    // Cycle actions
    'reviews/cycles/fetchAll/pending',
    'reviews/cycles/create/pending',
    'reviews/cycles/update/pending',
    'reviews/cycles/delete/pending',
    'reviews/cycles/activate/pending',
    'reviews/cycles/close/pending',
    'reviews/cycles/archive/pending',
    // Self assessment actions
    'reviews/selfAssessment/fetchMy/pending',
    'reviews/selfAssessment/save/pending',
    'reviews/selfAssessment/submit/pending',
    // Supervisor review actions
    'reviews/supervisorReview/fetchQueue/pending',
    'reviews/supervisorReview/save/pending',
    'reviews/supervisorReview/submit/pending',
    'reviews/supervisorReview/approve/pending',
    'reviews/supervisorReview/reject/pending',
    // Final rating actions
    'reviews/finalRatings/fetchAll/pending',
    'reviews/finalRatings/approve/pending',
    'reviews/finalRatings/lock/pending',
    'reviews/finalRatings/calibrate/pending',
    // PIP actions
    'reviews/pips/fetchAll/pending',
    'reviews/pips/create/pending',
    'reviews/pips/update/pending',
    'reviews/pips/delete/pending',
    'reviews/pips/approve/pending',
    'reviews/pips/complete/pending',
    // Feedback actions
    'reviews/feedback/fetchRequests/pending',
    'reviews/feedback/createRequest/pending',
    'reviews/feedback/submitResponse/pending',
    // Calibration actions
    'reviews/calibration/fetchSessions/pending',
    'reviews/calibration/createSession/pending',
    'reviews/calibration/startSession/pending',
    'reviews/calibration/completeSession/pending',
    'reviews/calibration/adjustRating/pending',
];

const SUCCESS_ACTIONS = LOADING_ACTIONS.map(a => a.replace('/pending', '/fulfilled'));
const FAILURE_ACTIONS = LOADING_ACTIONS.map(a => a.replace('/pending', '/rejected'));

// ========== Global Loading Counter ==========
let activeRequests = 0;
let loadingListeners = [];

export const subscribeToLoading = (listener) => {
    loadingListeners.push(listener);
    return () => {
        loadingListeners = loadingListeners.filter(l => l !== listener);
    };
};

const notifyLoadingListeners = (isLoading) => {
    loadingListeners.forEach(listener => listener(isLoading));
};

// ========== Error Handler ==========
const handleApiError = (store, action) => {
    const error = action.payload;
    const errorMessage = error?.message || error?.detail || 'An unexpected error occurred';
    const statusCode = error?.status || error?.status_code || 500;
    
    console.error(`[API Error] ${action.type}:`, error);
    
    // Dispatch error to notification slice if available
    try {
        store.dispatch({
            type: 'reviewsNotifications/addNotification',
            payload: {
                type: 'error',
                title: 'Error',
                message: errorMessage,
                createdAt: new Date().toISOString(),
            },
        });
    } catch (e) {
        // Notification slice not available
        console.error('Failed to dispatch error notification:', e);
    }
    
    // Handle specific status codes
    if (statusCode === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login?session=expired';
        }
    }
    
    if (statusCode === 403) {
        // Forbidden - show permission denied message
        try {
            store.dispatch({
                type: 'reviewsNotifications/addNotification',
                payload: {
                    type: 'error',
                    title: 'Permission Denied',
                    message: errorMessage || 'You do not have permission to perform this action',
                    createdAt: new Date().toISOString(),
                },
            });
        } catch (e) {
            console.error('Failed to dispatch permission error:', e);
        }
    }
};

// ========== Loading State Manager ==========
let loadingState = {
    cycles: false,
    selfAssessment: false,
    supervisorReview: false,
    finalRatings: false,
    pips: false,
    feedback: false,
    calibration: false,
};

const updateLoadingState = (actionType, isLoading) => {
    if (actionType.includes('/cycles/')) {
        loadingState.cycles = isLoading;
    } else if (actionType.includes('/selfAssessment/')) {
        loadingState.selfAssessment = isLoading;
    } else if (actionType.includes('/supervisorReview/')) {
        loadingState.supervisorReview = isLoading;
    } else if (actionType.includes('/finalRatings/')) {
        loadingState.finalRatings = isLoading;
    } else if (actionType.includes('/pips/')) {
        loadingState.pips = isLoading;
    } else if (actionType.includes('/feedback/')) {
        loadingState.feedback = isLoading;
    } else if (actionType.includes('/calibration/')) {
        loadingState.calibration = isLoading;
    }
};

// ========== Request Logger ==========
const logRequest = (action) => {
    if (import.meta.env.DEV) {
        console.log(`[API Request] ${action.type}`, {
            payload: action.payload,
            timestamp: new Date().toISOString(),
        });
    }
};

const logResponse = (action) => {
    if (import.meta.env.DEV) {
        console.log(`[API Response] ${action.type}`, {
            success: true,
            timestamp: new Date().toISOString(),
        });
    }
};

// ========== Main Middleware ==========
export const reviewMiddleware = (store) => (next) => (action) => {
    const actionType = action.type;
    
    // Track loading start
    if (LOADING_ACTIONS.includes(actionType)) {
        activeRequests++;
        if (activeRequests === 1) {
            notifyLoadingListeners(true);
        }
        updateLoadingState(actionType, true);
        logRequest(action);
    }
    
    // Track loading end (success or failure)
    if (SUCCESS_ACTIONS.includes(actionType)) {
        activeRequests--;
        if (activeRequests === 0) {
            notifyLoadingListeners(false);
        }
        updateLoadingState(actionType, false);
        logResponse(action);
    }
    
    if (FAILURE_ACTIONS.includes(actionType)) {
        activeRequests--;
        if (activeRequests === 0) {
            notifyLoadingListeners(false);
        }
        updateLoadingState(actionType, false);
        handleApiError(store, action);
    }
    
    return next(action);
};

// ========== Loading Middleware for Specific Features ==========
export const loadingMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    
    // You can dispatch loading state to a specific slice
    if (action.type?.endsWith('/pending')) {
        store.dispatch({
            type: `${action.type.split('/')[0]}/setLoading`,
            payload: true,
        });
    }
    
    if (action.type?.endsWith('/fulfilled') || action.type?.endsWith('/rejected')) {
        store.dispatch({
            type: `${action.type.split('/')[0]}/setLoading`,
            payload: false,
        });
    }
    
    return result;
};

// ========== Cache Middleware ==========
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (store) => (next) => (action) => {
    // Only cache GET requests
    if (action.type?.includes('/fetch') && action.type?.endsWith('/fulfilled')) {
        const cacheKey = `${action.type}_${JSON.stringify(action.meta?.arg || '')}`;
        cache.set(cacheKey, {
            data: action.payload,
            timestamp: Date.now(),
        });
    }
    
    return next(action);
};

export const getCachedData = (actionType, params = {}) => {
    const cacheKey = `${actionType}_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    
    return null;
};

export const clearCache = () => {
    cache.clear();
};

export const clearCacheForAction = (actionType) => {
    for (const key of cache.keys()) {
        if (key.startsWith(actionType)) {
            cache.delete(key);
        }
    }
};

export const cacheUtils = {
    clearCache: () => {
        cache.clear();
    },
    clearResourceCache: (resourceType) => {
        const target = resourceType.toLowerCase();
        for (const key of cache.keys()) {
            if (key.toLowerCase().includes(target)) {
                cache.delete(key);
            }
        }
    },
    getCacheSize: () => {
        return cache.size;
    },
    getCacheStats: () => {
        return {
            size: cache.size,
            keys: Array.from(cache.keys()),
        };
    }
};

// ========== Export Loading State Getter ==========
export const getLoadingState = () => ({ ...loadingState });
export const isGlobalLoading = () => activeRequests > 0;