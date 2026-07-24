// ============================================
// apps/reportplt/selectors/analytics.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    trend: null,
    performance: null,
    comparative: null,
    predictive: null,
    anomaly: null,
    loading: false,
    generating: false,
    error: null,
    currentAnalysis: null,
    history: [],
    filters: { period: 'monthly', metric: null, compare_by: null, group_by: null },
};

export const selectAnalyticsState = (state) => {
    return state?.analytics || state?.reports?.analytics || state?.reportplt?.analytics || initialState;
};

export const selectTrendAnalysis = createSelector(
    [selectAnalyticsState],
    (state) => state.trend || null
);

export const selectPerformanceAnalysis = createSelector(
    [selectAnalyticsState],
    (state) => state.performance || null
);

export const selectComparativeAnalysis = createSelector(
    [selectAnalyticsState],
    (state) => state.comparative || null
);

export const selectPredictiveAnalysis = createSelector(
    [selectAnalyticsState],
    (state) => state.predictive || null
);

export const selectAnomalyDetection = createSelector(
    [selectAnalyticsState],
    (state) => state.anomaly || null
);

export const selectAnalyticsLoading = createSelector(
    [selectAnalyticsState],
    (state) => state.loading || false
);

export const selectAnalyticsGenerating = createSelector(
    [selectAnalyticsState],
    (state) => state.generating || false
);

export const selectAnalyticsError = createSelector(
    [selectAnalyticsState],
    (state) => state.error || null
);

export const selectCurrentAnalysis = createSelector(
    [selectAnalyticsState],
    (state) => state.currentAnalysis || null
);

export const selectAnalyticsHistory = createSelector(
    [selectAnalyticsState],
    (state) => state.history || []
);

export const selectAnalyticsFilters = createSelector(
    [selectAnalyticsState],
    (state) => state.filters || { period: 'monthly', metric: null, compare_by: null, group_by: null }
);

export const selectTrendData = createSelector(
    [selectTrendAnalysis],
    (trend) => trend?.data || null
);

export const selectTrendPeriods = createSelector(
    [selectTrendData],
    (data) => data?.periods || []
);

export const selectTrendValues = createSelector(
    [selectTrendData],
    (data) => data?.values || []
);

export const selectTrendDirection = createSelector(
    [selectTrendData],
    (data) => data?.trend_direction || 'stable'
);

export const selectTrendGrowthRate = createSelector(
    [selectTrendData],
    (data) => data?.growth_rate || 0
);

export const selectPerformanceSummary = createSelector(
    [selectPerformanceAnalysis],
    (performance) => performance?.summary || null
);

export const selectPerformanceRankings = createSelector(
    [selectPerformanceAnalysis],
    (performance) => performance?.rankings || null
);

export const selectComparativeGroups = createSelector(
    [selectComparativeAnalysis],
    (comparative) => comparative?.groups || null
);

export const selectComparativeRankings = createSelector(
    [selectComparativeAnalysis],
    (comparative) => comparative?.rankings || []
);

export const selectPredictiveForecast = createSelector(
    [selectPredictiveAnalysis],
    (predictive) => predictive?.forecast || []
);

export const selectPredictiveConfidence = createSelector(
    [selectPredictiveAnalysis],
    (predictive) => predictive?.confidence_intervals || []
);

export const selectAnomalies = createSelector(
    [selectAnomalyDetection],
    (anomaly) => anomaly?.anomalies || []
);

export const selectAnomalySummary = createSelector(
    [selectAnomalyDetection],
    (anomaly) => anomaly?.summary || null
);

export const selectAnomalyRate = createSelector(
    [selectAnomalySummary],
    (summary) => summary?.anomaly_rate || 0
);

export const selectHasAnalyticsData = createSelector(
    [
        selectTrendAnalysis,
        selectPerformanceAnalysis,
        selectComparativeAnalysis,
        selectPredictiveAnalysis,
        selectAnomalyDetection
    ],
    (trend, performance, comparative, predictive, anomaly) => {
        return !!(trend || performance || comparative || predictive || anomaly);
    }
);

export const selectIsAnalyticsLoading = createSelector(
    [selectAnalyticsLoading],
    (loading) => loading
);

export const selectHasAnalyticsError = createSelector(
    [selectAnalyticsError],
    (error) => error !== null
);