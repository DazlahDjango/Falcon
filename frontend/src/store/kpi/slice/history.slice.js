/**
 * History Slice - Audit logs for KPIs, Actuals, Targets
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { historyService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchKPIHistory = createAsyncThunk(
  'history/fetchKPIHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await historyService.getKPIHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchKPIHistoryForKPI = createAsyncThunk(
  'history/fetchKPIHistoryForKPI',
  async ({ kpiId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await historyService.getKPIHistoryForKPI(kpiId, params);
      return { kpiId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActualHistory = createAsyncThunk(
  'history/fetchActualHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await historyService.getActualHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActualHistoryForActual = createAsyncThunk(
  'history/fetchActualHistoryForActual',
  async ({ actualId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await historyService.getActualHistoryForActual(actualId, params);
      return { actualId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTargetHistory = createAsyncThunk(
  'history/fetchTargetHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await historyService.getTargetHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTargetHistoryForTarget = createAsyncThunk(
  'history/fetchTargetHistoryForTarget',
  async ({ targetId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await historyService.getTargetHistoryForTarget(targetId, params);
      return { targetId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  kpiHistory: [],
  kpiHistoryByKPI: {},
  actualHistory: [],
  actualHistoryByActual: {},
  targetHistory: [],
  targetHistoryByTarget: {},
  
  loading: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.kpiHistory = [];
      state.kpiHistoryByKPI = {};
      state.actualHistory = [];
      state.actualHistoryByActual = {};
      state.targetHistory = [];
      state.targetHistoryByTarget = {};
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKPIHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKPIHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.kpiHistory = action.payload.results || action.payload;
        if (action.payload.count) state.pagination.total = action.payload.count;
      })
      .addCase(fetchKPIHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchKPIHistoryForKPI.fulfilled, (state, action) => {
        state.kpiHistoryByKPI[action.payload.kpiId] = action.payload.data;
      })
      
      .addCase(fetchActualHistory.fulfilled, (state, action) => {
        state.actualHistory = action.payload.results || action.payload;
      })
      
      .addCase(fetchActualHistoryForActual.fulfilled, (state, action) => {
        state.actualHistoryByActual[action.payload.actualId] = action.payload.data;
      })
      
      .addCase(fetchTargetHistory.fulfilled, (state, action) => {
        state.targetHistory = action.payload.results || action.payload;
      })
      
      .addCase(fetchTargetHistoryForTarget.fulfilled, (state, action) => {
        state.targetHistoryByTarget[action.payload.targetId] = action.payload.data;
      });
  },
});

export const { clearHistory, clearErrors } = historySlice.actions;
export default historySlice.reducer;