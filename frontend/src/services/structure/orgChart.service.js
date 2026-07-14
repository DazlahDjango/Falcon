import { BaseStructureService, withRetry } from './base.service';
import { ORG_CHART_ENDPOINTS } from '../../config/constants/structureApiConstants';

class OrgChartService extends BaseStructureService {
  constructor() {
    super('org-charts');
  }

  async exportJson(params) {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.JSON, { params }));
    return this.unwrap(response);
  }

  async exportCsv(params) {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.CSV, { params, responseType: 'blob' }));
    return this.unwrap(response);
  }

  async exportText(params) {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.TEXT, { params, responseType: 'text' }));
    return this.unwrap(response);
  }

  async exportVisio(params) {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.VISIO, { params, responseType: 'blob' }));
    return this.unwrap(response);
  }

  async getTree() {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.TREE));
    return this.unwrap(response);
  }

  async getPreview() {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.PREVIEW));
    return this.unwrap(response);
  }
}

export const orgChartService = new OrgChartService();
export { OrgChartService };