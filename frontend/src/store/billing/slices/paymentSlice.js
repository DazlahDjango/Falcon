import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '../../../services/billing/payment.service';

export const fetchPayments = createAsyncThunk(
    'billing/payments/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await paymentService.getPayments(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchPaymentById = createAsyncThunk(
    'billing/payments/fetchById',
    async (paymentId, { rejectWithValue }) => {
        try {
            const response = await paymentService.getPaymentById(paymentId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchPaymentSummary = createAsyncThunk(
    'billing/payments/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await paymentService.getPaymentSummary();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const retryPaymentAsync = createAsyncThunk(
    'billing/payments/retry',
    async (paymentId, { rejectWithValue, dispatch }) => {
        try {
            const response = await paymentService.retryPayment(paymentId);
            await dispatch(fetchPaymentById(paymentId));
            await dispatch(fetchPaymentSummary());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const requestRefundAsync = createAsyncThunk(
    'billing/payments/refund',
    async ({ paymentId, amount, reason }, { rejectWithValue, dispatch }) => {
        try {
            const response = await paymentService.requestRefund(paymentId, amount, reason);
            await dispatch(fetchPaymentById(paymentId));
            await dispatch(fetchPaymentSummary());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    payments: [],
    currentPayment: null,
    summary: null,
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    isLoading: false,
    isRetrying: false,
    isRefunding: false,
    error: null,
};

const paymentSlice = createSlice({
    name: 'billingPayments',
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
        setPaymentPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        resetPayments: (state) => {
            state.payments = [];
            state.currentPayment = null;
            state.summary = null;
            state.pagination = initialState.pagination;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all payments
            .addCase(fetchPayments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payments = action.payload?.payments || [];
                state.pagination = {
                    page: action.payload?.page || 1,
                    pageSize: action.payload?.page_size || 20,
                    total: action.payload?.count || 0,
                };
                state.summary = action.payload?.summary;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch payment by ID
            .addCase(fetchPaymentById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPayment = action.payload;
            })
            .addCase(fetchPaymentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch payment summary
            .addCase(fetchPaymentSummary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
            })
            .addCase(fetchPaymentSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Retry payment
            .addCase(retryPaymentAsync.pending, (state) => {
                state.isRetrying = true;
            })
            .addCase(retryPaymentAsync.fulfilled, (state) => {
                state.isRetrying = false;
            })
            .addCase(retryPaymentAsync.rejected, (state, action) => {
                state.isRetrying = false;
                state.error = action.payload;
            })
            // Request refund
            .addCase(requestRefundAsync.pending, (state) => {
                state.isRefunding = true;
            })
            .addCase(requestRefundAsync.fulfilled, (state) => {
                state.isRefunding = false;
            })
            .addCase(requestRefundAsync.rejected, (state, action) => {
                state.isRefunding = false;
                state.error = action.payload;
            });
    },
});
export const { clearPaymentError, setPaymentPage, resetPayments } = paymentSlice.actions;
export default paymentSlice.reducer;