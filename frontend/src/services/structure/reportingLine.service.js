import { BaseStructureService, withRetry } from './base.service';
import { REPORTING_LINE_ENDPOINTS } from '../../config/constants/structureApiConstants';

class ReportingLineService extends BaseStructureService {
  constructor() {
    super('reporting-lines');
  }

  async getByEmployee(userId) {
    if (!userId) throw new Error('Employee user ID is required');
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.BY_EMPLOYEE(userId)));
  }

  async getByManager(userId) {
    if (!userId) throw new Error('Manager user ID is required');
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.BY_MANAGER(userId)));
  }

  async getChain(userId) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.CHAIN(userId)));
  }

  async getSpanOfControl(managerId) {
    if (!managerId) throw new Error('Manager ID is required');
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.SPAN_OF_CONTROL(managerId)));
  }

  async getOrganizationSpan() {
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.ORGANIZATION_SPAN));
  }

  async assignManager(data) {
    if (!data) throw new Error('Assignment data is required');
    return withRetry(() => this.apiClient.post(REPORTING_LINE_ENDPOINTS.ASSIGN_MANAGER, data));
  }

  async removeManager(data) {
    if (!data) throw new Error('Removal data is required');
    return withRetry(() => this.apiClient.post(REPORTING_LINE_ENDPOINTS.REMOVE_MANAGER, data));
  }

  async getMyChain() {
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.MY_CHAIN));
  }

  async getMyTeam() {
    return withRetry(() => this.apiClient.get(REPORTING_LINE_ENDPOINTS.MY_TEAM));
  }
}

export const reportingLineService = new ReportingLineService();
export { ReportingLineService };