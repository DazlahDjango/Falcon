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
    async ({ period = 'month', year = null } = {}, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getRevenueReport(period, year);
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

export const fetchAdminRevenue = createAsyncThunk(
    'billing/analytics/fetchAdminRevenue',
    async (year = null, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getAdminRevenue(year);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch admin revenue report');
        }
    }
);

export const fetchAdminSubscriptions = createAsyncThunk(
    'billing/analytics/fetchAdminSubscriptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BillingAnalyticsService.getAdminSubscriptions();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch admin subscription analytics');
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
    adminRevenue: null,
    adminSubscriptions: null,
    loading: false,
    error: null,
    lastFetched: {
        summary: null,
        revenue: null,
        subscriptions: null,
        adminRevenue: null,
        adminSubscriptions: null,
    },
    dateRange: {
        period: 'month',
        year: null,
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
            state.adminRevenue = null;
            state.adminSubscriptions = null;
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

        // Fetch Admin Revenue
        builder.addCase(fetchAdminRevenue.fulfilled, (state, action) => {
            state.adminRevenue = action.payload;
            state.lastFetched.adminRevenue = Date.now();
        });

        // Fetch Admin Subscriptions
        builder.addCase(fetchAdminSubscriptions.fulfilled, (state, action) => {
            state.adminSubscriptions = action.payload;
            state.lastFetched.adminSubscriptions = Date.now();
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