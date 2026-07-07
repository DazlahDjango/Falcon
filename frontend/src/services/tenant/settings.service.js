import { BaseTenantService } from './tenantBase.service';
import { SETTINGS_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class SettingsService extends BaseTenantService {
  constructor() {
    super('settings');
  }

  async getSettings() {
    return this.withRetry(() =>
      this.apiClient.get(SETTINGS_ENDPOINTS.LIST)
    );
  }

  async getSettingsSection(section) {
    if (!section) throw new Error('Section name is required');
    return this.withRetry(() =>
      this.apiClient.get(SETTINGS_ENDPOINTS.SECTION, { params: { section } })
    );
  }

  async updateSettings(data) {
    if (!data) throw new Error('Settings data is required');
    return this.withRetry(() =>
      this.apiClient.post(SETTINGS_ENDPOINTS.UPDATE_SETTINGS, { settings: data })
    );
  }

  async updateSettingsSection(section, patch) {
    if (!section) throw new Error('Section name is required');
    if (!patch) throw new Error('Patch data is required');
    return this.withRetry(() =>
      this.apiClient.post(SETTINGS_ENDPOINTS.UPDATE_SECTION, { section, patch })
    );
  }

  async resetSettings() {
    return this.withRetry(() =>
      this.apiClient.post(SETTINGS_ENDPOINTS.RESET)
    );
  }

  async getSystemSettings() {
    return this.withRetry(() =>
      this.apiClient.get(SETTINGS_ENDPOINTS.SYSTEM_SETTINGS)
    );
  }

  async resetSystemSettings() {
    return this.withRetry(() =>
      this.apiClient.post(SETTINGS_ENDPOINTS.SYSTEM_SETTINGS_RESET)
    );
  }
}

export const settingsService = new SettingsService();