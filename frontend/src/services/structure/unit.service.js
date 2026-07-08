import { BaseStructureService, withRetry } from './base.service';
import { UNIT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class UnitService extends BaseStructureService {
  constructor() {
    super('units');
  }

  async getByCode(code) {
    if (!code) throw new Error('Unit code is required');
    return withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.BY_CODE(code)));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.STATS));
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.EMPLOYMENTS(id)));
  }
}

export const unitService = new UnitService();
export { UnitService };