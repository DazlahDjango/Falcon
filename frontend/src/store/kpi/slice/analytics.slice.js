/**
 * Analytics Slice - KPISummaries, DepartmentRollups, OrganizationHealth, Insights
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchKPISummaries = createAsyncThunk(
  'analytics/fetchKPISummaries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getKPISummaries(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartmentRollups = createAsyncThunk(
  'analytics/fetchDepartmentRollups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDepartmentRollups(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrganizationHealth = createAsyncThunk(
  'analytics/fetchOrganizationHealth',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getOrganizationHealth(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrganizationHealthHistory = createAsyncThunk(
  'analytics/fetchOrganizationHealthHistory',
  async (months = 12, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getOrganizationHealthHistory(months);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInsights = createAsyncThunk(
  'analytics/fetchInsights',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getInsights(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPredictions = createAsyncThunk(
  'analytics/fetchPredictions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getPredictions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHeatmap = createAsyncThunk(
  'analytics/fetchHeatmap',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getHeatmap(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.exportAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCustomReport = createAsyncThunk(
  'analytics/createCustomReport',
  async ({ reportType, format, filters }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.createCustomReport(reportType, format, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getReportStatus = createAsyncThunk(
  'analytics/getReportStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getReportStatus(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  kpiSummaries: [],
  departmentRollups: [],
  organizationHealth: null,
  organizationHealthHistory: [],
  insights: null,
  predictions: null,
  heatmap: null,
  exportData: null,
  reportTask: null,
  
  loading: false,
  exporting: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.kpiSummaries = [];
      state.departmentRollups = [];
      state.organizationHealth = null;
      state.organizationHealthHistory = [];
      state.insights = null;
      state.predictions = null;
      state.heatmap = null;
    },
    clearExport: (state) => {
      state.exportData = null;
      state.reportTask = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKPISummaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKPISummaries.fulfilled, (state, action) => {
        state.loading = false;
        state.kpiSummaries = action.payload.results || action.payload;
        if (action.payload.count) state.pagination.total = action.payload.count;
      })
      .addCase(fetchKPISummaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchDepartmentRollups.fulfilled, (state, action) => {
        state.departmentRollups = action.payload.results || action.payload;
      })
      
      .addCase(fetchOrganizationHealth.fulfilled, (state, action) => {
        state.organizationHealth = action.payload;
      })
      
      .addCase(fetchOrganizationHealthHistory.fulfilled, (state, action) => {
        state.organizationHealthHistory = action.payload;
      })
      
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.insights = action.payload;
      })
      
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.predictions = action.payload;
      })
      
      .addCase(fetchHeatmap.fulfilled, (state, action) => {
        state.heatmap = action.payload;
      })
      
      .addCase(exportAnalytics.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportAnalytics.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
      })
      .addCase(exportAnalytics.rejected, (state) => {
        state.exporting = false;
      })
      
      .addCase(createCustomReport.fulfilled, (state, action) => {
        state.reportTask = action.payload;
      })
      
      .addCase(getReportStatus.fulfilled, (state, action) => {
        state.reportTask = action.payload;
      });
  },
});

export const { clearAnalytics, clearExport, clearErrors } = analyticsSlice.actions;
export default analyticsSlice.reducer;