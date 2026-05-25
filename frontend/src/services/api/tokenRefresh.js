/**
 * Central token refresh queue — prevents parallel 401s from clearing the session
 * while another client is still refreshing (fixes flaky login / stuck dashboards).
 */
import axios from 'axios';
import {
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../accounts/storage/secureStorage';

import { API_BASE_URL } from './constants';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

export async function refreshAccessToken() {
  const refreshTokenValue = await getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token');
  }
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh/`,
    { refresh: refreshTokenValue },
    { headers: { 'Content-Type': 'application/json' } },
  );
  const access = response.data?.access;
  if (!access) {
    throw new Error('Refresh response missing access token');
  }
  await setTokens(access, refreshTokenValue);
  return access;
}

export function enqueueTokenRefresh() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
  isRefreshing = true;
  return refreshAccessToken()
    .then((token) => {
      processQueue(null, token);
      return token;
    })
    .catch((err) => {
      processQueue(err, null);
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
    });
}

/**
 * Retry a failed request after refreshing the access token.
 * @param {object} originalRequest - axios request config
 * @param {function} retryFn - (config) => Promise, usually apiClient(config)
 */
export async function retryRequestAfterRefresh(originalRequest, retryFn) {
  if (originalRequest._retry) {
    await clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new Error('Session expired. Please login again.');
  }
  originalRequest._retry = true;
  try {
    const token = await enqueueTokenRefresh();
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return retryFn(originalRequest);
  } catch (refreshError) {
    await clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw refreshError;
  }
}

/** True for errors that should not trip client-side circuit breakers */
export function isAuthOrClientError(status) {
  return status === 401 || status === 403 || status === 404 || status === 400;
}
