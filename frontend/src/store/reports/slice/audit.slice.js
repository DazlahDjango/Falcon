// ============================================
// apps/reportplt/slice/audit.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    audits: [],
    currentAudit: null,
    loading: false,
    loadingDetails: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { action: null, report: null, user: null, success: null, ip_address: null },
    actions: [],
    stats: null,
};

export const fetchAudits = createAsyncThunk(
    'audit/fetchAudits',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await auditService.getAudits(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchAudit = createAsyncThunk(
    'audit/fetchAudit',
    async (id, { rejectWithValue }) => {
        try {
            const response = await auditService.getAudit(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchAuditsByReport = createAsyncThunk(
    'audit/fetchAuditsByReport',
    async (reportId, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditsByReport(reportId);
            return { reportId, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchAuditsByUser = createAsyncThunk(
    'audit/fetchAuditsByUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditsByUser(userId);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchAuditActions = createAsyncThunk(
    'audit/fetchAuditActions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditActions();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchAuditStats = createAsyncThunk(
    'audit/fetchAuditStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const auditSlice = createSlice({
    name: 'audit',
    initialState,
    reducers: {
        clearCurrentAudit: (state) => {
            state.currentAudit = null;
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearAllAudits: (state) => {
            state.audits = [];
            state.pagination = initialState.pagination;
        },
        clearStats: (state) => {
            state.stats = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAudits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAudits.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.audits = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchAudits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAudit.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchAudit.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentAudit = action.payload;
            })
            .addCase(fetchAudit.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(fetchAuditActions.fulfilled, (state, action) => {
                state.actions = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAuditStats.fulfilled, (state, action) => {
                state.stats = action.payload || null;
            });
    },
});

export const {
    clearCurrentAudit,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllAudits,
    clearStats,
} = auditSlice.actions;

// Aliases for compatibility with useAudits hook
export const clearAuditErrors = clearErrors;
export const setAuditFilters = setFilters;
export const resetAuditFilters = resetFilters;
export const setAuditPagination = setPagination;

export default auditSlice.reducer;