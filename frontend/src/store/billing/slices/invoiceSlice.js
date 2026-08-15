import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InvoiceService } from '../../../services/billing';
import { INVOICE_STATUS } from '../../../config/constants/billingConstants';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchInvoices = createAsyncThunk(
    'billing/invoices/fetchAll',
    async ({ page = 1, pageSize = 20, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const response = await InvoiceService.getInvoices({ page, page_size: pageSize, ...filters });
            const data = response?.data;
            let items = [];
            let total = 0;
            if (Array.isArray(data)) {
                items = data;
                total = data.length;
            } else if (data && Array.isArray(data.results)) {
                items = data.results;
                total = data.count || data.results.length;
            } else if (data) {
                items = data.items || [];
                total = data.total || items.length;
            }
            return { items, total, page, pageSize };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch invoices');
        }
    }
);

export const fetchInvoiceById = createAsyncThunk(
    'billing/invoices/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await InvoiceService.getInvoice(id);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch invoice');
        }
    }
);

export const fetchInvoiceSummary = createAsyncThunk(
    'billing/invoices/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await InvoiceService.getInvoiceSummary();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch invoice summary');
        }
    }
);

export const downloadInvoice = createAsyncThunk(
    'billing/invoices/download',
    async ({ id, format = 'pdf' }, { rejectWithValue }) => {
        try {
            const response = await InvoiceService.downloadInvoice(id, format);
            return { id, format, data: response?.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to download invoice');
        }
    }
);

export const payInvoice = createAsyncThunk(
    'billing/invoices/pay',
    async ({ id, paymentMethodId = null }, { rejectWithValue, dispatch }) => {
        try {
            const response = await InvoiceService.payInvoice(id, { payment_method_id: paymentMethodId });
            await dispatch(fetchInvoiceById(id));
            await dispatch(fetchInvoiceSummary());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to pay invoice');
        }
    }
);

export const sendInvoiceEmail = createAsyncThunk(
    'billing/invoices/sendEmail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await InvoiceService.sendInvoiceEmail(id);
            return { id, data: response?.data };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to send invoice email');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    items: [],
    selectedInvoice: null,
    summary: null,
    loading: false,
    error: null,
    downloading: false,
    paying: false,
    sending: false,
    filters: {
        status: null,
        unpaidOnly: false,
        startDate: null,
        endDate: null,
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

const invoiceSlice = createSlice({
    name: 'billing/invoices',
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
        clearSelectedInvoice: (state) => {
            state.selectedInvoice = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetDownloadState: (state) => {
            state.downloading = false;
        },
        resetPayState: (state) => {
            state.paying = false;
        },
    },
    extraReducers: (builder) => {
        // Fetch Invoices
        builder.addCase(fetchInvoices.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchInvoices.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pageSize: action.payload.pageSize,
                total: action.payload.total,
            };
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchInvoices.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Invoice By ID
        builder.addCase(fetchInvoiceById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchInvoiceById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedInvoice = action.payload;
        });
        builder.addCase(fetchInvoiceById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Invoice Summary
        builder.addCase(fetchInvoiceSummary.fulfilled, (state, action) => {
            state.summary = action.payload;
        });

        // Download Invoice
        builder.addCase(downloadInvoice.pending, (state) => {
            state.downloading = true;
        });
        builder.addCase(downloadInvoice.fulfilled, (state) => {
            state.downloading = false;
        });
        builder.addCase(downloadInvoice.rejected, (state, action) => {
            state.downloading = false;
            state.error = action.payload;
        });

        // Pay Invoice
        builder.addCase(payInvoice.pending, (state) => {
            state.paying = true;
        });
        builder.addCase(payInvoice.fulfilled, (state) => {
            state.paying = false;
        });
        builder.addCase(payInvoice.rejected, (state, action) => {
            state.paying = false;
            state.error = action.payload;
        });

        // Send Invoice Email
        builder.addCase(sendInvoiceEmail.pending, (state) => {
            state.sending = true;
        });
        builder.addCase(sendInvoiceEmail.fulfilled, (state) => {
            state.sending = false;
        });
        builder.addCase(sendInvoiceEmail.rejected, (state, action) => {
            state.sending = false;
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
    clearSelectedInvoice,
    clearError,
    resetDownloadState,
    resetPayState,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;