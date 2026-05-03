// frontend/src/store/tenant/slice/tenantResourceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService, ResourceService } from '../../../services/tenant';

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

export const fetchResourceSummary = createAsyncThunk(
    'tenantResource/fetchResourceSummary',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await ResourceService.getResourceSummary(tenantId);
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
            const response = await ResourceService.updateResourceLimit(tenantId, resourceType, limitValue);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const bulkUpdateResources = createAsyncThunk(
    'tenantResource/bulkUpdateResources',
    async ({ tenantId, limits }, { rejectWithValue }) => {
        try {
            const response = await ResourceService.bulkUpdateResources(tenantId, limits);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const checkQuota = createAsyncThunk(
    'tenantResource/checkQuota',
    async ({ tenantId, resourceType, amount }, { rejectWithValue }) => {
        try {
            const response = await ResourceService.checkQuota(tenantId, resourceType, amount);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchQuotaWarnings = createAsyncThunk(
    'tenantResource/fetchQuotaWarnings',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await ResourceService.getResourceAlerts(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    resources: [],
    summary: null,
    quotaWarnings: [],
    loading: false,
    error: null,
    quotaCheck: { allowed: true, remaining: 0 },
};

// Slice
const tenantResourceSlice = createSlice({
    name: 'tenantResource',
    initialState,
    reducers: {
        clearResourceError: (state) => {
            state.error = null;
        },
        clearQuotaWarnings: (state) => {
            state.quotaWarnings = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Resources
            .addCase(fetchTenantResources.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantResources.fulfilled, (state, action) => {
                state.loading = false;
                state.resources = action.payload.resources || action.payload;
            })
            .addCase(fetchTenantResources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Resource Summary
            .addCase(fetchResourceSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            // Update Resource Limit
            .addCase(updateResourceLimit.fulfilled, (state, action) => {
                const index = state.resources.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
            })
            // Bulk Update Resources
            .addCase(bulkUpdateResources.fulfilled, (state, action) => {
                state.resources = action.payload.resources || state.resources;
            })
            // Check Quota
            .addCase(checkQuota.fulfilled, (state, action) => {
                state.quotaCheck = action.payload;
            })
            // Fetch Quota Warnings
            .addCase(fetchQuotaWarnings.fulfilled, (state, action) => {
                state.quotaWarnings = action.payload.alerts || [];
            });
    },
});

export const { clearResourceError, clearQuotaWarnings } = tenantResourceSlice.actions;
export default tenantResourceSlice.reducer;