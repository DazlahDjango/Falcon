/**
 * Accounts app HTTP helpers — thin wrapper over shared accountsApiClient.
 */
import { accountsApiClient } from './clients';

export const request = {
  get: (url, config = {}) => accountsApiClient.get(url, config),
  post: (url, data, config = {}) => accountsApiClient.post(url, data, config),
  put: (url, data, config = {}) => accountsApiClient.put(url, data, config),
  patch: (url, data, config = {}) => accountsApiClient.patch(url, data, config),
  delete: (url, config = {}) => accountsApiClient.delete(url, config),
};

export const upload = (url, formData, onProgress) =>
  accountsApiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });

export { accountsApiClient as apiClient };
export default accountsApiClient;

export const setupAxiosInterceptors = () => {
  if (import.meta.env.DEV) {
    console.log('[API] Accounts client ready (shared configuration)');
  }
};
