/**
 * Payment Method Slice
 * Manages saved payment methods state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PaymentMethodService } from '../../../services/billing';
import { PAYMENT_METHOD_TYPES, PAYMENT_METHOD_STATUS } from '../../../config/constants/billingConstants';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchPaymentMethods = createAsyncThunk(
    'billing/paymentMethods/fetchAll',
    async ({ activeOnly = true } = {}, { rejectWithValue }) => {
        try {
            const params = activeOnly ? { active_only: true } : {};
            const response = await PaymentMethodService.getPaymentMethods(params);
            return response?.data || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch payment methods');
        }
    }
);

export const fetchPaymentMethodById = createAsyncThunk(
    'billing/paymentMethods/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await PaymentMethodService.getPaymentMethod(id);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch payment method');
        }
    }
);

export const addPaymentMethod = createAsyncThunk(
    'billing/paymentMethods/add',
    async ({ authorizationCode, email }, { rejectWithValue, dispatch }) => {
        try {
            const response = await PaymentMethodService.addPaymentMethod(authorizationCode, email);
            await dispatch(fetchPaymentMethods());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add payment method');
        }
    }
);

export const deletePaymentMethod = createAsyncThunk(
    'billing/paymentMethods/delete',
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            await PaymentMethodService.deletePaymentMethod(id, true);
            await dispatch(fetchPaymentMethods());
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete payment method');
        }
    }
);

export const setDefaultPaymentMethod = createAsyncThunk(
    'billing/paymentMethods/setDefault',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await PaymentMethodService.setDefaultPaymentMethod(id);
            await dispatch(fetchPaymentMethods());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to set default payment method');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    items: [],
    selectedMethod: null,
    defaultMethod: null,
    loading: false,
    error: null,
    adding: false,
    deleting: false,
    lastFetched: null,
};

// ============================================================================
// Slice
// ============================================================================

const paymentMethodSlice = createSlice({
    name: 'billing/paymentMethods',
    initialState,
    reducers: {
        setSelectedMethod: (state, action) => {
            state.selectedMethod = action.payload;
        },
        clearSelectedMethod: (state) => {
            state.selectedMethod = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAddState: (state) => {
            state.adding = false;
        },
        resetDeleteState: (state) => {
            state.deleting = false;
        },
    },
    extraReducers: (builder) => {
        // Fetch Payment Methods
        builder.addCase(fetchPaymentMethods.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPaymentMethods.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
            state.defaultMethod = action.payload.find(m => m.is_default) || action.payload[0] || null;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchPaymentMethods.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Payment Method By ID
        builder.addCase(fetchPaymentMethodById.fulfilled, (state, action) => {
            state.selectedMethod = action.payload;
        });

        // Add Payment Method
        builder.addCase(addPaymentMethod.pending, (state) => {
            state.adding = true;
        });
        builder.addCase(addPaymentMethod.fulfilled, (state) => {
            state.adding = false;
        });
        builder.addCase(addPaymentMethod.rejected, (state, action) => {
            state.adding = false;
            state.error = action.payload;
        });

        // Delete Payment Method
        builder.addCase(deletePaymentMethod.pending, (state) => {
            state.deleting = true;
        });
        builder.addCase(deletePaymentMethod.fulfilled, (state) => {
            state.deleting = false;
        });
        builder.addCase(deletePaymentMethod.rejected, (state, action) => {
            state.deleting = false;
            state.error = action.payload;
        });

        // Set Default Payment Method
        builder.addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
            // Update will happen via fetchPaymentMethods
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setSelectedMethod,
    clearSelectedMethod,
    clearError,
    resetAddState,
    resetDeleteState,
} = paymentMethodSlice.actions;

export default paymentMethodSlice.reducer;