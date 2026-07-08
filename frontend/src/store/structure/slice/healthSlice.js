import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { structureHealthService } from '../../../services/structure';

const initialState = {
  database: null,
  cache: null,
  services: null,
  admin: null,
  metrics: null,
  isLoading: false,
  error: null,
};

export const fetchDatabaseHealth = createAsyncThunk(
  'health/fetchDatabase',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getDatabaseHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch database health');
    }
  }
);

export const fetchCacheHealth = createAsyncThunk(
  'health/fetchCache',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getCacheHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cache health');
    }
  }
);

export const fetchServicesHealth = createAsyncThunk(
  'health/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getServicesHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch services health');
    }
  }
);

export const fetchAdminHealth = createAsyncThunk(
  'health/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getAdminHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch admin health');
    }
  }
);

export const fetchHealthMetrics = createAsyncThunk(
  'health/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getMetrics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch health metrics');
    }
  }
);

export const fetchAllHealthChecks = createAsyncThunk(
  'health/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureHealthService.getAllHealthChecks();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch health checks');
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealthError: (state) => {
      state.error = null;
    },
    resetHealthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDatabaseHealth.fulfilled, (state, action) => {
        state.database = action.payload;
      })
      .addCase(fetchCacheHealth.fulfilled, (state, action) => {
        state.cache = action.payload;
      })
      .addCase(fetchServicesHealth.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(fetchAdminHealth.fulfilled, (state, action) => {
        state.admin = action.payload;
      })
      .addCase(fetchHealthMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(fetchAllHealthChecks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllHealthChecks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.database = action.payload.database;
        state.cache = action.payload.cache;
        state.services = action.payload.services;
        state.admin = action.payload.admin;
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchAllHealthChecks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearHealthError,
  resetHealthState,
} = healthSlice.actions;

export default healthSlice.reducer;