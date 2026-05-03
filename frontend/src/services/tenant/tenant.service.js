// frontend/src/services/tenant/tenant.service.js
import BaseTenantService from './tenantBase.service';

class TenantService extends BaseTenantService {
    constructor() {
        super('tenants');
    }

    // ==================== Tenant CRUD Operations ====================

    /**
     * Get all tenants (Super Admin only)
     * @param {Object} params - Query parameters (status, subscription_plan, search, page, ordering)
     * @returns {Promise} { success, data, status, message }
     */
    async getTenants(params = {}) {
        return this.list(params);
    }

    /**
     * Get single tenant by ID
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenant(id) {
        return this.getById(id);
    }

    /**
     * Get tenant by slug (URL-friendly identifier)
     * @param {string} slug - Tenant slug (e.g., 'acme-corp')
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantBySlug(slug) {
        return this.list({ slug, limit: 1 });
    }

    /**
     * Get detailed tenant information (includes related data)
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantDetail(id) {
        return this.getById(id, { detailed: true });
    }

    /**
     * Create new tenant (Super Admin only)
     * @param {Object} data - Tenant data (name, slug, contact_email, subscription_plan)
     * @returns {Promise} { success, data, status, message }
     */
    async createTenant(data) {
        return this.create(data);
    }

    /**
     * Update tenant
     * @param {string|number} id - Tenant ID
     * @param {Object} data - Updated tenant data
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenant(id, data) {
        return this.update(id, data);
    }

    /**
     * Delete tenant (Super Admin only)
     * @param {string|number} id - Tenant ID
     * @param {boolean} permanent - If true, hard delete; if false, soft delete
     * @returns {Promise} { success, data, status, message }
     */
    async deleteTenant(id, permanent = false) {
        return this.delete(id, !permanent);
    }

    // ==================== Tenant Actions ====================

    /**
     * Suspend tenant (Super Admin only)
     * @param {string|number} id - Tenant ID
     * @param {string} reason - Suspension reason
     * @returns {Promise} { success, data, status, message }
     */
    async suspendTenant(id, reason = '') {
        return this.update(id, { status: 'suspended', suspend_reason: reason });
    }

    /**
     * Activate tenant (Super Admin only)
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async activateTenant(id) {
        return this.update(id, { status: 'active' });
    }

    /**
     * Get tenant provisioning status
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getProvisioningStatus(id) {
        return this.getById(id, { fields: 'provisioning_status' });
    }

    // ==================== Usage & Resources ====================

    /**
     * Get tenant usage statistics
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantUsage(id) {
        return this.getById(id, { fields: 'usage' });
    }

    /**
     * Get tenant usage summary (simplified view)
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantUsageSummary(id) {
        return this.getById(id, { fields: 'usage_summary' });
    }

    /**
     * Get tenant resources and limits
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantResources(id) {
        return this.getById(id, { fields: 'resources' });
    }

    /**
     * Update tenant resource limits (Super Admin only)
     * @param {string|number} id - Tenant ID
     * @param {Object} limits - Resource limits object
     * @returns {Promise} { success, data, status, message }
     */
    async updateResourceLimits(id, limits) {
        return this.update(id, { resource_limits: limits });
    }

    // ==================== Analytics ====================

    /**
     * Get tenant statistics (KPIs, trends, etc.)
     * @param {string|number} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantStats(id) {
        return this.getStats({ tenant_id: id });
    }

    /**
     * Get tenant audit logs
     * @param {string|number} id - Tenant ID
     * @param {Object} params - Query parameters (page, page_size, start_date, end_date)
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantAuditLogs(id, params = {}) {
        return this.getHistory(id, params);
    }

    // ==================== Settings ====================

    /**
     * Update tenant settings
     * @param {string|number} id - Tenant ID
     * @param {Object} settings - Settings object
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenantSettings(id, settings) {
        return this.update(id, { settings });
    }

    /**
     * Update tenant branding (logo, colors, favicon)
     * @param {string|number} id - Tenant ID
     * @param {Object} branding - Branding object
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenantBranding(id, branding) {
        return this.update(id, { branding });
    }

    // ==================== Bulk Operations ====================

    /**
     * Bulk update multiple tenants
     * @param {Array<string|number>} tenantIds - Array of tenant IDs
     * @param {Object} data - Update data to apply to all
     * @returns {Promise} { success, data, status, message }
     */
    async bulkUpdateTenants(tenantIds, data) {
        return this.bulkOperation('update', { tenant_ids: tenantIds, ...data });
    }

    /**
     * Bulk delete multiple tenants
     * @param {Array<string|number>} tenantIds - Array of tenant IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkDeleteTenants(tenantIds) {
        return this.bulkOperation('delete', { tenant_ids: tenantIds });
    }

    /**
     * Bulk suspend multiple tenants
     * @param {Array<string|number>} tenantIds - Array of tenant IDs
     * @param {string} reason - Suspension reason
     * @returns {Promise} { success, data, status, message }
     */
    async bulkSuspendTenants(tenantIds, reason = '') {
        return this.bulkOperation('suspend', { tenant_ids: tenantIds, reason });
    }

    /**
     * Bulk activate multiple tenants
     * @param {Array<string|number>} tenantIds - Array of tenant IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkActivateTenants(tenantIds) {
        return this.bulkOperation('activate', { tenant_ids: tenantIds });
    }

    // ==================== Export ====================

    /**
     * Export all tenants (CSV, JSON, Excel)
     * @param {string} format - Export format (csv, json, xlsx)
     * @param {Object} params - Filter parameters
     * @returns {Promise} Blob data for file download
     */
    async exportTenants(format = 'csv', params = {}) {
        return this.exportData(format, params);
    }

    /**
     * Export single tenant data
     * @param {string|number} id - Tenant ID
     * @param {string} format - Export format (json, csv)
     * @returns {Promise} Blob data for file download
     */
    async exportTenantData(id, format = 'json') {
        return this.exportData(format, { tenant_id: id });
    }
}

export default new TenantService();