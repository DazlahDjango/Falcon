import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    insights: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    predictions: {
        data: null,
        loading: false,
        error: null,
    },
    trends: {
        data: [],
        loading: false,
    },
    period: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    },
};

const analyticsSlice = createSlice({
    name: 'kpiAnalytics',
    initialState,
    reducers: {
        fetchInsightsStart: (state) => {
            state.insights.loading = true;
            state.insights.error = null;
        },
        fetchInsightsSuccess: (state, action) => {
            state.insights.loading = false;
            state.insights.data = action.payload;
            state.insights.lastUpdated = new Date().toISOString();
        },
        fetchInsightsFailure: (state, action) => {
            state.insights.loading = false;
            state.insights.error = action.payload;
        },
        
        fetchPredictionsStart: (state) => {
            state.predictions.loading = true;
            state.predictions.error = null;
        },
        fetchPredictionsSuccess: (state, action) => {
            state.predictions.loading = false;
            state.predictions.data = action.payload;
        },
        fetchPredictionsFailure: (state, action) => {
            state.predictions.loading = false;
            state.predictions.error = action.payload;
        },
        
        fetchTrendsStart: (state) => {
            state.trends.loading = true;
        },
        fetchTrendsSuccess: (state, action) => {
            state.trends.loading = false;
            state.trends.data = action.payload;
        },
        fetchTrendsFailure: (state) => {
            state.trends.loading = false;
        },
        
        setAnalyticsPeriod: (state, action) => {
            state.period = { ...state.period, ...action.payload };
        },
        
        clearAnalytics: (state) => {
            state.insights.data = null;
            state.predictions.data = null;
            state.trends.data = [];
        },
    },
});

export const {
    fetchInsightsStart,
    fetchInsightsSuccess,
    fetchInsightsFailure,
    fetchPredictionsStart,
    fetchPredictionsSuccess,
    fetchPredictionsFailure,
    fetchTrendsStart,
    fetchTrendsSuccess,
    fetchTrendsFailure,
    setAnalyticsPeriod,
    clearAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;