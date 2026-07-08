import { BaseStructureService, withRetry } from './base.service';
import { REFERENCE_DATA_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureReferenceDataService extends BaseStructureService {
  constructor() {
    super('reference-data');
  }

  async getReferenceData(include) {
    return withRetry(() => this.apiClient.get(REFERENCE_DATA_ENDPOINTS.GET, { params: { include: include ? include.join(',') : 'counts,org_units,users' } }));
  }

  async getCounts() {
    return withRetry(() => this.apiClient.get(REFERENCE_DATA_ENDPOINTS.GET, { params: { include: 'counts' } }));
  }

  async getOrgUnits() {
    return withRetry(() => this.apiClient.get(REFERENCE_DATA_ENDPOINTS.GET, { params: { include: 'org_units' } }));
  }

  async getUsers() {
    return withRetry(() => this.apiClient.get(REFERENCE_DATA_ENDPOINTS.GET, { params: { include: 'users' } }));
  }
}

export const structureReferenceDataService = new StructureReferenceDataService();
export { StructureReferenceDataService };