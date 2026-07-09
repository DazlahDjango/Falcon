import { BaseStructureService, withRetry } from './base.service';
import { UNIT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class UnitService extends BaseStructureService {
  constructor() {
    super('units');
  }

  async getByCode(code) {
    if (!code) throw new Error('Unit code is required');
    const response = await withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.BY_CODE(code)));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(UNIT_ENDPOINTS.EMPLOYMENTS(id)));
    return this.unwrap(response);
  }
}

export const unitService = new UnitService();
export { UnitService };