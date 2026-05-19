import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class HealthService extends BaseConfigService {
  constructor() {
    super('health-checks');
  }
  async getHealthChecks(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.HEALTH_CHECKS, { params }));
  }
  async checkAllApps() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.CHECK_ALL_HEALTH));
  }
  async getLatestHealth(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.LATEST_HEALTH, { params }));
  }
  async getSystemMetrics() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.HEALTH_METRICS));
  }
  async evaluateThresholds(appName) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.EVALUATE_THRESHOLDS, { app_name: appName }));
  }
  async triggerConditionalMaintenance() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.CONDITIONAL_TRIGGER));
  }
  async getHealthHistory(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.HEALTH_HISTORY, { params }));
  }
  async getHealthStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_HEALTH, { params }));
  }
}

export const healthService = new HealthService();