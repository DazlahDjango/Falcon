import { dashboardApiClient } from '../api/clients';

// expose the underlying client as a named export for other modules
export const apiClient = dashboardApiClient;

// Retry wrapper for transient failures
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (fn, options = {}) => {
  const { maxRetries = MAX_RETRIES, retryDelay = RETRY_DELAY, retryOnStatus = [408, 429, 500, 502, 503, 504] } = options;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      const shouldRetry = retryOnStatus.includes(error.status) && attempt < maxRetries;
      if (shouldRetry) {
        console.warn(`[DashboardService] Retry ${attempt}/${maxRetries}`);
        await delay(retryDelay * attempt);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

class BaseDashboardService {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.apiClient = dashboardApiClient;
    this.withRetry = withRetry;
  }
  
  getEndpoint(endpoint = '') {
    return endpoint ? `/${this.resourceName}/${endpoint}` : `/${this.resourceName}/`;
  }
  
  async list(params = {}) {
    return withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
  }
  
  async getById(id, params = {}) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/`), { params }));
  }
  
  async create(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(() => this.apiClient.post(this.getEndpoint(), data));
  }
  
  async update(id, data, partial = true) {
    if (!id) throw new Error('ID is required');
    if (!data) throw new Error('Data is required');
    const method = partial ? 'patch' : 'put';
    return withRetry(() => this.apiClient[method](this.getEndpoint(`${id}/`), data));
  }
  
  async delete(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.delete(this.getEndpoint(`${id}/`)));
  }
}

export { withRetry, BaseDashboardService };