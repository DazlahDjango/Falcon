import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService } from '../../../services/tenant';

const initialState = {
  settings: null,
  systemSettings: null,
  sectionSettings: {},
  loading: false,
  submitting: false,
  error: null,
  version: 0,
  resetResult: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSettingsSection = createAsyncThunk(
  'settings/fetchSettingsSection',
  async (section, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettingsSection(section);
      return { section, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSettingsSection = createAsyncThunk(
  'settings/updateSettingsSection',
  async ({ section, patch }, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettingsSection(section, patch);
      return { section, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.resetSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettings: (state) => {
      state.settings = null;
      state.systemSettings = null;
      state.sectionSettings = {};
      state.resetResult = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearSection: (state, action) => {
      const { section } = action.payload;
      delete state.sectionSettings[section];
    },
    clearAllSections: (state) => {
      state.sectionSettings = {};
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
        state.settings = action.payload;
        state.version = action.payload?.version || 0;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSettingsSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettingsSection.fulfilled, (state, action) => {
        state.loading = false;
        state.sectionSettings[action.payload.section] = action.payload.data;
      })
      .addCase(fetchSettingsSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.submitting = false;
        state.settings = action.payload;
        state.version = action.payload?.version || state.version + 1;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateSettingsSection.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateSettingsSection.fulfilled, (state, action) => {
        state.submitting = false;
        const { section, data } = action.payload;
        state.sectionSettings[section] = data;
        if (state.settings) {
          state.settings = { ...state.settings, ...data };
        }
        state.version = data?.version || state.version + 1;
      })
      .addCase(updateSettingsSection.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(resetSettings.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.submitting = false;
        state.resetResult = action.payload;
        state.settings = action.payload;
        state.version = action.payload?.version || 0;
        state.sectionSettings = {};
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetSystemSettings.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(resetSystemSettings.fulfilled, (state, action) => {
        state.submitting = false;
        state.resetResult = action.payload;
        state.systemSettings = action.payload;
      })
      .addCase(resetSystemSettings.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSettings,
  clearErrors,
  clearSection,
  clearAllSections,
} = settingsSlice.actions;

export default settingsSlice.reducer;