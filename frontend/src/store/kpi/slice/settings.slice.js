/**
 * Settings Slice - System settings, reference data, notifications
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchSystemSettings = createAsyncThunk(
  'settings/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'settings/updateSystemSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSystemSettings(settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetSystemSettings = createAsyncThunk(
  'settings/resetSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.resetSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReferenceData = createAsyncThunk(
  'settings/fetchReferenceData',
  async (include = ['users', 'departments'], { rejectWithValue }) => {
    try {
      const response = await settingsService.getReferenceData(include);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'settings/fetchNotificationPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getNotificationPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'settings/updateNotificationPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateNotificationPreferences(preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  systemSettings: null,
  referenceData: {
    users: [],
    departments: [],
  },
  notificationPreferences: null,
  
  loading: false,
  saving: false,
  error: null,
};

// ============ Slice ============
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettings: (state) => {
      state.systemSettings = null;
      state.referenceData = { users: [], departments: [] };
      state.notificationPreferences = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateSystemSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.systemSettings = action.payload;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      .addCase(resetSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = action.payload;
      })
      
      .addCase(fetchReferenceData.fulfilled, (state, action) => {
        state.referenceData = action.payload;
      })
      
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.notificationPreferences = action.payload;
      })
      
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.notificationPreferences = action.payload;
      });
  },
});

export const { clearSettings, clearErrors } = settingsSlice.actions;
export default settingsSlice.reducer;