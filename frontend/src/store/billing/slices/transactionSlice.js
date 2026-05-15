import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TransactionService } from '../../../services/billing';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '../../../config/constants/billingConstants';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchTransactions = createAsyncThunk(
    'billing/transactions/fetchAll',
    async ({ page = 1, pageSize = 20, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const response = await TransactionService.getTransactions({ page, page_size: pageSize, ...filters });
            return {
                items: response?.data || [],
                total: response?.count || 0,
                page,
                pageSize,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch transactions');
        }
    }
);

export const fetchTransactionById = createAsyncThunk(
    'billing/transactions/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await TransactionService.getTransaction(id);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch transaction');
        }
    }
);

export const fetchTransactionSummary = createAsyncThunk(
    'billing/transactions/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TransactionService.getTransactionSummary();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch transaction summary');
        }
    }
);

export const verifyTransaction = createAsyncThunk(
    'billing/transactions/verify',
    async (reference, { rejectWithValue, dispatch }) => {
        try {
            const response = await TransactionService.verifyTransaction(reference);
            // Refresh the transaction list after verification
            await dispatch(fetchTransactions());
            await dispatch(fetchTransactionSummary());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify transaction');
        }
    }
);

export const refundTransaction = createAsyncThunk(
    'billing/transactions/refund',
    async ({ id, amount = null, reason = 'Customer requested refund' }, { rejectWithValue, dispatch }) => {
        try {
            const response = await TransactionService.refundTransaction(id, { amount, reason });
            await dispatch(fetchTransactionById(id));
            await dispatch(fetchTransactions());
            await dispatch(fetchTransactionSummary());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to refund transaction');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    items: [],
    selectedTransaction: null,
    summary: null,
    loading: false,
    error: null,
    verifying: false,
    refunding: false,
    filters: {
        status: null,
        transactionType: null,
        startDate: null,
        endDate: null,
        reference: null,
    },
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    lastFetched: null,
};

// ============================================================================
// Slice
// ============================================================================

const transactionSlice = createSlice({
    name: 'billing/transactions',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetVerifyState: (state) => {
            state.verifying = false;
        },
        resetRefundState: (state) => {
            state.refunding = false;
        },
    },
    extraReducers: (builder) => {
        // Fetch Transactions
        builder.addCase(fetchTransactions.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTransactions.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pageSize: action.payload.pageSize,
                total: action.payload.total,
            };
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchTransactions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Transaction By ID
        builder.addCase(fetchTransactionById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTransactionById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedTransaction = action.payload;
        });
        builder.addCase(fetchTransactionById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Transaction Summary
        builder.addCase(fetchTransactionSummary.fulfilled, (state, action) => {
            state.summary = action.payload;
        });

        // Verify Transaction
        builder.addCase(verifyTransaction.pending, (state) => {
            state.verifying = true;
        });
        builder.addCase(verifyTransaction.fulfilled, (state) => {
            state.verifying = false;
        });
        builder.addCase(verifyTransaction.rejected, (state, action) => {
            state.verifying = false;
            state.error = action.payload;
        });

        // Refund Transaction
        builder.addCase(refundTransaction.pending, (state) => {
            state.refunding = true;
        });
        builder.addCase(refundTransaction.fulfilled, (state) => {
            state.refunding = false;
        });
        builder.addCase(refundTransaction.rejected, (state, action) => {
            state.refunding = false;
            state.error = action.payload;
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setFilters,
    clearFilters,
    setPagination,
    clearSelectedTransaction,
    clearError,
    resetVerifyState,
    resetRefundState,
} = transactionSlice.actions;

export default transactionSlice.reducer;