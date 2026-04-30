import { BaseStructureService, withRetry } from './base.service';

export class EmploymentService extends BaseStructureService {
  constructor() {
    super('employments');
  }

  async getCurrent(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/employments/current/', { params });
      return response;
    });
  }

  async getByUser(userId, includeHistory = true) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/employments/by-user/${userId}/`);
      return response;
    });
  }
  
  async getMyEmployment() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/me/');
      return response;
    });
  }

  async transferEmployee(transferData) {
    if (!transferData.user_id) throw new Error('User ID is required');
    if (!transferData.department_id) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/employments/transfer/', transferData);
      return response;
    });
  }

  async bulkCreate(employments) {
    if (!employments || !employments.length) throw new Error('Employments array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/employments/bulk-create/', { employments });
      return response;
    });
  }

  async endEmployment(userId, endDate, reason = '') {
    if (!userId) throw new Error('User ID is required');
    if (!endDate) throw new Error('End date is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(`/employments/${userId}/end/`, {
        end_date: endDate,
        reason,
      });
      return response;
    });
  }

  async getTeamMembers(managerId, includeIndirect = true) {
    if (!managerId) throw new Error('Manager ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/team/${managerId}/`, {
        params: { include_indirect: includeIndirect },
      });
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/employments/validate/', data);
      return response;
    });
  }

  async getDepartmentStats(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get('/employments/stats/', {
        params: { department_id: departmentId },
      });
      return response;
    });
  }
}

export const employmentService = new EmploymentService();