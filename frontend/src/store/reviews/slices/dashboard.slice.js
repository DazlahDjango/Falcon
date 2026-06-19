// src/store/reviews/slices/dashboard.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsDashboardService } from '../../../services/reviews';

// Async Thunks
const normalizeApiError = (error) => {
  const payload = error.response?.data;
  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;
  if (payload?.detail) return payload.detail;
  return error.message || 'An unexpected error occurred';
};

export const fetchStaffDashboard = createAsyncThunk(
  'reviewsDashboard/fetchStaff',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsDashboardService.getStaffDashboard();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const fetchSupervisorDashboard = createAsyncThunk(
  'reviewsDashboard/fetchSupervisor',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsDashboardService.getSupervisorDashboard();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const fetchExecutiveDashboard = createAsyncThunk(
  'reviewsDashboard/fetchExecutive',
  async (departmentId, { rejectWithValue }) => {
    try {
      return await reviewsDashboardService.getExecutiveDashboard(departmentId);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const fetchAdminDashboard = createAsyncThunk(
  'reviewsDashboard/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsDashboardService.getAdminDashboard();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const fetchDashboardMetrics = createAsyncThunk(
  'reviewsDashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsDashboardService.getMetrics();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

const initialState = {
  staff: null,
  supervisor: null,
  executive: null,
  admin: null,
  metrics: null,
  loading: false,
  error: null,
  selectedDashboard: 'staff',
};

const dashboardSlice = createSlice({
  name: 'reviewsDashboard',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    clearDashboards: (state) => {
      state.staff = null;
      state.supervisor = null;
      state.executive = null;
      state.admin = null;
      state.metrics = null;
    },
    setSelectedDashboard: (state, action) => {
      state.selectedDashboard = action.payload;
    },
    setMetrics: (state, action) => {
      state.metrics = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Staff Dashboard
    builder
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Supervisor Dashboard
    builder
      .addCase(fetchSupervisorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.supervisor = action.payload;
      })
      .addCase(fetchSupervisorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Executive Dashboard
    builder
      .addCase(fetchExecutiveDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExecutiveDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.executive = action.payload;
      })
      .addCase(fetchExecutiveDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Admin Dashboard
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Metrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ===== Exports =====
export const {
  resetState: resetDashboardState,
  clearDashboards,
  setSelectedDashboard,
  setMetrics,
  clearErrors,
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
export const dashboardActions = dashboardSlice.actions;
export default dashboardReducer;