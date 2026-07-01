import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interimAssignmentService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  activeItems: [],
  expiringItems: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchInterimAssignments = createAsyncThunk(
  'interimAssignments/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch interim assignments');
    }
  }
);

export const fetchInterimAssignmentById = createAsyncThunk(
  'interimAssignments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch interim assignment');
    }
  }
);

export const fetchActiveInterimAssignments = createAsyncThunk(
  'interimAssignments/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.getActive();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch active interim assignments');
    }
  }
);

export const fetchExpiringInterimAssignments = createAsyncThunk(
  'interimAssignments/fetchExpiring',
  async (days, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.getExpiringSoon(days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch expiring interim assignments');
    }
  }
);

export const fetchInterimAssignmentsByEmployee = createAsyncThunk(
  'interimAssignments/fetchByEmployee',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.getByEmployee(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch interim assignments by employee');
    }
  }
);

export const createInterimAssignment = createAsyncThunk(
  'interimAssignments/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create interim assignment');
    }
  }
);

export const updateInterimAssignment = createAsyncThunk(
  'interimAssignments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update interim assignment');
    }
  }
);

export const deleteInterimAssignment = createAsyncThunk(
  'interimAssignments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await interimAssignmentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete interim assignment');
    }
  }
);

export const assignInterim = createAsyncThunk(
  'interimAssignments/assign',
  async (data, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.assign(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign interim');
    }
  }
);

export const endInterim = createAsyncThunk(
  'interimAssignments/end',
  async (data, { rejectWithValue }) => {
    try {
      const response = await interimAssignmentService.end(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to end interim assignment');
    }
  }
);

const interimAssignmentSlice = createSlice({
  name: 'interimAssignments',
  initialState,
  reducers: {
    clearInterimAssignmentError: (state) => {
      state.error = null;
    },
    clearInterimAssignmentCurrent: (state) => {
      state.currentItem = null;
    },
    setInterimAssignmentFilters: (state, action) => {
      state.filters = action.payload;
    },
    setInterimAssignmentPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetInterimAssignmentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterimAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInterimAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results || action.payload;
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchInterimAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchInterimAssignmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInterimAssignmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchInterimAssignmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveInterimAssignments.fulfilled, (state, action) => {
        state.activeItems = action.payload.active_assignments || action.payload;
      })
      .addCase(fetchExpiringInterimAssignments.fulfilled, (state, action) => {
        state.expiringItems = action.payload.expiring_soon || action.payload;
      })
      .addCase(createInterimAssignment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateInterimAssignment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(deleteInterimAssignment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearInterimAssignmentError,
  clearInterimAssignmentCurrent,
  setInterimAssignmentFilters,
  setInterimAssignmentPagination,
  resetInterimAssignmentState,
} = interimAssignmentSlice.actions;

export default interimAssignmentSlice.reducer;