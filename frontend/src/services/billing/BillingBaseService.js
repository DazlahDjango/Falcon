import { billingApiClient } from '../api/clients';
import { withRetry as defaultWithRetry } from '../api/withRetry';

class BillingBaseService {
    constructor(resourceName, options = {}) {
        this.resourceName = resourceName;
        this.apiClient = options.apiClient || billingApiClient;
        this.withRetry = options.withRetry || defaultWithRetry;
        this.logLabel = options.logLabel || 'Billing';
    }

    getEndpoint(endpoint = '') {
        return endpoint ? `/${this.resourceName}/${endpoint}` : `/${this.resourceName}/`;
    }

    unwrap(response) {
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response.data;
        }
        return response;
    }

    async list(params = {}) {
        return this.withRetry(() => this.apiClient.get(this.getEndpoint(), { params }), { logLabel: this.logLabel });
    }

    async listRaw(params = {}) {
        const response = await this.list(params);
        return this.unwrap(response);
    }

    async getById(id, params = {}) {
        if (!id) throw new Error('ID is required');
        return this.withRetry(() => this.apiClient.get(this.getEndpoint(`${id}/`), { params }), { logLabel: this.logLabel });
    }

    async getByIdRaw(id, params = {}) {
        const response = await this.getById(id, params);
        return this.unwrap(response);
    }

    async create(data) {
        if (!data) throw new Error('Data is required');
        return this.withRetry(() => this.apiClient.post(this.getEndpoint(), data), { logLabel: this.logLabel });
    }

    async update(id, data, partial = true) {
        if (!id) throw new Error('ID is required');
        if (!data) throw new Error('Data is required');
        const method = partial ? 'patch' : 'put';
        return this.withRetry(() => this.apiClient[method](this.getEndpoint(`${id}/`), data), { logLabel: this.logLabel });
    }

    async delete(id) {
        if (!id) throw new Error('ID is required');
        return this.withRetry(() => this.apiClient.delete(this.getEndpoint(`${id}/`)), { logLabel: this.logLabel });
    }

    async getStats(params = {}) {
        return this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), { params }), { logLabel: this.logLabel });
    }

    async exportData(format = 'csv', params = {}) {
        return this.withRetry(() => this.apiClient.get(this.getEndpoint(`export/${format}/`), { params, responseType: format === 'json' ? 'json' : 'blob' }), { logLabel: this.logLabel });
    }
}

export { BillingBaseService };
export default BillingBaseService;