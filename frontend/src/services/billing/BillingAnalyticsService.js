/**
 * Billing Analytics Service
 * Handles billing analytics and reporting operations
 */

import axios from 'axios';
import { ANALYTICS_ENDPOINTS } from '../../config/constants/billingApiConstants';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';
import { store } from '../../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BILLING_API_BASE = `${API_BASE_URL}/billing`;

const analyticsApiClient = axios.create({
    baseURL: BILLING_API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

analyticsApiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    let tenantId = await getTenantId();
    if (!tenantId) {
        const state = store.getState();
        tenantId = state?.auth?.user?.tenant_id || state?.tenant?.currentTenant?.id;
    }
    if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
    }
    
    return config;
});

class BillingAnalyticsServiceClass {
    async getBillingSummary() {
        return analyticsApiClient.get(ANALYTICS_ENDPOINTS.SUMMARY);
    }
    
    async getRevenueReport(params = {}) {
        return analyticsApiClient.get(ANALYTICS_ENDPOINTS.REVENUE, { params });
    }
    
    async getSubscriptionAnalytics() {
        return analyticsApiClient.get(ANALYTICS_ENDPOINTS.SUBSCRIPTIONS);
    }
    
    async getTaxReport(params = {}) {
        return analyticsApiClient.get(ANALYTICS_ENDPOINTS.TAX, { params });
    }
    
    async getRevenueForecast() {
        return analyticsApiClient.get(ANALYTICS_ENDPOINTS.FORECAST);
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
    
    async getChurnRate(periodDays = 30) {
        const analytics = await this.getSubscriptionAnalytics();
        const data = analytics?.data || {};
        
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