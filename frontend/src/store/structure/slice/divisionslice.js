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
};

export const fetchDivisions = createAsyncThunk(
  'divisions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await divisionService.list(params);
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
    },
    setDivisionPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetDivisionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivisions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results || action.payload;
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDivisionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDivisionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchDivisionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDivisionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createDivision.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateDivision.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
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
} = divisionSlice.actions;

export default divisionSlice.reducer;