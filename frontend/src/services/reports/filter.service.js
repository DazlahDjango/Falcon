import { ReportBaseService, withRetry } from './reportBase.service';
import { FILTER_ENDPOINTS } from '../../config/constants/reportApiConstants';

class FilterService extends ReportBaseService {
    constructor() {
        super('filters');
    }

    async getFilters(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(FILTER_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getFilter(id) {
        if (!id) throw new Error('Filter ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(FILTER_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createFilter(data) {
        if (!data) throw new Error('Filter data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(FILTER_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updateFilter(id, data) {
        if (!id) throw new Error('Filter ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(FILTER_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deleteFilter(id) {
        if (!id) throw new Error('Filter ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(FILTER_ENDPOINTS.DELETE(id));
            return response;
        });
    }

    async applyFilter(id, values) {
        if (!id) throw new Error('Filter ID is required');
        if (!values) throw new Error('Filter values are required');
        return withRetry(async () => {
            const response = await this.apiClient.post(FILTER_ENDPOINTS.APPLY(id), { values });
            return response;
        });
    }

    async setDefaultFilter(id) {
        if (!id) throw new Error('Filter ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(FILTER_ENDPOINTS.SET_DEFAULT(id));
            return response;
        });
    }

    async duplicateFilter(id, newName = null) {
        if (!id) throw new Error('Filter ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(FILTER_ENDPOINTS.DUPLICATE(id), { new_name: newName });
            return response;
        });
    }

    async getGlobalFilters() {
        return withRetry(async () => {
            const response = await this.apiClient.get(FILTER_ENDPOINTS.GLOBAL);
            return response;
        });
    }

    async getMyFilters() {
        return withRetry(async () => {
            const response = await this.apiClient.get(FILTER_ENDPOINTS.MY_FILTERS);
            return response;
        });
    }

    async getFilterTypes() {
        return withRetry(async () => {
            const response = await this.apiClient.get(FILTER_ENDPOINTS.TYPES);
            return response;
        });
    }
}

export const filterService = new FilterService();

