import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employmentService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  currentEmployments: [],
  stats: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchEmployments = createAsyncThunk(
  'employments/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employmentService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employments');
    }
  }
);

export const fetchEmploymentById = createAsyncThunk(
  'employments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employmentService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employment');
    }
  }
);

export const fetchCurrentEmployments = createAsyncThunk(
  'employments/fetchCurrent',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employmentService.getCurrent(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch current employments');
    }
  }
);

export const fetchEmploymentsByUser = createAsyncThunk(
  'employments/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await employmentService.getByUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employments by user');
    }
  }
);

export const fetchEmploymentStats = createAsyncThunk(
  'employments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employmentService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employment stats');
    }
  }
);

export const fetchMyEmployment = createAsyncThunk(
  'employments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employmentService.getMyEmployment();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my employment');
    }
  }
);

export const createEmployment = createAsyncThunk(
  'employments/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employmentService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create employment');
    }
  }
);

export const updateEmployment = createAsyncThunk(
  'employments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employmentService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update employment');
    }
  }
);

export const deleteEmployment = createAsyncThunk(
  'employments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await employmentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete employment');
    }
  }
);

export const transferEmployee = createAsyncThunk(
  'employments/transfer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employmentService.transfer(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to transfer employee');
    }
  }
);

export const bulkCreateEmployments = createAsyncThunk(
  'employments/bulkCreate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employmentService.bulkCreate(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to bulk create employments');
    }
  }
);

const employmentSlice = createSlice({
  name: 'employments',
  initialState,
  reducers: {
    clearEmploymentError: (state) => {
      state.error = null;
    },
    clearEmploymentCurrent: (state) => {
      state.currentItem = null;
    },
    setEmploymentFilters: (state, action) => {
      state.filters = action.payload;
    },
    setEmploymentPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetEmploymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployments.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchEmployments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || action.payload?.detail || action.error?.message || 'An error occurred');
      })
      .addCase(fetchEmploymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmploymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchEmploymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || action.payload?.detail || action.error?.message || 'An error occurred');
      })
      .addCase(fetchCurrentEmployments.fulfilled, (state, action) => {
        state.currentEmployments = action.payload.employments || action.payload;
      })
      .addCase(fetchEmploymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createEmployment.fulfilled, (state, action) => {
        const newEmployment = action.payload.data || action.payload;
        state.items.unshift(newEmployment);
        state.totalCount += 1;
      })
      .addCase(updateEmployment.fulfilled, (state, action) => {
        const updatedEmployment = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedEmployment.id);
        if (index !== -1) {
          state.items[index] = updatedEmployment;
        }
        if (state.currentItem?.id === updatedEmployment.id) {
          state.currentItem = updatedEmployment;
        }
      })
      .addCase(deleteEmployment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearEmploymentError,
  clearEmploymentCurrent,
  setEmploymentFilters,
  setEmploymentPagination,
  resetEmploymentState,
} = employmentSlice.actions;

export default employmentSlice.reducer;