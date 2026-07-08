import { BaseStructureService, withRetry } from './base.service';
import { HEALTH_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureHealthService extends BaseStructureService {
  constructor() {
    super('health');
  }

  async getDatabaseHealth() {
    return withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.DATABASE));
  }

  async getCacheHealth() {
    return withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.CACHE));
  }

  async getServicesHealth() {
    return withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.SERVICES));
  }

  async getAdminHealth() {
    return withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.ADMIN));
  }

  async getMetrics() {
    return withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.METRICS));
  }

  async getAllHealthChecks() {
    const [database, cache, services, admin, metrics] = await Promise.all([
      this.getDatabaseHealth(),
      this.getCacheHealth(),
      this.getServicesHealth(),
      this.getAdminHealth(),
      this.getMetrics()
    ]);
    return { database, cache, services, admin, metrics };
  }
}

export const structureHealthService = new StructureHealthService();
export { StructureHealthService };