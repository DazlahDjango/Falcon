import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { structureSystemSettingsService } from '../../../services/structure';

const initialState = {
  settings: null,
  isLoading: false,
  error: null,
  version: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureSystemSettingsService.getSettings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await structureSystemSettingsService.updateSettings(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/reset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureSystemSettingsService.resetSettings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reset settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    resetSettingsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resetSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.version = action.payload.version;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSettingsError,
  resetSettingsState,
} = settingsSlice.actions;

export default settingsSlice.reducer;