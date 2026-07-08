import { BaseStructureService, withRetry } from './base.service';
import { DEPARTMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DepartmentService extends BaseStructureService {
  constructor() {
    super('departments');
  }

  async getByCode(code) {
    if (!code) throw new Error('Department code is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.BY_CODE(code)));
  }

  async getRootDepartments() {
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.ROOT));
  }

  async getStats() {
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.STATS));
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.CHILDREN(id)));
  }

  async getSections(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.SECTIONS(id)));
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.EMPLOYMENTS(id)));
  }

  async getAncestors(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.ANCESTORS(id)));
  }

  async moveDepartment(id, parentId) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.post(DEPARTMENT_ENDPOINTS.MOVE(id), { parent_id: parentId }));
  }
}

export const departmentService = new DepartmentService();
export { DepartmentService };