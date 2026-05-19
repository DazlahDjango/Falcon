import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class RegistryService extends BaseConfigService {
  constructor() {
    super('registered-apps');
  }
  async getRegisteredApps(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.REGISTERED_APPS, { params }));
  }
  async getApp(appId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.REGISTERED_APPS}/${appId}/`));
  }
  async registerV1Apps() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.REGISTER_V1_APPS));
  }
  async updateApp(appId, data) {
    return this.withRetry(() => this.apiClient.patch(`${CONFIG_API.REGISTERED_APPS}/${appId}/`, data));
  }
  async unregisterApp(appId) {
    return this.withRetry(() => this.apiClient.delete(`${CONFIG_API.REGISTERED_APPS}/${appId}/`));
  }
  async getRecoverySequence() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.RECOVERY_SEQUENCE));
  }
  async getPriorityOrder() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.PRIORITY_ORDER));
  }
  async getDependencies(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.APP_DEPENDENCIES, { params }));
  }
  async createDependency(data) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.APP_DEPENDENCIES, data));
  }
  async deleteDependency(dependencyId) {
    return this.withRetry(() => this.apiClient.delete(`${CONFIG_API.APP_DEPENDENCIES}/${dependencyId}/`));
  }
}

export const registryService = new RegistryService();