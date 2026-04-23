import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { featureFlagApi } from '../../../services/organisations/api';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all feature flags
 */
export const fetchFeatureFlags = createAsyncThunk(
  'featureFlags/fetchFeatureFlags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await featureFlagApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feature flags');
    }
  }
);

/**
 * Fetch feature flag by ID
 */
export const fetchFeatureFlagById = createAsyncThunk(
  'featureFlags/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await featureFlagApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feature flag');
    }
  }
);

/**
 * Create feature flag
 */
export const createFeatureFlag = createAsyncThunk(
  'featureFlags/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await featureFlagApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create feature flag');
    }
  }
);

/**
 * Update feature flag
 */
export const updateFeatureFlag = createAsyncThunk(
  'featureFlags/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await featureFlagApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update feature flag');
    }
  }
);

/**
 * Delete feature flag
 */
export const deleteFeatureFlag = createAsyncThunk(
  'featureFlags/delete',
  async (id, { rejectWithValue }) => {
    try {
      await featureFlagApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete feature flag');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  featureFlags: [],
  currentFeatureFlag: null,
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const featureFlagSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    clearFeatureFlagError: (state) => {
      state.error = null;
    },
    clearFeatureFlags: (state) => {
      state.featureFlags = [];
      state.currentFeatureFlag = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchFeatureFlags
      // ============================================================
      .addCase(fetchFeatureFlags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeatureFlags.fulfilled, (state, action) => {
        state.loading = false;
        state.featureFlags = action.payload.results || action.payload;
      })
      .addCase(fetchFeatureFlags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================================================
      // fetchFeatureFlagById
      // ============================================================
      .addCase(fetchFeatureFlagById.fulfilled, (state, action) => {
        state.currentFeatureFlag = action.payload;
      })

      // ============================================================
      // createFeatureFlag
      // ============================================================
      .addCase(createFeatureFlag.fulfilled, (state, action) => {
        state.featureFlags.push(action.payload);
      })

      // ============================================================
      // updateFeatureFlag
      // ============================================================
      .addCase(updateFeatureFlag.fulfilled, (state, action) => {
        const index = state.featureFlags.findIndex(flag => flag.id === action.payload.id);
        if (index !== -1) {
          state.featureFlags[index] = action.payload;
        }
      })

      // ============================================================
      // deleteFeatureFlag
      // ============================================================
      .addCase(deleteFeatureFlag.fulfilled, (state, action) => {
        state.featureFlags = state.featureFlags.filter(flag => flag.id !== action.payload);
      });
  },
});

export const { clearFeatureFlagError, clearFeatureFlags } = featureFlagSlice.actions;
export default featureFlagSlice.reducer;