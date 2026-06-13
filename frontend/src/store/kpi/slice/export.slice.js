/**
 * Export Slice - Handle data exports (KPIs, Scores, Reports)
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exportService } from '../../../services/kpi';

// ============ Async Thunks ============

export const exportKPIs = createAsyncThunk(
  'export/exportKPIs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.exportKPIs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportScores = createAsyncThunk(
  'export/exportScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.exportScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportReport = createAsyncThunk(
  'export/exportReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.exportReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportDepartmentReport = createAsyncThunk(
  'export/exportDepartmentReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.exportDepartmentReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportKPIDetail = createAsyncThunk(
  'export/exportKPIDetail',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.exportKPIDetail(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  exporting: false,
  exportData: null,
  exportType: null,
  exportProgress: 0,
  error: null,
  lastExport: null,
};

// ============ Slice ============
const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    clearExportData: (state) => {
      state.exportData = null;
      state.exportType = null;
      state.exportProgress = 0;
    },
    setExportProgress: (state, action) => {
      state.exportProgress = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Export KPIs
      .addCase(exportKPIs.pending, (state) => {
        state.exporting = true;
        state.error = null;
        state.exportProgress = 0;
      })
      .addCase(exportKPIs.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
        state.exportType = 'kpis';
        state.exportProgress = 100;
        state.lastExport = new Date().toISOString();
      })
      .addCase(exportKPIs.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
        state.exportProgress = 0;
      })
      
      // Export Scores
      .addCase(exportScores.pending, (state) => {
        state.exporting = true;
        state.error = null;
        state.exportProgress = 0;
      })
      .addCase(exportScores.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
        state.exportType = 'scores';
        state.exportProgress = 100;
        state.lastExport = new Date().toISOString();
      })
      .addCase(exportScores.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
        state.exportProgress = 0;
      })
      
      // Export Report
      .addCase(exportReport.pending, (state) => {
        state.exporting = true;
        state.error = null;
        state.exportProgress = 0;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
        state.exportType = 'report';
        state.exportProgress = 100;
        state.lastExport = new Date().toISOString();
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
        state.exportProgress = 0;
      })
      
      // Export Department Report
      .addCase(exportDepartmentReport.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportDepartmentReport.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
        state.exportType = 'department_report';
        state.lastExport = new Date().toISOString();
      })
      .addCase(exportDepartmentReport.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      })
      
      // Export KPI Detail
      .addCase(exportKPIDetail.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportKPIDetail.fulfilled, (state, action) => {
        state.exporting = false;
        state.exportData = action.payload;
        state.exportType = 'kpi_detail';
        state.lastExport = new Date().toISOString();
      })
      .addCase(exportKPIDetail.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      });
  },
});

export const { clearExportData, setExportProgress, clearErrors } = exportSlice.actions;
export default exportSlice.reducer;