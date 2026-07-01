import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as systemSettingsApi from '../../../services/accounts/api/system-settings';

const initialState = {
  settings: null,
  isLoading: false,
  isUpdating: false,
  isResetting: false,
  isSyncing: false,
  error: null,
  version: null,
};

export const fetchSystemSettings = createAsyncThunk(
  'systemSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.getSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch system settings');
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'systemSettings/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.updateSystemSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update system settings');
    }
  }
);

export const resetSystemSettings = createAsyncThunk(
  'systemSettings/reset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.resetSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset system settings');
    }
  }
);

export const syncPolicy = createAsyncThunk(
  'systemSettings/syncPolicy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.syncPolicy();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync policy');
    }
  }
);

const systemSettingsSlice = createSlice({
  name: 'systemSettings',
  initialState,
  reducers: {
    clearSystemSettingsError: (state) => {
      state.error = null;
    },
    resetSystemSettingsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSystemSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      .addCase(resetSystemSettings.pending, (state) => {
        state.isResetting = true;
        state.error = null;
      })
      .addCase(resetSystemSettings.fulfilled, (state, action) => {
        state.isResetting = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(resetSystemSettings.rejected, (state, action) => {
        state.isResetting = false;
        state.error = action.payload;
      })
      .addCase(syncPolicy.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncPolicy.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(syncPolicy.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSystemSettingsError,
  resetSystemSettingsState,
} = systemSettingsSlice.actions;

export default systemSettingsSlice.reducer;