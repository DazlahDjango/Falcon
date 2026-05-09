// frontend/src/store/tenant/slice/tenantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tenantService } from '../../../services/tenant/tenant.service';

// Async Thunks
export const fetchTenants = createAsyncThunk(
    'appTenant/fetchTenants',
    async (params, { rejectWithValue }) => {
        try {
            const response = await tenantService.getTenants(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTenantDetails = createAsyncThunk(
    'tenant/fetchTenantDetails',
    async (id, { rejectWithValue }) => {
        try {
            // ✅ Fix: Use getTenantDetails
            const response = await tenantService.getTenantDetails(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createTenant = createAsyncThunk(
    'appTenant/createTenant',
    async (data, { rejectWithValue }) => {
        try {
            const response = await tenantService.createTenant(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTenant = createAsyncThunk(
    'appTenant/updateTenant',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await tenantService.updateTenant(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTenant = createAsyncThunk(
    'appTenant/deleteTenant',
    async (id, { rejectWithValue }) => {
        try {
            await tenantService.deleteTenant(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const suspendTenant = createAsyncThunk(
    'appTenant/suspendTenant',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await tenantService.suspendTenant(id, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const activateTenant = createAsyncThunk(
    'appTenant/activateTenant',
    async (id, { rejectWithValue }) => {
        try {
            const response = await tenantService.activateTenant(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
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
        // ✅ Add this reducer for direct tenant updates (for compatibility with tenant.service.js)
        setCurrentTenant: (state, action) => {
            state.currentTenant = action.payload;
        },
        updateTenantStats: (state, action) => {
            // This can be used to update stats in the UI slice
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
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.tenants = state.tenants.filter(t => t.id !== action.payload);
                state.total -= 1;
            })
            // Suspend Tenant
            .addCase(suspendTenant.fulfilled, (state, action) => {
                if (state.currentTenant?.id === action.payload.id) {
                    state.currentTenant = action.payload;
                }
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
            })
            // Activate Tenant
            .addCase(activateTenant.fulfilled, (state, action) => {
                if (state.currentTenant?.id === action.payload.id) {
                    state.currentTenant = action.payload;
                }
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
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