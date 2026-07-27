// services/api/BaseResourceService.js

import { withRetry as defaultWithRetry } from './withRetry';

export class BaseResourceService {
  constructor(resourceName, { client, withRetry = defaultWithRetry, logLabel = 'API' } = {}) {
    if (!client) {
      throw new Error('BaseResourceService requires an api client');
    }
    this.resourceName = resourceName;
    this.apiClient = client;
    this.withRetry = (fn, opts) => withRetry(fn, { logLabel, ...opts });
  }

  getEndpoint(endpoint = '') {
    return endpoint ? `/${this.resourceName}/${endpoint}` : `/${this.resourceName}/`;
  }

  /**
   * Unwrap envelope response — returns the actual data
   * Use this when your components expect the raw payload
   */
  unwrap(response) {
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return response.data;
    }
    return response;
  }

  async list(params = {}) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    return response; // full envelope
  }

  async listRaw(params = {}) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(), { params }));
    return this.unwrap(response); // just the data
  }

  async get(id, params = {}) {
    return this.getById(id, params);
  }

  async getById(id, params = {}) {
    if (!id) throw new Error('ID is required');
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/`), { params }));
    return response;
  }

  async getByIdRaw(id, params = {}) {
    if (!id) throw new Error('ID is required');
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/`), { params }));
    return this.unwrap(response);
  }

  async create(data) {
    if (!data) throw new Error('Data is required');
    return this.withRetry(() => this.apiClient.post(this.getEndpoint(), data));
  }

  async update(id, data, partial = true) {
    if (!id) throw new Error('ID is required');
    if (!data) throw new Error('Data is required');
    const method = partial ? 'patch' : 'put';
    return this.withRetry(() => this.apiClient[method](this.getEndpoint(`${id}/`), data));
  }

  async delete(id) {
    if (!id) throw new Error('ID is required');
    return this.withRetry(() => this.apiClient.delete(this.getEndpoint(`${id}/`)));
  }

  async getStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), { params }));
  }

  async exportData(format = 'csv', params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(this.getEndpoint(`export/${format}/`), {
        params,
        responseType: format === 'json' ? 'json' : 'blob',
      }),
    );
  }
}