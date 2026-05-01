// frontend/src/services/tenant/tenant.service.js
import BaseTenantService from "./tenantBase.service";

class TenantService extends BaseTenantService {
    constructor() {
        super('tenants');
    }
    // ========== Tenant CRUD Operations ==========
    async getTenantBySlug(slug) {
        return this.list({ slug, limit: 1 });
    }

    async suspendTenant(id, reason) {
        return this.update(id, { status: 'suspended', suspend_reason: reason });
    }
    async getTenants(params = {}) {
        const response = await api.get(API_ENDPOINTS.TENANT.LIST, { params });
        return respon 
        return response.data;
    }

    async deleteTenant(id) {
        await api.delete(API_ENDPOINTS.TENANT.DELETE(id));
    }

    // ========== Tenant Status Management ==========

    async suspendTenant(id, reason = '') {
        const response = await api.post(API_ENDPOINTS.TENANT.SUSPEND(id), { reason });
        return response.data;
    }

    async activateTenant(id) {
        const response = await api.post(API_ENDPOINTS.TENANT.ACTIVATE(id));
        return response.data;
    }

    async getProvisioningStatus(id) {
        const response = await api.get(API_ENDPOINTS.TENANT.PROVISIONING_STATUS(id));
        return response.data;
    }

    // ========== Resource & Usage Management ==========

    async getTenantUsage(id) {
        const response = await api.get(API_ENDPOINTS.TENANT.USAGE(id));
        return response.data;
    }

    async getTenantResources(id) {
        const response = await api.get(API_ENDPOINTS.TENANT.RESOURCES(id));
        return response.data;
    }

    async updateResourceLimits(id, limits) {
        const response = await api.post(API_ENDPOINTS.TENANT.UPDATE_LIMITS(id), { limits });
        return response.data;
    }

    // ========== Tenant Analytics ==========

    async getTenantStats(id) {
        const response = await api.get(API_ENDPOINTS.TENANT.STATS(id));
        return response.data;
    }

    async getTenantAuditLogs(id, params = {}) {
        const response = await api.get(API_ENDPOINTS.TENANT.AUDIT_LOGS(id), { params });
        return response.data;
    }

    // ========== Tenant Settings ==========

    async updateTenantSettings(id, settings) {
        const response = await api.patch(API_ENDPOINTS.TENANT.SETTINGS(id), { settings });
        return response.data;
    }

    async updateTenantBranding(id, branding) {
        const response = await api.post(API_ENDPOINTS.TENANT.BRANDING(id), branding);
        return response.data;
    }

    // ========== Bulk Operations ==========

    async bulkUpdateTenants(tenantIds, data) {
        const response = await api.post(API_ENDPOINTS.TENANT.BULK_UPDATE, { tenantIds, ...data });
        return response.data;
    }

    async bulkDeleteTenants(tenantIds) {
        const response = await api.post(API_ENDPOINTS.TENANT.BULK_DELETE, { tenantIds });
        return response.data;
    }

    // ========== Export Operations ==========

    async exportTenants(params = {}) {
        const response = await api.get(API_ENDPOINTS.TENANT.EXPORT, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportTenantData(id, format = 'json') {
        const response = await api.get(API_ENDPOINTS.TENANT.EXPORT_DATA(id), {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    }
}

export default new TenantService();