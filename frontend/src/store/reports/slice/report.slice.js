// ============================================
// apps/reportplt/slice/report.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    reports: [],
    currentReport: null,
    myReports: [],
    publicReports: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    generating: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { report_type: null, domain: null, data_source: null, status: null, category: null, is_published: null, is_archived: null, search: '' },
    types: [],
    statuses: [],
    categories: [],
    formats: [],
    generationStatus: null,
    generationProgress: 0,
};

export const fetchReports = createAsyncThunk(
    'report/fetchReports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await reportService.getReports(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchReport = createAsyncThunk(
    'report/fetchReport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await reportService.getReport(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createReport = createAsyncThunk(
    'report/createReport',
    async (data, { rejectWithValue }) => {
        try {
            const response = await reportService.createReport(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateReport = createAsyncThunk(
    'report/updateReport',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await reportService.updateReport(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteReport = createAsyncThunk(
    'report/deleteReport',
    async (id, { rejectWithValue }) => {
        try {
            await reportService.deleteReport(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const generateReport = createAsyncThunk(
    'report/generateReport',
    async ({ id, params = {} }, { rejectWithValue }) => {
        try {
            const response = await reportService.generateReport(id, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const exportReport = createAsyncThunk(
    'report/exportReport',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await reportService.exportReport(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateReportStatus = createAsyncThunk(
    'report/updateReportStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await reportService.updateReportStatus(id, status);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const performReportAction = createAsyncThunk(
    'report/performAction',
    async ({ id, action, data = {} }, { rejectWithValue }) => {
        try {
            const response = await reportService.performAction(id, action, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchMyReports = createAsyncThunk(
    'report/fetchMyReports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await reportService.getMyReports(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchPublicReports = createAsyncThunk(
    'report/fetchPublicReports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await reportService.getPublicReports(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchReportTypes = createAsyncThunk(
    'report/fetchReportTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reportService.getReportTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchReportStatuses = createAsyncThunk(
    'report/fetchReportStatuses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reportService.getReportStatuses();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        clearCurrentReport: (state) => {
            state.currentReport = null;
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
        clearAllReports: (state) => {
            state.reports = [];
            state.myReports = [];
            state.publicReports = [];
            state.pagination = initialState.pagination;
        },
        updateGenerationProgress: (state, action) => {
            state.generationProgress = action.payload;
        },
        resetGenerationStatus: (state) => {
            state.generationStatus = null;
            state.generationProgress = 0;
            state.generating = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.reports = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchReport.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchReport.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentReport = action.payload;
                const index = state.reports.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.reports[index] = action.payload;
            })
            .addCase(fetchReport.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createReport.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createReport.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentReport = action.payload;
                state.reports.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createReport.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateReport.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateReport.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentReport = action.payload;
                const index = state.reports.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.reports[index] = action.payload;
            })
            .addCase(updateReport.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                state.reports = state.reports.filter(r => r.id !== action.payload);
                state.myReports = state.myReports.filter(r => r.id !== action.payload);
                state.publicReports = state.publicReports.filter(r => r.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(generateReport.pending, (state) => {
                state.generating = true;
                state.generationStatus = 'pending';
                state.generationProgress = 0;
                state.error = null;
            })
            .addCase(generateReport.fulfilled, (state, action) => {
                state.generating = false;
                state.generationStatus = 'completed';
                state.generationProgress = 100;
                if (action.payload?.report_id) {
                    const index = state.reports.findIndex(r => r.id === action.payload.report_id);
                    if (index !== -1) {
                        state.reports[index] = { ...state.reports[index], status: 'completed', last_generated_at: new Date().toISOString() };
                    }
                }
            })
            .addCase(generateReport.rejected, (state, action) => {
                state.generating = false;
                state.generationStatus = 'failed';
                state.error = action.payload;
            })
            .addCase(updateReportStatus.fulfilled, (state, action) => {
                const index = state.reports.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.reports[index] = action.payload;
                if (state.currentReport?.id === action.payload.id) state.currentReport = action.payload;
            })
            .addCase(performReportAction.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.reports.findIndex(r => r.id === action.payload.id);
                    if (index !== -1) state.reports[index] = action.payload;
                    if (state.currentReport?.id === action.payload.id) state.currentReport = action.payload;
                }
            })
            .addCase(fetchMyReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyReports.fulfilled, (state, action) => {
                state.loading = false;
                state.myReports = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
            })
            .addCase(fetchMyReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPublicReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPublicReports.fulfilled, (state, action) => {
                state.loading = false;
                state.publicReports = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
            })
            .addCase(fetchPublicReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchReportTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchReportStatuses.fulfilled, (state, action) => {
                state.statuses = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentReport,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllReports,
    updateGenerationProgress,
    resetGenerationStatus,
} = reportSlice.actions;

// Aliases for compatibility with useReports hook
export const clearReportErrors = clearErrors;
export const setReportFilters = setFilters;
export const resetReportFilters = resetFilters;
export const setReportPagination = setPagination;

export default reportSlice.reducer;