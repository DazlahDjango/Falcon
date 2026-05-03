// frontend/src/services/tenant/provisioning.service.js
import BaseTenantService from './tenantBase.service';

class ProvisioningService extends BaseTenantService {
    constructor() {
        super('provisioning');
    }

    // ==================== Provisioning Status ====================

    /**
     * Get provisioning status for a tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getProvisioningStatus(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/provisioning-status/`);
        return response.data;
    }

    /**
     * Get detailed provisioning progress (steps, percentages)
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getProvisioningProgress(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/provisioning/progress/`);
        return response.data;
    }

    /**
     * Get provisioning logs for debugging
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getProvisioningLogs(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/provisioning/logs/`);
        return response.data;
    }

    // ==================== Provisioning Actions ====================

    /**
     * Retry failed provisioning
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async retryProvisioning(tenantId) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/provisioning/retry/`);
        return response.data;
    }

    /**
     * Cancel ongoing provisioning
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async cancelProvisioning(tenantId) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/provisioning/cancel/`);
        return response.data;
    }
}

export default new ProvisioningService();