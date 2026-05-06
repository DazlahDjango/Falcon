// frontend/src/services/tenant/domain.service.js
/**
 * Domain Management Service
 * Handles custom domain configuration, SSL, and verification
 * Following CIA Triad: Confidentiality, Integrity, Availability
 * 
 * Version: 2.0.0
 */

import BaseTenantService from './tenantBase.service';
import { store } from '../../store';
import { showToast } from '../../store/tenant/slice/tenantUISlice';

class DomainService extends BaseTenantService {
    constructor() {
        super('domains');
    }

    // ==================== Domain CRUD Operations ====================

    /**
     * Get all domains with filtering
     * @param {Object} params - Filter parameters
     * @param {string} params.tenant_id - Filter by tenant
     * @param {string} params.status - Filter by status (pending, verified, failed)
     * @param {boolean} params.is_primary - Filter primary domains
     * @param {number} params.page - Page number
     * @param {number} params.page_size - Items per page
     * @returns {Promise} { success, data, status, message }
     */
    async getDomains(params = {}) {
        return this.list(params);
    }

    /**
     * Get domains for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} params - Additional filters
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantDomains(tenantId, params = {}) {
        return this.listForTenant(tenantId, params);
    }

    /**
     * Get single domain by ID
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getDomain(domainId) {
        return this.getById(domainId);
    }

    /**
     * Create new domain
     * @param {Object} data - Domain data
     * @param {string} data.tenant_id - Tenant UUID
     * @param {string} data.domain - Domain name (e.g., example.com)
     * @param {boolean} data.is_primary - Set as primary domain
     * @returns {Promise} { success, data, status, message }
     */
    async createDomain(data) {
        // Validate domain format
        if (!this._validateDomain(data.domain)) {
            throw new Error('Invalid domain format');
        }
        
        const response = await this.create(data, false);
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Domain "${data.domain}" added. Please verify ownership.`,
                type: 'success',
            }));
            
            await this.logAudit('domain.create', 'domain', response.data?.id, {
                domain: data.domain,
                tenant_id: data.tenant_id,
            });
        }
        
        return response;
    }

    /**
     * Create domain for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} data - Domain data
     * @param {string} data.domain - Domain name
     * @param {boolean} data.is_primary - Set as primary domain
     * @returns {Promise} { success, data, status, message }
     */
    async createDomainForTenant(tenantId, data) {
        if (!this._validateDomain(data.domain)) {
            throw new Error('Invalid domain format');
        }
        
        const response = await this.createForTenant(tenantId, data, false);
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Domain "${data.domain}" added. Please verify ownership.`,
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Update domain
     * @param {string} domainId - Domain UUID
     * @param {Object} data - Updated domain data
     * @returns {Promise} { success, data, status, message }
     */
    async updateDomain(domainId, data) {
        const response = await this.update(domainId, data, true);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Domain updated successfully',
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Delete domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteDomain(domainId) {
        const response = await this.delete(domainId);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Domain removed successfully',
                type: 'info',
            }));
            
