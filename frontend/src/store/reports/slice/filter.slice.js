// ============================================
// apps/reportplt/slice/filter.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { filterService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    filters: [],
    currentFilter: null,
    globalFilters: [],
    myFilters: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filtersState: { filter_type: null, is_global: null, is_system: null, is_default: null, search: '' },
    types: [],
    appliedFilters: {},
};

export const fetchFilters = createAsyncThunk(
    'filter/fetchFilters',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await filterService.getFilters(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchFilter = createAsyncThunk(
    'filter/fetchFilter',
    async (id, { rejectWithValue }) => {
        try {
            const response = await filterService.getFilter(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createFilter = createAsyncThunk(
    'filter/createFilter',
    async (data, { rejectWithValue }) => {
        try {
            const response = await filterService.createFilter(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateFilter = createAsyncThunk(
    'filter/updateFilter',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await filterService.updateFilter(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteFilter = createAsyncThunk(
    'filter/deleteFilter',
    async (id, { rejectWithValue }) => {
        try {
            await filterService.deleteFilter(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const applyFilter = createAsyncThunk(
    'filter/applyFilter',
    async ({ id, values }, { rejectWithValue }) => {
        try {
            const response = await filterService.applyFilter(id, values);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const setDefaultFilter = createAsyncThunk(
    'filter/setDefaultFilter',
    async (id, { rejectWithValue }) => {
        try {
            const response = await filterService.setDefaultFilter(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const duplicateFilter = createAsyncThunk(
    'filter/duplicateFilter',
    async ({ id, newName = null }, { rejectWithValue }) => {
        try {
            const response = await filterService.duplicateFilter(id, newName);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchGlobalFilters = createAsyncThunk(
    'filter/fetchGlobalFilters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await filterService.getGlobalFilters();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchMyFilters = createAsyncThunk(
    'filter/fetchMyFilters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await filterService.getMyFilters();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchFilterTypes = createAsyncThunk(
    'filter/fetchFilterTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await filterService.getFilterTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        clearCurrentFilter: (state) => {
            state.currentFilter = null;
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFiltersState: (state, action) => {
            state.filtersState = { ...state.filtersState, ...action.payload };
            state.pagination.page = 1;
        },
        resetFiltersState: (state) => {
            state.filtersState = initialState.filtersState;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearAllFilters: (state) => {
            state.filters = [];
            state.globalFilters = [];
            state.myFilters = [];
            state.pagination = initialState.pagination;
        },
        clearAppliedFilters: (state) => {
            state.appliedFilters = {};
        },
        setAppliedFilters: (state, action) => {
            state.appliedFilters = { ...state.appliedFilters, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilters.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFilters.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.filters = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchFilters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchFilter.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchFilter.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentFilter = action.payload;
                const index = state.filters.findIndex(f => f.id === action.payload.id);
                if (index !== -1) state.filters[index] = action.payload;
            })
            .addCase(fetchFilter.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createFilter.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createFilter.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentFilter = action.payload;
                state.filters.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createFilter.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateFilter.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateFilter.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentFilter = action.payload;
                const index = state.filters.findIndex(f => f.id === action.payload.id);
                if (index !== -1) state.filters[index] = action.payload;
            })
            .addCase(updateFilter.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteFilter.fulfilled, (state, action) => {
                state.filters = state.filters.filter(f => f.id !== action.payload);
                state.myFilters = state.myFilters.filter(f => f.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(setDefaultFilter.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.filters.findIndex(f => f.id === action.payload.id);
                    if (index !== -1) state.filters[index] = action.payload;
                    if (state.currentFilter?.id === action.payload.id) state.currentFilter = action.payload;
                }
            })
            .addCase(duplicateFilter.fulfilled, (state, action) => {
                state.filters.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(fetchGlobalFilters.fulfilled, (state, action) => {
                state.globalFilters = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchMyFilters.fulfilled, (state, action) => {
                state.myFilters = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchFilterTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentFilter,
    clearErrors,
    setFiltersState,
    resetFiltersState,
    setPagination,
    clearAllFilters,
    clearAppliedFilters,
    setAppliedFilters,
} = filterSlice.actions;

// Aliases for compatibility with useFilters hook
export const clearFilterErrors = clearErrors;
export const setFilterPagination = setPagination;

export default filterSlice.reducer;