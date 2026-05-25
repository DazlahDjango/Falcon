/**
 * @deprecated Import from `services/api` instead.
 */
import { API_BASE_URL, DEFAULT_TIMEOUT_MS, rootApiClient, apiConfig } from './index';

export const defaultConfig = {
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
};

export const axiosInstance = rootApiClient;
export { apiConfig, API_BASE_URL, DEFAULT_TIMEOUT_MS };
