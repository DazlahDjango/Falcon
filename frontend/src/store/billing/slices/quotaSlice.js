import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quotaService } from '../../../services/billing/quota.service';
export const fetchQuotaStatus = createAsyncThunk(
    'billing/quota/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await quotaService.getQuotaStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchQuotaLimits = createAsyncThunk(
    'billing/quota/fetchLimits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await quotaService.getQuotaLimits();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const refreshQuotaUsage = createAsyncThunk(
    'billing/quota/refresh',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await quotaService.refreshQuotaUsage();
            await dispatch(fetchQuotaStatus());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    status: null,
    limits: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
};

const quotaSlice = createSlice({
    name: 'billingQuota',
    initialState,
    reducers: {
        clearQuotaError: (state) => {
            state.error = null;
        },
        updateQuotaLocally: (state, action) => {
            if (state.status && action.payload) {
                state.status = { ...state.status, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuotaStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchQuotaStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.status = action.payload;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchQuotaStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchQuotaLimits.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuotaLimits.fulfilled, (state, action) => {
                state.isLoading = false;
                state.limits = action.payload;
            })
            .addCase(fetchQuotaLimits.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(refreshQuotaUsage.pending, (state) => {
                state.isRefreshing = true;
            })
            .addCase(refreshQuotaUsage.fulfilled, (state) => {
                state.isRefreshing = false;
            })
            .addCase(refreshQuotaUsage.rejected, (state, action) => {
                state.isRefreshing = false;
                state.error = action.payload;
            });
    },
});
export const { clearQuotaError, updateQuotaLocally } = quotaSlice.actions;
export default quotaSlice.reducer;