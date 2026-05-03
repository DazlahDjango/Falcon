// frontend/src/services/tenant/migration.service.js
import BaseTenantService from './tenantBase.service';

class MigrationService extends BaseTenantService {
    constructor() {
        super('migrations');
    }

    // ==================== Migration Read-Only Operations ====================

    /**
     * Get all migrations (optionally filtered by tenant)
     * @param {string|number} tenantId - Optional tenant ID to filter by
     * @param {Object} params - Additional query parameters (status, app_name)
     * @returns {Promise} { success, data, status, message }
     */
    async getMigrations(tenantId = null, params = {}) {
        if (tenantId) {
            return this.listForTenant(tenantId, params);
        }
        return this.list(params);
    }

    /**
     * Get single migration by ID
     * @param {string|number} id - Migration ID
     * @returns {Promise} { success, data, status, message }
     */
    async getMigration(id) {
        return this.getById(id);
    }

    /**
     * Get migration for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} migrationId - Migration ID
     * @returns {Promise} { success, data, status, message }
     */
    async getMigrationForTenant(tenantId, migrationId) {
        return this.getForTenant(tenantId, migrationId);
    }

    // ==================== Migration Summary ====================

    /**
     * Get migration summary for tenant (counts by status)
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getMigrationSummary(tenantId) {
        return this.listForTenant(tenantId, { summary: true });
    }

    // ==================== Migration Actions (Super Admin only) ====================

    /**
     * Run pending migrations for tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string} appName - Optional specific app name to migrate
     * @returns {Promise} { success, data, status, message }
     */
    async runMigrations(tenantId, appName = null) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/migrations/run/`, {
            app_name: appName
        });
        return response.data;
    }

    /**
     * Rollback migration for tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string} migrationName - Migration name to rollback
     * @returns {Promise} { success, data, status, message }
     */
    async rollbackMigration(tenantId, migrationName) {
        const response = await this.apiClient.post(`/tenants/${tenantId}/migrations/rollback/`, {
            migration_name: migrationName
        });
        return response.data;
    }
}

export default new MigrationService();