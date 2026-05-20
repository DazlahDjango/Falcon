import { BaseDashboardService } from './dashboard.service';

class ViewPresetService extends BaseDashboardService {
  constructor() {
    super('view-presets');
  }

  async getViewPresets() {
    return this.withRetry(() => this.apiClient.get('/view-presets'));
  }

  async getViewPresetById(presetId) {
    if (!presetId) throw new Error('Preset ID is required');
    return this.withRetry(() => this.apiClient.get(`/view-presets/${presetId}`));
  }

  async createViewPreset(presetData) {
    if (!presetData) throw new Error('Preset data is required');
    return this.withRetry(() => this.apiClient.post('/view-presets', presetData));
  }

  async updateViewPreset(presetId, presetData) {
    if (!presetId) throw new Error('Preset ID is required');
    if (!presetData) throw new Error('Preset data is required');
    return this.withRetry(() => this.apiClient.patch(`/view-presets/${presetId}`, presetData));
  }

  async deleteViewPreset(presetId) {
    if (!presetId) throw new Error('Preset ID is required');
    return this.withRetry(() => this.apiClient.delete(`/view-presets/${presetId}`));
  }

  async setDefaultPreset(presetId) {
    if (!presetId) throw new Error('Preset ID is required');
    return this.withRetry(() => this.apiClient.post(`/view-presets/${presetId}/set-default`));
  }
}

export const viewPresetService = new ViewPresetService();