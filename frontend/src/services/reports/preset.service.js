import { ReportBaseService, withRetry } from './reportBase.service';
import { PRESET_ENDPOINTS } from '../../config/constants/reportApiConstants';

class PresetService extends ReportBaseService {
    constructor() {
        super('presets');
    }

    async getPresets(params = {}) {
        return withRetry(async () => {
            const response = await this.apiClient.get(PRESET_ENDPOINTS.LIST, { params });
            return response;
        });
    }

    async getPreset(id) {
        if (!id) throw new Error('Report Preset ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.get(PRESET_ENDPOINTS.DETAIL(id));
            return response;
        });
    }

    async createPreset(data) {
        if (!data) throw new Error('Report Preset data is required');
        return withRetry(async () => {
            const response = await this.apiClient.post(PRESET_ENDPOINTS.CREATE, data);
            return response;
        });
    }

    async updatePreset(id, data) {
        if (!id) throw new Error('Report Preset ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.patch(PRESET_ENDPOINTS.UPDATE(id), data);
            return response;
        });
    }

    async deletePreset(id) {
        if (!id) throw new Error('Report Preset ID is required');
        return withRetry(async () => {
            const response = await this.apiClient.delete(PRESET_ENDPOINTS.DELETE(id));
            return response;
        });
    }
}

export const presetService = new PresetService();
export default presetService;
