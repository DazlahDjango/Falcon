import { BaseStructureService, withRetry } from './base.service';
import { HEALTH_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureHealthService extends BaseStructureService {
  constructor() {
    super('health');
  }

  async getDatabaseHealth() {
    const response = await withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.DATABASE));
    return this.unwrap(response);
  }

  async getCacheHealth() {
    const response = await withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.CACHE));
    return this.unwrap(response);
  }

  async getServicesHealth() {
    const response = await withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.SERVICES));
    return this.unwrap(response);
  }

  async getAdminHealth() {
    const response = await withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.ADMIN));
    return this.unwrap(response);
  }

  async getMetrics() {
    const response = await withRetry(() => this.apiClient.get(HEALTH_ENDPOINTS.METRICS));
    return this.unwrap(response);
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