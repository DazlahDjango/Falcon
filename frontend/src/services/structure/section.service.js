import { BaseStructureService, withRetry } from './base.service';
import { SECTION_ENDPOINTS } from '../../config/constants/structureApiConstants';

class SectionService extends BaseStructureService {
  constructor() {
    super('sections');
  }

  async getByCode(code) {
    if (!code) throw new Error('Section code is required');
    return withRetry(() => this.apiClient.get(SECTION_ENDPOINTS.BY_CODE(code)));
  }

  async getUnits(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(SECTION_ENDPOINTS.UNITS(id)));
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(SECTION_ENDPOINTS.EMPLOYMENTS(id)));
  }
}

export const sectionService = new SectionService();
export { SectionService };