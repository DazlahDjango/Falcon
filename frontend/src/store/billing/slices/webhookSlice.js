import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WebhookService } from '../../../services/billing';

export const fetchWebhookLogs = createAsyncThunk('billing/webhook/fetchLogs', async ({ page = 1, pageSize = 50, eventType = null } = {}, { rejectWithValue }) => {
    try {
        const response = await WebhookService.getWebhookLogs({ page, page_size: pageSize, event_type: eventType });
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
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch webhook logs'); }
});

export const retryWebhook = createAsyncThunk('billing/webhook/retry', async (id, { rejectWithValue, dispatch }) => {
    try { const response = await WebhookService.retryWebhook(id); await dispatch(fetchWebhookLogs({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to retry webhook'); }
});

const initialState = {
    logs: [], selectedLog: null, pagination: { page: 1, pageSize: 50, total: 0 }, loading: false, error: null, stats: { total: 0, processed: 0, failed: 0, pending: 0, successRate: 0 },
};

const webhookSlice = createSlice({
    name: 'billing/webhook', initialState,
    reducers: {
        setSelectedLog: (state, action) => { state.selectedLog = action.payload; },
        clearError: (state) => { state.error = null; },
        updateStats: (state) => {
            const logs = state.logs;
            state.stats = { total: logs.length, processed: logs.filter(l => l.processing_status === 'processed').length, failed: logs.filter(l => l.processing_status === 'failed').length, pending: logs.filter(l => l.processing_status === 'pending').length, successRate: logs.length ? (logs.filter(l => l.processing_status === 'processed').length / logs.length) * 100 : 0 };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWebhookLogs.pending, (state) => { state.loading = true; });
        builder.addCase(fetchWebhookLogs.fulfilled, (state, action) => { state.loading = false; state.logs = action.payload.items; state.pagination = { page: action.payload.page, pageSize: action.payload.pageSize, total: action.payload.total }; webhookSlice.caseReducers.updateStats(state); });
        builder.addCase(fetchWebhookLogs.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { setSelectedLog, clearError } = webhookSlice.actions;
export default webhookSlice.reducer;