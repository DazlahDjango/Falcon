import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAccessToken, setTokens, clearTokens, getRefreshToken } from '../../../services/accounts/storage/secureStorage';
import { refreshToken as refreshTokenApi } from '../../../services/accounts/api/auth';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, dispatch }) => {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        try {
            const response = await refreshTokenApi(refreshToken);
            const { access } = response.data;
            await setTokens(access, refreshToken);
            return access;
        } catch (error) {
            await clearTokens();
            throw error;
        }
    }
);
export const authMiddleware = (store) => (next) => async (action) => {
    if (action.type?.endsWith('/rejected') && action.payload?.status === 401) {
        const state = store.getState();
        const token = await getAccessToken();
        if (token && !isRefreshing) {
            isRefreshing = true;
            try {
                const newToken = await store.dispatch(refreshAccessToken()).unwrap();
                processQueue(null, newToken);
                const retryAction = {
                    ...action,
                    meta: { ...action.meta, retry: true }
                };
                return store.dispatch(retryAction);
            } catch (error) {
                processQueue(error, null);
                store.dispatch({ type: 'auth/logout' });
                window.location.href = '/login';
                return netx(action);
            } finally {
                isRefreshing = false;
            }
        } else if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return store.dispatch(action);
            }).catch(() => {
                return next(action);
            });
        }
    }
    return next(action);
};