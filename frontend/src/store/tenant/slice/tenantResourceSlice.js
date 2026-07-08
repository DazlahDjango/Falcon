import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService } from '../../../services/tenant';

// Async Thunks
export const fetchTenantResources = createAsyncThunk(
    'tenantResource/fetchTenantResources',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenantResources(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateResourceLimit = createAsyncThunk(
    'tenantResource/updateResourceLimit',
    async ({ tenantId, resourceType, limitValue }, { rejectWithValue }) => {
        try {
            await TenantService.updateResourceLimits(tenantId, {
                [resourceType]: limitValue
            });
            return {
                resource_type: resourceType,
                limit_value: limitValue
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const syncTenantResources = createAsyncThunk(
    'tenantResource/syncTenantResources',
    async (tenantId, { rejectWithValue, dispatch }) => {
        try {
            const response = await TenantService.syncTenantResources(tenantId);
            // Instantly fetch synced data to reflect real-time counts
            dispatch(fetchTenantResources({ tenantId, refresh: true }));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTenantUsage = createAsyncThunk(
    'tenantResource/fetchTenantUsage',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenantUsage(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    resources: null,
    loading: false,
    error: null,
};

// Slice
const tenantResourceSlice = createSlice({
    name: 'tenantResource',
    initialState,
    reducers: {
        clearResourceError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenantResources.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantResources.fulfilled, (state, action) => {
                state.loading = false;
                state.resources = action.payload?.resources || action.payload;
            })
            .addCase(fetchTenantResources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateResourceLimit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateResourceLimit.fulfilled, (state, action) => {
                state.loading = false;
                if (state.resources && action.payload) {
                    const { resource_type, limit_value } = action.payload;
                    const index = state.resources.findIndex(
                        r => (r.resource_type || r.type) === resource_type
                    );
                    if (index !== -1) {
                        state.resources[index] = {
                            ...state.resources[index],
                            limit_value: limit_value,
                            limit: limit_value,
                            percentage: limit_value > 0 
                                ? (state.resources[index].current_value / limit_value) * 100 
                                : 0
                        };
                    }
                }
            })
            .addCase(updateResourceLimit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(syncTenantResources.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncTenantResources.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(syncTenantResources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTenantUsage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantUsage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.usage) {
                    const rawUsage = action.payload.usage;
                    const normalized = {};
                    Object.entries(rawUsage).forEach(([key, val]) => {
                        if (key === 'tenant_id' || key === 'tenant_name') return;
                        
                        let current = val?.current;
                        let limit = val?.limit;
                        
                        if (key === 'storage') {
                            current = val?.current_mb;
                            limit = val?.limit_mb;
                        } else if (key === 'api_calls') {
                            current = val?.current_today;
                            limit = val?.limit_per_day;
                        }
                        
                        normalized[key] = {
                            current: current !== undefined ? current : 0,
                            limit: limit !== undefined ? limit : '-',
                            percentage: val?.percentage !== undefined ? val?.percentage : 
                                (limit && limit !== '-' && limit > 0 ? (current / limit) * 100 : 0)
                        };
                    });
                    state.usage = normalized;
                } else {
                    state.usage = null;
                }
            })
            .addCase(fetchTenantUsage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const { clearResourceError } = tenantResourceSlice.actions;

// Selectors
export const selectResources = (state) => state.tenantResource?.resources || [];
export const selectResourceLoading = (state) => state.tenantResource?.loading || false;
export const selectResourceError = (state) => state.tenantResource?.error;

export default tenantResourceSlice.reducer;

// Add this thunk for quota warnings
export const fetchQuotaWarnings = createAsyncThunk(
    'tenantResource/fetchQuotaWarnings',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await TenantService.getQuotaWarnings(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
