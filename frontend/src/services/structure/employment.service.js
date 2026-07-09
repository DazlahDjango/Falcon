import { BaseStructureService, withRetry } from './base.service';
import { EMPLOYMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class EmploymentService extends BaseStructureService {
  constructor() {
    super('employments');
  }

  async getCurrent(params) {
    const response = await withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.CURRENT, { params }));
    return this.unwrap(response);
  }

  async getByUser(userId) {
    if (!userId) throw new Error('User ID is required');
    const response = await withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.BY_USER(userId)));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async transfer(data) {
    if (!data) throw new Error('Transfer data is required');
    const response = await withRetry(() => this.apiClient.post(EMPLOYMENT_ENDPOINTS.TRANSFER, data));
    return this.unwrap(response);
  }

  async bulkCreate(data) {
    if (!data) throw new Error('Bulk data is required');
    const response = await withRetry(() => this.apiClient.post(EMPLOYMENT_ENDPOINTS.BULK_CREATE, data));
    return this.unwrap(response);
  }

  async getMyEmployment() {
    const response = await withRetry(() => this.apiClient.get(EMPLOYMENT_ENDPOINTS.ME));
    return this.unwrap(response);
  }
}

export const employmentService = new EmploymentService();
export { EmploymentService };