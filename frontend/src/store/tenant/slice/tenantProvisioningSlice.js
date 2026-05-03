// frontend/src/store/tenant/slice/tenantProvisioningSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProvisioningService } from '../../../services/tenant';

export const fetchProvisioningStatus = createAsyncThunk(
    'tenantProvisioning/fetchProvisioningStatus',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await ProvisioningService.getProvisioningStatus(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProvisioningProgress = createAsyncThunk(
    'tenantProvisioning/fetchProvisioningProgress',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await ProvisioningService.getProvisioningProgress(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const retryProvisioning = createAsyncThunk(
    'tenantProvisioning/retryProvisioning',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await ProvisioningService.retryProvisioning(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    status: null,
    progress: null,
    logs: [],
    loading: false,
    error: null,
    retrying: false,
    isProvisioning: false,
    isProvisioned: false,
    isFailed: false,
    progressPercentage: 0,
    currentStep: null,
};

const tenantProvisioningSlice = createSlice({
    name: 'tenantProvisioning',
    initialState,
    reducers: {
        clearProvisioningError: (state) => {
            state.error = null;
        },
        updateProvisioningProgress: (state, action) => {
            state.progress = action.payload;
            state.progressPercentage = action.payload.progress || 0;
            state.currentStep = action.payload.current_step || action.payload.step;
        },
        setProvisioningComplete: (state) => {
            state.isProvisioned = true;
            state.isProvisioning = false;
            if (state.status) state.status.status = 'completed';
        },
        setProvisioningFailed: (state, action) => {
            state.isFailed = true;
            state.isProvisioning = false;
            state.error = action.payload;
        },
        resetProvisioningState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProvisioningStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProvisioningStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload;
                state.isProvisioning = action.payload?.status === 'provisioning' || action.payload?.status === 'pending';
                state.isProvisioned = action.payload?.status === 'active' && action.payload?.provisioned_at;
                state.isFailed = action.payload?.status === 'failed';
            })
            .addCase(fetchProvisioningStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchProvisioningProgress.fulfilled, (state, action) => {
                state.progress = action.payload;
                state.progressPercentage = action.payload?.progress || 0;
                state.currentStep = action.payload?.current_step || action.payload?.step;
            })
            .addCase(retryProvisioning.pending, (state) => {
                state.retrying = true;
            })
            .addCase(retryProvisioning.fulfilled, (state) => {
                state.retrying = false;
                state.isFailed = false;
                state.isProvisioning = true;
            })
            .addCase(retryProvisioning.rejected, (state, action) => {
                state.retrying = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearProvisioningError,
    updateProvisioningProgress,
    setProvisioningComplete,
    setProvisioningFailed,
    resetProvisioningState,
} = tenantProvisioningSlice.actions;

export default tenantProvisioningSlice.reducer;