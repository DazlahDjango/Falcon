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
         */
        async getTenants(params = {}) {
            const response = await this.list(params);
            
            if (response.success && response.data?.results) {
                store.dispatch(updateTenantStats({
                    total: response.data.count || response.data.results.length,
                    active: response.data.results.filter(t => t.is_active).length,
                    suspended: response.data.results.filter(t => !t.is_active).length,
                    trial: response.data.results.filter(t => t.subscription_plan === 'trial').length,
                }));
            }
            
            return response;
        }

        /**
         * Get single tenant by ID
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
                if (response.data.settings) {
                    response.data.settings = this.decryptSensitiveData(response.data.settings);
                }
                
                store.dispatch(setCurrentTenant(response.data));
            }
            
            return response;
        }

        /**
         * Get tenant by slug (URL-friendly identifier)
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
         * 
         * @param {Object} data - Tenant data
         * @param {string} data.name - Company name (required)
         * @param {string} data.slug - URL-friendly identifier (required)
         * @param {string} data.contact_email - Admin email (required)
         * @param {string} data.subscription_plan - Plan type (required: trial, basic, professional, enterprise)
         * @param {string} data.domain - Custom domain (optional)
         * @param {string} data.contact_phone - Contact phone (optional)
         * @param {string} data.address - Address (optional)
         * @param {string} data.city - City (optional)
         * @param {string} data.country - Country (optional)
         * @param {string} data.primary_color - Brand primary color (optional, hex)
         * @param {string} data.secondary_color - Brand secondary color (optional, hex)
         * @param {Object} data.settings - Tenant settings (optional)
         * @param {Object} data.features - Feature flags (optional)
         */
        async createTenant(data) {
            // Validate required fields
            const requiredFields = ['name', 'slug', 'contact_email', 'subscription_plan'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Check if we have files (logo or favicon)
            const hasFiles = data.logo || data.favicon;

            let createData;
            if (hasFiles) {
                // Use FormData for file uploads
                createData = new FormData();
                createData.append('name', data.name);
                createData.append('slug', data.slug.toLowerCase().replace(/\s+/g, '-'));
                createData.append('contact_email', data.contact_email.toLowerCase());
                createData.append('subscription_plan', data.subscription_plan);

                const optionalFields = [
                    'domain', 'contact_phone', 'address', 'city', 'country',
                    'primary_color', 'secondary_color', 'settings', 'features'
                ];
                
                for (const field of optionalFields) {
                    if (data[field]) {
                        if (typeof data[field] === 'object') {
                            createData.append(field, JSON.stringify(data[field]));
                        } else {
                            createData.append(field, data[field]);
                        }
                    }
                }

                // Add files
                if (data.logo) createData.append('logo', data.logo);
                if (data.favicon) createData.append('favicon', data.favicon);
            } else {
                // Regular JSON payload
                createData = {
                    name: data.name,
                    slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
                    contact_email: data.contact_email.toLowerCase(),
                    subscription_plan: data.subscription_plan,
                };

                const optionalFields = [
                    'domain', 'contact_phone', 'address', 'city', 'country',
                    'primary_color', 'secondary_color', 'settings', 'features'
                ];
                
                for (const field of optionalFields) {
                    if (data[field]) {
                        createData[field] = data[field];
                    }
                }
            }

            // Note: is_active and is_verified are NOT sent - backend handles these
            const response = await this.create(createData, true);
            
            if (response.success) {
                store.dispatch(showToast({
                    message: `Tenant "${data.name}" created successfully`,
                    type: 'success',
                }));
                
                await this.logAudit('tenant.create', 'tenant', response.data?.id, {
                    tenant_name: data.name,
                    plan: data.subscription_plan,
                    slug: hasFiles ? data.slug : createData.slug,
                });
            }
            
            return response;
        }

        /**
         * Update tenant information
         */
        async updateTenant(id, data, partial = true) {
            // Check if we have files (logo or favicon)
            const hasFiles = data.logo || data.favicon;

            let updateData;
            if (hasFiles) {
                // Use FormData for file uploads
                updateData = new FormData();
                
                // Add all fields
                Object.keys(data).forEach(key => {
                    if (data[key] !== null && data[key] !== undefined) {
                        if (key === 'settings' || (typeof data[key] === 'object' && !(data[key] instanceof File))) {
                            updateData.append(key, JSON.stringify(this.encryptSensitiveData(data[key])));
                        } else {
                            updateData.append(key, data[key]);
                        }
                    }
                });
            } else {
                // Regular JSON payload
                updateData = { ...data };
                if (updateData.settings) {
                    updateData.settings = this.encryptSensitiveData(updateData.settings);
                }
            }

            const response = await this.update(id, updateData, partial, true);
            
            if (response.success) {
                store.dispatch(showToast({
                    message: 'Tenant updated successfully',
                    type: 'success',
                }));
                
                const state = store.getState();
                if (state.appTenant?.currentTenant?.id === id) {
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
         * Reconcile/sync tenant resources in real-time
         */
        async syncTenantResources(id) {
            const response = await this.apiClient.post(
                this.getEndpoint(`${id}/sync-resources/`)
            );
            
            if (response.success) {
                store.dispatch(showToast({
                    message: 'Tenant resources synced successfully',
                    type: 'success',
                }));
            }
            
            return response;
        }

        /**
         * Get tenant provisioning status
         */
        async getProvisioningStatus(id) {
            return this.apiClient.get(this.getEndpoint(`${id}/provisioning-status/`));
        }

        // ==================== Usage & Resources ====================

        /**
         * Get tenant usage statistics
         */
        async getTenantUsage(id, period = {}) {
            const params = {};
            if (period.start_date) params.start_date = period.start_date;
            if (period.end_date) params.end_date = period.end_date;
            
            return this.apiClient.get(this.getEndpoint(`${id}/usage/`), { params });
        }

        /**
         * Get tenant usage summary (simplified view for dashboard)
         */
        async getTenantUsageSummary(id) {
            return this.apiClient.get(this.getEndpoint(`${id}/usage-summary/`));
        }

        /**
         * Get tenant resources and limits
         */
        async getTenantResources(id, refresh = false) {
            const params = refresh ? { refresh: 'true' } : {};
            return this.apiClient.get(this.getEndpoint(`${id}/resources/`), { params });
        }

        /**
         * Update tenant resource limits (Super Admin only)
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
         * Get tenant statistics (accepts tenant id or gets global dashboard stats if null)
         */
        async getTenantStats(id = null) {
            if (id) {
                return this.getStats({ tenant_id: id });
            }
            return this.apiClient.get(this.getEndpoint('stats/'));
        }

        /**
         * Get recent tenants (Super Admin only)
         */
        async getRecentTenants() {
            return this.list({ limit: 5, ordering: '-created_at' });
        }

        /**
         * Get dashboard alerts (Super Admin only)
         */
        async getDashboardAlerts() {
            const response = await this.getTenantStats();
            return {
                ...response,
                data: response.data?.alerts || []
            };
        }

        /**
         * Get activity data (Super Admin only)
         */
        async getActivityData() {
            const response = await this.getTenantStats();
            return {
                ...response,
                data: response.data?.activity || []
            };
        }

        /**
         * Get health data (Super Admin only)
         */
        async getHealthData() {
            const response = await this.getTenantStats();
            return {
                ...response,
                data: response.data?.health || { status: 'healthy', database: 'healthy', cache: 'healthy', worker: 'healthy', storage: 'Optimal' }
            };
        }

        /**
         * Get tenant audit logs
         */
        async getTenantAuditLogs(id, params = {}) {
            return this.getHistory(id, params);
        }

        /**
         * Get tenant statistics across all tenants (Super Admin only)
         */
        async getGlobalStats(params = {}) {
            return this.apiClient.get('/stats/tenants/', { params });
        }

        // ==================== Settings & Branding ====================

        /**
         * Update tenant settings
         */
        async updateTenantSettings(id, settings) {
            const encryptedSettings = this.encryptSensitiveData(settings);
            return this.update(id, { settings: encryptedSettings }, true);
        }

        /**
         * Update tenant branding (logo, colors, favicon)
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
         */
        async validateTenant(tenantData) {
            return this.validate(tenantData);
        }

        /**
         * Check if slug is available
         */
        async isSlugAvailable(slug, excludeId = null) {
            const params = { slug };
            if (excludeId) params.exclude_id = excludeId;
            
            const response = await this.apiClient.get('/tenants/check-slug/', { params });
            return response.success && response.data?.available === true;
        }

        /**
         * Check if domain is available
         */
        async isDomainAvailable(domain) {
            const response = await this.apiClient.get('/tenants/check-domain/', { params: { domain } });
            return response.success && response.data?.available === true;
        }

        // ==================== Bulk Operations ====================

        /**
         * Bulk update multiple tenants
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
         */
        async exportTenants(format = 'csv', params = {}) {
            return this.exportData(format, params);
        }

        /**
         * Export single tenant data
         */
        async exportTenantData(id, format = 'json') {
            return this.exportData(format, { tenant_id: id, detailed: true });
        }
    }

    // Export singleton instance
    export const tenantService = new TenantService();
    export default tenantService;