/**
 * Admin Billing Service
 * Admin-only billing operations
 */

import { BillingBaseService } from './BillingBaseService';
import { ADMIN_BILLING_ENDPOINTS } from '../../config/constants/billingApiConstants';

class AdminBillingServiceClass extends BillingBaseService {
    constructor() {
        super('admin/billing');
    }

    /**
     * Get tenant subscriptions (Admin only)
     * @param {string} tenantId - Tenant ID
     */
    async getTenantSubscriptions(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_SUBSCRIPTIONS(tenantId))
        );
    }

    /**
     * Get tenant invoices (Admin only)
     * @param {string} tenantId - Tenant ID
     */
    async getTenantInvoices(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_INVOICES(tenantId))
        );
    }

    /**
     * Get tenant transactions (Admin only)
     * @param {string} tenantId - Tenant ID
     */
    async getTenantTransactions(tenantId) {
        if (!tenantId) throw new Error('Tenant ID is required');
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TENANT_TRANSACTIONS(tenantId))
        );
    }

    /**
     * Bulk update subscriptions (Admin only)
     * @param {Array} updates - Array of subscription updates
     */
    async bulkUpdateSubscriptions(updates) {
        if (!updates || updates.length === 0) {
            throw new Error('Updates array is required');
        }
        return this.withRetry(() => 
            this.apiClient.post(ADMIN_BILLING_ENDPOINTS.BULK_UPDATE_SUBSCRIPTIONS, { updates })
        );
    }

    /**
     * Get revenue report (Admin only)
     * @param {Object} params - { start_date, end_date, group_by }
     */
    async getRevenueReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.REVENUE_REPORT, { params })
        );
    }

    /**
     * Get subscription report (Admin only)
     * @param {Object} params - { status, plan_type }
     */
    async getSubscriptionReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.SUBSCRIPTION_REPORT, { params })
        );
    }

    /**
     * Get tax report (Admin only)
     * @param {Object} params - { year, country }
     */
    async getTaxReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ADMIN_BILLING_ENDPOINTS.TAX_REPORT, { params })
        );
    }

    /**
     * Get system-wide billing metrics (Admin only)
     */
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