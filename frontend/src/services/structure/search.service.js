import { BaseStructureService, withRetry } from './base.service';
import { SEARCH_ENDPOINTS } from '../../config/constants/structureApiConstants';

class StructureSearchService extends BaseStructureService {
  constructor() {
    super('search');
  }

  async search(query, params) {
    if (!query) throw new Error('Search query is required');
    return withRetry(() => this.apiClient.get(SEARCH_ENDPOINTS.SEARCH, { params: { search: query, ...params } }));
  }

  async searchOrganizationalUnits(query, isActive) {
    return this.search(query, { level: 'organizational_unit', is_active: isActive });
  }

  async searchDivisions(query, isActive) {
    return this.search(query, { level: 'division', is_active: isActive });
  }

  async searchDepartments(query, isActive) {
    return this.search(query, { level: 'department', is_active: isActive });
  }

  async searchSections(query, isActive) {
    return this.search(query, { level: 'section', is_active: isActive });
  }

  async searchUnits(query, isActive) {
    return this.search(query, { level: 'unit', is_active: isActive });
  }
}

export const structureSearchService = new StructureSearchService();
export { StructureSearchService };