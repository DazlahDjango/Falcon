// frontend/src/services/tenant/schema.service.js
import BaseTenantService from './tenantBase.service';

class SchemaService extends BaseTenantService {
    constructor() {
        super('schemas');
    }

    // ==================== Schema Read-Only Operations ====================

    /**
     * Get all schemas (optionally filtered by tenant)
     * @param {string|number} tenantId - Optional tenant ID to filter by
     * @param {Object} params - Additional query parameters (status, is_ready)
     * @returns {Promise} { success, data, status, message }
     */
    async getSchemas(tenantId = null, params = {}) {
        if (tenantId) {
            return this.listForTenant(tenantId, params);
        }
        return this.list(params);
    }

    /**
     * Get single schema by ID
     * @param {string|number} id - Schema ID
     * @returns {Promise} { success, data, status, message }
     */
    async getSchema(id) {
        return this.getById(id);
    }

    /**
     * Get schema for specific tenant (primary schema)
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getSchemaForTenant(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/schema/`);
        return response.data;
    }

    /**
     * Get all schemas for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantSchemas(tenantId) {
        return this.listForTenant(tenantId);
    }

    // ==================== Schema Information ====================

    /**
     * Get schema status (active, maintenance, etc.)
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { status, is_ready }
     */
    async getSchemaStatus(tenantId) {
        const response = await this.getSchemaForTenant(tenantId);
        return {
            status: response.data.status,
            is_ready: response.data.is_ready
        };
    }

    /**
     * Get schema size in MB
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { size_mb, size_display }
     */
    async getSchemaSize(tenantId) {
        const response = await this.getSchemaForTenant(tenantId);
        return {
            size_mb: response.data.size_mb,
            size_display: response.data.size_display
        };
    }

    /**
     * Get list of tables in schema
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getSchemaTables(tenantId) {
        const response = await this.apiClient.get(`/tenants/${tenantId}/schema/tables/`);
        return response.data;
    }

    // ==================== Schema Actions ====================

    /**
     * Refresh schema statistics (table count, size, etc.)
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async refreshSchemaStats(tenantId) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/schema/refresh/`);
        return response.data;
    }
}

export default new SchemaService();