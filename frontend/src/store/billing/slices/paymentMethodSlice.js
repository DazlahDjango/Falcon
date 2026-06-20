import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PaymentMethodService } from '../../../services/billing';

export const fetchPaymentMethods = createAsyncThunk('billing/paymentMethods/fetchAll', async (_, { rejectWithValue }) => {
    try { const response = await PaymentMethodService.getPaymentMethods(); return response?.data || []; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch payment methods'); }
});

export const addPaymentMethod = createAsyncThunk('billing/paymentMethods/add', async ({ authorizationCode, email }, { rejectWithValue, dispatch }) => {
    try { const response = await PaymentMethodService.addPaymentMethod(authorizationCode, email); await dispatch(fetchPaymentMethods()); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to add payment method'); }
});

export const deletePaymentMethod = createAsyncThunk('billing/paymentMethods/delete', async (id, { rejectWithValue, dispatch }) => {
    try { await PaymentMethodService.deletePaymentMethod(id); await dispatch(fetchPaymentMethods()); return id; }
    catch (error) { return rejectWithValue(error.message || 'Failed to delete payment method'); }
});

export const setDefaultPaymentMethod = createAsyncThunk('billing/paymentMethods/setDefault', async (id, { rejectWithValue, dispatch }) => {
    try { const response = await PaymentMethodService.setDefaultPaymentMethod(id); await dispatch(fetchPaymentMethods()); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to set default payment method'); }
});

const initialState = {
    items: [], defaultMethod: null, selectedMethod: null, loading: false, error: null, adding: false, deleting: false,
};

const paymentMethodSlice = createSlice({
    name: 'billing/paymentMethods', initialState,
    reducers: {
        setSelectedMethod: (state, action) => { state.selectedMethod = action.payload; },
        clearSelectedMethod: (state) => { state.selectedMethod = null; },
        clearError: (state) => { state.error = null; },
        resetAddState: (state) => { state.adding = false; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPaymentMethods.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchPaymentMethods.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.defaultMethod = action.payload.find(m => m.is_default) || action.payload[0] || null; });
        builder.addCase(fetchPaymentMethods.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(addPaymentMethod.pending, (state) => { state.adding = true; });
        builder.addCase(addPaymentMethod.fulfilled, (state) => { state.adding = false; });
        builder.addCase(addPaymentMethod.rejected, (state, action) => { state.adding = false; state.error = action.payload; });
        builder.addCase(deletePaymentMethod.fulfilled, (state, action) => { state.items = state.items.filter(m => m.id !== action.payload); if (state.defaultMethod?.id === action.payload) state.defaultMethod = state.items.find(m => m.is_default) || state.items[0] || null; });
        builder.addCase(setDefaultPaymentMethod.fulfilled, (state, action) => { if (action.payload) { state.defaultMethod = action.payload; state.items = state.items.map(m => ({ ...m, is_default: m.id === action.payload.id })); } });
    },
});

export const { setSelectedMethod, clearSelectedMethod, clearError, resetAddState } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;