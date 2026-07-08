import { BaseStructureService, withRetry } from './base.service';
import { ORGANIZATIONAL_UNIT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class OrganizationalUnitService extends BaseStructureService {
  constructor() {
    super('organizational-units');
  }

  async getByLevel(level) {
    if (!level) throw new Error('Level is required');
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.BY_LEVEL(level)));
  }

  async getByPath(path) {
    if (!path) throw new Error('Path is required');
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.BY_PATH(path)));
  }

  async getRootUnits() {
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.ROOT));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.STATS));
  }

  async getSubtree(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.SUBTREE(id)));
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.CHILDREN(id)));
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.EMPLOYMENTS(id)));
  }

  async getHierarchyTree(tenantId) {
    return withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.TREE, { params: { tenant_id: tenantId } }));
  }
}

export const organizationalUnitService = new OrganizationalUnitService();
export { OrganizationalUnitService };