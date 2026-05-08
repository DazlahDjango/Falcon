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
    async ({ tenantId, resourceType, limit }, { rejectWithValue }) => {
        try {
            const response = await TenantService.updateResourceLimit(tenantId, resourceType, limit);
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
                state.resources = action.payload;
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
                    state.resources[action.payload.resource_type] = action.payload;
                }
            })
            .addCase(updateResourceLimit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const { clearResourceError } = tenantResourceSlice.actions;

// Selectors
export const selectResources = (state) => state.tenantResource?.resources;
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
