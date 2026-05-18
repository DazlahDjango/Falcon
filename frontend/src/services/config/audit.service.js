import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class AuditService extends BaseConfigService {
  constructor() {
    super('audit-logs');
  }
  async getAuditLogs(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.AUDIT_LOGS, { params }));
  }
  async getAuditLog(logId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.AUDIT_LOGS}/${logId}/`));
  }
  async exportAuditLogs(params = {}, format = 'csv') {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.AUDIT_LOGS}/export/${format}/`, {
      params, responseType: format === 'json' ? 'json' : 'blob'
    }));
  }
}

export const auditService = new AuditService();