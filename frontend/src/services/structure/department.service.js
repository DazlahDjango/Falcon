import { BaseStructureService, withRetry } from './base.service';
import { DEPARTMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DepartmentService extends BaseStructureService {
  constructor() {
    super('departments');
  }

  async getByCode(code) {
    if (!code) throw new Error('Department code is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.BY_CODE(code)));
    return this.unwrap(response);
  }

  async getRootDepartments() {
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.ROOT));
    return this.unwrap(response);
  }

  async getStats() {
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.STATS));
    return this.unwrap(response);
  }

  async getChildren(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.CHILDREN(id)));
    return this.unwrap(response);
  }

  async getSections(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.SECTIONS(id)));
    return this.unwrap(response);
  }

  async getEmployments(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.EMPLOYMENTS(id)));
    return this.unwrap(response);
  }

  async getAncestors(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.ANCESTORS(id)));
    return this.unwrap(response);
  }

  async moveDepartment(id, parentId) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.post(DEPARTMENT_ENDPOINTS.MOVE(id), { parent_id: parentId }));
    return this.unwrap(response);
  }
}

export const departmentService = new DepartmentService();
export { DepartmentService };