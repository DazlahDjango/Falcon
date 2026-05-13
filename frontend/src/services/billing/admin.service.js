import { BaseBillingService, withRetry } from './client';

class AdminBillingService extends BaseBillingService {
    constructor() {
        super('admin/billing');
    }
    async getAllTenants(params = {}) {
        return withRetry(() => this.apiClient.get('/tenants/', { params }));
    }
    async getTenantBilling(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return withRetry(() => this.apiClient.get(`/tenants/${tenantId}/`));
    }
    async updateTenantSubscription(tenantId, data) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return withRetry(() => this.apiClient.put(`/tenants/${tenantId}/subscription/`, data));
    }
    async getAllSubscriptions(params = {}) {
        return withRetry(() => this.apiClient.get('/subscriptions/', { params }));
    }
    async getRevenueAnalytics(params = {}) {
        return withRetry(() => this.apiClient.get('/revenue/', { params }));
    }
    async getMrrAnalytics(params = {}) {
        return withRetry(() => this.apiClient.get('/revenue/mrr/', { params }));
    }
    async getChurnAnalytics(params = {}) {
        return withRetry(() => this.apiClient.get('/revenue/churn/', { params }));
    }
    async getLtvAnalytics(params = {}) {
        return withRetry(() => this.apiClient.get('/revenue/ltv/', { params }));
    }
    async managePlan(data) {
        if (data.id) {
            return withRetry(() => this.apiClient.put(`/plans/${data.id}/`, data));
        }
        return withRetry(() => this.apiClient.post('/plans/', data));
    }
    async deletePlan(planId) {
        if (!planId) throw new Error('Plan ID is required');
        return withRetry(() => this.apiClient.delete(`/plans/${planId}/`));
    }
}
export const adminBillingService = new AdminBillingService();
export default adminBillingService;