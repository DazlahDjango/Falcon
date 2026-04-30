import { BaseStructureService, withRetry } from './base.service';

export class OrgChartService extends BaseStructureService {
  constructor() {
    super('org-charts');
  }

  async exportAsJson(format = 'full', rootDepartmentId = null) {
    return withRetry(async () => {
      const params = { format };
      if (rootDepartmentId) params.root_department_id = rootDepartmentId;
      
      const response = await this.apiClient.get('/org-charts/json/', { params });
      return response;
    });
  }
  
  async exportAsCsv(entity = 'departments', includeInactive = false) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/org-charts/csv/', {
        params: { entity, include_inactive: includeInactive },
        responseType: 'blob',
      });
      return response;
    });
  }

  async exportAsText(rootDepartmentId = null, maxDepth = 10) {
    return withRetry(async () => {
      const params = { max_depth: maxDepth };
      if (rootDepartmentId) params.root_department_id = rootDepartmentId;
      const response = await this.apiClient.get('/org-charts/text/', {
        params,
        responseType: 'text',
      });
      return response;
    });
  }

  async exportAsVisio(rootDepartmentId = null) {
    return withRetry(async () => {
      const params = {};
      if (rootDepartmentId) params.root_department_id = rootDepartmentId;
      const response = await this.apiClient.get('/org-charts/visio/', {
        params,
        responseType: 'blob',
      });
      return response;
    });
  }

  async getTreeView(includeInactive = false) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/org-charts/tree/', {
        params: { include_inactive: includeInactive },
      });
      return response;
    });
  }

  async getPreview() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/org-charts/preview/');
      return response;
    });
  }

  async getFlatOrgChart() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/org-charts/json/', {
        params: { format: 'flat' },
      });
      return response;
    });
  }

  async getFullOrgChart(rootDepartmentId = null) {
    return withRetry(async () => {
      const params = {};
      if (rootDepartmentId) params.root_department_id = rootDepartmentId;
      const response = await this.apiClient.get('/org-charts/json/', {
        params: { format: 'full', ...params },
      });
      return response;
    });
  }
}

export const orgChartService = new OrgChartService();