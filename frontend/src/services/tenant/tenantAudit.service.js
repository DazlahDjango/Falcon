// frontend/src/services/tenant/tenantAudit.service.js
// For full audit CRUD operations only
import BaseTenantService from './tenantBase.service';

class TenantAuditService extends BaseTenantService {
    constructor() {
        super('audit');
    }

    async getAuditLogs(tenantId, params = {}) {
        return this.listForTenant(tenantId, params);
    }

    async getAuditLog(id) {
        return this.getById(id);
    }

    async getAuditLogForTenant(tenantId, logId) {
        return this.getForTenant(tenantId, logId);
    }

    async getAuditSummary(tenantId, params = {}) {
        return this.listForTenant(tenantId, { summary: true, ...params });
    }

    async exportAuditLogs(tenantId, format = 'csv', params = {}) {
        return this.exportData(format, { tenant_id: tenantId, type: 'audit', ...params });
    }

    async getAuditStats(tenantId) {
        return this.getStats({ tenant_id: tenantId });
    }

    async getUniqueActions(tenantId) {
        return this.listForTenant(tenantId, { unique_actions: true });
    }

    async getUniqueUsers(tenantId) {
        return this.listForTenant(tenantId, { unique_users: true });
    }

    async getAuditLogsByDateRange(tenantId, startDate, endDate, params = {}) {
        return this.listForTenant(tenantId, {
            start_date: startDate,
            end_date: endDate,
            ...params
        });
    }

    async getAuditLogsByAction(tenantId, action, params = {}) {
        return this.listForTenant(tenantId, { action, ...params });
    }

    async getAuditLogsByUser(tenantId, userId, params = {}) {
        return this.listForTenant(tenantId, { user_id: userId, ...params });
    }
}

export default new TenantAuditService();
