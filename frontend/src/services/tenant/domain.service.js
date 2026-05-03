// frontend/src/services/tenant/domain.service.js
import BaseTenantService from './tenantBase.service';

class DomainService extends BaseTenantService {
    constructor() {
        super('domains');
    }

    // ==================== Domain CRUD Operations ====================

    /**
     * Get all domains (optionally filtered by tenant)
     * @param {string|number} tenantId - Optional tenant ID to filter by
     * @param {Object} params - Additional query parameters
     * @returns {Promise} { success, data, status, message }
     */
    async getDomains(tenantId = null, params = {}) {
        if (tenantId) {
            return this.listForTenant(tenantId, params);
        }
        return this.list(params);
    }

    /**
     * Get single domain by ID
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async getDomain(id) {
        return this.getById(id);
    }

    /**
     * Create new domain
     * @param {Object} data - Domain data (tenant_id, domain, is_primary)
     * @returns {Promise} { success, data, status, message }
     */
    async createDomain(data) {
        return this.create(data);
    }

    /**
     * Create domain for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {Object} data - Domain data (domain, is_primary)
     * @returns {Promise} { success, data, status, message }
     */
    async createDomainForTenant(tenantId, data) {
        return this.createForTenant(tenantId, data);
    }

    /**
     * Update domain
     * @param {string|number} id - Domain ID
     * @param {Object} data - Updated domain data
     * @returns {Promise} { success, data, status, message }
     */
    async updateDomain(id, data) {
        return this.update(id, data);
    }

    /**
     * Delete domain
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteDomain(id) {
        return this.delete(id);
    }

    /**
     * Delete domain for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} domainId - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteDomainForTenant(tenantId, domainId) {
        return this.deleteForTenant(tenantId, domainId);
    }

    // ==================== Domain Actions ====================

    /**
     * Verify domain ownership via DNS
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async verifyDomain(id) {
        return this.update(id, { action: 'verify' });
    }

    /**
     * Verify domain for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} domainId - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async verifyDomainForTenant(tenantId, domainId) {
        return this.updateForTenant(tenantId, domainId, { action: 'verify' });
    }

    /**
     * Set domain as primary for tenant
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async setPrimaryDomain(id) {
        return this.update(id, { is_primary: true });
    }

    /**
     * Set domain as primary for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} domainId - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async setPrimaryDomainForTenant(tenantId, domainId) {
        return this.updateForTenant(tenantId, domainId, { is_primary: true });
    }

    /**
     * Get DNS verification information
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async getVerificationInfo(id) {
        return this.getById(id, { fields: 'verification_info' });
    }

    /**
     * Resend domain verification
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async resendVerification(id) {
        return this.update(id, { resend_verification: true });
    }

    // ==================== SSL Management ====================

    /**
     * Get SSL certificate status for domain
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async getSSLStatus(id) {
        return this.getById(id, { fields: 'ssl_status' });
    }

    /**
     * Renew SSL certificate for domain
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async renewSSL(id) {
        return this.update(id, { renew_ssl: true });
    }

    /**
     * Enable force HTTPS for domain
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async enableForceHTTPS(id) {
        return this.update(id, { force_https: true });
    }

    /**
     * Disable force HTTPS for domain
     * @param {string|number} id - Domain ID
     * @returns {Promise} { success, data, status, message }
     */
    async disableForceHTTPS(id) {
        return this.update(id, { force_https: false });
    }
}

export default new DomainService();