/**
 * History Slice - Audit logs for KPIs, Actuals, Targets
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { historyService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchKPIHistory = createAsyncThunk(
  'history/fetchKPIHistory',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.history?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await historyService.getKPIHistory(queryParams);
      return { data: response.data, page, pageSize };
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
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.history?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await historyService.getActualHistory(queryParams);
      return { data: response.data, page, pageSize };
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
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.history?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await historyService.getTargetHistory(queryParams);
      return { data: response.data, page, pageSize };
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
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);
        state.kpiHistory = results;
        state.pagination = { page: page || 1, pageSize: pageSize || 20, total, totalPages: Math.max(1, Math.ceil(total / (pageSize || 20))) };
      })
      .addCase(fetchKPIHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchKPIHistoryForKPI.fulfilled, (state, action) => {
        state.kpiHistoryByKPI[action.payload.kpiId] = action.payload.data;
      })
      
      .addCase(fetchActualHistory.fulfilled, (state, action) => {
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);
        state.actualHistory = results;
        state.pagination = { page: page || 1, pageSize: pageSize || 20, total, totalPages: Math.max(1, Math.ceil(total / (pageSize || 20))) };
      })
      
      .addCase(fetchActualHistoryForActual.fulfilled, (state, action) => {
        state.actualHistoryByActual[action.payload.actualId] = action.payload.data;
      })
      
      .addCase(fetchTargetHistory.fulfilled, (state, action) => {
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);
        state.targetHistory = results;
        state.pagination = { page: page || 1, pageSize: pageSize || 20, total, totalPages: Math.max(1, Math.ceil(total / (pageSize || 20))) };
      })
      
      .addCase(fetchTargetHistoryForTarget.fulfilled, (state, action) => {
        state.targetHistoryByTarget[action.payload.targetId] = action.payload.data;
      });
  },
});

export const { clearHistory, clearErrors } = historySlice.actions;
export default historySlice.reducer;