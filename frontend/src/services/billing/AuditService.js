import { BillingBaseService } from './BillingBaseService';
import { AUDIT_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AuditServiceClass extends BillingBaseService {
    constructor() { super('audit-logs'); }

    async getAuditLogs(params = {}) { return this.list(params); }
    async filterLogs(filters = {}) {
        return this.withRetry(() => this.apiClient.get(AUDIT_ENDPOINTS.FILTER, { params: filters }));
    }
    async exportLogs(days = 30) {
        return this.withRetry(() => this.apiClient.get(AUDIT_ENDPOINTS.EXPORT, { params: { days }, responseType: 'blob' }));
    }
    async getAuditSummary(days = 30) {
        return this.withRetry(() => this.apiClient.get(AUDIT_ENDPOINTS.SUMMARY, { params: { days } }));
    }
    async getUserActivity(userEmail, days = 30) {
        return this.filterLogs({ user_email: userEmail, start_date: new Date(Date.now() - days * 86400000).toISOString().split('T')[0] });
    }
}

export const AuditService = new AuditServiceClass();
export default AuditService;