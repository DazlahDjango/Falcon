import { BaseStructureService, withRetry } from './base.service';
import { DIVISION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DivisionService extends BaseStructureService {
  constructor() {
    super('divisions');
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getDepartments(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.DEPARTMENTS(id)));
    return this.unwrap(response);
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.EMPLOYMENTS(id)));
    return this.unwrap(response);
  }
}

export const divisionService = new DivisionService();
export { DivisionService };