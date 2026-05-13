import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionService } from '../../../services/billing/subscription.service';

export const fetchCurrentSubscription = createAsyncThunk(
    'billing/subscription/fetchCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.getCurrentSubscription();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchSubscriptionStatus = createAsyncThunk(
    'billing/subscription/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.getSubscriptionStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const cancelSubscriptionAsync = createAsyncThunk(
    'billing/subscription/cancel',
    async ({ id, atPeriodEnd, reason }, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.cancelSubscription(id, atPeriodEnd, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const reactivateSubscriptionAsync = createAsyncThunk(
    'billing/subscription/reactivate',
    async (id, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.reactivateSubscription(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    current: null,
    status: null,
    isLoading: false,
    error: null,
    isCancelling: false,
    isReactivating: false,
};

const subscriptionSlice = createSlice({
    name: 'billingSubscription',
    initialState,
    reducers: {
        clearSubscriptionError: (state) => {
            state.error = null;
        },
        resetSubscription: (state) => {
            state.current = null;
            state.status = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentSubscription.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchCurrentSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchSubscriptionStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.status = action.payload;
            })
            .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Cancel subscription
            .addCase(cancelSubscriptionAsync.pending, (state) => {
                state.isCancelling = true;
            })
            .addCase(cancelSubscriptionAsync.fulfilled, (state, action) => {
                state.isCancelling = false;
                state.current = action.payload;
            })
            .addCase(cancelSubscriptionAsync.rejected, (state, action) => {
                state.isCancelling = false;
                state.error = action.payload;
            })
            .addCase(reactivateSubscriptionAsync.pending, (state) => {
                state.isReactivating = true;
            })
            .addCase(reactivateSubscriptionAsync.fulfilled, (state, action) => {
                state.isReactivating = false;
                state.current = action.payload;
            })
            .addCase(reactivateSubscriptionAsync.rejected, (state, action) => {
                state.isReactivating = false;
                state.error = action.payload;
            });
    },
});
export const { clearSubscriptionError, resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;