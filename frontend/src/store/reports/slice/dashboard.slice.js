// ============================================
// apps/reportplt/slice/dashboard.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    dashboards: [],
    currentDashboard: null,
    myDashboards: [],
    defaultDashboard: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { dashboard_type: null, is_default: null, is_shared: null, is_published: null, search: '' },
    types: [],
    layout: null,
};

export const fetchDashboards = createAsyncThunk(
    'dashboard/fetchDashboards',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDashboards(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetchDashboard',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDashboard(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createDashboard = createAsyncThunk(
    'dashboard/createDashboard',
    async (data, { rejectWithValue }) => {
        try {
            const response = await dashboardService.createDashboard(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateDashboard = createAsyncThunk(
    'dashboard/updateDashboard',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await dashboardService.updateDashboard(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteDashboard = createAsyncThunk(
    'dashboard/deleteDashboard',
    async (id, { rejectWithValue }) => {
        try {
            await dashboardService.deleteDashboard(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const performDashboardAction = createAsyncThunk(
    'dashboard/performAction',
    async ({ id, action, data = {} }, { rejectWithValue }) => {
        try {
            const response = await dashboardService.performAction(id, action, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateDashboardLayout = createAsyncThunk(
    'dashboard/updateLayout',
    async ({ id, layout }, { rejectWithValue }) => {
        try {
            const response = await dashboardService.updateLayout(id, layout);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const refreshDashboard = createAsyncThunk(
    'dashboard/refreshDashboard',
    async (id, { rejectWithValue }) => {
        try {
            const response = await dashboardService.refreshDashboard(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchMyDashboards = createAsyncThunk(
    'dashboard/fetchMyDashboards',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getMyDashboards(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDefaultDashboard = createAsyncThunk(
    'dashboard/fetchDefaultDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDefaultDashboard();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDashboardTypes = createAsyncThunk(
    'dashboard/fetchDashboardTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dashboardService.getDashboardTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearCurrentDashboard: (state) => {
            state.currentDashboard = null;
            state.layout = null;
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
        clearAllDashboards: (state) => {
            state.dashboards = [];
            state.myDashboards = [];
            state.pagination = initialState.pagination;
        },
        updateLayoutState: (state, action) => {
            state.layout = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboards.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.dashboards = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchDashboards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDashboard.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentDashboard = action.payload;
                state.layout = action.payload?.layout || null;
                const index = state.dashboards.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.dashboards[index] = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createDashboard.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createDashboard.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentDashboard = action.payload;
                state.dashboards.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createDashboard.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateDashboard.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateDashboard.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentDashboard = action.payload;
                const index = state.dashboards.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.dashboards[index] = action.payload;
            })
            .addCase(updateDashboard.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteDashboard.fulfilled, (state, action) => {
                state.dashboards = state.dashboards.filter(d => d.id !== action.payload);
                state.myDashboards = state.myDashboards.filter(d => d.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(performDashboardAction.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.dashboards.findIndex(d => d.id === action.payload.id);
                    if (index !== -1) state.dashboards[index] = action.payload;
                    if (state.currentDashboard?.id === action.payload.id) {
                        state.currentDashboard = action.payload;
                        state.layout = action.payload?.layout || state.layout;
                    }
                }
            })
            .addCase(updateDashboardLayout.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    state.currentDashboard = action.payload;
                    state.layout = action.payload?.layout || null;
                    const index = state.dashboards.findIndex(d => d.id === action.payload.id);
                    if (index !== -1) state.dashboards[index] = action.payload;
                }
            })
            .addCase(fetchMyDashboards.fulfilled, (state, action) => {
                state.myDashboards = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
            })
            .addCase(fetchDefaultDashboard.fulfilled, (state, action) => {
                state.defaultDashboard = action.payload || null;
            })
            .addCase(fetchDashboardTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentDashboard,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllDashboards,
    updateLayoutState,
} = dashboardSlice.actions;

// Aliases for compatibility with useDashboards hook
export const clearDashboardErrors = clearErrors;
export const setDashboardFilters = setFilters;
export const resetDashboardFilters = resetFilters;
export const setDashboardPagination = setPagination;

export default dashboardSlice.reducer;