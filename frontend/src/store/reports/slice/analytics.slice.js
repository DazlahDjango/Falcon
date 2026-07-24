// ============================================
// apps/reportplt/slice/analytics.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

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

export const analyzeTrend = createAsyncThunk(
    'analytics/analyzeTrend',
    async (data, { rejectWithValue }) => {
        try {
            const response = await analyticsService.trendAnalysis(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const analyzePerformance = createAsyncThunk(
    'analytics/analyzePerformance',
    async (data, { rejectWithValue }) => {
        try {
            const response = await analyticsService.performanceAnalysis(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const analyzeComparative = createAsyncThunk(
    'analytics/analyzeComparative',
    async (data, { rejectWithValue }) => {
        try {
            const response = await analyticsService.comparativeAnalysis(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const analyzePredictive = createAsyncThunk(
    'analytics/analyzePredictive',
    async (data, { rejectWithValue }) => {
        try {
            const response = await analyticsService.predictiveAnalysis(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const detectAnomalies = createAsyncThunk(
    'analytics/detectAnomalies',
    async (data, { rejectWithValue }) => {
        try {
            const response = await analyticsService.anomalyDetection(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalytics: (state) => {
            state.trend = null;
            state.performance = null;
            state.comparative = null;
            state.predictive = null;
            state.anomaly = null;
            state.currentAnalysis = null;
            state.error = null;
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearHistory: (state) => {
            state.history = [];
        },
        setCurrentAnalysis: (state, action) => {
            state.currentAnalysis = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeTrend.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(analyzeTrend.fulfilled, (state, action) => {
                state.generating = false;
                state.trend = action.payload;
                state.currentAnalysis = 'trend';
                state.history.unshift({ type: 'trend', data: action.payload, timestamp: new Date().toISOString() });
            })
            .addCase(analyzeTrend.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            })
            .addCase(analyzePerformance.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(analyzePerformance.fulfilled, (state, action) => {
                state.generating = false;
                state.performance = action.payload;
                state.currentAnalysis = 'performance';
                state.history.unshift({ type: 'performance', data: action.payload, timestamp: new Date().toISOString() });
            })
            .addCase(analyzePerformance.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            })
            .addCase(analyzeComparative.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(analyzeComparative.fulfilled, (state, action) => {
                state.generating = false;
                state.comparative = action.payload;
                state.currentAnalysis = 'comparative';
                state.history.unshift({ type: 'comparative', data: action.payload, timestamp: new Date().toISOString() });
            })
            .addCase(analyzeComparative.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            })
            .addCase(analyzePredictive.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(analyzePredictive.fulfilled, (state, action) => {
                state.generating = false;
                state.predictive = action.payload;
                state.currentAnalysis = 'predictive';
                state.history.unshift({ type: 'predictive', data: action.payload, timestamp: new Date().toISOString() });
            })
            .addCase(analyzePredictive.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            })
            .addCase(detectAnomalies.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(detectAnomalies.fulfilled, (state, action) => {
                state.generating = false;
                state.anomaly = action.payload;
                state.currentAnalysis = 'anomaly';
                state.history.unshift({ type: 'anomaly', data: action.payload, timestamp: new Date().toISOString() });
            })
            .addCase(detectAnomalies.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearAnalytics,
    clearErrors,
    setFilters,
    resetFilters,
    clearHistory,
    setCurrentAnalysis,
} = analyticsSlice.actions;

// Aliases for compatibility with useAnalytics hook
export const clearAnalyticsErrors = clearErrors;
export const setAnalyticsFilters = setFilters;
export const resetAnalyticsFilters = resetFilters;

export default analyticsSlice.reducer;