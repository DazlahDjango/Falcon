import { BillingBaseService } from './BillingBaseService';
import { AUDIT_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AuditServiceClass extends BillingBaseService {
    constructor() { super('audit-logs'); }

    async getAuditLogs(params = {}) { return this.list(params); }
    async filterLogs(filters = {}) {
        const { page = 1, page_size = 50, ...restFilters } = filters;
        const cleanedParams = {
            limit: page_size,
            offset: (page - 1) * page_size
        };
        
        Object.entries(restFilters).forEach(([key, val]) => {
            let backendKey = key;
            if (key === 'startDate') backendKey = 'start_date';
            if (key === 'endDate') backendKey = 'end_date';
            if (key === 'resourceType') backendKey = 'resource_type';
            if (key === 'userEmail') backendKey = 'user_email';
            
            if (val !== null && val !== undefined && val !== '') {
                cleanedParams[backendKey] = val;
            }
        });
        
        return this.withRetry(() => this.apiClient.get(AUDIT_ENDPOINTS.FILTER, { params: cleanedParams }));
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