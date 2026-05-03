// frontend/src/store/tenant/slice/tenantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService } from '../../../services/tenant';

// Async Thunks
export const fetchTenants = createAsyncThunk(
    'tenant/fetchTenants',
    async (params, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenants(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTenantById = createAsyncThunk(
    'tenant/fetchTenantById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenant(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createTenant = createAsyncThunk(
    'tenant/createTenant',
    async (data, { rejectWithValue }) => {
        try {
            const response = await TenantService.createTenant(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTenant = createAsyncThunk(
    'tenant/updateTenant',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await TenantService.updateTenant(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTenant = createAsyncThunk(
    'tenant/deleteTenant',
    async (id, { rejectWithValue }) => {
        try {
            await TenantService.deleteTenant(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const suspendTenant = createAsyncThunk(
    'tenant/suspendTenant',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await TenantService.suspendTenant(id, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const activateTenant = createAsyncThunk(
    'tenant/activateTenant',
    async (id, { rejectWithValue }) => {
        try {
            const response = await TenantService.activateTenant(id);
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
    name: 'tenant',
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
                state.total = action.payload.count || action.payload.length;
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

export const { setPage, setPageSize, setFilters, clearFilters, clearError, clearCurrentTenant } = tenantSlice.actions;
export default tenantSlice.reducer;