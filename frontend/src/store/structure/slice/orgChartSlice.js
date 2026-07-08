import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orgChartService } from '../../../services/structure';

const initialState = {
  tree: null,
  preview: null,
  jsonData: null,
  isLoading: false,
  error: null,
};

export const fetchOrgChartTree = createAsyncThunk(
  'orgCharts/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getTree();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch org chart tree');
    }
  }
);

export const fetchOrgChartPreview = createAsyncThunk(
  'orgCharts/fetchPreview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getPreview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch org chart preview');
    }
  }
);

export const exportOrgChartJson = createAsyncThunk(
  'orgCharts/exportJson',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orgChartService.exportJson(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export org chart as JSON');
    }
  }
);

export const exportOrgChartCsv = createAsyncThunk(
  'orgCharts/exportCsv',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orgChartService.exportCsv(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export org chart as CSV');
    }
  }
);

const orgChartSlice = createSlice({
  name: 'orgCharts',
  initialState,
  reducers: {
    clearOrgChartError: (state) => {
      state.error = null;
    },
    resetOrgChartState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgChartTree.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrgChartTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tree = action.payload.tree || action.payload;
      })
      .addCase(fetchOrgChartTree.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrgChartPreview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrgChartPreview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preview = action.payload.preview || action.payload;
      })
      .addCase(fetchOrgChartPreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(exportOrgChartJson.fulfilled, (state, action) => {
        state.jsonData = action.payload;
      });
  },
});

export const {
  clearOrgChartError,
  resetOrgChartState,
} = orgChartSlice.actions;

export default orgChartSlice.reducer;