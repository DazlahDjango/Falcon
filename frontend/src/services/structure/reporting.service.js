import { BaseStructureService, withRetry } from './base.service';

export class ReportingService extends BaseStructureService {
  constructor() {
    super('reporting-lines');
  }

  async getByEmployee(userId) {
    if (!userId) throw new Error('User ID is required');
    
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/by-employee/${userId}/`);
      return response;
    });
  }

  async getByManager(userId) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/by-manager/${userId}/`);
      return response;
    });
  }

  async getChainUp(userId, includeSelf = true) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/chain/${userId}/`, {
        params: { include_self: includeSelf },
      });
      return response;
    });
  }

  async getChainDown(userId, includeIndirect = true, maxDepth = 10) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/team/${userId}/`, {
        params: { include_indirect: includeIndirect, max_depth: maxDepth },
      });
      return response;
    });
  }

  async getSpanOfControl(userId) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/reporting-lines/span-of-control/${userId}/`);
      return response;
    });
  }
  
  async getOrganizationSpan(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/reporting-lines/organization-span/', { params });
      return response;
    });
  }

  async assignMatrixReporting(data) {
    if (!data.employee_user_id) throw new Error('Employee user ID is required');
    if (!data.manager_user_id) throw new Error('Manager user ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/reporting-lines/assign-matrix/', data);
      return response;
    });
  }
  
  async assignInterimManager(data) {
    if (!data.employee_user_id) throw new Error('Employee user ID is required');
    if (!data.interim_manager_user_id) throw new Error('Interim manager user ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/reporting-lines/assign-interim/', data);
      return response;
    });
  }

  async endInterimAssignment(userId, endDate, reason = '') {
    if (!userId) throw new Error('User ID is required');
    if (!endDate) throw new Error('End date is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(`/reporting-lines/end-interim/${userId}/`, {
        end_date: endDate,
        reason,
      });
      return response;
    });
  }

  async updateReportingWeights(employeeUserId, weights) {
    if (!employeeUserId) throw new Error('Employee user ID is required');
    if (!weights || Object.keys(weights).length === 0) throw new Error('Weights object is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/reporting-lines/update-weights/', {
        employee_user_id: employeeUserId,
        weights,
      });
      return response;
    });
  }

  async validate(data) {
    if (!data) throw new Error('Data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/reporting-lines/validate/', data);
      return response;
    });
  }

  async getMyChain() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/my-chain/');
      return response;
    });
  }

  async getMyTeam() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/my-team/');
      return response;
    });
  }
}

export const reportingService = new ReportingService();