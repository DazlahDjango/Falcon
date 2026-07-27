// ============================================
// apps/reportplt/middleware/reportErrorHandler.middleware.js
// ============================================

import { createSlice } from '@reduxjs/toolkit';
import { REPORT_ERROR_CODES, HTTP_STATUS } from '../../../config/constants/reportApiConstants';

const errorState = {
    errors: [],
    currentError: null,
    isError: false,
};

export const errorSlice = createSlice({
    name: 'reportError',
    initialState: errorState,
    reducers: {
        setError: (state, action) => {
            state.currentError = action.payload;
            state.isError = true;
            state.errors.unshift({ ...action.payload, timestamp: Date.now() });
            if (state.errors.length > 50) state.errors.pop();
        },
        clearError: (state) => {
            state.currentError = null;
            state.isError = false;
        },
        clearAllErrors: (state) => {
            state.errors = [];
            state.currentError = null;
            state.isError = false;
        },
    },
});

export const { setError, clearError, clearAllErrors } = errorSlice.actions;

export const reportErrorHandler = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type?.endsWith('/rejected') && action.payload) {
        const error = normalizeError(action.payload);
        store.dispatch(setError(error));

        if (error.status === HTTP_STATUS.UNAUTHORIZED) {
            handleUnauthorized(store, error);
        } else if (error.status === HTTP_STATUS.FORBIDDEN) {
            handleForbidden(store, error);
        } else if (error.status === HTTP_STATUS.NOT_FOUND) {
            handleNotFound(store, error);
        } else if (error.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
            handleRateLimit(store, error);
        } else if (error.status >= 500) {
            handleServerError(store, error);
        }
    }

    if (action.type?.startsWith('report/') && action.type?.endsWith('/fulfilled')) {
        store.dispatch(clearError());
    }

    return result;
};

export const normalizeError = (error) => {
    if (typeof error === 'string') {
        return { message: error, status: 400, code: 'UNKNOWN_ERROR' };
    }
    if (error.response?.data) {
        return {
            message: error.response.data.message || error.response.data.error || 'An error occurred',
            status: error.response.status || 500,
            code: error.response.data.code || 'API_ERROR',
            details: error.response.data.details || null,
        };
    }
    if (error.message) {
        return {
            message: error.message,
            status: error.status || 500,
            code: error.code || 'UNKNOWN_ERROR',
            details: error.details || null,
        };
    }
    return {
        message: 'An unexpected error occurred',
        status: 500,
        code: 'UNKNOWN_ERROR',
        details: null,
    };
};

export const handleUnauthorized = (store, error) => {
    console.warn('Authentication error:', error.message);
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
        if (window.location.pathname !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
    }
};

export const handleForbidden = (store, error) => {
    console.warn('Permission denied:', error.message);
    store.dispatch(setError({ ...error, isPermissionError: true }));
};

export const handleNotFound = (store, error) => {
    console.warn('Resource not found:', error.message);
    store.dispatch(setError({ ...error, isNotFound: true }));
};

export const handleRateLimit = (store, error) => {
    console.warn('Rate limit exceeded:', error.message);
    store.dispatch(setError({ ...error, isRateLimit: true, retryAfter: error.retryAfter || 60 }));
};

export const handleServerError = (store, error) => {
    console.error('Server error:', error.message);
    store.dispatch(setError({ ...error, isServerError: true }));
};

export const selectError = (state) => state.reportError?.currentError || null;
export const selectIsError = (state) => state.reportError?.isError || false;
export const selectErrorHistory = (state) => state.reportError?.errors || [];
export const selectLastError = (state) => state.reportError?.errors?.[0] || null;

export default errorSlice.reducer;