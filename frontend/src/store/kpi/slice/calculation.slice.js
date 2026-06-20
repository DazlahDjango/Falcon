/**
 * Calculation Slice - Trigger and track score calculations
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calculationService } from '../../../services/kpi';

// ============ Async Thunks ============

export const triggerCalculation = createAsyncThunk(
  'calculation/trigger',
  async ({ year, month, force = false, userIds = null }, { rejectWithValue }) => {
    try {
      const response = await calculationService.triggerCalculation(year, month, force, userIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCalculationStatus = createAsyncThunk(
  'calculation/getStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await calculationService.getCalculationStatus(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkCalculationStatus = createAsyncThunk(
  'calculation/checkStatus',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await calculationService.checkCalculationStatus(year, month);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ NEW: Fetch Calculation History ============
export const fetchCalculationHistory = createAsyncThunk(
  'calculation/fetchHistory',
  async ({ page = 1, pageSize = 20, year = null, month = null }, { rejectWithValue }) => {
    try {
      // If calculationService doesn't have getCalculationHistory, you can use this approach
      // For now, returning mock data or you can implement the service method
      const response = await calculationService.getCalculationHistory?.({ page, pageSize, year, month }) || {
        data: {
          results: [],
          count: 0,
          next: null,
          previous: null
        }
      };
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  activeTask: null,
  taskStatus: null,
  lastCalculation: null,
  history: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  },
  triggering: false,
  polling: false,
  loading: false,
  error: null,
};

// ============ Slice ============
const calculationSlice = createSlice({
  name: 'calculation',
  initialState,
  reducers: {
    clearActiveTask: (state) => {
      state.activeTask = null;
      state.taskStatus = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    updateTaskStatus: (state, action) => {
      state.taskStatus = action.payload;
    },
    clearHistory: (state) => {
      state.history = initialState.history;
    },
  },
  extraReducers: (builder) => {
    builder
      // Trigger Calculation
      .addCase(triggerCalculation.pending, (state) => {
        state.triggering = true;
        state.error = null;
      })
      .addCase(triggerCalculation.fulfilled, (state, action) => {
        state.triggering = false;
        state.activeTask = action.payload;
        state.taskStatus = action.payload;
      })
      .addCase(triggerCalculation.rejected, (state, action) => {
        state.triggering = false;
        state.error = action.payload;
      })
      
      // Get Calculation Status
      .addCase(getCalculationStatus.pending, (state) => {
        state.polling = true;
      })
      .addCase(getCalculationStatus.fulfilled, (state, action) => {
        state.polling = false;
        state.taskStatus = action.payload;
        if (action.payload.status === 'COMPLETED') {
          state.lastCalculation = new Date().toISOString();
          state.activeTask = null;
        }
      })
      .addCase(getCalculationStatus.rejected, (state) => {
        state.polling = false;
      })
      
      // Check Calculation Status
      .addCase(checkCalculationStatus.fulfilled, (state, action) => {
        state.lastCalculation = action.payload.last_calculation;
      })
      
      // Fetch Calculation History
      .addCase(fetchCalculationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalculationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history.items = action.payload.results || action.payload || [];
        state.history.total = action.payload.count || state.history.items.length;
        state.history.page = action.payload.page || 1;
        state.history.totalPages = action.payload.totalPages || Math.ceil(state.history.total / state.history.pageSize);
      })
      .addCase(fetchCalculationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActiveTask, clearErrors, updateTaskStatus, clearHistory } = calculationSlice.actions;
export default calculationSlice.reducer;