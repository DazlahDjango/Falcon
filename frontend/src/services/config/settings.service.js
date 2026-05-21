import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class SettingsService extends BaseConfigService {
  constructor() {
    super('');
  }

  async getSystemSettings() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.SYSTEM_SETTINGS));
  }

  async updateSystemSettings(patch) {
    return this.withRetry(() => this.apiClient.patch(CONFIG_API.SYSTEM_SETTINGS, patch));
  }

  async resetSystemSettings() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.SYSTEM_SETTINGS_RESET));
  }
}

export const settingsService = new SettingsService();
