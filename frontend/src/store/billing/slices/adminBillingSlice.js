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

export const fetchRevenueReport = createAsyncThunk('billing/admin/fetchRevenueReport', async (year = null, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getRevenueReport(year); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch revenue report'); }
});

export const fetchSubscriptionReport = createAsyncThunk('billing/admin/fetchSubscriptionReport', async (_, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getSubscriptionReport(); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch subscription report'); }
});

export const fetchTransactionStats = createAsyncThunk('billing/admin/fetchTransactionStats', async (year = null, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getTransactionStats(year); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch transaction stats'); }
});

export const fetchOverdueInvoices = createAsyncThunk('billing/admin/fetchOverdueInvoices', async (_, { rejectWithValue }) => {
    try { const response = await AdminBillingService.getOverdueInvoices(); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch overdue invoices'); }
});

const initialState = {
    tenantData: {}, revenueReport: null, subscriptionReport: null, transactionStats: null, overdueInvoices: [],
    loading: false, error: null,
};

const adminBillingSlice = createSlice({
    name: 'billing/admin', initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        clearTenantData: (state, action) => { if (action.payload) delete state.tenantData[action.payload]; else state.tenantData = {}; },
        clearReports: (state) => { state.revenueReport = null; state.subscriptionReport = null; state.transactionStats = null; state.overdueInvoices = []; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTenantSubscriptions.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], subscriptions: action.payload.data }; });
        builder.addCase(fetchTenantInvoices.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], invoices: action.payload.data }; });
        builder.addCase(fetchTenantTransactions.fulfilled, (state, action) => { state.tenantData[action.payload.tenantId] = { ...state.tenantData[action.payload.tenantId], transactions: action.payload.data }; });
        builder.addCase(fetchRevenueReport.fulfilled, (state, action) => { state.revenueReport = action.payload; });
        builder.addCase(fetchSubscriptionReport.fulfilled, (state, action) => { state.subscriptionReport = action.payload; });
        builder.addCase(fetchTransactionStats.fulfilled, (state, action) => { state.transactionStats = action.payload; });
        builder.addCase(fetchOverdueInvoices.fulfilled, (state, action) => { state.overdueInvoices = action.payload; });
    },
});

export const { clearError, clearTenantData, clearReports } = adminBillingSlice.actions;
export default adminBillingSlice.reducer;