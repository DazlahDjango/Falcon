/**
 * Analytics Helpers
 * Helper functions for billing analytics and reporting
 */

import { formatCurrency, formatPercentage } from './formatters';

/**
 * Calculate growth rate between two periods
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Growth rate percentage
 */
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Format growth rate for display
 * @param {number} growthRate - Growth rate percentage
 * @returns {Object} { text, isPositive, icon, color }
 */
export const formatGrowthRate = (growthRate) => {
    const isPositive = growthRate >= 0;
    const absValue = Math.abs(growthRate);
    
    return {
        text: `${isPositive ? '+' : '-'}${absValue.toFixed(1)}%`,
        isPositive,
        icon: isPositive ? '↑' : '↓',
        color: isPositive ? '#10b981' : '#ef4444',
    };
};

/**
 * Prepare revenue chart data
 * @param {Array} data - Raw revenue data
 * @param {string} period - Period type (daily, weekly, monthly)
 * @returns {Object} Chart.js compatible data
 */
export const prepareRevenueChartData = (data, period = 'monthly') => {
    if (!data || !data.breakdown) {
        return {
            labels: [],
            datasets: [],
        };
    }
    
    const labels = data.breakdown.map(item => {
        if (item.date) return new Date(item.date).toLocaleDateString();
        if (item.month) return item.month;
        if (item.week) return item.week;
        return '';
    });
    
    const values = data.breakdown.map(item => (item.total || 0) / 100);
    
    return {
        labels,
        datasets: [
            {
                label: 'Revenue',
                data: values,
                backgroundColor: 'rgba(37, 99, 235, 0.5)',
                borderColor: '#2563eb',
                borderWidth: 2,
                fill: true,
            },
        ],
    };
};

/**
 * Prepare subscription distribution data for pie chart
 * @param {Object} data - Subscription data by plan type
 * @returns {Object} Chart.js compatible data
 */
export const prepareSubscriptionDistributionData = (data) => {
    if (!data) {
        return {
            labels: [],
            datasets: [],
        };
    }
    
    const labels = [];
    const values = [];
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    Object.entries(data).forEach(([plan, count], index) => {
        if (count > 0) {
            labels.push(plan.charAt(0).toUpperCase() + plan.slice(1));
            values.push(count);
        }
    });
    
    return {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
            },
        ],
    };
};

/**
 * Calculate key metrics from analytics data
 * @param {Object} data - Raw analytics data
 * @returns {Object} Calculated metrics
 */
export const calculateKeyMetrics = (data) => {
    if (!data) {
        return {
            mrr: 0,
            mrrDisplay: 'KES 0',
            arr: 0,
            arrDisplay: 'KES 0',
            arpu: 0,
            arpuDisplay: 'KES 0',
            ltv: 0,
            ltvDisplay: 'KES 0',
            churnRate: 0,
            retentionRate: 0,
        };
    }
    
    const mrr = data.total_mrr || 0;
    const arr = mrr * 12;
    const activeCustomers = data.total_active || 0;
    const totalRevenue = data.total_revenue || 0;
    
    const arpu = activeCustomers > 0 ? Math.round(totalRevenue / activeCustomers) : 0;
    const churnRate = data.churn_rate || 0;
    const retentionRate = 100 - churnRate;
    
    // Simple LTV calculation: ARPU / Churn Rate
    const ltv = churnRate > 0 ? Math.round(arpu / (churnRate / 100)) : arpu * 12;
    
    return {
        mrr,
        mrrDisplay: formatCurrency(mrr),
        arr,
        arrDisplay: formatCurrency(arr),
        arpu,
        arpuDisplay: formatCurrency(arpu),
        ltv,
        ltvDisplay: formatCurrency(ltv),
        churnRate: formatPercentage(churnRate, 1),
        retentionRate: formatPercentage(retentionRate, 1),
    };
};

/**
 * Generate forecast data based on historical trends
 * @param {Array} historicalData - Historical revenue data
 * @param {number} periodsToForecast - Number of periods to forecast
 * @returns {Array} Forecast data
 */
export const generateRevenueForecast = (historicalData, periodsToForecast = 3) => {
    if (!historicalData || historicalData.length < 3) {
        return [];
    }
    
    // Simple linear regression for forecast
    const values = historicalData.map(d => d.total || 0);
    const n = values.length;
    
    // Calculate trend
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * values[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= periodsToForecast; i++) {
        const predicted = intercept + slope * (n + i);
        forecast.push({
            period: `Period +${i}`,
            predicted: Math.max(0, Math.round(predicted)),
            predictedDisplay: formatCurrency(Math.max(0, Math.round(predicted))),
            lowerBound: Math.max(0, Math.round(predicted * 0.8)),
            upperBound: Math.max(0, Math.round(predicted * 1.2)),
        });
    }
    
    return forecast;
};

/**
 * Generate CSV export data from analytics
 * @param {Object} data - Analytics data
 * @returns {string} CSV string
 */
export const exportAnalyticsToCSV = (data) => {
    if (!data || !data.breakdown) return '';
    
    const headers = ['Period', 'Revenue', 'Transactions', 'Success Rate'];
    const rows = data.breakdown.map(item => [
        item.date || item.month || item.week || '',
        (item.total || 0) / 100,
        item.count || 0,
        `${((item.successful || 0) / (item.count || 1) * 100).toFixed(1)}%`,
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');
    
    return csvContent;
};