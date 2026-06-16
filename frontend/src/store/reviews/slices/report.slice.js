// src/store/reviews/slices/report.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsReportService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchEmployeeSummary = createAsyncThunk(
  'reports/fetchEmployeeSummary',
  async ({ employeeId, cycleId }, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getEmployeeSummary(employeeId, cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTeamSummary = createAsyncThunk(
  'reports/fetchTeamSummary',
  async ({ managerId, cycleId }, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getTeamSummary(managerId, cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCycleStatsReport = createAsyncThunk(
  'reports/fetchCycleStats',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getCycleStats(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPSummaryReport = createAsyncThunk(
  'reports/fetchPIPSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getPIPSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationSummaryReport = createAsyncThunk(
  'reports/fetchCalibrationSummary',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getCalibrationSummary(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRatingDistributionReport = createAsyncThunk(
  'reports/fetchRatingDistribution',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await reviewsReportService.getRatingDistribution(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/export',
  async ({ reportType, cycleId, format }, { rejectWithValue }) => {
    try {
      return await reviewsReportService.exportReport(reportType, cycleId, format);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  employeeSummary: null,
  teamSummary: null,
  cycleStats: null,
  pipSummary: null,
  calibrationSummary: null,
  ratingDistribution: null,
  exportData: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    clearAllReports: (state) => {
      state.employeeSummary = null;
      state.teamSummary = null;
      state.cycleStats = null;
      state.pipSummary = null;
      state.calibrationSummary = null;
      state.ratingDistribution = null;
      state.exportData = null;
    },
    clearExportData: (state) => {
      state.exportData = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Employee Summary =====
    builder
      .addCase(fetchEmployeeSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeSummary = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchEmployeeSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Team Summary =====
    builder
      .addCase(fetchTeamSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.teamSummary = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchTeamSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Cycle Stats =====
    builder
      .addCase(fetchCycleStatsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCycleStatsReport.fulfilled, (state, action) => {
        state.loading = false;
        state.cycleStats = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchCycleStatsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== PIP Summary =====
    builder
      .addCase(fetchPIPSummaryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPSummaryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.pipSummary = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchPIPSummaryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Calibration Summary =====
    builder
      .addCase(fetchCalibrationSummaryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrationSummaryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.calibrationSummary = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchCalibrationSummaryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Rating Distribution =====
    builder
      .addCase(fetchRatingDistributionReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingDistributionReport.fulfilled, (state, action) => {
        state.loading = false;
        state.ratingDistribution = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchRatingDistributionReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Export =====
    builder
      .addCase(exportReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.loading = false;
        state.exportData = action.payload;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const reviewsReportReducer = reportSlice.reducer;
export const reviewsReportActions = reportSlice.actions;
export const resetReportState = reportSlice.actions.resetState;
