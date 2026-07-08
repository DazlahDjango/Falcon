import { BaseStructureService, withRetry } from './base.service';
import { SYSTEM_SETTINGS_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureSystemSettingsService extends BaseStructureService {
  constructor() {
    super('system-settings');
  }

  async getSettings() {
    return withRetry(() => this.apiClient.get(SYSTEM_SETTINGS_ENDPOINTS.GET));
  }

  async updateSettings(data) {
    if (!data) throw new Error('Settings data is required');
    return withRetry(() => this.apiClient.patch(SYSTEM_SETTINGS_ENDPOINTS.UPDATE, data));
  }

  async resetSettings() {
    return withRetry(() => this.apiClient.post(SYSTEM_SETTINGS_ENDPOINTS.RESET));
  }
}

export const structureSystemSettingsService = new StructureSystemSettingsService();
export { StructureSystemSettingsService };