import { ReportBaseService, withRetry } from './reportBase.service';
import { AUDIT_ENDPOINTS } from '../../config/constants/reportApiConstants';

class AuditService extends ReportBaseService {
  constructor() {
    super('audits');
  }

  async getAudits(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getAudit(id) {
    if (!id) throw new Error('Audit ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async getAuditsByReport(reportId) {
    if (!reportId) throw new Error('Report ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.BY_REPORT(reportId));
      return response;
    });
  }

  async getAuditsByUser(userId) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.BY_USER(userId));
      return response;
    });
  }

  async getAuditActions() {
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.ACTIONS);
      return response;
    });
  }

  async getAuditStats() {
    return withRetry(async () => {
      const response = await this.apiClient.get(AUDIT_ENDPOINTS.STATS);
      return response;
    });
  }
}

export const auditService = new AuditService();

