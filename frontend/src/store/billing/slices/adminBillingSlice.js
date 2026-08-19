import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AdminBillingService } from '../../../services/billing';

export const fetchTenantSubscriptions = createAsyncThunk('billing/admin/fetchTenantSubscriptions', async (tenantId, { rejectWithValue }) => {
    try {
        const response = await AdminBillingService.getTenantSubscriptions(tenantId);
        const raw = response?.data;
        const data = Array.isArray(raw) ? raw : (raw?.results || []);
        return { tenantId, data };
    }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch tenant subscriptions'); }
});

export const fetchTenantInvoices = createAsyncThunk('billing/admin/fetchTenantInvoices', async (tenantId, { rejectWithValue }) => {
    try {
        const response = await AdminBillingService.getTenantInvoices(tenantId);
        const raw = response?.data;
        const data = Array.isArray(raw) ? raw : (raw?.results || []);
        return { tenantId, data };
    }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch tenant invoices'); }
});

export const fetchTenantTransactions = createAsyncThunk('billing/admin/fetchTenantTransactions', async (tenantId, { rejectWithValue }) => {
    try {
        const response = await AdminBillingService.getTenantTransactions(tenantId);
        const raw = response?.data;
        const data = Array.isArray(raw) ? raw : (raw?.results || []);
        return { tenantId, data };
    }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch tenant transactions'); }
});

export const fetchRevenueReport = createAsyncThunk('billing/admin/fetchRevenueReport', async ({ startDate, endDate }, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getRevenueReport(startDate, endDate); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch revenue report'); }
});

export const fetchSubscriptionReport = createAsyncThunk('billing/admin/fetchSubscriptionReport', async ({ startDate, endDate }, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getSubscriptionReport(startDate, endDate); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch subscription report'); }
});

export const fetchTaxReport = createAsyncThunk('billing/admin/fetchTaxReport', async (year, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getTaxReport(year); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch tax report'); }
});

export const bulkUpdateSubscriptions = createAsyncThunk('billing/admin/bulkUpdate', async (updates, { rejectWithValue, dispatch }) => {
    try { const response = await AdminBillingService.bulkUpdateSubscriptions(updates); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to bulk update subscriptions'); }
});

const initialState = {
    tenantData: {}, revenueReport: null, subscriptionReport: null, taxReport: null,
    loading: false, error: null, bulkUpdateStatus: { loading: false, success: false, message: null },
};

const adminBillingSlice = createSlice({
    name: 'billing/admin', initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        clearTenantData: (state, action) => { if (action.payload) delete state.tenantData[action.payload]; else state.tenantData = {}; },
        clearReports: (state) => { state.revenueReport = null; state.subscriptionReport = null; state.taxReport = null; },
        resetBulkUpdate: (state) => { state.bulkUpdateStatus = { loading: false, success: false, message: null }; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTenantSubscriptions.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], subscriptions: action.payload.data }; });
        builder.addCase(fetchTenantInvoices.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], invoices: action.payload.data }; });
        builder.addCase(fetchTenantTransactions.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], transactions: action.payload.data }; });
        builder.addCase(fetchRevenueReport.fulfilled, (state, action) => { state.revenueReport = action.payload; });
        builder.addCase(fetchSubscriptionReport.fulfilled, (state, action) => { state.subscriptionReport = action.payload; });
        builder.addCase(fetchTaxReport.fulfilled, (state, action) => { state.taxReport = action.payload; });
        builder.addCase(bulkUpdateSubscriptions.pending, (state) => { state.bulkUpdateStatus = { loading: true, success: false, message: null }; });
        builder.addCase(bulkUpdateSubscriptions.fulfilled, (state, action) => { state.bulkUpdateStatus = { loading: false, success: true, message: action.payload?.message || 'Bulk update completed successfully' }; });
        builder.addCase(bulkUpdateSubscriptions.rejected, (state, action) => { state.bulkUpdateStatus = { loading: false, success: false, message: action.payload }; });
    },
});

export const { clearError, clearTenantData, clearReports, resetBulkUpdate } = adminBillingSlice.actions;
export default adminBillingSlice.reducer;