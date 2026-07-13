import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../../services/tenant';

const initialState = {
  superAdminDashboard: null,
  clientAdminDashboard: null,
  organizationStats: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchSuperAdminDashboard = createAsyncThunk(
  'dashboard/fetchSuperAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSuperAdminDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchClientAdminDashboard = createAsyncThunk(
  'dashboard/fetchClientAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getClientAdminDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrganizationStats = createAsyncThunk(
  'dashboard/fetchOrganizationStats',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getOrganizationStats(organizationId);
      return { organizationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.superAdminDashboard = null;
      state.clientAdminDashboard = null;
      state.organizationStats = null;
      state.lastFetched = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearOrganizationStats: (state) => {
      state.organizationStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.superAdminDashboard = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSuperAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.clientAdminDashboard = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchClientAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganizationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationStats = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOrganizationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDashboard,
  clearErrors,
  clearOrganizationStats,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;