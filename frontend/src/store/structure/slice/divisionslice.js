import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { divisionService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  stats: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
  hasFetched: false, // Added: track if initial fetch occurred
};

export const fetchDivisions = createAsyncThunk(
  'divisions/fetchAll', 
  async (params, { rejectWithValue }) => {
    try {
      const response = await divisionService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch divisions');
    }
  }
);

export const fetchDivisionById = createAsyncThunk(
  'divisions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await divisionService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch division');
    }
  }
);

export const fetchDivisionStats = createAsyncThunk(
  'divisions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await divisionService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch division stats');
    }
  }
);

export const fetchDivisionDepartments = createAsyncThunk(
  'divisions/fetchDepartments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await divisionService.getDepartments(id);
      return { id, departments: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch division departments');
    }
  }
);

export const createDivision = createAsyncThunk(
  'divisions/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await divisionService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create division');
    }
  }
);

export const updateDivision = createAsyncThunk(
  'divisions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await divisionService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update division');
    }
  }
);

export const deleteDivision = createAsyncThunk(
  'divisions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await divisionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete division');
    }
  }
);

const divisionSlice = createSlice({
  name: 'divisions',
  initialState,
  reducers: {
    clearDivisionError: (state) => {
      state.error = null;
    },
    clearDivisionCurrent: (state) => {
      state.currentItem = null;
    },
    setDivisionFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset page when filters change
    },
    setDivisionPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetDivisionState: () => initialState,
    // Added: reset hasFetched
    resetDivisionFetch: (state) => {
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivisions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasFetched = true; // Mark as fetched
        const responseData = action.payload?.data || action.payload;
        const results = responseData?.results || [];
        state.items = Array.isArray(results) ? results : [];
        state.totalCount = responseData?.count || (Array.isArray(results) ? results.length : 0);
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || action.payload?.detail || action.error?.message || 'An error occurred');
      })
      .addCase(fetchDivisionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDivisionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload?.data || action.payload;
      })
      .addCase(fetchDivisionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || action.payload?.detail || action.error?.message || 'An error occurred');
      })
      .addCase(fetchDivisionStats.fulfilled, (state, action) => {
        state.stats = action.payload?.data || action.payload;
      })
      .addCase(createDivision.fulfilled, (state, action) => {
        const newDivision = action.payload?.data || action.payload;
        state.items.unshift(newDivision);
        state.totalCount += 1;
      })
      .addCase(updateDivision.fulfilled, (state, action) => {
        const updatedDivision = action.payload?.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedDivision.id);
        if (index !== -1) {
          state.items[index] = updatedDivision;
        }
        if (state.currentItem?.id === updatedDivision.id) {
          state.currentItem = updatedDivision;
        }
      })
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearDivisionError,
  clearDivisionCurrent,
  setDivisionFilters,
  setDivisionPagination,
  resetDivisionState,
  resetDivisionFetch,
} = divisionSlice.actions;

export default divisionSlice.reducer;