// ============================================
// apps/reportplt/slice/export.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exportService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    exports: [],
    currentExport: null,
    myExports: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    downloading: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { format: null, status: null, report: null, exported_by: null },
    formats: [],
};

export const fetchExports = createAsyncThunk(
    'export/fetchExports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await exportService.getExports(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExport = createAsyncThunk(
    'export/fetchExport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await exportService.getExport(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createExport = createAsyncThunk(
    'export/createExport',
    async (data, { rejectWithValue }) => {
        try {
            const response = await exportService.createExport(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const downloadExport = createAsyncThunk(
    'export/downloadExport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await exportService.downloadExport(id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const regenerateExport = createAsyncThunk(
    'export/regenerateExport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await exportService.regenerateExport(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchMyExports = createAsyncThunk(
    'export/fetchMyExports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await exportService.getMyExports(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchExportFormats = createAsyncThunk(
    'export/fetchExportFormats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await exportService.getExportFormats();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteExport = createAsyncThunk(
    'export/deleteExport',
    async (id, { rejectWithValue }) => {
        try {
            await exportService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const exportSlice = createSlice({
    name: 'export',
    initialState,
    reducers: {
        clearCurrentExport: (state) => {
            state.currentExport = null;
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
        clearAllExports: (state) => {
            state.exports = [];
            state.myExports = [];
            state.pagination = initialState.pagination;
        },
        resetDownloading: (state) => {
            state.downloading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExports.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.exports = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchExports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchExport.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchExport.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentExport = action.payload;
            })
            .addCase(fetchExport.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createExport.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createExport.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentExport = action.payload;
                state.exports.unshift(action.payload);
                state.pagination.total += 1;
                if (action.payload?.exported_by === state.myExports?.[0]?.exported_by) {
                    state.myExports.unshift(action.payload);
                }
            })
            .addCase(createExport.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(downloadExport.pending, (state) => {
                state.downloading = true;
                state.error = null;
            })
            .addCase(downloadExport.fulfilled, (state) => {
                state.downloading = false;
            })
            .addCase(downloadExport.rejected, (state, action) => {
                state.downloading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyExports.fulfilled, (state, action) => {
                state.myExports = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
            })
            .addCase(fetchExportFormats.fulfilled, (state, action) => {
                state.formats = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(deleteExport.fulfilled, (state, action) => {
                state.exports = state.exports.filter(e => e.id !== action.payload);
                state.myExports = state.myExports.filter(e => e.id !== action.payload);
                state.pagination.total -= 1;
            });
    },
});

export const {
    clearCurrentExport,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllExports,
    resetDownloading,
} = exportSlice.actions;

// Aliases for compatibility with useExports hook
export const clearExportErrors = clearErrors;
export const setExportFilters = setFilters;
export const resetExportFilters = resetFilters;
export const setExportPagination = setPagination;

export default exportSlice.reducer;