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

  async getTreeView(includeInactive = false) {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.TREE, { params: { include_inactive: includeInactive } }));
    const unwrapped = this.unwrap(response);
    return unwrapped?.tree || unwrapped;
  }

  async getFullOrgChart(rootDepartmentId = null) {
    const params = { format: 'full' };
    if (rootDepartmentId) {
      params.root_unit_id = rootDepartmentId;
    }
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.JSON, { params }));
    return this.unwrap(response);
  }

  async getFlatOrgChart() {
    const params = { format: 'flat' };
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.JSON, { params }));
    return this.unwrap(response);
  }

  async exportOrgChart(params = {}) {
    const { format, includeInactive, maxDepth, rootUnitId } = params;
    const apiParams = {};
    if (includeInactive !== undefined) apiParams.include_inactive = includeInactive;
    if (maxDepth !== undefined) apiParams.max_depth = maxDepth;
    if (rootUnitId !== undefined) apiParams.root_unit_id = rootUnitId;

    if (format === 'csv') {
      return this.exportCsv(apiParams);
    } else if (format === 'text') {
      return this.exportText(apiParams);
    } else if (format === 'visio') {
      return this.exportVisio(apiParams);
    } else {
      apiParams.format = format || 'full';
      return this.exportJson(apiParams);
    }
  }

  async getPreview() {
    const response = await withRetry(() => this.apiClient.get(ORG_CHART_ENDPOINTS.PREVIEW));
    return this.unwrap(response);
  }
}

export const orgChartService = new OrgChartService();
export { OrgChartService };