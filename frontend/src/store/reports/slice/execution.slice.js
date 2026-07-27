// ============================================
// apps/reportplt/slice/execution.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { executionService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    executions: [],
    currentExecution: null,
    executionLogs: [],
    loading: false,
    loadingDetails: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { status: null, report: null, triggered_by: null },
    statuses: [],
};

export const fetchExecutions = createAsyncThunk(
    'execution/fetchExecutions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await executionService.getExecutions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExecution = createAsyncThunk(
    'execution/fetchExecution',
    async (id, { rejectWithValue }) => {
        try {
            const response = await executionService.getExecution(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExecutionLogs = createAsyncThunk(
    'execution/fetchExecutionLogs',
    async (id, { rejectWithValue }) => {
        try {
            const response = await executionService.getExecutionLogs(id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExecutionsByReport = createAsyncThunk(
    'execution/fetchExecutionsByReport',
    async (reportId, { rejectWithValue }) => {
        try {
            const response = await executionService.getExecutionsByReport(reportId);
            return { reportId, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExecutionStatuses = createAsyncThunk(
    'execution/fetchExecutionStatuses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await executionService.getExecutionStatuses();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        clearCurrentExecution: (state) => {
            state.currentExecution = null;
            state.executionLogs = [];
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
        clearAllExecutions: (state) => {
            state.executions = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExecutions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExecutions.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.executions = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchExecutions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchExecution.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchExecution.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentExecution = action.payload;
            })
            .addCase(fetchExecution.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(fetchExecutionLogs.fulfilled, (state, action) => {
                state.executionLogs = action.payload.data || [];
            })
            .addCase(fetchExecutionStatuses.fulfilled, (state, action) => {
                state.statuses = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentExecution,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllExecutions,
} = executionSlice.actions;

// Aliases for compatibility with useExecutions hook
export const clearExecutionErrors = clearErrors;
export const setExecutionFilters = setFilters;
export const resetExecutionFilters = resetFilters;
export const setExecutionPagination = setPagination;

export default executionSlice.reducer;