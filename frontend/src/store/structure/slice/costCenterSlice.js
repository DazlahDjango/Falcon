import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { costCenterService } from '../../../services/structure';

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

export const fetchCostCenters = createAsyncThunk(
  'costCenters/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await costCenterService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost centers');
    }
  }
);

export const fetchCostCenterById = createAsyncThunk(
  'costCenters/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center');
    }
  }
);

export const fetchCostCenterStats = createAsyncThunk(
  'costCenters/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center stats');
    }
  }
);

export const fetchCostCenterChildren = createAsyncThunk(
  'costCenters/fetchChildren',
  async (id, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getChildren(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center children');
    }
  }
);

export const fetchCostCenterUtilization = createAsyncThunk(
  'costCenters/fetchUtilization',
  async (id, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getUtilization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center utilization');
    }
  }
);

export const createCostCenter = createAsyncThunk(
  'costCenters/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await costCenterService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create cost center');
    }
  }
);

export const updateCostCenter = createAsyncThunk(
  'costCenters/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await costCenterService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cost center');
    }
  }
);

export const deleteCostCenter = createAsyncThunk(
  'costCenters/delete',
  async (id, { rejectWithValue }) => {
    try {
      await costCenterService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete cost center');
    }
  }
);

const costCenterSlice = createSlice({
  name: 'costCenters',
  initialState,
  reducers: {
    clearCostCenterError: (state) => {
      state.error = null;
    },
    clearCostCenterCurrent: (state) => {
      state.currentItem = null;
    },
    setCostCenterFilters: (state, action) => {
      state.filters = action.payload;
    },
    setCostCenterPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetCostCenterState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostCenters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCostCenters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results || action.payload;
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchCostCenters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCostCenterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCostCenterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchCostCenterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCostCenterStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createCostCenter.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateCostCenter.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(deleteCostCenter.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearCostCenterError,
  clearCostCenterCurrent,
  setCostCenterFilters,
  setCostCenterPagination,
  resetCostCenterState,
} = costCenterSlice.actions;

export default costCenterSlice.reducer;