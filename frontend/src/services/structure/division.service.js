import { BaseStructureService, withRetry } from './base.service';
import { DIVISION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DivisionService extends BaseStructureService {
  constructor() {
    super('divisions');
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.STATS));
  }

  async getDepartments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.DEPARTMENTS(id)));
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DIVISION_ENDPOINTS.EMPLOYMENTS(id)));
  }
}

export const divisionService = new DivisionService();
export { DivisionService };