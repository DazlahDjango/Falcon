import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billingSettingsService } from '../../../services/billing/settings.service';

export const fetchSettings = createAsyncThunk('billing/systemSettings/fetch', async (_, { rejectWithValue }) => {
    try {
        const response = await billingSettingsService.getSettings();
        return response?.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to fetch system settings');
    }
});

export const updateSettings = createAsyncThunk('billing/systemSettings/update', async (patch, { rejectWithValue }) => {
    try {
        const response = await billingSettingsService.updateSettings(patch);
        return response?.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to update system settings');
    }
});

export const resetSettings = createAsyncThunk('billing/systemSettings/reset', async (_, { rejectWithValue }) => {
    try {
        const response = await billingSettingsService.resetSettings();
        return response?.data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to reset system settings');
    }
});

const initialState = {
    settings: null,
    loading: false,
    error: null,
    version: 0,
    lastFetched: null,
};

const systemSettingsSlice = createSlice({
    name: 'billing/systemSettings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSettings: (state) => {
            state.settings = null;
            state.version = 0;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.settings = action.payload;
            state.version = (state.version || 0) + 1;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(updateSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.settings = action.payload;
            state.version = (state.version || 0) + 1;
        });
        builder.addCase(updateSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(resetSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(resetSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.settings = action.payload;
            state.version = (state.version || 0) + 1;
        });
        builder.addCase(resetSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const { clearError, clearSettings } = systemSettingsSlice.actions;
export default systemSettingsSlice.reducer;