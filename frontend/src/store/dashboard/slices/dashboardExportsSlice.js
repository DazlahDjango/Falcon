// frontend/src/store/dashboard/slices/dashboardExportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exportService } from '../../../services/dashboard/export.service';

const initialState = {
  exports: [],
  history: [],
  total: 0,
  loading: false,
  exporting: false,
  error: null,
  lastFetched: null
};

export const fetchExports = createAsyncThunk(
  'dashboardExports/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await exportService.getExports(filters);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch exports');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exports');
    }
  }
);

export const fetchExportHistory = createAsyncThunk(
  'dashboardExports/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await exportService.getExportHistory();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch export history');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch export history');
    }
  }
);

export const createExport = createAsyncThunk(
  'dashboardExports/create',
  async (exportData, { rejectWithValue }) => {
    try {
      const response = await exportService.createExport(exportData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create export');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create export');
    }
  }
);

export const updateExport = createAsyncThunk(
  'dashboardExports/update',
  async ({ exportId, exportData }, { rejectWithValue }) => {
    try {
      const response = await exportService.updateExport(exportId, exportData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update export');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update export');
    }
  }
);

export const deleteExport = createAsyncThunk(
  'dashboardExports/delete',
  async (exportId, { rejectWithValue }) => {
    try {
      const response = await exportService.deleteExport(exportId);
      if (response?.success) {
        return exportId;
      }
      return rejectWithValue(response?.message || 'Failed to delete export');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete export');
    }
  }
);

export const triggerExport = createAsyncThunk(
  'dashboardExports/trigger',
  async (exportId, { rejectWithValue }) => {
    try {
      const response = await exportService.triggerExport(exportId);
      if (response?.success) {
        return { exportId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to trigger export');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to trigger export');
    }
  }
);

const dashboardExportsSlice = createSlice({
  name: 'dashboardExports',
  initialState,
  reducers: {
    clearExportsError: (state) => {
      state.error = null;
    },
    resetExportsState: () => initialState,
    addLocalExport: (state, action) => {
      state.exports.unshift(action.payload);
      state.total += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExports.fulfilled, (state, action) => {
        state.loading = false;
        state.exports = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length || 0;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchExports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExportHistory.fulfilled, (state, action) => {
        state.history = action.payload.results || action.payload;
      })
      .addCase(createExport.fulfilled, (state, action) => {
        state.exports.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateExport.fulfilled, (state, action) => {
        const index = state.exports.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exports[index] = action.payload;
        }
      })
      .addCase(deleteExport.fulfilled, (state, action) => {
        state.exports = state.exports.filter(e => e.id !== action.payload);
        state.total -= 1;
      })
      .addCase(triggerExport.pending, (state) => {
        state.exporting = true;
      })
      .addCase(triggerExport.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(triggerExport.rejected, (state) => {
        state.exporting = false;
      });
  }
});

export const { clearExportsError, resetExportsState, addLocalExport } = dashboardExportsSlice.actions;
export default dashboardExportsSlice.reducer;