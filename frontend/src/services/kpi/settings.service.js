import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  SYSTEM_SETTINGS_ENDPOINTS,
  REFERENCE_DATA_ENDPOINTS,
  NOTIFICATION_PREFERENCES_ENDPOINTS,
} from '../api/endpoints';

class SettingsService extends BaseKPIService {
  constructor() {
    super('settings');
  }

  // ============ System Settings ============
  async getSystemSettings() {
    return withRetry(async () => {
      const response = await this.apiClient.get(SYSTEM_SETTINGS_ENDPOINTS.KPI);
      return response;
    });
  }

  async updateSystemSettings(settings) {
    if (!settings) throw new Error('Settings data is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(SYSTEM_SETTINGS_ENDPOINTS.KPI, { settings });
      return response;
    });
  }

  async resetSystemSettings() {
    return withRetry(async () => {
      const response = await this.apiClient.post(SYSTEM_SETTINGS_ENDPOINTS.RESET);
      return response;
    });
  }

  // ============ Reference Data ============
  async getReferenceData(include = ['users', 'departments']) {
    return withRetry(async () => {
      const response = await this.apiClient.get(REFERENCE_DATA_ENDPOINTS.GET, {
        params: { include: include.join(',') },
      });
      return response;
    });
  }

  // ============ Notification Preferences ============
  async getNotificationPreferences() {
    return withRetry(async () => {
      const response = await this.apiClient.get(NOTIFICATION_PREFERENCES_ENDPOINTS.GET);
      return response;
    });
  }

  async updateNotificationPreferences(preferences) {
    if (!preferences) throw new Error('Preferences data is required');
    return withRetry(async () => {
      const response = await this.apiClient.put(NOTIFICATION_PREFERENCES_ENDPOINTS.UPDATE, preferences);
      return response;
    });
  }
}

export const settingsService = new SettingsService();