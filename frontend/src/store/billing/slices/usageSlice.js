import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UsageService } from '../../../services/billing';

export const trackUsage = createAsyncThunk('billing/usage/track', async ({ usageType, delta = 1 }, { rejectWithValue }) => {
    try { const response = await UsageService.trackUsage(usageType, delta); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to track usage'); }
});

export const fetchUsageSummary = createAsyncThunk('billing/usage/fetchSummary', async (_, { rejectWithValue }) => {
    try { const response = await UsageService.getUsageSummary(); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch usage summary'); }
});

export const fetchCurrentLimits = createAsyncThunk('billing/usage/fetchLimits', async (_, { rejectWithValue }) => {
    try { const response = await UsageService.getCurrentLimits(); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch current limits'); }
});

export const checkLimit = createAsyncThunk('billing/usage/checkLimit', async ({ usageType, currentValue }, { rejectWithValue }) => {
    try { const response = await UsageService.checkLimit(usageType, currentValue); return response; }
    catch (error) { return rejectWithValue(error.message || 'Failed to check limit'); }
});

const initialState = {
    summary: null, limits: null, recentTrackings: [], loading: false, error: null, alerts: [],
};

const usageSlice = createSlice({
    name: 'billing/usage', initialState,
    reducers: {
        clearAlerts: (state) => { state.alerts = []; },
        clearError: (state) => { state.error = null; },
        addAlert: (state, action) => { state.alerts.push({ ...action.payload, timestamp: Date.now() }); },
    },
    extraReducers: (builder) => {
        builder.addCase(trackUsage.pending, (state) => { state.loading = true; });
        builder.addCase(trackUsage.fulfilled, (state, action) => { state.loading = false; state.recentTrackings.unshift({ ...action.payload, timestamp: Date.now() }); state.recentTrackings = state.recentTrackings.slice(0, 50); if (action.payload?.isSoftExceeded || action.payload?.isHardExceeded) { state.alerts.push({ type: action.payload.isHardExceeded ? 'hard' : 'soft', ...action.payload, timestamp: Date.now() }); } });
        builder.addCase(trackUsage.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(fetchUsageSummary.pending, (state) => { state.loading = true; });
        builder.addCase(fetchUsageSummary.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; });
        builder.addCase(fetchUsageSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(fetchCurrentLimits.fulfilled, (state, action) => { state.limits = action.payload; });
    },
});

export const { clearAlerts, clearError, addAlert } = usageSlice.actions;
export default usageSlice.reducer;