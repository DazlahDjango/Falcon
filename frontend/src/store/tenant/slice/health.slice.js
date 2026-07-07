import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthService } from '../../../services/tenant';

const initialState = {
  health: null,
  organizationsHealth: null,
  loading: false,
  error: null,
  lastChecked: null,
};

export const fetchHealth = createAsyncThunk(
  'health/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await healthService.getHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrganizationsHealth = createAsyncThunk(
  'health/fetchOrganizationsHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await healthService.getOrganizationsHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealth: (state) => {
      state.health = null;
      state.organizationsHealth = null;
      state.lastChecked = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.health = action.payload;
        state.lastChecked = Date.now();
      })
      .addCase(fetchHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganizationsHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationsHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationsHealth = action.payload;
        state.lastChecked = Date.now();
      })
      .addCase(fetchOrganizationsHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearHealth,
  clearErrors,
} = healthSlice.actions;

export default healthSlice.reducer;