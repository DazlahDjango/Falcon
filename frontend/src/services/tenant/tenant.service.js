// frontend/src/services/tenant/tenant.service.js
/**
 * Tenant Core Service
 * Handles all tenant CRUD operations, provisioning, and management
 * Following CIA Triad: Confidentiality, Integrity, Availability
 * 
 * Version: 2.0.0
 */

import BaseTenantService from './tenantBase.service';
import { store } from '../../store';
import { setCurrentTenant, updateTenantStats } from '../../store/tenant/slice/tenantSlice';
import { showToast } from '../../store/tenant/slice/tenantUISlice';

class TenantService extends BaseTenantService {
    constructor() {
        super('tenants');
    }

    // ==================== Tenant CRUD Operations ====================

    /**
     * Get all tenants with advanced filtering (Super Admin only)
     * @param {Object} params - Query parameters
     * @param {string} params.status - Filter by status (active, suspended, inactive)
     * @param {string} params.subscription_plan - Filter by plan
     * @param {boolean} params.is_active - Active status
     * @param {string} params.search - Search term
     * @param {string} params.ordering - Sort field (prefix with - for desc)
     * @param {number} params.page - Page number
     * @param {number} params.page_size - Items per page
     * @returns {Promise} { success, data, status, message }
     */
    async getTenants(params = {}) {
        const response = await this.list(params);
        
        if (response.success && response.data?.results) {
            // Update store with tenant list stats
            store.dispatch(updateTenantStats({
                total: response.data.count || response.data.results.length,
                active: response.data.results.filter(t => t.is_active).length,
                suspended: response.data.results.filter(t => t.status === 'suspended').length,
                trial: response.data.results.filter(t => t.subscription_plan === 'trial').length,
            }));
        }
        
        return response;
    }

    /**
     * Get single tenant by ID
     * @param {string|number} id - Tenant ID
     * @param {Object} options - Additional options
     * @returns {Promise} { success, data, status, message }
     */
    async getTenant(id, options = {}) {
        const { include_resources = false, include_settings = false, include_audit = false } = options;
        
        const params = {
            include_resources,
            include_settings,
            include_audit,
        };
        
        return this.getById(id, params);
    }

