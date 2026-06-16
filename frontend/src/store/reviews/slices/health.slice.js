// src/store/reviews/slices/health.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsHealthService } from '../../../services/reviews';

// ============ Thunks ============

export const checkHealth = createAsyncThunk(
  'health/check',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsHealthService.healthCheck();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'health/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsHealthService.getMetrics();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  status: null,
  checks: {},
  metrics: null,
  loading: false,
  error: null,
  lastChecked: null,
};

const healthSlice = createSlice({
  name: 'health',
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
    // ===== Check Health =====
    builder
      .addCase(checkHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
        state.checks = action.payload.checks;
        state.lastChecked = new Date().toISOString();
      })
      .addCase(checkHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Metrics =====
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
        state.lastChecked = new Date().toISOString();
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const reviewsHealthReducer = healthSlice.reducer;
export const reviewsHealthActions = healthSlice.actions;
export const resetHealthState = healthSlice.actions.resetState;
