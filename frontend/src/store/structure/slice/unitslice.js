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
      return response;
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
      return response;
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
      return response;
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
      return response;
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
      return response;
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
      return response;
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
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
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
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnitStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        const newUnit = action.payload.data || action.payload;
        state.items.unshift(newUnit);
        state.totalCount += 1;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const updatedUnit = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedUnit.id);
        if (index !== -1) {
          state.items[index] = updatedUnit;
        }
        if (state.currentItem?.id === updatedUnit.id) {
          state.currentItem = updatedUnit;
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