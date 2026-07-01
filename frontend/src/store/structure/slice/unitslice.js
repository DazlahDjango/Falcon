import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unitService } from '../../../services/structure';

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

export const fetchUnits = createAsyncThunk(
  'units/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await unitService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch units');
    }
  }
);

export const fetchUnitById = createAsyncThunk(
  'units/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await unitService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch unit');
    }
  }
);

export const fetchUnitStats = createAsyncThunk(
  'units/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await unitService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch unit stats');
    }
  }
);

export const fetchUnitEmployments = createAsyncThunk(
  'units/fetchEmployments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await unitService.getEmployments(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch unit employments');
    }
  }
);

export const createUnit = createAsyncThunk(
  'units/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await unitService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create unit');
    }
  }
);

export const updateUnit = createAsyncThunk(
  'units/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await unitService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update unit');
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'units/delete',
  async (id, { rejectWithValue }) => {
    try {
      await unitService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete unit');
    }
  }
);

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    clearUnitError: (state) => {
      state.error = null;
    },
    clearUnitCurrent: (state) => {
      state.currentItem = null;
    },
    setUnitFilters: (state, action) => {
      state.filters = action.payload;
    },
    setUnitPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetUnitState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results || action.payload;
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnitById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnitStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearUnitError,
  clearUnitCurrent,
  setUnitFilters,
  setUnitPagination,
  resetUnitState,
} = unitSlice.actions;

export default unitSlice.reducer;