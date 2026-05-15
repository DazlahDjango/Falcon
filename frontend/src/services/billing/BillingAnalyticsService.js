/**
 * Billing Analytics Service
 * Handles billing analytics and reporting operations
 */

import { BillingBaseService } from './BillingBaseService';
import { ANALYTICS_ENDPOINTS } from '../../config/constants/billingApiConstants';

class BillingAnalyticsServiceClass extends BillingBaseService {
    constructor() {
        super('analytics');
    }

    /**
     * Get billing summary for tenant
     */
    async getBillingSummary() {
        return this.withRetry(() => 
            this.apiClient.get(ANALYTICS_ENDPOINTS.SUMMARY)
        );
    }

    /**
     * Get revenue report
     * @param {Object} params - { days, period, start_date, end_date }
     */
    async getRevenueReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ANALYTICS_ENDPOINTS.REVENUE, { params })
        );
    }

    /**
     * Get subscription analytics
     */
    async getSubscriptionAnalytics() {
        return this.withRetry(() => 
            this.apiClient.get(ANALYTICS_ENDPOINTS.SUBSCRIPTIONS)
        );
    }

    /**
     * Get tax report
     * @param {Object} params - { year }
     */
    async getTaxReport(params = {}) {
        return this.withRetry(() => 
            this.apiClient.get(ANALYTICS_ENDPOINTS.TAX, { params })
        );
    }

    /**
     * Get revenue forecast
     */
    async getRevenueForecast() {
        return this.withRetry(() => 
            this.apiClient.get(ANALYTICS_ENDPOINTS.FORECAST)
        );
    }

    /**
     * Get monthly revenue breakdown
     * @param {number} months - Number of months to analyze
     */
    async getMonthlyRevenueBreakdown(months = 12) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        
        return this.getRevenueReport({
            period: 'monthly',
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
        });
    }

    /**
     * Get subscription growth metrics
     */
    async getSubscriptionGrowth() {
        const analytics = await this.getSubscriptionAnalytics();
        const data = analytics?.data || {};
        
        return {
            active: data.total_active || 0,
            trialing: data.total_trialing || 0,
            total: (data.total_active || 0) + (data.total_trialing || 0),
            cancelled: data.total_cancelled || 0,
            expired: data.total_expired || 0,
            byPlan: data.by_plan || [],
            mrr: data.total_mrr || 0,
        };
    }

    /**
     * Calculate churn rate
     * @param {number} periodDays - Period in days
     */
    async getChurnRate(periodDays = 30) {
        const analytics = await this.getSubscriptionAnalytics();
        const data = analytics?.data || {};
        
        const active = data.total_active || 0;
        const cancelled = data.total_cancelled || 0;
        
        if (active === 0) return 0;
        return (cancelled / (active + cancelled)) * 100;
    }

    /**
     * Format currency for display
     * @param {number} amount - Amount in cents
     * @param {string} currency - Currency code
     */
    formatCurrency(amount, currency = 'KES') {
        if (!amount && amount !== 0) return '—';
        const symbols = { KES: 'KSh', USD: '$', GBP: '£', EUR: '€' };
        const symbol = symbols[currency] || currency;
        const formatted = (amount / 100).toFixed(2);
        return `${symbol} ${formatted}`;
    }
}

export const BillingAnalyticsService = new BillingAnalyticsServiceClass();
export default BillingAnalyticsService;