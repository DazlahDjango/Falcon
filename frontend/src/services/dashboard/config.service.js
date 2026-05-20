import { BaseDashboardService } from './dashboard.service';

class DashboardConfigService extends BaseDashboardService {
  constructor() {
    super('configs');
  }

  async getUserConfigs() {
    return this.withRetry(() => this.apiClient.get('/configs'));
  }

  async getConfigById(configId) {
    if (!configId) throw new Error('Config ID is required');
    return this.withRetry(() => this.apiClient.get(`/configs/${configId}`));
  }

  async getDefaultConfig(dashboardType) {
    if (!dashboardType) throw new Error('Dashboard type is required');
    return this.withRetry(() => this.apiClient.get(`/configs/default/${dashboardType}`));
  }

  async createConfig(configData) {
    if (!configData) throw new Error('Config data is required');
    return this.withRetry(() => this.apiClient.post('/configs', configData));
  }

  async updateConfig(configId, configData) {
    if (!configId) throw new Error('Config ID is required');
    if (!configData) throw new Error('Config data is required');
    return this.withRetry(() => this.apiClient.patch(`/configs/${configId}`, configData));
  }

  async deleteConfig(configId) {
    if (!configId) throw new Error('Config ID is required');
    return this.withRetry(() => this.apiClient.delete(`/configs/${configId}`));
  }

  async cloneConfig(sourceId, newName) {
    if (!sourceId) throw new Error('Source config ID is required');
    if (!newName) throw new Error('New name is required');
    return this.withRetry(() => this.apiClient.post(`/configs/${sourceId}/clone`, { new_name: newName }));
  }

  async setDefaultConfig(configId) {
    if (!configId) throw new Error('Config ID is required');
    return this.withRetry(() => this.apiClient.post(`/configs/${configId}/set-default`));
  }
}

export const dashboardConfigService = new DashboardConfigService();