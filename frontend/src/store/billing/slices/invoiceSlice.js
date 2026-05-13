import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '../../../services/billing/invoice.service';
export const fetchInvoices = createAsyncThunk(
    'billing/invoices/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await invoiceService.getInvoices(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchInvoiceDetail = createAsyncThunk(
    'billing/invoices/fetchDetail',
    async (invoiceId, { rejectWithValue }) => {
        try {
            const response = await invoiceService.getInvoiceById(invoiceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchOutstandingInvoices = createAsyncThunk(
    'billing/invoices/fetchOutstanding',
    async (_, { rejectWithValue }) => {
        try {
            const response = await invoiceService.getOutstandingInvoices();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchInvoiceSummary = createAsyncThunk(
    'billing/invoices/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await invoiceService.getInvoiceSummary();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    invoices: [],
    currentInvoice: null,
    outstandingInvoices: [],
    summary: null,
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    isLoading: false,
    isDownloading: false,
    error: null,
};

const invoiceSlice = createSlice({
    name: 'billingInvoices',
    initialState,
    reducers: {
        clearInvoiceError: (state) => {
            state.error = null;
        },
        setInvoicePage: (state, action) => {
            state.pagination.page = action.payload;
        },
        resetInvoices: (state) => {
            state.invoices = [];
            state.currentInvoice = null;
            state.outstandingInvoices = [];
            state.summary = null;
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvoices.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.invoices = action.payload?.invoices || [];
                state.pagination = {
                    page: action.payload?.page || 1,
                    pageSize: action.payload?.page_size || 20,
                    total: action.payload?.count || 0,
                };
                state.summary = action.payload?.summary;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchInvoiceDetail.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchInvoiceDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInvoice = action.payload;
            })
            .addCase(fetchInvoiceDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchOutstandingInvoices.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOutstandingInvoices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.outstandingInvoices = action.payload?.invoices || [];
            })
            .addCase(fetchOutstandingInvoices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchInvoiceSummary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchInvoiceSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
            })
            .addCase(fetchInvoiceSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});
export const { clearInvoiceError, setInvoicePage, resetInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;