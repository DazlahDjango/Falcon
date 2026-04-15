import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsApi } from '../../../services/organisation/settingsService'; // API Import

// ============================================================
// Async Thunks
// ============================================================

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.get();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsApi.update(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotifications',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateNotificationSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'settings/updateSecurity',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateSecuritySettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update security settings');
    }
  }
);

export const updateBillingSettings = createAsyncThunk(
  'settings/updateBilling',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updateBillingSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update billing settings');
    }
  }
);

export const fetchApiKeys = createAsyncThunk(
  'settings/fetchApiKeys',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getApiKeys();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch API keys');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  settings: {
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: 1,
    week_start_day: 'monday',
    time_format: '24h',
    notification_preferences: {},
    security_settings: {},
    billing_settings: {},
  },
  apiKeys: [],
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSettings: (state) => {
      state.settings = initialState.settings;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings.notification_preferences = action.payload;
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.settings.security_settings = action.payload;
      })
      .addCase(updateBillingSettings.fulfilled, (state, action) => {
        state.settings.billing_settings = action.payload;
      })
      .addCase(fetchApiKeys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.loading = false;
        state.apiKeys = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;