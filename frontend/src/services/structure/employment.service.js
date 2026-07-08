import { BaseStructureService, withRetry } from './base.service';
import { EMPLOYMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class EmploymentService extends BaseStructureService {
  constructor() {
    super('employments');
  }

  async getCurrent(params) {
    return withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.CURRENT, { params }));
  }

  async getByUser(userId) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.BY_USER(userId)));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.STATS));
  }

  async transfer(data) {
    if (!data) throw new Error('Transfer data is required');
    return withRetry(() => this.apiClient.post(EMPLOYMENT_ENDPOINTS.TRANSFER, data));
  }

  async bulkCreate(data) {
    if (!data) throw new Error('Bulk data is required');
    return withRetry(() => this.apiClient.post(EMPLOYMENT_ENDPOINTS.BULK_CREATE, data));
  }

  async getMyEmployment() {
    return withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.ME));
  }
}

export const employmentService = new EmploymentService();
export { EmploymentService };