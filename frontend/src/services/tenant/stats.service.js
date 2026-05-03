// frontend/src/services/tenant/stats.service.js
import BaseTenantService from './tenantBase.service';

class StatsService extends BaseTenantService {
    constructor() {
        super('stats');
    }

    // ==================== Tenant Statistics ====================

    /**
     * Get comprehensive tenant statistics
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantStats(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/stats/`);
        return response.data;
    }

    /**
     * Get usage history over time
     * @param {string|number} tenantId - Tenant ID
     * @param {number} days - Number of days (default: 30)
     * @returns {Promise} { success, data, status, message }
     */
    async getUsageHistory(tenantId, days = 30) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/stats/usage-history/`, {
            params: { days }
        });
        return response.data;
    }

    /**
     * Get resource usage trends
     * @param {string|number} tenantId - Tenant ID
     * @param {string} resourceType - Resource type
     * @param {number} days - Number of days (default: 30)
     * @returns {Promise} { success, data, status, message }
     */
    async getResourceTrends(tenantId, resourceType, days = 30) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/stats/resource-trends/`, {
            params: { resource_type: resourceType, days }
        });
        return response.data;
    }

    /**
     * Get audit log summary
     * @param {string|number} tenantId - Tenant ID
     * @param {number} days - Number of days (default: 30)
     * @returns {Promise} { success, data, status, message }
     */
    async getAuditSummary(tenantId, days = 30) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/stats/audit-summary/`, {
            params: { days }
        });
        return response.data;
    }

    // ==================== Global Statistics (Super Admin only) ====================

    /**
     * Get tenant growth over time
     * @param {number} months - Number of months (default: 12)
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantGrowth(months = 12) {
        const response = await this.apiClient.get('/stats/tenant-growth/', {
            params: { months }
        });
        return response.data;
    }

    /**
     * Get overall system statistics
     * @returns {Promise} { total_tenants, total_users, total_kpis, storage_used, api_calls }
     */
    async getSystemStats() {
        const response = await this.apiClient.get('/stats/system/');
        return response.data;
    }

    /**
     * Get subscription distribution
     * @returns {Promise} { trial, basic, professional, enterprise }
     */
    async getSubscriptionDistribution() {
        const response = await this.apiClient.get('/stats/subscriptions/');
        return response.data;
    }

    /**
     * Get resource usage across all tenants
     * @returns {Promise} { users, storage, api_calls, kpis, departments }
     */
    async getGlobalResourceUsage() {
        const response = await this.apiClient.get('/stats/resources/');
        return response.data;
    }
}

export default new StatsService();