import { BaseTenantService } from './tenantBase.service';
import { HEALTH_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class HealthService extends BaseTenantService {
  constructor() {
    super('health');
  }

  async getHealth() {
    return this.withRetry(() =>
      this.apiClient.get(HEALTH_ENDPOINTS.HEALTH)
    );
  }

  async getOrganizationsHealth() {
    return this.withRetry(() =>
      this.apiClient.get(HEALTH_ENDPOINTS.ORGANIZATIONS_HEALTH)
    );
  }
}

export const healthService = new HealthService();