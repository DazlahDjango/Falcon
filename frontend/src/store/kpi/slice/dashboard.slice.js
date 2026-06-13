/**
 * Dashboard Slice - Individual, Manager, Executive, Champion Dashboards
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchIndividualDashboard = createAsyncThunk(
  'dashboard/fetchIndividual',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getIndividualDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchManagerDashboard = createAsyncThunk(
  'dashboard/fetchManager',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getManagerDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExecutiveDashboard = createAsyncThunk(
  'dashboard/fetchExecutive',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getExecutiveDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChampionDashboard = createAsyncThunk(
  'dashboard/fetchChampion',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getChampionDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAdminOverview = createAsyncThunk(
  'dashboard/fetchAdminOverview',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAdminOverview(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  individual: null,
  manager: null,
  executive: null,
  champion: null,
  adminOverview: null,
  
  loading: false,
  error: null,
  lastUpdated: null,
};

// ============ Slice ============
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboards: (state) => {
      state.individual = null;
      state.manager = null;
      state.executive = null;
      state.champion = null;
      state.adminOverview = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    updateDashboardTimestamp: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Individual Dashboard
      .addCase(fetchIndividualDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIndividualDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.individual = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchIndividualDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Manager Dashboard
      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.manager = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Executive Dashboard
      .addCase(fetchExecutiveDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExecutiveDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.executive = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchExecutiveDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Champion Dashboard
      .addCase(fetchChampionDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.champion = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchChampionDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin Overview
      .addCase(fetchAdminOverview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.adminOverview = action.payload;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboards, clearErrors, updateDashboardTimestamp } = dashboardSlice.actions;
export default dashboardSlice.reducer;