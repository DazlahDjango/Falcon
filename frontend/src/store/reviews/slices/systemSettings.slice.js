// src/store/reviews/slices/systemSettings.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsHealthService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchSystemSettings = createAsyncThunk(
  'systemSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsHealthService.getSystemSettings();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'systemSettings/update',
  async (settings, { rejectWithValue }) => {
    try {
      return await reviewsHealthService.updateSystemSettings(settings);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetSystemSettings = createAsyncThunk(
  'systemSettings/reset',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsHealthService.resetSystemSettings();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  settings: null,
  loading: false,
  error: null,
  isUpdating: false,
  lastUpdated: null,
};

const systemSettingsSlice = createSlice({
  name: 'systemSettings',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch =====
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updateSystemSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // ===== Reset =====
    builder
      .addCase(resetSystemSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(resetSystemSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(resetSystemSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const reviewsSystemSettingsReducer = systemSettingsSlice.reducer;
export default reviewsSystemSettingsReducer;
export const reviewsSystemSettingsActions = systemSettingsSlice.actions;
export const resetSystemSettingsState = systemSettingsSlice.actions.resetState;