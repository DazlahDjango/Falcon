import { createSelector } from '@reduxjs/toolkit';

const selectUsageState = (state) => state.billing?.usage || {};

export const selectUsageSummary = createSelector([selectUsageState], (usage) => usage.summary);
export const selectCurrentLimits = createSelector([selectUsageState], (usage) => usage.limits);
export const selectUsageAlerts = createSelector([selectUsageState], (usage) => usage.alerts);
export const selectUsageLoading = createSelector([selectUsageState], (usage) => usage.loading);
export const selectUsageError = createSelector([selectUsageState], (usage) => usage.error);
export const selectRecentTrackings = createSelector([selectUsageState], (usage) => usage.recentTrackings);

export const selectUsersUsage = createSelector([selectUsageSummary], (summary) => summary?.usage?.users || { current: 0, limit: 0, percentage: 0 });
export const selectKpisUsage = createSelector([selectUsageSummary], (summary) => summary?.usage?.kpis || { current: 0, limit: 0, percentage: 0 });
export const selectApiCallsUsage = createSelector([selectUsageSummary], (summary) => summary?.usage?.api_calls || { current: 0, limit: 0, percentage: 0 });
export const selectStorageUsage = createSelector([selectUsageSummary], (summary) => summary?.usage?.storage || { current: 0, limit: 0, percentage: 0 });
export const selectDepartmentsUsage = createSelector([selectUsageSummary], (summary) => summary?.usage?.departments || { current: 0, limit: 0, percentage: 0 });
export const selectIsWithinLimit = (usageType) => createSelector([selectUsageSummary], (summary) => {
    const usage = summary?.usage?.[usageType];
    if (!usage || usage.limit === -1) return true;
    return usage.current < usage.limit;
});
export const selectIsSoftLimitExceeded = (usageType) => createSelector([selectUsageSummary], (summary) => {
    const usage = summary?.usage?.[usageType];
    if (!usage || usage.limit === -1) return false;
    return usage.percentage >= 100 && usage.percentage < 110;
});
export const selectIsHardLimitExceeded = (usageType) => createSelector([selectUsageSummary], (summary) => {
    const usage = summary?.usage?.[usageType];
    if (!usage || usage.limit === -1) return false;
    return usage.percentage >= 110;
});
export const selectUsagePercentage = (usageType) => createSelector([selectUsageSummary], (summary) => {
    const usage = summary?.usage?.[usageType];
    return usage?.percentage || 0;
});
export const selectDaysRemainingInPeriod = createSelector([selectUsageSummary], (summary) => summary?.days_remaining || 0);