    /**
     * Get tenant details with full data (for detail page)
     * @param {string} tenantId - Tenant UUID
     * @param {Object} options - Additional options
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantDetails(tenantId, options = {}) {
        const {
            include_resources = true,
            include_settings = true,
            include_audit = true,
        } = options;

        const params = {
            include_resources,
            include_settings,
            include_audit,
            detailed: true,
        };

        const response = await this.getById(tenantId, params);
        
        if (response.success && response.data) {
            // Decrypt sensitive data
            if (response.data.settings) {
                response.data.settings = this.decryptSensitiveData(response.data.settings);
            }
            
            // Update current tenant in store
            store.dispatch(setCurrentTenant(response.data));
        }
        
        return response;
    }

    /**
     * Get tenant by slug (URL-friendly identifier)
     * @param {string} slug - Tenant slug (e.g., 'acme-corp')
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantBySlug(slug) {
        const response = await this.list({ slug, limit: 1 });
        
        if (response.success && response.data?.results?.length) {
            return { success: true, data: response.data.results[0] };
        }
        
        return { success: false, data: null, message: 'Tenant not found' };
    }

    /**
     * Create new tenant (Super Admin only)
     * @param {Object} data - Tenant data
     * @param {string} data.name - Company name
     * @param {string} data.slug - URL-friendly identifier
     * @param {string} data.contact_email - Admin email
     * @param {string} data.subscription_plan - Plan type (trial, basic, professional, enterprise)
     * @param {Object} data.settings - Initial settings (optional)
     * @param {Object} data.limits - Resource limits (optional)
     * @returns {Promise} { success, data, status, message }
     */
    async createTenant(data) {
        // Validate required fields
        const requiredFields = ['name', 'slug', 'contact_email', 'subscription_plan'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Prepare data for creation
        const createData = {
            name: data.name,
            slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
            contact_email: data.contact_email.toLowerCase(),
            subscription_plan: data.subscription_plan,
            is_active: data.is_active ?? true,
            is_verified: false,
            settings: data.settings || {},
        };

        // Add default features based on plan
        createData.features = this._getDefaultFeatures(data.subscription_plan);
        
        // Set default limits
        if (data.limits) {
            createData.limits = data.limits;
        } else {
            createData.limits = this._getDefaultLimits(data.subscription_plan);
        }

        // Add optional fields
        if (data.primary_color) createData.primary_color = data.primary_color;
        if (data.secondary_color) createData.secondary_color = data.secondary_color;
        if (data.contact_phone) createData.contact_phone = data.contact_phone;
        if (data.address) createData.address = data.address;
        if (data.city) createData.city = data.city;
        if (data.country) createData.country = data.country;

        const response = await this.create(createData, true);
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Tenant "${data.name}" created successfully`,
                type: 'success',
            }));
            
            // Log audit
            await this.logAudit('tenant.create', 'tenant', response.data?.id, {
                tenant_name: data.name,
                plan: data.subscription_plan,
                slug: createData.slug,
            });
        }
        
        return response;
    }

    /**
     * Update tenant information
     * @param {string} id - Tenant ID
     * @param {Object} data - Updated tenant data
     * @param {boolean} partial - Partial update (true) or full update (false)
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenant(id, data, partial = true) {
        // Encrypt sensitive settings before sending
        if (data.settings) {
            data.settings = this.encryptSensitiveData(data.settings);
        }

        const response = await this.update(id, data, partial, true);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Tenant updated successfully',
                type: 'success',
            }));
            
            // Refresh tenant details in store if it's the current tenant
            const state = store.getState();
            if (state.tenant?.currentTenant?.id === id) {
                await this.getTenantDetails(id);
            }
            
            await this.logAudit('tenant.update', 'tenant', id, {
                updated_fields: Object.keys(data),
            });
        }
        
        return response;
    }

    /**
     * Delete tenant (Super Admin only)
     * @param {string} id - Tenant ID
     * @param {boolean} permanent - If true, hard delete; if false, soft delete
     * @returns {Promise} { success, data, status, message }
     */
    async deleteTenant(id, permanent = false) {
        const response = await this.delete(id, !permanent);
        
        if (response.success) {
            store.dispatch(showToast({
                message: permanent ? 'Tenant permanently deleted' : 'Tenant deleted (can be restored)',
                type: 'warning',
            }));
            
            await this.logAudit('tenant.delete', 'tenant', id, { permanent });
        }
        
        return response;
    }

    /**
     * Restore deleted tenant
     * @param {string} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async restoreTenant(id) {
        const response = await this.restore(id);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Tenant restored successfully',
                type: 'success',
            }));
            
            await this.logAudit('tenant.restore', 'tenant', id);
        }
        
        return response;
    }

    // ==================== Tenant Actions ====================

    /**
     * Suspend tenant (Super Admin only)
     * @param {string} id - Tenant ID
     * @param {string} reason - Suspension reason
     * @returns {Promise} { success, data, status, message }
     */
    async suspendTenant(id, reason) {
        if (!reason) throw new Error('Suspension reason is required');
        
        const response = await this.apiClient.post(
            this.getEndpoint(`${id}/suspend/`),
            { reason }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Tenant suspended: ${reason}`,
                type: 'warning',
            }));
            
            await this.logAudit('tenant.suspend', 'tenant', id, { reason });
        }
        
        return response;
    }

    /**
     * Activate tenant (Super Admin only)
     * @param {string} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async activateTenant(id) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${id}/activate/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Tenant activated successfully',
                type: 'success',
            }));
            
            await this.logAudit('tenant.activate', 'tenant', id);
        }
        
        return response;
    }

    /**
     * Get tenant provisioning status
     * @param {string} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getProvisioningStatus(id) {
        return this.apiClient.get(this.getEndpoint(`${id}/provisioning-status/`));
    }

    // ==================== Usage & Resources ====================

    /**
     * Get tenant usage statistics
     * @param {string} id - Tenant ID
     * @param {Object} period - Time period
     * @param {string} period.start_date - Start date (ISO)
     * @param {string} period.end_date - End date (ISO)
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantUsage(id, period = {}) {
        const params = {};
        if (period.start_date) params.start_date = period.start_date;
        if (period.end_date) params.end_date = period.end_date;
        
        return this.apiClient.get(this.getEndpoint(`${id}/usage/`), { params });
    }

    /**
     * Get tenant usage summary (simplified view for dashboard)
     * @param {string} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantUsageSummary(id) {
        return this.apiClient.get(this.getEndpoint(`${id}/usage-summary/`));
    }

    /**
     * Get tenant resources and limits
     * @param {string} id - Tenant ID
     * @param {boolean} refresh - Force refresh from database
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantResources(id, refresh = false) {
        const params = refresh ? { refresh: 'true' } : {};
        return this.apiClient.get(this.getEndpoint(`${id}/resources/`), { params });
    }

    /**
     * Update tenant resource limits (Super Admin only)
     * @param {string} id - Tenant ID
     * @param {Object} limits - Resource limits object
     * @returns {Promise} { success, data, status, message }
     */
    async updateResourceLimits(id, limits) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${id}/update-limits/`),
            { limits }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Resource limits updated successfully',
                type: 'success',
            }));
            
            await this.logAudit('tenant.update_limits', 'tenant', id, { new_limits: limits });
        }
        
        return response;
    }

    // ==================== Analytics & Audit ====================

    /**
     * Get tenant statistics (KPIs, trends, etc.)
     * @param {string} id - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantStats(id) {
        return this.getStats({ tenant_id: id });
    }

    /**
     * Get tenant audit logs
     * @param {string} id - Tenant ID
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.page_size - Items per page
     * @param {string} params.start_date - Start date filter
     * @param {string} params.end_date - End date filter
     * @param {string} params.action - Filter by action type
     * @returns {Promise} { success, data, status, message }
     */
    async getTenantAuditLogs(id, params = {}) {
        return this.getHistory(id, params);
    }

    /**
     * Get tenant statistics across all tenants (Super Admin only)
     * @param {Object} params - Filter parameters
     * @returns {Promise} { success, data, status, message }
     */
    async getGlobalStats(params = {}) {
        return this.apiClient.get('/stats/tenants/', { params });
    }

    // ==================== Settings & Branding ====================

    /**
     * Update tenant settings
     * @param {string} id - Tenant ID
     * @param {Object} settings - Settings object
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenantSettings(id, settings) {
        const encryptedSettings = this.encryptSensitiveData(settings);
        return this.update(id, { settings: encryptedSettings }, true);
    }

    /**
     * Update tenant branding (logo, colors, favicon)
     * @param {string} id - Tenant ID
     * @param {Object} branding - Branding object
     * @returns {Promise} { success, data, status, message }
     */
    async updateTenantBranding(id, branding) {
        const formData = new FormData();
        
        if (branding.logo) formData.append('logo', branding.logo);
        if (branding.favicon) formData.append('favicon', branding.favicon);
        if (branding.primary_color) formData.append('primary_color', branding.primary_color);
        if (branding.secondary_color) formData.append('secondary_color', branding.secondary_color);
        
        const response = await this.apiClient.patch(
            this.getEndpoint(`${id}/branding/`),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Branding updated successfully',
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Validation ====================

    /**
     * Validate tenant data before creation/update
     * @param {Object} tenantData - Tenant data to validate
     * @returns {Promise} { success, data, status, message, errors }
     */
    async validateTenant(tenantData) {
        return this.validate(tenantData);
    }

    /**
     * Check if slug is available
     * @param {string} slug - Slug to check
     * @param {string} excludeId - Tenant ID to exclude from check
     * @returns {Promise<boolean>} True if available
     */
    async isSlugAvailable(slug, excludeId = null) {
        const params = { slug };
        if (excludeId) params.exclude_id = excludeId;
        
        const response = await this.apiClient.get('/tenants/check-slug/', { params });
        return response.success && response.data?.available === true;
    }

    /**
     * Check if email domain is available
     * @param {string} domain - Domain to check
     * @returns {Promise<boolean>} True if available
     */
    async isDomainAvailable(domain) {
        const response = await this.apiClient.get('/tenants/check-domain/', { params: { domain } });
        return response.success && response.data?.available === true;
    }

    // ==================== Bulk Operations ====================

    /**
     * Bulk update multiple tenants
     * @param {Array<string>} tenantIds - Array of tenant IDs
     * @param {Object} data - Update data to apply to all
     * @returns {Promise} { success, data, status, message }
     */
    async bulkUpdateTenants(tenantIds, data) {
        const response = await this.bulkOperation('update', { tenant_ids: tenantIds, ...data });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${tenantIds.length} tenants updated successfully`,
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Bulk delete multiple tenants
     * @param {Array<string>} tenantIds - Array of tenant IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkDeleteTenants(tenantIds) {
        const response = await this.bulkOperation('delete', { tenant_ids: tenantIds });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${tenantIds.length} tenants deleted`,
                type: 'warning',
            }));
        }
        
        return response;
    }

    /**
     * Bulk suspend multiple tenants
     * @param {Array<string>} tenantIds - Array of tenant IDs
     * @param {string} reason - Suspension reason
     * @returns {Promise} { success, data, status, message }
     */
    async bulkSuspendTenants(tenantIds, reason = '') {
        const response = await this.bulkOperation('suspend', { tenant_ids: tenantIds, reason });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${tenantIds.length} tenants suspended`,
                type: 'warning',
            }));
        }
        
        return response;
    }

    /**
     * Bulk activate multiple tenants
     * @param {Array<string>} tenantIds - Array of tenant IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkActivateTenants(tenantIds) {
        const response = await this.bulkOperation('activate', { tenant_ids: tenantIds });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${tenantIds.length} tenants activated`,
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Export ====================

    /**
     * Export all tenants (CSV, JSON, Excel)
     * @param {string} format - Export format (csv, json, xlsx)
     * @param {Object} params - Filter parameters
     * @returns {Promise<Blob>} Blob data for file download
     */
    async exportTenants(format = 'csv', params = {}) {
        return this.exportData(format, params);
    }

    /**
     * Export single tenant data
     * @param {string} id - Tenant ID
     * @param {string} format - Export format (json, csv)
     * @returns {Promise<Blob>} Blob data for file download
     */
    async exportTenantData(id, format = 'json') {
        return this.exportData(format, { tenant_id: id, detailed: true });
    }

    // ==================== Private Helper Methods ====================

    _getDefaultFeatures(plan) {
        const features = {
            trial: {
                max_users: 10,
                max_kpis: 50,
                custom_branding: false,
                api_access: false,
                sso: false,
                advanced_analytics: false,
                audit_logs: true,
                reports: true,
                backup_retention_days: 7,
            },
            basic: {
                max_users: 50,
                max_kpis: 100,
                custom_branding: false,
                api_access: false,
                sso: false,
                advanced_analytics: false,
                audit_logs: true,
                reports: true,
                backup_retention_days: 14,
            },
            professional: {
                max_users: 500,
                max_kpis: 1000,
                custom_branding: true,
                api_access: true,
                sso: false,
                advanced_analytics: true,
                audit_logs: true,
                reports: true,
                backup_retention_days: 30,
            },
            enterprise: {
                max_users: 10000,
                max_kpis: 10000,
                custom_branding: true,
                api_access: true,
                sso: true,
                advanced_analytics: true,
                audit_logs: true,
                reports: true,
                backup_retention_days: 90,
            },
        };
        
        return features[plan] || features.trial;
    }

    _getDefaultLimits(plan) {
        const limits = {
            trial: {
                storage_mb: 1024,
                api_calls_per_day: 1000,
                concurrent_sessions: 2,
                departments: 5,
                teams: 10,
                positions: 20,
            },
            basic: {
                storage_mb: 5120,
                api_calls_per_day: 5000,
                concurrent_sessions: 3,
                departments: 20,
                teams: 50,
                positions: 100,
            },
            professional: {
                storage_mb: 51200,
                api_calls_per_day: 50000,
                concurrent_sessions: 10,
                departments: 100,
                teams: 250,
                positions: 500,
            },
            enterprise: {
                storage_mb: 512000,
                api_calls_per_day: 500000,
                concurrent_sessions: 50,
                departments: 500,
                teams: 1000,
                positions: 2000,
            },
        };
        
        return limits[plan] || limits.trial;
    }
}

// Export singleton instance
export const tenantService = new TenantService();
export default tenantService;