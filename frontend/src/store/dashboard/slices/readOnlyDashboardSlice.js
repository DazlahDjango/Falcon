// frontend/src/store/dashboard/slices/readOnlyDashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { readOnlyService } from '../../../services/dashboard/readOnly.service';

const initialState = {
  data: null,
  period: 'current',
  viewType: 'executive',
  loading: false,
  exporting: false,
  error: null,
  lastUpdated: null
};

// ===================== ASYNC THUNKS =====================

export const fetchReadOnlyDashboard = createAsyncThunk(
  'readOnlyDashboard/fetchData',
  async ({ period, viewType } = {}, { rejectWithValue }) => {
    try {
      const response = await readOnlyService.getDashboardData({ period, viewType });
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch dashboard data');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const exportReadOnlyDashboard = createAsyncThunk(
  'readOnlyDashboard/export',
  async ({ period, viewType, format }, { rejectWithValue }) => {
    try {
      const response = await readOnlyService.exportDashboard({ period, viewType, format });
      if (response?.success || response?.data) {
        return { data: response.data, format };
      }
      return rejectWithValue(response?.message || 'Failed to export dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export dashboard');
    }
  }
);

export const refreshReadOnlyDashboard = createAsyncThunk(
  'readOnlyDashboard/refresh',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { period, viewType } = state.readOnlyDashboard;
    
    await dispatch(fetchReadOnlyDashboard({ period, viewType }));
    
    return { success: true };
  }
);

// ===================== SLICE =====================

const readOnlyDashboardSlice = createSlice({
  name: 'readOnlyDashboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    setViewType: (state, action) => {
      state.viewType = action.payload;
    },
    clearReadOnlyError: (state) => {
      state.error = null;
    },
    resetReadOnlyState: () => initialState,
    updateReadOnlyData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchReadOnlyDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReadOnlyDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchReadOnlyDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export
      .addCase(exportReadOnlyDashboard.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportReadOnlyDashboard.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportReadOnlyDashboard.rejected, (state) => {
        state.exporting = false;
      });
  }
});

export const {
  setPeriod,
  setViewType,
  clearReadOnlyError,
  resetReadOnlyState,
  updateReadOnlyData
} = readOnlyDashboardSlice.actions;

export default readOnlyDashboardSlice.reducer;