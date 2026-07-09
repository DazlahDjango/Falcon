import { BaseStructureService, withRetry } from './base.service';
import { ORGANIZATIONAL_UNIT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class OrganizationalUnitService extends BaseStructureService {
  constructor() {
    super('organizational-units');
  }

  async getByLevel(level) {
    if (!level) throw new Error('Level is required');
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.BY_LEVEL(level)));
    return this.unwrap(response);
  }

  async getByPath(path) {
    if (!path) throw new Error('Path is required');
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.BY_PATH(path)));
    return this.unwrap(response);
  }

  async getRootUnits() {
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.ROOT));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getSubtree(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.SUBTREE(id)));
    return this.unwrap(response);
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.CHILDREN(id)));
    return this.unwrap(response);
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.EMPLOYMENTS(id)));
    return this.unwrap(response);
  }

  async getHierarchyTree(tenantId) {
    const response = await withRetry(() => this.apiClient.get(ORGANIZATIONAL_UNIT_ENDPOINTS.TREE, { params: { tenant_id: tenantId } }));
    return this.unwrap(response);
  }
}

export const organizationalUnitService = new OrganizationalUnitService();
export { OrganizationalUnitService };