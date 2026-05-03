// frontend/src/services/tenant/resource.service.js
import BaseTenantService from './tenantBase.service';

class ResourceService extends BaseTenantService {
    constructor() {
        super('resources');
    }

    // ==================== Resource Operations ====================

    /**
     * Get all resources for a tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getResources(tenantId) {
        return this.listForTenant(tenantId);
    }

    /**
     * Get specific resource by type
     * @param {string|number} tenantId - Tenant ID
     * @param {string} resourceType - Resource type (users, storage_mb, etc.)
     * @returns {Promise} { success, data, status, message }
     */
    async getResource(tenantId, resourceType) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/resources/${resourceType}/`);
        return response.data;
    }

    /**
     * Update single resource limit
     * @param {string|number} tenantId - Tenant ID
     * @param {string} resourceType - Resource type
     * @param {number} limitValue - New limit value
     * @returns {Promise} { success, data, status, message }
     */
    async updateResourceLimit(tenantId, resourceType, limitValue) {
        const response = await this.apiClient.patch(`/tenants/${tenantId}/resources/${resourceType}/`, {
            limit_value: limitValue
        });
        return response.data;
    }

    /**
     * Bulk update multiple resource limits
     * @param {string|number} tenantId - Tenant ID
     * @param {Object} limits - Object with resource types as keys
     * @returns {Promise} { success, data, status, message }
     */
    async bulkUpdateResources(tenantId, limits) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/update-limits/`, { limits });
        return response.data;
    }

    // ==================== Resource Summary ====================

    /**
     * Get resource summary for tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getResourceSummary(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/resources/summary/`);
        return response.data;
    }

    // ==================== Quota Checking ====================

    /**
     * Check if tenant has quota for a resource
     * @param {string|number} tenantId - Tenant ID
     * @param {string} resourceType - Resource type
     * @param {number} amount - Amount to check (default: 1)
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async checkQuota(tenantId, resourceType, amount = 1) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/resources/check-quota/`, {
            params: { resource_type: resourceType, amount }
        });
        return response.data;
    }

    /**
     * Check if tenant can create a new user
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async canCreateUser(tenantId) {
        return this.checkQuota(tenantId, 'users', 1);
    }

    /**
     * Check if tenant can create a new KPI
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async canCreateKPI(tenantId) {
        return this.checkQuota(tenantId, 'kpis', 1);
    }

    /**
     * Check if tenant can create a new department
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async canCreateDepartment(tenantId) {
        return this.checkQuota(tenantId, 'departments', 1);
    }

    /**
     * Check if tenant can make an API call
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async canMakeAPICall(tenantId) {
        return this.checkQuota(tenantId, 'api_calls_per_day', 1);
    }

    /**
     * Check if tenant can add storage
     * @param {string|number} tenantId - Tenant ID
     * @param {number} mbToAdd - MB to add
     * @returns {Promise} { allowed, remaining, current, limit }
     */
    async canAddStorage(tenantId, mbToAdd) {
        return this.checkQuota(tenantId, 'storage_mb', mbToAdd);
    }

    // ==================== Resource Alerts ====================

    /**
     * Get resource alerts for tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getResourceAlerts(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/resources/alerts/`);
        return response.data;
    }

    /**
     * Acknowledge resource alert
     * @param {string|number} alertId - Alert ID
     * @returns {Promise} { success, data, status, message }
     */
    async acknowledgeAlert(alertId) {
        const response = await this.apiClient.post(`/resources/alerts/${alertId}/acknowledge/`);
        return response.data;
    }

    // ==================== Resource History ====================

    /**
     * Get resource usage history over time
     * @param {string|number} tenantId - Tenant ID
     * @param {string} resourceType - Resource type
     * @param {number} days - Number of days (default: 30)
     * @returns {Promise} { success, data, status, message }
     */
    async getResourceHistory(tenantId, resourceType, days = 30) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/resources/${resourceType}/history/`, {
            params: { days }
        });
        return response.data;
    }
}

export default new ResourceService();