import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BillingPortalService } from '../../../services/billing';

export const fetchPortalAccess = createAsyncThunk('billing/portal/fetchAccess', async (returnUrl = null, { rejectWithValue }) => {
    try {
        const response = await BillingPortalService.getPortalAccess(returnUrl);
        return response?.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to fetch portal access');
    }
});

export const fetchPortalOverview = createAsyncThunk('billing/portal/fetchOverview', async (_, { rejectWithValue }) => {
    try {
        const response = await BillingPortalService.getPortalOverview();
        return response?.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to fetch portal overview');
    }
});

const initialState = {
    portalAccess: null,
    portalOverview: null,
    loading: false,
    error: null,
    redirecting: false,
};

const billingPortalSlice = createSlice({
    name: 'billing/portal',
    initialState,
    reducers: {
        setRedirecting: (state, action) => {
            state.redirecting = action.payload;
        },
        clearPortalAccess: (state) => {
            state.portalAccess = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPortalAccess.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPortalAccess.fulfilled, (state, action) => {
            state.loading = false;
            state.portalAccess = action.payload;
        });
        builder.addCase(fetchPortalAccess.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(fetchPortalOverview.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPortalOverview.fulfilled, (state, action) => {
            state.loading = false;
            state.portalOverview = action.payload;
        });
        builder.addCase(fetchPortalOverview.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const { setRedirecting, clearPortalAccess, clearError } = billingPortalSlice.actions;
export default billingPortalSlice.reducer;