// ============================================
// apps/reportplt/slice/distribution.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { distributionService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    distributions: [],
    currentDistribution: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { search: '', is_active: null },
};

export const fetchDistributions = createAsyncThunk(
    'distribution/fetchDistributions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await distributionService.getDistributions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDistribution = createAsyncThunk(
    'distribution/fetchDistribution',
    async (id, { rejectWithValue }) => {
        try {
            const response = await distributionService.getDistribution(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createDistribution = createAsyncThunk(
    'distribution/createDistribution',
    async (data, { rejectWithValue }) => {
        try {
            const response = await distributionService.createDistribution(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateDistribution = createAsyncThunk(
    'distribution/updateDistribution',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await distributionService.updateDistribution(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteDistribution = createAsyncThunk(
    'distribution/deleteDistribution',
    async (id, { rejectWithValue }) => {
        try {
            await distributionService.deleteDistribution(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const distributionSlice = createSlice({
    name: 'distribution',
    initialState,
    reducers: {
        clearCurrentDistribution: (state) => {
            state.currentDistribution = null;
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
        clearAllDistributions: (state) => {
            state.distributions = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDistributions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDistributions.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.distributions = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchDistributions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDistribution.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchDistribution.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentDistribution = action.payload;
                const index = state.distributions.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.distributions[index] = action.payload;
            })
            .addCase(fetchDistribution.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createDistribution.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createDistribution.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentDistribution = action.payload;
                state.distributions.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createDistribution.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateDistribution.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateDistribution.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentDistribution = action.payload;
                const index = state.distributions.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.distributions[index] = action.payload;
            })
            .addCase(updateDistribution.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteDistribution.fulfilled, (state, action) => {
                state.distributions = state.distributions.filter(d => d.id !== action.payload);
                state.pagination.total -= 1;
            });
    },
});

export const {
    clearCurrentDistribution,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllDistributions,
} = distributionSlice.actions;

// Aliases for compatibility
export const clearDistributionErrors = clearErrors;
export const setDistributionFilters = setFilters;
export const resetDistributionFilters = resetFilters;
export const setDistributionPagination = setPagination;

export default distributionSlice.reducer;
