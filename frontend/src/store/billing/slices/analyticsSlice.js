import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BillingAnalyticsService } from '../../../services/billing';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchBillingSummary = createAsyncThunk(
    'billing/analytics/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getBillingSummary();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch billing summary');
        }
    }
);

export const fetchRevenueReport = createAsyncThunk(
    'billing/analytics/fetchRevenue',
    async ({ days = 30, period = 'daily', startDate = null, endDate = null } = {}, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getRevenueReport({ days, period, start_date: startDate, end_date: endDate });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch revenue report');
        }
    }
);

export const fetchSubscriptionAnalytics = createAsyncThunk(
    'billing/analytics/fetchSubscriptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getSubscriptionAnalytics();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subscription analytics');
        }
    }
);

export const fetchRevenueForecast = createAsyncThunk(
    'billing/analytics/fetchForecast',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getRevenueForecast();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch revenue forecast');
        }
    }
);

export const fetchTaxReport = createAsyncThunk(
    'billing/analytics/fetchTax',
    async (year = null, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getTaxReport({ year: year || new Date().getFullYear() });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tax report');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    summary: null,
    revenue: null,
    subscriptions: null,
    forecast: null,
    taxReport: null,
    loading: false,
    error: null,
    lastFetched: {
        summary: null,
        revenue: null,
        subscriptions: null,
        forecast: null,
        tax: null,
    },
    dateRange: {
        days: 30,
        period: 'daily',
        startDate: null,
        endDate: null,
    },
};

// ============================================================================
// Slice
// ============================================================================

const analyticsSlice = createSlice({
    name: 'billing/analytics',
    initialState,
    reducers: {
        setDateRange: (state, action) => {
            state.dateRange = { ...state.dateRange, ...action.payload };
        },
        clearAnalytics: (state) => {
            state.summary = null;
            state.revenue = null;
            state.subscriptions = null;
            state.forecast = null;
            state.taxReport = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Billing Summary
        builder.addCase(fetchBillingSummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBillingSummary.fulfilled, (state, action) => {
            state.loading = false;
            state.summary = action.payload;
            state.lastFetched.summary = Date.now();
        });
        builder.addCase(fetchBillingSummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Revenue Report
        builder.addCase(fetchRevenueReport.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRevenueReport.fulfilled, (state, action) => {
            state.loading = false;
            state.revenue = action.payload;
            state.lastFetched.revenue = Date.now();
        });
        builder.addCase(fetchRevenueReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Subscription Analytics
        builder.addCase(fetchSubscriptionAnalytics.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSubscriptionAnalytics.fulfilled, (state, action) => {
            state.loading = false;
            state.subscriptions = action.payload;
            state.lastFetched.subscriptions = Date.now();
        });
        builder.addCase(fetchSubscriptionAnalytics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Revenue Forecast
        builder.addCase(fetchRevenueForecast.fulfilled, (state, action) => {
            state.forecast = action.payload;
            state.lastFetched.forecast = Date.now();
        });

        // Fetch Tax Report
        builder.addCase(fetchTaxReport.fulfilled, (state, action) => {
            state.taxReport = action.payload;
            state.lastFetched.tax = Date.now();
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setDateRange,
    clearAnalytics,
    clearError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;