            await this.logAudit('domain.delete', 'domain', domainId);
        }
        
        return response;
    }

    /**
     * Delete domain for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteTenantDomain(tenantId, domainId) {
        const response = await this.deleteForTenant(tenantId, domainId);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Domain removed successfully',
                type: 'info',
            }));
        }
        
        return response;
    }

    // ==================== Domain Verification ====================

    /**
     * Get DNS verification information
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getVerificationInfo(domainId) {
        const response = await this.apiClient.get(
            this.getEndpoint(`${domainId}/verification-info/`)
        );
        
        return response;
    }

    /**
     * Verify domain ownership via DNS
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async verifyDomain(domainId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${domainId}/verify/`)
        );
        
        if (response.success) {
            const message = response.data?.verified ? 
                'Domain verified successfully!' : 
                response.data?.message || 'Verification in progress. DNS changes may take a few minutes.';
            
            store.dispatch(showToast({
                message,
                type: response.data?.verified ? 'success' : 'info',
            }));
            
            if (response.data?.verified) {
                await this.logAudit('domain.verify', 'domain', domainId, { verified: true });
            }
        }
        
        return response;
    }

    /**
     * Verify domain for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async verifyTenantDomain(tenantId, domainId) {
        const response = await this.apiClient.post(
            this.getTenantEndpoint(tenantId, `${domainId}/verify/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: response.data?.verified ? 
                    'Domain verified successfully!' : 
                    'Verification in progress. DNS changes may take a few minutes.',
                type: response.data?.verified ? 'success' : 'info',
            }));
        }
        
        return response;
    }

    /**
     * Resend domain verification
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async resendVerification(domainId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${domainId}/resend-verification/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Verification instructions resent. Check your DNS settings.',
                type: 'info',
            }));
        }
        
        return response;
    }

    // ==================== Primary Domain Management ====================

    /**
     * Set domain as primary for tenant
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async setPrimaryDomain(domainId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${domainId}/set-primary/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Primary domain updated successfully',
                type: 'success',
            }));
            
            await this.logAudit('domain.set_primary', 'domain', domainId);
        }
        
        return response;
    }

    /**
     * Set domain as primary for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async setTenantPrimaryDomain(tenantId, domainId) {
        const response = await this.apiClient.post(
            this.getTenantEndpoint(tenantId, `${domainId}/set-primary/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Primary domain updated',
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== SSL Certificate Management ====================

    /**
     * Get SSL certificate status for domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getSSLStatus(domainId) {
        return this.apiClient.get(this.getEndpoint(`${domainId}/ssl-status/`));
    }

    /**
     * Request SSL certificate for domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async requestSSL(domainId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${domainId}/request-ssl/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'SSL certificate requested. This may take a few minutes.',
                type: 'info',
            }));
        }
        
        return response;
    }

    /**
     * Renew SSL certificate for domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async renewSSL(domainId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${domainId}/renew-ssl/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'SSL certificate renewal initiated',
                type: 'info',
            }));
        }
        
        return response;
    }

    // ==================== HTTPS Settings ====================

    /**
     * Enable force HTTPS for domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async enableForceHTTPS(domainId) {
        const response = await this.update(domainId, { force_https: true }, true);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Force HTTPS enabled. All HTTP traffic will redirect to HTTPS.',
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Disable force HTTPS for domain
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async disableForceHTTPS(domainId) {
        const response = await this.update(domainId, { force_https: false }, true);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Force HTTPS disabled',
                type: 'info',
            }));
        }
        
        return response;
    }

    // ==================== Domain Validation ====================

    /**
     * Check domain availability
     * @param {string} domain - Domain name to check
     * @param {string} excludeTenantId - Tenant to exclude from check
     * @returns {Promise<boolean>} True if available
     */
    async checkDomainAvailability(domain, excludeTenantId = null) {
        const params = { domain };
        if (excludeTenantId) {
            params.exclude_tenant = excludeTenantId;
        }
        
        const response = await this.apiClient.get('/domains/check-availability/', { params });
        return response.success && response.data?.available === true;
    }

    /**
     * Validate domain format
     * @param {string} domain - Domain name to validate
     * @returns {boolean} True if valid
     * @private
     */
    _validateDomain(domain) {
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    /**
     * Get domain DNS records for verification
     * @param {string} domainId - Domain UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getDNSRecords(domainId) {
        return this.apiClient.get(this.getEndpoint(`${domainId}/dns-records/`));
    }

    // ==================== Bulk Operations ====================

    /**
     * Bulk verify domains
     * @param {Array<string>} domainIds - Array of domain IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkVerifyDomains(domainIds) {
        const response = await this.bulkOperation('verify', { domain_ids: domainIds });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Verification started for ${domainIds.length} domains`,
                type: 'info',
            }));
        }
        
        return response;
    }

    /**
     * Bulk delete domains
     * @param {Array<string>} domainIds - Array of domain IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkDeleteDomains(domainIds) {
        const confirmed = window.confirm(`Delete ${domainIds.length} domains? This action cannot be undone.`);
        
        if (!confirmed) {
            throw new Error('Bulk delete cancelled');
        }
        
        const response = await this.bulkOperation('delete', { domain_ids: domainIds });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${domainIds.length} domains deleted`,
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Export ====================

    /**
     * Export domains report
     * @param {string} tenantId - Tenant UUID
     * @param {string} format - Export format (csv, json)
     * @returns {Promise<Blob>} Blob data for file download
     */
    async exportDomains(tenantId = null, format = 'csv') {
        const params = tenantId ? { tenant_id: tenantId } : {};
        return this.exportData(format, { ...params, report_type: 'domains' });
    }
}

// Export singleton instance
export const domainService = new DomainService();
export default domainService;