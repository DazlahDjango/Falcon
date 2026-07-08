import { BaseStructureService, withRetry } from './base.service';
import { ORG_CHART_ENDPOINTS } from '../../config/constants/structureApiConstants';

class OrgChartService extends BaseStructureService {
  constructor() {
    super('org-charts');
  }

  async exportJson(params) {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.JSON, { params }));
  }

  async exportCsv(params) {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.CSV, { params, responseType: 'blob' }));
  }

  async exportText(params) {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.TEXT, { params, responseType: 'text' }));
  }

  async exportVisio(params) {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.VISIO, { params, responseType: 'blob' }));
  }

  async getTree() {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.TREE));
  }

  async getPreview() {
    return withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.PREVIEW));
  }
}

export const orgChartService = new OrgChartService();
export { OrgChartService };