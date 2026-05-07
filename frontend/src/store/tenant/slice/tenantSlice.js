// frontend/src/store/tenant/slice/tenantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService } from '../../../services/tenant';

// Async Thunks (keep all your existing thunks including provisioning ones)
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
            const response = await TenantService.getTenantById(id);
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

// Provisioning Async Thunks
export const fetchProvisioningStatus = createAsyncThunk(
    'tenant/fetchProvisioningStatus',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.getProvisioningStatus(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProvisioningProgress = createAsyncThunk(
    'tenant/fetchProvisioningProgress',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.getProvisioningProgress(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const retryProvisioning = createAsyncThunk(
    'tenant/retryProvisioning',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.retryProvisioning(tenantId);
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
    // Provisioning states
    provisioningStatus: null,
    provisioningProgress: null,
    isProvisioning: false,
    provisioningError: null,
    modal: {
        deleteTenant: { isOpen: false, data: null },
        suspendTenant: { isOpen: false, data: null },
        activateTenant: { isOpen: false, data: null },
        upgradeTenant: { isOpen: false, data: null },
    },
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
        clearProvisioningError: (state) => {
            state.provisioningError = null;
        },
        resetProvisioning: (state) => {
            state.provisioningStatus = null;
            state.provisioningProgress = null;
            state.isProvisioning = false;
            state.provisioningError = null;
        },
        openModal: (state, action) => {
            const { modalName, data } = action.payload;
            if (state.modal[modalName]) {
                state.modal[modalName].isOpen = true;
                state.modal[modalName].data = data;
            }
        },
        closeModal: (state, action) => {
            const modalName = action.payload;
            if (state.modal[modalName]) {
                state.modal[modalName].isOpen = false;
                state.modal[modalName].data = null;
            }
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
            })
            // Provisioning - Fetch Status
            .addCase(fetchProvisioningStatus.pending, (state) => {
                state.isProvisioning = true;
                state.provisioningError = null;
            })
            .addCase(fetchProvisioningStatus.fulfilled, (state, action) => {
                state.isProvisioning = false;
                state.provisioningStatus = action.payload;
            })
            .addCase(fetchProvisioningStatus.rejected, (state, action) => {
                state.isProvisioning = false;
                state.provisioningError = action.payload;
                state.error = action.payload;
            })
            // Provisioning - Fetch Progress
            .addCase(fetchProvisioningProgress.pending, (state) => {
                state.isProvisioning = true;
            })
            .addCase(fetchProvisioningProgress.fulfilled, (state, action) => {
                state.isProvisioning = false;
                state.provisioningProgress = action.payload;
            })
            .addCase(fetchProvisioningProgress.rejected, (state, action) => {
                state.isProvisioning = false;
                state.provisioningError = action.payload;
            })
            // Provisioning - Retry
            .addCase(retryProvisioning.pending, (state) => {
                state.isProvisioning = true;
                state.provisioningError = null;
            })
            .addCase(retryProvisioning.fulfilled, (state, action) => {
                state.isProvisioning = false;
                state.provisioningStatus = action.payload;
                state.provisioningProgress = null;
            })
            .addCase(retryProvisioning.rejected, (state, action) => {
                state.isProvisioning = false;
                state.provisioningError = action.payload;
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
    clearProvisioningError,
    resetProvisioning,
    openModal,
    closeModal,
} = tenantSlice.actions;

// Base Selectors
export const selectCurrentTenant = (state) => state.tenant?.currentTenant;
export const selectTenantLoading = (state) => state.tenant?.loading || false;
export const selectTenantError = (state) => state.tenant?.error;
export const selectTenants = (state) => state.tenant?.tenants || [];
export const selectTenantTotal = (state) => state.tenant?.total || 0;
export const selectTenantPage = (state) => state.tenant?.page || 1;
export const selectTenantFilters = (state) => state.tenant?.filters || {};
export const selectModalState = (state, modalName) => state.tenant?.modal?.[modalName]?.isOpen || false;
export const selectModalData = (state, modalName) => state.tenant?.modal?.[modalName]?.data;

// Provisioning Selectors
export const selectProvisioningStatus = (state) => state.tenant?.provisioningStatus;
export const selectProvisioningProgress = (state) => state.tenant?.provisioningProgress;
export const selectProvisioningProgressPercentage = (state) => {
    const progress = state.tenant?.provisioningProgress;
    if (!progress) return 0;
    if (typeof progress === 'number') return progress;
    if (progress.percentage) return progress.percentage;
    if (progress.current_step && progress.steps) {
        return (progress.current_step / progress.steps) * 100;
    }
    return 0;
};
export const selectIsProvisioning = (state) => state.tenant?.isProvisioning || false;
export const selectIsProvisioned = (state) => {
    const status = state.tenant?.provisioningStatus;
    if (!status) return false;
    return status.status === 'completed' || status === 'completed' || status.state === 'provisioned';
};
export const selectIsProvisioningFailed = (state) => {
    const status = state.tenant?.provisioningStatus;
    const error = state.tenant?.provisioningError;
    if (error) return true;
    if (!status) return false;
    return status.status === 'failed' || status === 'failed';
};
export const selectProvisioningError = (state) => state.tenant?.provisioningError;

// Additional exports for tenant.service.js
export const setCurrentTenant = (tenant) => ({
    type: 'tenant/setCurrentTenant',
    payload: tenant,
});

export const updateTenantStats = (stats) => ({
    type: 'tenant/updateTenantStats',
    payload: stats,
});

export default tenantSlice.reducer;