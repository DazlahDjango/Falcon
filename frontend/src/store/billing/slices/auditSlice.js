import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuditService } from '../../../services/billing';

export const fetchAuditLogs = createAsyncThunk('billing/audit/fetchAll', async ({ page = 1, pageSize = 50, filters = {} } = {}, { rejectWithValue }) => {
    try {
        const response = await AuditService.filterLogs({ page, page_size: pageSize, ...filters });
        const data = response?.data;
        let items = [];
        let total = 0;
        if (Array.isArray(data)) {
            items = data;
            total = data.length;
        } else if (data && Array.isArray(data.results)) {
            items = data.results;
            total = data.count || data.results.length;
        } else if (data) {
            items = data.items || [];
            total = data.total || items.length;
        }
        return { items, total, page, pageSize };
    }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch audit logs'); }
});

export const fetchAuditSummary = createAsyncThunk('billing/audit/fetchSummary', async ({ days = 30 } = {}, { rejectWithValue }) => {
    try { const response = await AuditService.getAuditSummary(days); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch audit summary'); }
});

export const exportAuditLogs = createAsyncThunk('billing/audit/export', async ({ days = 30, format = 'csv' } = {}, { rejectWithValue }) => {
    try { const response = await AuditService.exportLogs(days); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to export audit logs'); }
});

const initialState = {
    items: [], summary: null, pagination: { page: 1, pageSize: 50, total: 0 }, loading: false, exporting: false, error: null, filters: { startDate: null, endDate: null, action: null, resourceType: null, userEmail: null, success: null },
};

const auditSlice = createSlice({
    name: 'billing/audit', initialState,
    reducers: {
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; state.pagination.page = 1; },
        clearFilters: (state) => { state.filters = initialState.filters; state.pagination.page = 1; },
        setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAuditLogs.pending, (state) => { state.loading = true; });
        builder.addCase(fetchAuditLogs.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.items; state.pagination = { page: action.payload.page, pageSize: action.payload.pageSize, total: action.payload.total }; });
        builder.addCase(fetchAuditLogs.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(fetchAuditSummary.fulfilled, (state, action) => { state.summary = action.payload; });
        builder.addCase(exportAuditLogs.pending, (state) => { state.exporting = true; });
        builder.addCase(exportAuditLogs.fulfilled, (state) => { state.exporting = false; });
        builder.addCase(exportAuditLogs.rejected, (state) => { state.exporting = false; });
    },
});

export const { setFilters, clearFilters, setPagination, clearError } = auditSlice.actions;
export default auditSlice.reducer;