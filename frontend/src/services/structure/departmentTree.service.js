import { BaseStructureService, withRetry } from './base.service';
import { DEPARTMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DepartmentTreeService extends BaseStructureService {
  constructor() {
    super('department-trees');
  }

  async getFullTree() {
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_FULL));
    return this.unwrap(response);
  }

  async getBranch(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_BRANCH(departmentId)));
    return this.unwrap(response);
  }

  async getPath(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_PATH(departmentId)));
    return this.unwrap(response);
  }

  async getSubtree(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_SUBTREE(departmentId)));
    return this.unwrap(response);
  }

  async getLCA(deptA, deptB) {
    if (!deptA || !deptB) throw new Error('Both department IDs are required');
    const response = await withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_LCA, { params: { dept_a: deptA, dept_b: deptB } }));
    return this.unwrap(response);
  }
}

export const departmentTreeService = new DepartmentTreeService();
export { DepartmentTreeService };