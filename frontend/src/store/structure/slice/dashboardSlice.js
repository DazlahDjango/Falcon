import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { structureDashboardService } from '../../../services/structure';

const initialState = {
  overview: null,
  health: null,
  trends: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureDashboardService.getOverview();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard overview');
    }
  }
);

export const fetchDashboardHealth = createAsyncThunk(
  'dashboard/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureDashboardService.getHierarchyHealth();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy health');
    }
  }
);

export const fetchDashboardTrends = createAsyncThunk(
  'dashboard/fetchTrends',
  async (months, { rejectWithValue }) => {
    try {
      const response = await structureDashboardService.getTrends(months);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard trends');
    }
  }
);

export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (months, { rejectWithValue }) => {
    try {
      const response = await structureDashboardService.getAllDashboardData(months);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardHealth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardHealth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.health = action.payload;
      })
      .addCase(fetchDashboardHealth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchDashboardTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload.overview;
        state.health = action.payload.health;
        state.trends = action.payload.trends;
      })
      .addCase(fetchAllDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDashboardError,
  resetDashboardState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;