// ============================================
// frontend/src/hooks/reports/useAnalytics.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    analyzeTrend,
    analyzePerformance,
    analyzeComparative,
    analyzePredictive,
    detectAnomalies,
    clearAnalytics,
    clearAnalyticsErrors,
    setAnalyticsFilters,
    resetAnalyticsFilters,
    clearHistory,
    setCurrentAnalysis,
} from '../../store/reports/slice/analytics.slice';
import {
    selectTrendAnalysis,
    selectPerformanceAnalysis,
    selectComparativeAnalysis,
    selectPredictiveAnalysis,
    selectAnomalyDetection,
    selectAnalyticsLoading,
    selectAnalyticsGenerating,
    selectAnalyticsError,
    selectCurrentAnalysis,
    selectAnalyticsHistory,
    selectAnalyticsFilters,
    selectTrendData,
    selectTrendPeriods,
    selectTrendValues,
    selectTrendDirection,
    selectTrendGrowthRate,
    selectPerformanceSummary,
    selectPerformanceRankings,
    selectComparativeGroups,
    selectComparativeRankings,
    selectPredictiveForecast,
    selectPredictiveConfidence,
    selectAnomalies,
    selectAnomalySummary,
    selectAnomalyRate,
    selectHasAnalyticsData,
    selectIsAnalyticsLoading,
    selectHasAnalyticsError,
} from '../../store/reports/selectors/analytics.selectors';

export const useAnalytics = (options = {}) => {
    const {
        autoFetch = false,
        filters: initialFilters = {},
    } = options;

    const dispatch = useDispatch();

    const trend = useSelector(selectTrendAnalysis);
    const performance = useSelector(selectPerformanceAnalysis);
    const comparative = useSelector(selectComparativeAnalysis);
    const predictive = useSelector(selectPredictiveAnalysis);
    const anomaly = useSelector(selectAnomalyDetection);
    const loading = useSelector(selectAnalyticsLoading);
    const generating = useSelector(selectAnalyticsGenerating);
    const error = useSelector(selectAnalyticsError);
    const currentAnalysis = useSelector(selectCurrentAnalysis);
    const history = useSelector(selectAnalyticsHistory);
    const filters = useSelector(selectAnalyticsFilters);
    const hasData = useSelector(selectHasAnalyticsData);
    const isLoading = useSelector(selectIsAnalyticsLoading);
    const hasError = useSelector(selectHasAnalyticsError);

    const trendData = useSelector(selectTrendData);
    const trendPeriods = useSelector(selectTrendPeriods);
    const trendValues = useSelector(selectTrendValues);
    const trendDirection = useSelector(selectTrendDirection);
    const trendGrowthRate = useSelector(selectTrendGrowthRate);
    const performanceSummary = useSelector(selectPerformanceSummary);
    const performanceRankings = useSelector(selectPerformanceRankings);
    const comparativeGroups = useSelector(selectComparativeGroups);
    const comparativeRankings = useSelector(selectComparativeRankings);
    const predictiveForecast = useSelector(selectPredictiveForecast);
    const predictiveConfidence = useSelector(selectPredictiveConfidence);
    const anomalies = useSelector(selectAnomalies);
    const anomalySummary = useSelector(selectAnomalySummary);
    const anomalyRate = useSelector(selectAnomalyRate);

    const runTrend = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Analysis data is required'));
        return dispatch(analyzeTrend(data)).unwrap();
    }, [dispatch]);

    const runPerformance = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Analysis data is required'));
        return dispatch(analyzePerformance(data)).unwrap();
    }, [dispatch]);

    const runComparative = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Analysis data is required'));
        return dispatch(analyzeComparative(data)).unwrap();
    }, [dispatch]);

    const runPredictive = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Analysis data is required'));
        return dispatch(analyzePredictive(data)).unwrap();
    }, [dispatch]);

    const runAnomaly = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Analysis data is required'));
        return dispatch(detectAnomalies(data)).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setAnalyticsFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetAnalyticsFilters());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAnalytics());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearAnalyticsErrors());
    }, [dispatch]);

    const clearAllHistory = useCallback(() => {
        dispatch(clearHistory());
    }, [dispatch]);

    const setCurrent = useCallback((analysisType) => {
        dispatch(setCurrentAnalysis(analysisType));
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && initialFilters) {
            // Auto-fetch logic if needed
        }
    }, [autoFetch, initialFilters]);

    return useMemo(() => ({
        trend,
        performance,
        comparative,
        predictive,
        anomaly,
        loading,
        generating,
        error,
        currentAnalysis,
        history,
        filters,
        hasData,
        isLoading,
        hasError,
        trendData,
        trendPeriods,
        trendValues,
        trendDirection,
        trendGrowthRate,
        performanceSummary,
        performanceRankings,
        comparativeGroups,
        comparativeRankings,
        predictiveForecast,
        predictiveConfidence,
        anomalies,
        anomalySummary,
        anomalyRate,
        runTrend,
        runPerformance,
        runComparative,
        runPredictive,
        runAnomaly,
        updateFilters,
        resetAllFilters,
        clearAll,
        clearErrors,
        clearAllHistory,
        setCurrent,
    }), [
        trend,
        performance,
        comparative,
        predictive,
        anomaly,
        loading,
        generating,
        error,
        currentAnalysis,
        history,
        filters,
        hasData,
        isLoading,
        hasError,
        trendData,
        trendPeriods,
        trendValues,
        trendDirection,
        trendGrowthRate,
        performanceSummary,
        performanceRankings,
        comparativeGroups,
        comparativeRankings,
        predictiveForecast,
        predictiveConfidence,
        anomalies,
        anomalySummary,
        anomalyRate,
        runTrend,
        runPerformance,
        runComparative,
        runPredictive,
        runAnomaly,
        updateFilters,
        resetAllFilters,
        clearAll,
        clearErrors,
        clearAllHistory,
        setCurrent,
    ]);
};