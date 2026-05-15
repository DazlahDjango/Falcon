import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CheckoutService } from '../../../services/billing';

// ============================================================================
// Async Thunks
// ============================================================================

export const initializeSubscriptionCheckout = createAsyncThunk(
    'billing/checkout/initSubscription',
    async ({ planId, billingInterval = 'monthly', successUrl = null, cancelUrl = null, metadata = {} }, { rejectWithValue }) => {
        try {
            const response = await CheckoutService.initializeSubscriptionCheckout({
                plan_id: planId,
                billing_interval: billingInterval,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata,
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to initialize subscription checkout');
        }
    }
);

export const initializeOneTimeCheckout = createAsyncThunk(
    'billing/checkout/initOneTime',
    async ({ amount, description, successUrl = null, cancelUrl = null, metadata = {} }, { rejectWithValue }) => {
        try {
            const response = await CheckoutService.initializeOneTimeCheckout({
                amount,
                description,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata,
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to initialize one-time checkout');
        }
    }
);

export const verifyCheckout = createAsyncThunk(
    'billing/checkout/verify',
    async (reference, { rejectWithValue }) => {
        try {
            const response = await CheckoutService.verifyCheckout(reference);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify checkout');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    currentCheckout: null,
    verificationResult: null,
    loading: false,
    error: null,
    redirecting: false,
    lastReference: null,
    lastCheckoutTime: null,
};

// ============================================================================
// Slice
// ============================================================================

const checkoutSlice = createSlice({
    name: 'billing/checkout',
    initialState,
    reducers: {
        setCurrentCheckout: (state, action) => {
            state.currentCheckout = action.payload;
        },
        clearCurrentCheckout: (state) => {
            state.currentCheckout = null;
            state.verificationResult = null;
        },
        setRedirecting: (state, action) => {
            state.redirecting = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        saveCheckoutSession: (state, action) => {
            state.currentCheckout = action.payload;
            state.lastCheckoutTime = Date.now();
        },
        restoreCheckoutSession: (state, action) => {
            const session = action.payload;
            if (session && (Date.now() - session.timestamp) < 30 * 60 * 1000) {
                state.currentCheckout = session;
                state.lastReference = session.reference;
            }
        },
    },
    extraReducers: (builder) => {
        // Initialize Subscription Checkout
        builder.addCase(initializeSubscriptionCheckout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(initializeSubscriptionCheckout.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCheckout = action.payload;
            state.lastReference = action.payload?.reference;
            state.lastCheckoutTime = Date.now();
        });
        builder.addCase(initializeSubscriptionCheckout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Initialize One-Time Checkout
        builder.addCase(initializeOneTimeCheckout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(initializeOneTimeCheckout.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCheckout = action.payload;
            state.lastReference = action.payload?.reference;
            state.lastCheckoutTime = Date.now();
        });
        builder.addCase(initializeOneTimeCheckout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Verify Checkout
        builder.addCase(verifyCheckout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyCheckout.fulfilled, (state, action) => {
            state.loading = false;
            state.verificationResult = action.payload;
        });
        builder.addCase(verifyCheckout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setCurrentCheckout,
    clearCurrentCheckout,
    setRedirecting,
    clearError,
    saveCheckoutSession,
    restoreCheckoutSession,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;