/**
 * Billing Analytics Service
 * Handles billing analytics and reporting operations
 */

import { ANALYTICS_ENDPOINTS } from '../../config/constants/billingApiConstants';
import { billingApiClient } from './BillingBaseService';

class BillingAnalyticsServiceClass {
    async getBillingSummary() {
        const response = await billingApiClient.get(ANALYTICS_ENDPOINTS.SUMMARY);
        return response.data;
    }

    async getRevenueReport(params = {}) {
        const response = await billingApiClient.get(ANALYTICS_ENDPOINTS.REVENUE, { params });
        return response.data;
    }

    async getSubscriptionAnalytics() {
        const response = await billingApiClient.get(ANALYTICS_ENDPOINTS.SUBSCRIPTIONS);
        return response.data;
    }

    async getTaxReport(params = {}) {
        const response = await billingApiClient.get(ANALYTICS_ENDPOINTS.TAX, { params });
        return response.data;
    }

    async getRevenueForecast() {
        const response = await billingApiClient.get(ANALYTICS_ENDPOINTS.FORECAST);
        return response.data;
    }

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

    async getSubscriptionGrowth() {
        const analytics = await this.getSubscriptionAnalytics();
        const data = analytics || {};

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

    async getChurnRate(periodDays = 30) {
        const analytics = await this.getSubscriptionAnalytics();
        const data = analytics || {};

        const active = data.total_active || 0;
        const cancelled = data.total_cancelled || 0;

        if (active === 0) return 0;
        return (cancelled / (active + cancelled)) * 100;
    }

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