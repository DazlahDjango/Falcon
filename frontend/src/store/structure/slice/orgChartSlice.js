import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orgChartService } from '../../../services/structure/orgChart.service';
import { initialOrgChartState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchOrgChartTree = createAsyncThunk(
  'structure/orgChart/fetchTree',
  async ({ includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getTreeView(includeInactive);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch org chart tree');
    }
  }
);

export const fetchFullOrgChart = createAsyncThunk(
  'structure/orgChart/fetchFull',
  async ({ rootDepartmentId = null } = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getFullOrgChart(rootDepartmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch full org chart');
    }
  }
);

export const fetchFlatOrgChart = createAsyncThunk(
  'structure/orgChart/fetchFlat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getFlatOrgChart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch flat org chart');
    }
  }
);

export const fetchOrgChartPreview = createAsyncThunk(
  'structure/orgChart/fetchPreview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getPreview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch org chart preview');
    }
  }
);

export const exportOrgChart = createAsyncThunk(
  'structure/orgChart/export',
  async ({ format, includeInactive = false, maxDepth = 10 }, { dispatch, rejectWithValue }) => {
    try {
      let response;
      switch (format) {
        case 'json':
          response = await orgChartService.exportAsJson('full');
          break;
        case 'csv':
          response = await orgChartService.exportAsCsv('departments', includeInactive);
          break;
        case 'text':
          response = await orgChartService.exportAsText(null, maxDepth);
          break;
        case 'visio':
          response = await orgChartService.exportAsVisio();
          break;
        default:
          response = await orgChartService.exportAsJson('full');
      }
      dispatch(showToast({ message: 'Export completed successfully', type: 'success' }));
      return { format, data: response };
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Export failed', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

const orgChartSlice = createSlice({
  name: 'structure/orgChart',
  initialState: initialOrgChartState,
  reducers: {
    setExportFormat: (state, action) => {
      state.exportFormat = action.payload;
    },
    clearOrgChartData: (state) => {
      state.treeData = null;
      state.flatData = [];
      state.previewData = null;
    },
    resetExportState: (state) => {
      state.isExporting = false;
      state.exportFormat = 'json';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgChartTree.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchOrgChartTree.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.treeData = action.payload;
      })
      .addCase(fetchOrgChartTree.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchFullOrgChart.fulfilled, (state, action) => {
        state.treeData = action.payload;
      })
      .addCase(fetchFlatOrgChart.fulfilled, (state, action) => {
        state.flatData = action.payload?.departments || action.payload || [];
      })
      .addCase(fetchOrgChartPreview.fulfilled, (state, action) => {
        state.previewData = action.payload;
      })
      .addCase(exportOrgChart.pending, (state) => {
        state.isExporting = true;
      })
      .addCase(exportOrgChart.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportOrgChart.rejected, (state) => {
        state.isExporting = false;
      });
  },
});
export const { setExportFormat, clearOrgChartData, resetExportState } = orgChartSlice.actions;
export default orgChartSlice.reducer;