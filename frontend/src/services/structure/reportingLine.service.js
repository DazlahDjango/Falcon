import { BaseStructureService, withRetry } from './base.service';
import { REPORTING_LINE_ENDPOINTS } from '../../config/constants/structureApiConstants';

class ReportingLineService extends BaseStructureService {
  constructor() {
    super('reporting-lines');
  }

  async getByEmployee(userId) {
    if (!userId) throw new Error('Employee user ID is required');
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.BY_EMPLOYEE(userId)));
    return this.unwrap(response);
  }

  async getByManager(userId) {
    if (!userId) throw new Error('Manager user ID is required');
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.BY_MANAGER(userId)));
    return this.unwrap(response);
  }

  async getChain(userId) {
    if (!userId) throw new Error('User ID is required');
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.CHAIN(userId)));
    return this.unwrap(response);
  }

  async getSpanOfControl(managerId) {
    if (!managerId) throw new Error('Manager ID is required');
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.SPAN_OF_CONTROL(managerId)));
    return this.unwrap(response);
  }

  async getOrganizationSpan() {
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.ORGANIZATION_SPAN));
    return this.unwrap(response);
  }

  async assignManager(data) {
    if (!data) throw new Error('Assignment data is required');
    const response = await withRetry(() => this.apiClient.post(REPORTING_LINE_ENDPOINTS.ASSIGN_MANAGER, data));
    return this.unwrap(response);
  }

  async removeManager(data) {
    if (!data) throw new Error('Removal data is required');
    const response = await withRetry(() => this.apiClient.post(REPORTING_LINE_ENDPOINTS.REMOVE_MANAGER, data));
    return this.unwrap(response);
  }

  async getMyChain() {
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.MY_CHAIN));
    return this.unwrap(response);
  }

  async getMyTeam() {
    const response = await withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.MY_TEAM));
    return this.unwrap(response);
  }
}

export const reportingLineService = new ReportingLineService();
export { ReportingLineService };