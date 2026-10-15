// ============================================
// apps/reportplt/slice/preset.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { presetService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    presets: [],
    currentPreset: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { search: '', report: null, is_default: null },
};

export const fetchPresets = createAsyncThunk(
    'preset/fetchPresets',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await presetService.getPresets(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchPreset = createAsyncThunk(
    'preset/fetchPreset',
    async (id, { rejectWithValue }) => {
        try {
            const response = await presetService.getPreset(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createPreset = createAsyncThunk(
    'preset/createPreset',
    async (data, { rejectWithValue }) => {
        try {
            const response = await presetService.createPreset(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updatePreset = createAsyncThunk(
    'preset/updatePreset',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await presetService.updatePreset(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deletePreset = createAsyncThunk(
    'preset/deletePreset',
    async (id, { rejectWithValue }) => {
        try {
            await presetService.deletePreset(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const presetSlice = createSlice({
    name: 'preset',
    initialState,
    reducers: {
        clearCurrentPreset: (state) => {
            state.currentPreset = null;
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
        clearAllPresets: (state) => {
            state.presets = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPresets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPresets.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.presets = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchPresets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPreset.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchPreset.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentPreset = action.payload;
                const index = state.presets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.presets[index] = action.payload;
            })
            .addCase(fetchPreset.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createPreset.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createPreset.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentPreset = action.payload;
                state.presets.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createPreset.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updatePreset.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updatePreset.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentPreset = action.payload;
                const index = state.presets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.presets[index] = action.payload;
            })
            .addCase(updatePreset.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deletePreset.fulfilled, (state, action) => {
                state.presets = state.presets.filter(p => p.id !== action.payload);
                state.pagination.total -= 1;
            });
    },
});

export const {
    clearCurrentPreset,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllPresets,
} = presetSlice.actions;

// Aliases for compatibility
export const clearPresetErrors = clearErrors;
export const setPresetFilters = setFilters;
export const resetPresetFilters = resetFilters;
export const setPresetPagination = setPagination;

export default presetSlice.reducer;
