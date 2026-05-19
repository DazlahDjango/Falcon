/**
 * Admin Billing Service
 * Admin-only billing operations
 */

import { BillingBaseService } from './BillingBaseService';
import { ADMIN_BILLING_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AdminBillingServiceClass extends BillingBaseService {
    constructor() {
        super('admin');
    }
    
    async getTenantSubscriptions(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_SUBSCRIPTIONS(tenantId))
        );
    }
    
    async getTenantInvoices(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_INVOICES(tenantId))
        );
    }
    
    async getTenantTransactions(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_TRANSACTIONS(tenantId))
        );
    }
    
    async bulkUpdateSubscriptions(updates) {
        if (!updates || updates.length === 0) {
            throw new Error('Updates array is required');
        }
        return this.withRetry(() => 
            this.apiClient.post(ADMIN_BILLING_ENDPOINTS.BULK_UPDATE_SUBSCRIPTIONS, { updates })
        );
    }
    
    async getRevenueReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.REVENUE_REPORT, { params })
        );
    }
    
    async getSubscriptionReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.SUBSCRIPTION_REPORT, { params })
        );
    }
    
    async getTaxReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TAX_REPORT, { params })
        );
    }
    
    async getSystemMetrics() {
        const [revenue, subscriptions] = await Promise.all([
            this.getRevenueReport({ days: 30 }),
            this.getSubscriptionReport(),
        ]);
        
        return {
            revenue: revenue?.data || {},
            subscriptions: subscriptions?.data || {},
            timestamp: new Date().toISOString(),
        };
    }
}

export const AdminBillingService = new AdminBillingServiceClass();
export default AdminBillingService;