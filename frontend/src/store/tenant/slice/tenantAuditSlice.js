// frontend/src/store/tenant/slice/tenantAuditSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService } from '../../../services/tenant';

export const fetchAuditLogs = createAsyncThunk(
    'tenantAudit/fetchAuditLogs',
    async ({ tenantId, params }, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenantAuditLogs(tenantId, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const exportAuditLogs = createAsyncThunk(
    'tenantAudit/exportAuditLogs',
    async ({ tenantId, format, filters }, { rejectWithValue }) => {
        try {
            const blob = await TenantService.exportData(format, { tenant_id: tenantId, type: 'audit', ...filters });
            return blob;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    logs: [],
    total: 0,
    page: 1,
    pageSize: 20,
    filters: {},
    loading: false,
    error: null,
    exporting: false,
    selectedLog: null,
};

const tenantAuditSlice = createSlice({
    name: 'tenantAudit',
    initialState,
    reducers: {
        setAuditPage: (state, action) => {
            state.page = action.payload;
        },
        setAuditPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.page = 1;
        },
        setAuditFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
        },
        clearAuditFilters: (state) => {
            state.filters = {};
            state.page = 1;
        },
        setSelectedLog: (state, action) => {
            state.selectedLog = action.payload;
        },
        clearAuditError: (state) => {
            state.error = null;
        },
        resetAuditState: (state) => {
            state.logs = [];
            state.total = 0;
            state.page = 1;
            state.filters = {};
            state.selectedLog = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.results || action.payload;
                state.total = action.payload.count || action.payload.length;
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(exportAuditLogs.pending, (state) => {
                state.exporting = true;
            })
            .addCase(exportAuditLogs.fulfilled, (state) => {
                state.exporting = false;
            })
            .addCase(exportAuditLogs.rejected, (state, action) => {
                state.exporting = false;
                state.error = action.payload;
            });
    },
});

export const {
    setAuditPage,
    setAuditPageSize,
    setAuditFilters,
    clearAuditFilters,
    setSelectedLog,
    clearAuditError,
    resetAuditState,
} = tenantAuditSlice.actions;

export default tenantAuditSlice.reducer;