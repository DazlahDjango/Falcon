import { BaseStructureService, withRetry } from './base.service';

export class DepartmentService extends BaseStructureService {
  constructor() {
    super('departments');
  }
  async getByCode(code) {
    if (!code) throw new Error('Department code is required');
    
    return withRetry(async () => {
      const response = await this.apiClient.get(`/departments/by-code/${code}/`);
      return response;
    });
  }
  async getTree(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/department-trees/full/', { params });
      return response;
    });
  }
  async getChildren(id) {
    if (!id) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/children/`));
      return response;
    });
  }
  async getAncestors(id) {
    if (!id) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${id}/ancestors/`));
      return response;
    });
  }
  async moveDepartment(id, newParentId) {
    if (!id) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(this.getEndpoint(`${id}/move/`), {
        parent_id: newParentId,
      });
      return response;
    });
  }
  async getPath(id) {
    if (!id) throw new Error('Department ID is required');
    
    return withRetry(async () => {
      const response = await this.apiClient.get(`/department-trees/path/${id}/`);
      return response;
    });
  }
  async getBranch(id) {
    if (!id) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/department-trees/branch/${id}/`);
      return response;
    });
  }
  async findLCA(deptAId, deptBId) {
    if (!deptAId || !deptBId) throw new Error('Both department IDs are required');
    return withRetry(async () => {
      const response = await this.apiClient.get('/department-trees/lca/', {
        params: { dept_a: deptAId, dept_b: deptBId },
      });
      return response;
    });
  }
  async getRootDepartments(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/department-trees/', { params });
      return response;
    });
  }
  async validate(data) {
    if (!data) throw new Error('Data is required'); 
    return withRetry(async () => {
      const response = await this.apiClient.post('/departments/validate/', data);
      return response;
    });
  }
  async bulkCreate(departments) {
    if (!departments || !departments.length) throw new Error('Departments array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/departments/', {
        departments,
        action: 'create',
      });
      return response;
    });
  }
  async bulkUpdate(departments) {
    if (!departments || !departments.length) throw new Error('Departments array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/departments/', {
        departments,
        action: 'update',
      });
      return response;
    });
  }
}

export const departmentService = new DepartmentService();