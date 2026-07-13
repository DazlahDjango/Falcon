// services/tenant/sector.service.js
import { BaseTenantService } from './tenantBase.service';
import { SECTOR_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class SectorService extends BaseTenantService {
    constructor() {
        super('sectors');
    }

    async getSectors(params = {}) {
        console.log('🔵 sector.service.getSectors called with params:', params);
        try {
            const response = await this.withRetry(() =>
                this.apiClient.get(SECTOR_ENDPOINTS.LIST, { params })
            );
            console.log('🔵 sector.service.getSectors raw response:', response);
            console.log('🔵 response.status:', response.status);
            console.log('🔵 response.data:', response.data);
            console.log('🔵 response.data type:', typeof response.data);
            console.log('🔵 response.data is array:', Array.isArray(response.data));
            console.log('🔵 response.data.results:', response.data?.results);
            console.log('🔵 response.data.success:', response.data?.success);

            // CASE 1: Envelope format with success: true and data
            if (response.data?.success === true && response.data?.data) {
                console.log('🔵 Using envelope unwrapped data');
                const unwrapped = response.data.data;
                console.log('🔵 Unwrapped data:', unwrapped);
                return unwrapped;
            }

            // CASE 2: Direct format with results array
            if (response.data?.results) {
                console.log('🔵 Using results from response');
                return response.data;
            }

            // CASE 3: Array response
            if (Array.isArray(response.data)) {
                console.log('🔵 Response is array, wrapping in results format');
                return { results: response.data, count: response.data.length };
            }

            // CASE 4: Return as-is
            console.log('🔵 Returning raw response.data');
            return response.data;
        } catch (error) {
            console.error('🔴 sector.service.getSectors error:', error);
            console.error('🔴 error.response:', error.response);
            console.error('🔴 error.response.data:', error.response?.data);
            throw error;
        }
    }

    async getSector(id, params = {}) {
        if (!id) throw new Error('Sector ID is required');
        const response = await this.withRetry(() =>
            this.apiClient.get(SECTOR_ENDPOINTS.DETAIL(id), { params })
        );
        if (response.data?.success === true && response.data?.data) {
            return response.data.data;
        }
        return response.data;
    }

    async createSector(data) {
        if (!data) throw new Error('Sector data is required');
        if (!data.name) throw new Error('Sector name is required');
        if (!data.code) throw new Error('Sector code is required');
        if (!data.sector_type) throw new Error('Sector type is required');
        const response = await this.withRetry(() =>
            this.apiClient.post(SECTOR_ENDPOINTS.CREATE, data)
        );
        if (response.data?.success === true && response.data?.data) {
            return response.data.data;
        }
        return response.data;
    }

    async updateSector(id, data) {
        if (!id) throw new Error('Sector ID is required');
        if (!data) throw new Error('Update data is required');
        const response = await this.withRetry(() =>
            this.apiClient.patch(SECTOR_ENDPOINTS.UPDATE(id), data)
        );
        if (response.data?.success === true && response.data?.data) {
            return response.data.data;
        }
        return response.data;
    }

    async deleteSector(id) {
        if (!id) throw new Error('Sector ID is required');
        const response = await this.withRetry(() =>
            this.apiClient.delete(SECTOR_ENDPOINTS.DELETE(id))
        );
        return response.data;
    }

    async toggleActive(id) {
        if (!id) throw new Error('Sector ID is required');
        const response = await this.withRetry(() =>
            this.apiClient.post(SECTOR_ENDPOINTS.TOGGLE_ACTIVE(id))
        );
        if (response.data?.success === true && response.data?.data) {
            return response.data.data;
        }
        return response.data;
    }

    async getSectorByCode(code) {
        if (!code) throw new Error('Sector code is required');
        const response = await this.getSectors({ search: code });
        const results = response?.results || response || [];
        const sector = results.find((s) => s.code === code);
        if (!sector) throw new Error(`Sector with code "${code}" not found`);
        return sector;
    }

    async getActiveSectors() {
        return this.getSectors({ is_active: true });
    }

    async getSectorsByType(sectorType) {
        if (!sectorType) throw new Error('Sector type is required');
        return this.getSectors({ sector_type: sectorType });
    }
}

export const sectorService = new SectorService();