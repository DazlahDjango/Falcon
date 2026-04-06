import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as auditApi from '../../../services/accounts/api/audit';

// Async Thunks
// =============
export const fetchAuditLogs = createAsyncThunk(
    'audit/fetch',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await auditApi.getAuditLogs(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs');
        }
    }
);
export const fetchAuditLogById = createAsyncThunk(
    'audit/fetchById',
    async (logId, { rejectWithValue }) => {
        try {
            const response = await auditApi.getAuditLogById(logId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit log');
        }
    }
);
export const fetchUserActivity = createAsyncThunk(
    'audit/fetchUserActivity',
    async ({ userId, days = 30 }, { rejectWithValue }) => {
        try {
            const response = await auditApi.getUserActivity(userId, days);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user activity');
        }
    }
);
export const fetchSecurityEvents = createAsyncThunk(
    'audit/fetchSecurityEvents',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await auditApi.getSecurityEvents(days);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch security events');
        }
    }
);
export const exportAuditLogs = createAsyncThunk(
    'audit/export',
    async ({ format, filters }, { rejectWithValue }) => {
        try {
            const response = await auditApi.exportAuditLogs({ format, ...filters });
            return { data: response.data, format };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to export audit logs');
        }
    }
);

// Initial State
// ===============
const initialState = {
    logs: [],
    selectedLog: null,
    userActivity: null,
    securityEvents: [],
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 20
    },
    filters: {
        action: '',
        action_type: '',
        severity: '',
        user_id: '',
        start_date: '',
        end_date: '',
        ip_address: ''
    },
    isLoading: false,
    error: null,
    exporting: false
};

// Slice
// =======
const auditSlice = createSlice({
    name: 'audit',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.current_page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.current_page = 1;
        },
        clearSelectedLog: (state) => {
            state.selectedLog = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Audit Logs
            .addCase(fetchAuditLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.results;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Audit Log By ID
            .addCase(fetchAuditLogById.fulfilled, (state, action) => {
                state.selectedLog = action.payload;
            })
            // Fetch User Activity
            .addCase(fetchUserActivity.fulfilled, (state, action) => {
                state.userActivity = action.payload;
            })
            // Fetch Security Events
            .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
                state.securityEvents = action.payload.events;
            })
            // Export Audit Logs
            .addCase(exportAuditLogs.pending, (state) => {
                state.exporting = true;
            })
            .addCase(exportAuditLogs.fulfilled, (state) => {
                state.exporting = false;
            })
            .addCase(exportAuditLogs.rejected, (state) => {
                state.exporting = false;
            });
    }
});
export const { setFilters, resetFilters, clearSelectedLog, clearError } = auditSlice.actions;

export default auditSlice.reducer;