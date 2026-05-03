import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportingService } from '../../../services/structure/reporting.service';
import { initialReportingState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchReportingLines = createAsyncThunk(
  'structure/reporting/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await reportingService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines');
    }
  }
);

export const fetchReportingLinesByEmployee = createAsyncThunk(
  'structure/reporting/fetchByEmployee',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingService.getByEmployee(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines for employee');
    }
  }
);

export const fetchReportingLinesByManager = createAsyncThunk(
  'structure/reporting/fetchByManager',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingService.getByManager(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines for manager');
    }
  }
);

export const fetchReportingChain = createAsyncThunk(
  'structure/reporting/fetchChain',
  async ({ userId, includeSelf = true }, { rejectWithValue }) => {
    try {
      const response = await reportingService.getChainUp(userId, includeSelf);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting chain');
    }
  }
);

export const fetchSpanOfControl = createAsyncThunk(
  'structure/reporting/fetchSpanOfControl',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingService.getSpanOfControl(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch span of control');
    }
  }
);

export const fetchOrganizationSpan = createAsyncThunk(
  'structure/reporting/fetchOrganizationSpan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportingService.getOrganizationSpan();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organization span');
    }
  }
);

export const createReportingLine = createAsyncThunk(
  'structure/reporting/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await reportingService.create(data);
      dispatch(showToast({ message: 'Reporting line created successfully', type: 'success' }));
      dispatch(fetchReportingLines({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to create reporting line', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateReportingLine = createAsyncThunk(
  'structure/reporting/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await reportingService.update(id, data);
      dispatch(showToast({ message: 'Reporting line updated successfully', type: 'success' }));
      dispatch(fetchReportingLines({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update reporting line', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReportingLine = createAsyncThunk(
  'structure/reporting/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await reportingService.delete(id);
      dispatch(showToast({ message: 'Reporting line deleted successfully', type: 'success' }));
      dispatch(fetchReportingLines({}));
      return id;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to delete reporting line', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const assignMatrixReporting = createAsyncThunk(
  'structure/reporting/assignMatrix',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await reportingService.assignMatrixReporting(data);
      dispatch(showToast({ message: 'Matrix reporting assigned successfully', type: 'success' }));
      dispatch(fetchReportingLinesByEmployee(data.employee_user_id));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to assign matrix reporting', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const assignInterimManager = createAsyncThunk(
  'structure/reporting/assignInterim',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await reportingService.assignInterimManager(data);
      dispatch(showToast({ message: 'Interim manager assigned successfully', type: 'success' }));
      dispatch(fetchReportingLinesByEmployee(data.employee_user_id));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to assign interim manager', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Reporting Slice
 */
const reportingSlice = createSlice({
  name: 'structure/reporting',
  initialState: initialReportingState,
  reducers: {
    setReportingPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedReportingLine: (state) => {
      state.selectedReportingLine = null;
    },
    clearMatrixRelations: (state) => {
      state.matrixRelations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportingLines.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchReportingLines.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchReportingLines.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchReportingLinesByEmployee.fulfilled, (state, action) => {
        state.matrixRelations = action.payload?.results || action.payload || [];
      })
      .addCase(fetchReportingLinesByManager.fulfilled, (state, action) => {
        state.items = action.payload?.results || action.payload || [];
      })
      .addCase(fetchReportingChain.fulfilled, (state, action) => {
        // Chain data stored in separate state or used directly
      })
      .addCase(fetchSpanOfControl.fulfilled, (state, action) => {
        state.spanOfControl = action.payload;
      })
      .addCase(fetchOrganizationSpan.fulfilled, (state, action) => {
        state.organizationSpan = action.payload;
      })
      .addCase(deleteReportingLine.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.matrixRelations = state.matrixRelations.filter(item => item.id !== action.payload);
      });
  },
});

export const {
  setReportingPage,
  clearSelectedReportingLine,
  clearMatrixRelations,
} = reportingSlice.actions;

export default reportingSlice.reducer;