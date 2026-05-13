import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentMethodService } from '../../../services/billing/paymentMethod.service';

export const fetchPaymentMethods = createAsyncThunk(
    'billing/paymentMethods/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await paymentMethodService.getPaymentMethods();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchDefaultPaymentMethod = createAsyncThunk(
    'billing/paymentMethods/fetchDefault',
    async (_, { rejectWithValue }) => {
        try {
            const response = await paymentMethodService.getDefaultPaymentMethod();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const addPaymentMethodAsync = createAsyncThunk(
    'billing/paymentMethods/add',
    async ({ paymentMethodId, setAsDefault }, { rejectWithValue, dispatch }) => {
        try {
            const response = await paymentMethodService.addPaymentMethod(paymentMethodId, setAsDefault);
            await dispatch(fetchPaymentMethods());
            if (setAsDefault) {
                await dispatch(fetchDefaultPaymentMethod());
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const deletePaymentMethodAsync = createAsyncThunk(
    'billing/paymentMethods/delete',
    async (paymentMethodId, { rejectWithValue, dispatch }) => {
        try {
            const response = await paymentMethodService.deletePaymentMethod(paymentMethodId);
            await dispatch(fetchPaymentMethods());
            await dispatch(fetchDefaultPaymentMethod());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const setDefaultPaymentMethodAsync = createAsyncThunk(
    'billing/paymentMethods/setDefault',
    async (paymentMethodId, { rejectWithValue, dispatch }) => {
        try {
            const response = await paymentMethodService.setDefaultPaymentMethod(paymentMethodId);
            await dispatch(fetchPaymentMethods());
            await dispatch(fetchDefaultPaymentMethod());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    methods: [],
    defaultMethod: null,
    isLoading: false,
    isAdding: false,
    isDeleting: false,
    error: null,
};

const paymentMethodSlice = createSlice({
    name: 'billingPaymentMethods',
    initialState,
    reducers: {
        clearPaymentMethodError: (state) => {
            state.error = null;
        },
        resetPaymentMethods: (state) => {
            state.methods = [];
            state.defaultMethod = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch payment methods
            .addCase(fetchPaymentMethods.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
                state.isLoading = false;
                state.methods = action.payload?.payment_methods || [];
            })
            .addCase(fetchPaymentMethods.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch default payment method
            .addCase(fetchDefaultPaymentMethod.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDefaultPaymentMethod.fulfilled, (state, action) => {
                state.isLoading = false;
                state.defaultMethod = action.payload;
            })
            .addCase(fetchDefaultPaymentMethod.rejected, (state, action) => {
                state.isLoading = false;
                state.defaultMethod = null;
            })
            // Add payment method
            .addCase(addPaymentMethodAsync.pending, (state) => {
                state.isAdding = true;
            })
            .addCase(addPaymentMethodAsync.fulfilled, (state) => {
                state.isAdding = false;
            })
            .addCase(addPaymentMethodAsync.rejected, (state, action) => {
                state.isAdding = false;
                state.error = action.payload;
            })
            // Delete payment method
            .addCase(deletePaymentMethodAsync.pending, (state) => {
                state.isDeleting = true;
            })
            .addCase(deletePaymentMethodAsync.fulfilled, (state) => {
                state.isDeleting = false;
            })
            .addCase(deletePaymentMethodAsync.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload;
            })
            .addCase(setDefaultPaymentMethodAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(setDefaultPaymentMethodAsync.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(setDefaultPaymentMethodAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});
export const { clearPaymentMethodError, resetPaymentMethods } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;