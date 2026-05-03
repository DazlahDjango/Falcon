// frontend/src/services/tenant/health.service.js
import BaseTenantService from './tenantBase.service';

class HealthService extends BaseTenantService {
    constructor() {
        super('health');
    }

    // ==================== System Health ====================

    /**
     * Get overall system health
     * @returns {Promise} { status, checks, timestamp }
     */
    async getSystemHealth() {
        const response = await this.apiClient.get('/health/');
        return response.data;
    }

    /**
     * Get database health status
     * @returns {Promise} { status, response_time_ms, message }
     */
    async getDatabaseHealth() {
        const response = await this.apiClient.get('/health/database/');
        return response.data;
    }

    /**
     * Get cache/Redis health status
     * @returns {Promise} { status, response_time_ms, message }
     */
    async getCacheHealth() {
        const response = await this.apiClient.get('/health/cache/');
        return response.data;
    }

    /**
     * Get Celery worker health status
     * @returns {Promise} { status, active_workers, message }
     */
    async getWorkerHealth() {
        const response = await this.apiClient.get('/health/workers/');
        return response.data;
    }

    // ==================== Tenant Health ====================

    /**
     * Get health status for a specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { status, warnings, schema_status, quota_status }
     */
    async getTenantHealth(tenantId) {
        const response = await this.apiClient.get(`/health/tenants/${tenantId}/`);
        return response.data;
    }

    /**
     * Get health status for all tenants (Super Admin only)
     * @returns {Promise} { total_tenants, healthy_tenants, degraded_tenants, tenants_list }
     */
    async getAllTenantsHealth() {
        const response = await this.apiClient.get('/health/tenants/');
        return response.data;
    }
}

export default new HealthService();