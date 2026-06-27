// frontend/src/store/tenant/slice/tenantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tenantService } from '../../../services/tenant/tenant.service';

// Helper to format API errors
const formatError = (error) => {
    return error.response?.data
        ? (typeof error.response.data === 'object'
            ? Object.values(error.response.data).flat().join(', ')
            : error.response.data)
        : error.message;
};

// Async Thunks
export const fetchTenants = createAsyncThunk(
    'appTenant/fetchTenants',
    async (params, { rejectWithValue }) => {
        try {
            const response = await tenantService.getTenants(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const fetchTenantById = createAsyncThunk(
    'appTenant/fetchTenantById',
    async (id, { rejectWithValue }) => {
        try {
            // ✅ Fix: Use getTenant, not getTenantById
            const response = await tenantService.getTenant(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const fetchTenantDetails = createAsyncThunk(
    'appTenant/fetchTenantDetails',
    async (id, { rejectWithValue }) => {
        try {
            // ✅ Fix: Use getTenantDetails
            const response = await tenantService.getTenantDetails(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const createTenant = createAsyncThunk(
    'appTenant/createTenant',
    async (data, { rejectWithValue }) => {
        try {
            const response = await tenantService.create(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const updateTenant = createAsyncThunk(
    'appTenant/updateTenant',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await tenantService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const deleteTenant = createAsyncThunk(
    'appTenant/deleteTenant',
    async (id, { rejectWithValue }) => {
        try {
            // ✅ FIX: Use admin API endpoint instead of tenantService
            await tenantService.deleteTenant(id);
            return id;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);
export const bulkDeleteTenants = createAsyncThunk(
    'appTenant/bulkDeleteTenants',
    async (ids, { rejectWithValue }) => {
        try {
            await tenantService.bulkDeleteTenants(ids);
            return ids;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);



export const suspendTenant = createAsyncThunk(
    'appTenant/suspendTenant',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            // ✅ FIX: Use admin API endpoint instead of tenantService
            const response = await tenantService.suspendTenant(id, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

export const activateTenant = createAsyncThunk(
    'appTenant/activateTenant',
    async (id, { rejectWithValue }) => {
        try {
            // ✅ FIX: Use admin API endpoint instead of tenantService
            const response = await tenantService.activateTenant(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(formatError(error));
        }
    }
);

// Initial State
const initialState = {
    tenants: [],
    currentTenant: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
    filters: {},
};

// Slice
const tenantSlice = createSlice({
    name: 'appTenant',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.page = 1;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.page = 1;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentTenant: (state) => {
            state.currentTenant = null;
        },
        setCurrentTenant: (state, action) => {
            state.currentTenant = action.payload;
        },
        updateTenantStats: (state, action) => {
            state.stats = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tenants
            .addCase(fetchTenants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants = action.payload.results || action.payload;
                state.total = action.payload.count || (action.payload.length || 0);
            })
            .addCase(fetchTenants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Tenant By ID
            .addCase(fetchTenantById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTenant = action.payload;
            })
            .addCase(fetchTenantById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Tenant Details
            .addCase(fetchTenantDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTenant = action.payload;
            })
            .addCase(fetchTenantDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Tenant
            .addCase(createTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTenant.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Tenant
            .addCase(updateTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTenant.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTenant = action.payload;
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
            })
            .addCase(updateTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Tenant
            .addCase(deleteTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.loading = false;
                state.tenants = state.tenants.filter(t => t.id !== action.payload);
                state.total -= 1;
            })
            .addCase(deleteTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Bulk Delete Tenants
            .addCase(bulkDeleteTenants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkDeleteTenants.fulfilled, (state, action) => {
                state.loading = false;
                const deletedIds = action.payload;
                state.tenants = state.tenants.filter(t => !deletedIds.includes(t.id));
                state.total -= deletedIds.length;
            })
            .addCase(bulkDeleteTenants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Suspend Tenant
            .addCase(suspendTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(suspendTenant.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentTenant?.id === action.payload.id) {
                    state.currentTenant = action.payload;
                }
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
            })
            .addCase(suspendTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Activate Tenant
            .addCase(activateTenant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activateTenant.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentTenant?.id === action.payload.id) {
                    state.currentTenant = action.payload;
                }
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
            })
            .addCase(activateTenant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const {
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentTenant,
    setCurrentTenant,
    updateTenantStats,
} = tenantSlice.actions;

// Selectors
export const selectCurrentTenant = (state) => state.appTenant?.currentTenant;
export const selectTenantLoading = (state) => state.appTenant?.loading || false;
export const selectTenantError = (state) => state.appTenant?.error;
export const selectTenants = (state) => state.appTenant?.tenants || [];
export const selectTenantTotal = (state) => state.appTenant?.total || 0;
export const selectTenantPage = (state) => state.appTenant?.page || 1;
export const selectTenantFilters = (state) => state.appTenant?.filters || {};
export const selectTenantPageSize = (state) => state.appTenant?.pageSize || 20;

export default tenantSlice.reducer;