import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as auditApi from '../../../services/accounts/api/audit';

export const fetchAuditLogs = createAsyncThunk(
    'audit/fetchLogs',
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
    'audit/fetchLogById',
    async (logId, { rejectWithValue }) => {
        try {
            const response = await auditApi.getAuditLogById(logId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit log');
        }
    }
);

export const fetchUserAuditActivity = createAsyncThunk(
    'audit/fetchUserActivity',
    async ({ userId, days = 30 }, { rejectWithValue }) => {
        try {
            const response = await auditApi.getUserAuditActivity(userId, days);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user activity');
        }
    }
);

export const fetchUserAuditSummary = createAsyncThunk(
    'audit/fetchUserSummary',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await auditApi.getUserAuditSummary(days);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user summary');
        }
    }
);

export const fetchTenantAuditSummary = createAsyncThunk(
    'audit/fetchTenantSummary',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await auditApi.getTenantAuditSummary(days);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant summary');
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

export const fetchObjectHistory = createAsyncThunk(
    'audit/fetchObjectHistory',
    async ({ contentType, objectId }, { rejectWithValue }) => {
        try {
            const response = await auditApi.getObjectHistory(contentType, objectId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch object history');
        }
    }
);

export const fetchComplianceReport = createAsyncThunk(
    'audit/fetchComplianceReport',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await auditApi.getComplianceReport(startDate, endDate);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch compliance report');
        }
    }
);

export const exportAuditLogs = createAsyncThunk(
    'audit/exportLogs',
    async (data, { rejectWithValue }) => {
        try {
            const response = await auditApi.exportAuditLogs(data);
            return { data: response.data, format: data.format || 'json' };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to export audit logs');
        }
    }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
    logs: [],
    selectedLog: null,
    userActivity: null,
    userSummary: null,
    tenantSummary: null,
    securityEvents: [],
    objectHistory: [],
    complianceReport: null,
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

// ============================================================
// Slice
// ============================================================

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
        setPage: (state, action) => {
            state.pagination.current_page = action.payload;
        },
        clearSelectedLog: (state) => {
            state.selectedLog = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAudit: () => initialState
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
                state.logs = action.payload.results || action.payload || [];
                state.pagination = {
                    current_page: action.payload.current_page || 1,
                    total_pages: action.payload.total_pages || 1,
                    total_items: action.payload.count || state.logs.length,
                    page_size: action.payload.page_size || 20
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
            // Fetch User Audit Activity
            .addCase(fetchUserAuditActivity.fulfilled, (state, action) => {
                state.userActivity = action.payload;
            })
            // Fetch User Audit Summary
            .addCase(fetchUserAuditSummary.fulfilled, (state, action) => {
                state.userSummary = action.payload;
            })
            // Fetch Tenant Audit Summary
            .addCase(fetchTenantAuditSummary.fulfilled, (state, action) => {
                state.tenantSummary = action.payload;
            })
            // Fetch Security Events
            .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
                state.securityEvents = action.payload.events || action.payload || [];
            })
            // Fetch Object History
            .addCase(fetchObjectHistory.fulfilled, (state, action) => {
                state.objectHistory = action.payload.history || action.payload || [];
            })
            // Fetch Compliance Report
            .addCase(fetchComplianceReport.fulfilled, (state, action) => {
                state.complianceReport = action.payload;
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
export const { setFilters, resetFilters, setPage, clearSelectedLog, clearError, resetAudit } = auditSlice.actions;

export const selectAudit = (state) => state.audit;
export const selectAuditLogs = (state) => state.audit.logs;
export const selectSelectedLog = (state) => state.audit.selectedLog;
export const selectAuditPagination = (state) => state.audit.pagination;
export const selectAuditFilters = (state) => state.audit.filters;
export const selectSecurityEvents = (state) => state.audit.securityEvents;
export const selectComplianceReport = (state) => state.audit.complianceReport;
export const selectAuditLoading = (state) => state.audit.isLoading;
export const selectAuditError = (state) => state.audit.error;

export default auditSlice.reducer;