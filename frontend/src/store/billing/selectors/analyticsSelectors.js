import { createSelector } from '@reduxjs/toolkit';

const selectAnalyticsState = (state) => state.billing?.analytics || {};

export const selectBillingSummary = createSelector([selectAnalyticsState], (analytics) => analytics.summary);
export const selectRevenueReport = createSelector([selectAnalyticsState], (analytics) => analytics.revenue);
export const selectSubscriptionAnalytics = createSelector([selectAnalyticsState], (analytics) => analytics.subscriptions);
export const selectRevenueForecast = createSelector([selectAnalyticsState], (analytics) => analytics.forecast);
export const selectTaxReport = createSelector([selectAnalyticsState], (analytics) => analytics.taxReport);
export const selectAnalyticsLoading = createSelector([selectAnalyticsState], (analytics) => analytics.loading);
export const selectAnalyticsError = createSelector([selectAnalyticsState], (analytics) => analytics.error);

export const selectMRR = createSelector([selectSubscriptionAnalytics], (subscriptions) => subscriptions?.total_mrr || 0);
export const selectMRRDisplay = createSelector([selectMRR], (mrr) => mrr ? `KES ${(mrr / 100).toFixed(2)}` : 'KES 0.00');
export const selectActiveSubscriptionsCount = createSelector([selectSubscriptionAnalytics], (subscriptions) => subscriptions?.total_active || 0);
export const selectTrialingSubscriptionsCount = createSelector([selectSubscriptionAnalytics], (subscriptions) => subscriptions?.total_trialing || 0);
export const selectTotalRevenue = createSelector([selectRevenueReport], (revenue) => revenue?.total_revenue || 0);
export const selectTotalRevenueDisplay = createSelector([selectTotalRevenue], (revenue) => revenue ? `KES ${(revenue / 100).toFixed(2)}` : 'KES 0.00');
export const selectRevenueSuccessRate = createSelector([selectRevenueReport], (revenue) => revenue?.success_rate || 0);
export const selectRevenueBreakdown = createSelector([selectRevenueReport], (revenue) => revenue?.breakdown || []);
export const selectSubscriptionByPlan = createSelector([selectSubscriptionAnalytics], (subscriptions) => subscriptions?.by_plan || {});
export const selectSubscriptionByPlanType = createSelector([selectSubscriptionAnalytics], (subscriptions) => subscriptions?.by_plan_type || {});
export const selectChurnRate = createSelector([selectSubscriptionAnalytics], (subscriptions) => {
    if (!subscriptions) return 0;
    const cancelled = subscriptions.total_cancelled || 0;
    const active = subscriptions.total_active || 0;
    return active + cancelled === 0 ? 0 : (cancelled / (active + cancelled)) * 100;
});
export const selectTotalTaxCollected = createSelector([selectTaxReport], (tax) => tax?.total_tax_collected || 0);
export const selectMonthlyRevenueTrend = createSelector([selectRevenueReport], (revenue) => revenue?.monthly_breakdown || []);