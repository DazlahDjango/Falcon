import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAccessToken,
  setTokens,
  clearTokens,
  getRefreshToken,
} from '../../../services/accounts/storage/secureStorage';
import { refreshToken as refreshTokenApi } from '../../../services/accounts/api/auth';
import { logout } from '../slice/authSlice';

let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
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
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await refreshTokenApi({ refresh: refreshToken });
      const { access, refresh } = response.data;
      if (access) {
        await setTokens(access, refresh || refreshToken);
        return access;
      }
      throw new Error('Invalid refresh response');
    } catch (error) {
      await clearTokens();
      return rejectWithValue(error.response?.data?.error || 'Session expired');
    }
  }
);

const isAuthOrPublicEndpoint = (action) => {
  if (!action?.meta?.arg?.endpoint) return false;
  const url = action.meta.arg.endpoint || '';
  const publicEndpoints = [
    '/auth/login/',
    '/auth/refresh/',
    '/auth/register/',
    '/auth/password-reset/',
    '/auth/verify-email/',
    '/auth/invitation/accept/',
    '/auth/mfa-verify/',
    '/auth/mfa-setup/',
  ];
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

export const authMiddleware = (store) => (next) => async (action) => {
  const result = next(action);

  if (action.type?.endsWith('/rejected') && action.payload?.status === 401) {
    if (isAuthOrPublicEndpoint(action)) {
      return result;
    }

    const state = store.getState();
    const token = await getAccessToken();

    if (token && !isRefreshing) {
      isRefreshing = true;

      try {
        const newToken = await store.dispatch(refreshAccessToken()).unwrap();
        processQueue(null, newToken);

        const retryAction = {
          ...action,
          meta: { ...action.meta, retry: true },
          retry: true,
        };
        return store.dispatch(retryAction);
      } catch (error) {
        processQueue(error, null);
        store.dispatch(logout());
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return result;
      } finally {
        isRefreshing = false;
      }
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          const retryAction = {
            ...action,
            meta: { ...action.meta, retry: true },
            retry: true,
          };
          return store.dispatch(retryAction);
        })
        .catch(() => result);
    }
  }

  return result;
};

export const tokenRefreshMiddleware = (store) => (next) => (action) => {
  if (action.type === 'auth/refreshToken/fulfilled') {
    const token = action.payload;
    if (token) {
      const pendingActions = store.getState().auth?.pendingActions || [];
      pendingActions.forEach((pendingAction) => {
        store.dispatch(pendingAction);
      });
    }
  }
  return next(action);
};