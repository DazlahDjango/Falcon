import { BaseStructureService, withRetry } from './base.service';
import { DEPARTMENT_ENDPOINTS } from '../../config/constants/structureApiConstants';

class DepartmentTreeService extends BaseStructureService {
  constructor() {
    super('department-trees');
  }

  async getFullTree() {
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_FULL));
  }

  async getBranch(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_BRANCH(departmentId)));
  }

  async getPath(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_PATH(departmentId)));
  }

  async getSubtree(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_SUBTREE(departmentId)));
  }

  async getLCA(deptA, deptB) {
    if (!deptA || !deptB) throw new Error('Both department IDs are required');
    return withRetry(() => this.apiClient.get(DEPARTMENT_ENDPOINTS.TREE_LCA, { params: { dept_a: deptA, dept_b: deptB } }));
  }
}

export const departmentTreeService = new DepartmentTreeService();
export { DepartmentTreeService };