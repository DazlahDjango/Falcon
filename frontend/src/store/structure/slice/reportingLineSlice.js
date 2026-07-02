import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportingLineService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  myChain: null,
  myTeam: [],
  organizationSpan: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchReportingLines = createAsyncThunk(
  'reportingLines/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines');
    }
  }
);

export const fetchReportingLineById = createAsyncThunk(
  'reportingLines/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting line');
    }
  }
);

export const fetchReportingLinesByEmployee = createAsyncThunk(
  'reportingLines/fetchByEmployee',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getByEmployee(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines by employee');
    }
  }
);

export const fetchReportingLinesByManager = createAsyncThunk(
  'reportingLines/fetchByManager',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getByManager(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting lines by manager');
    }
  }
);

export const fetchReportingChain = createAsyncThunk(
  'reportingLines/fetchChain',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getChain(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reporting chain');
    }
  }
);

export const fetchSpanOfControl = createAsyncThunk(
  'reportingLines/fetchSpanOfControl',
  async (managerId, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getSpanOfControl(managerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch span of control');
    }
  }
);

export const fetchOrganizationSpan = createAsyncThunk(
  'reportingLines/fetchOrganizationSpan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getOrganizationSpan();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organization span');
    }
  }
);

export const fetchMyChain = createAsyncThunk(
  'reportingLines/fetchMyChain',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getMyChain();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my chain');
    }
  }
);

export const fetchMyTeam = createAsyncThunk(
  'reportingLines/fetchMyTeam',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.getMyTeam();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my team');
    }
  }
);

export const createReportingLine = createAsyncThunk(
  'reportingLines/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create reporting line');
    }
  }
);

export const updateReportingLine = createAsyncThunk(
  'reportingLines/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update reporting line');
    }
  }
);

export const deleteReportingLine = createAsyncThunk(
  'reportingLines/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reportingLineService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete reporting line');
    }
  }
);

export const assignManager = createAsyncThunk(
  'reportingLines/assignManager',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.assignManager(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign manager');
    }
  }
);

export const removeManager = createAsyncThunk(
  'reportingLines/removeManager',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reportingLineService.removeManager(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove manager');
    }
  }
);

const reportingLineSlice = createSlice({
  name: 'reportingLines',
  initialState,
  reducers: {
    clearReportingLineError: (state) => {
      state.error = null;
    },
    clearReportingLineCurrent: (state) => {
      state.currentItem = null;
    },
    setReportingLineFilters: (state, action) => {
      state.filters = action.payload;
    },
    setReportingLinePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetReportingLineState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportingLines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportingLines.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchReportingLines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchReportingLineById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportingLineById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchReportingLineById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyChain.fulfilled, (state, action) => {
        state.myChain = action.payload;
      })
      .addCase(fetchMyTeam.fulfilled, (state, action) => {
        state.myTeam = action.payload.results || action.payload || [];
      })
      .addCase(fetchOrganizationSpan.fulfilled, (state, action) => {
        state.organizationSpan = action.payload;
      })
      .addCase(createReportingLine.fulfilled, (state, action) => {
        const newLine = action.payload.data || action.payload;
        state.items.unshift(newLine);
        state.totalCount += 1;
      })
      .addCase(updateReportingLine.fulfilled, (state, action) => {
        const updatedLine = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedLine.id);
        if (index !== -1) {
          state.items[index] = updatedLine;
        }
        if (state.currentItem?.id === updatedLine.id) {
          state.currentItem = updatedLine;
        }
      })
      .addCase(deleteReportingLine.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearReportingLineError,
  clearReportingLineCurrent,
  setReportingLineFilters,
  setReportingLinePagination,
  resetReportingLineState,
} = reportingLineSlice.actions;

export default reportingLineSlice.reducer;