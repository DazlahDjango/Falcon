import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AdminBillingService } from '../../../services/billing';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchSystemMetrics = createAsyncThunk(
    'billing/admin/fetchMetrics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await AdminBillingService.getSystemMetrics();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch system metrics');
        }
    }
);

export const fetchAdminRevenueReport = createAsyncThunk(
    'billing/admin/fetchRevenueReport',
    async ({ startDate = null, endDate = null, groupBy = 'month' } = {}, { rejectWithValue }) => {
        try {
            const response = await AdminBillingService.getRevenueReport({ start_date: startDate, end_date: endDate, group_by: groupBy });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch revenue report');
        }
    }
);

export const fetchAdminSubscriptionReport = createAsyncThunk(
    'billing/admin/fetchSubscriptionReport',
    async ({ status = null, planType = null } = {}, { rejectWithValue }) => {
        try {
            const response = await AdminBillingService.getSubscriptionReport({ status, plan_type: planType });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subscription report');
        }
    }
);

export const fetchAdminTaxReport = createAsyncThunk(
    'billing/admin/fetchTaxReport',
    async ({ year = null, country = null } = {}, { rejectWithValue }) => {
        try {
            const response = await AdminBillingService.getTaxReport({ year, country });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tax report');
        }
    }
);

export const fetchTenantBillingData = createAsyncThunk(
    'billing/admin/fetchTenantData',
    async (tenantId, { rejectWithValue }) => {
        try {
            const [subscriptions, invoices, transactions] = await Promise.all([
                AdminBillingService.getTenantSubscriptions(tenantId),
                AdminBillingService.getTenantInvoices(tenantId),
                AdminBillingService.getTenantTransactions(tenantId),
            ]);
            return {
                tenantId,
                subscriptions: subscriptions?.data || [],
                invoices: invoices?.data || [],
                transactions: transactions?.data || [],
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tenant billing data');
        }
    }
);

export const bulkUpdateSubscriptions = createAsyncThunk(
    'billing/admin/bulkUpdate',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await AdminBillingService.bulkUpdateSubscriptions(updates);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to bulk update subscriptions');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    systemMetrics: null,
    revenueReport: null,
    subscriptionReport: null,
    taxReport: null,
    currentTenantData: {
        tenantId: null,
        subscriptions: [],
        invoices: [],
        transactions: [],
    },
    loading: false,
    error: null,
    bulkUpdateLoading: false,
    lastFetched: null,
};

// ============================================================================
// Slice
// ============================================================================

const adminBillingSlice = createSlice({
    name: 'billing/admin',
    initialState,
    reducers: {
        clearCurrentTenantData: (state) => {
            state.currentTenantData = initialState.currentTenantData;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearAllAdminData: (state) => {
            state.systemMetrics = null;
            state.revenueReport = null;
            state.subscriptionReport = null;
            state.taxReport = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch System Metrics
        builder.addCase(fetchSystemMetrics.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSystemMetrics.fulfilled, (state, action) => {
            state.loading = false;
            state.systemMetrics = action.payload;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchSystemMetrics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Admin Revenue Report
        builder.addCase(fetchAdminRevenueReport.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAdminRevenueReport.fulfilled, (state, action) => {
            state.loading = false;
            state.revenueReport = action.payload;
        });
        builder.addCase(fetchAdminRevenueReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Admin Subscription Report
        builder.addCase(fetchAdminSubscriptionReport.fulfilled, (state, action) => {
            state.subscriptionReport = action.payload;
        });

        // Fetch Admin Tax Report
        builder.addCase(fetchAdminTaxReport.fulfilled, (state, action) => {
            state.taxReport = action.payload;
        });

        // Fetch Tenant Billing Data
        builder.addCase(fetchTenantBillingData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTenantBillingData.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTenantData = action.payload;
        });
        builder.addCase(fetchTenantBillingData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Bulk Update Subscriptions
        builder.addCase(bulkUpdateSubscriptions.pending, (state) => {
            state.bulkUpdateLoading = true;
        });
        builder.addCase(bulkUpdateSubscriptions.fulfilled, (state) => {
            state.bulkUpdateLoading = false;
        });
        builder.addCase(bulkUpdateSubscriptions.rejected, (state, action) => {
            state.bulkUpdateLoading = false;
            state.error = action.payload;
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    clearCurrentTenantData,
    clearError,
    clearAllAdminData,
} = adminBillingSlice.actions;

export default adminBillingSlice.reducer;