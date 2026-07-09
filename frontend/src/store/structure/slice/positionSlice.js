import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { positionService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  stats: null,
  vacantItems: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchPositions = createAsyncThunk(
  'positions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await positionService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch positions');
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  'positions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await positionService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch position');
    }
  }
);

export const fetchVacantPositions = createAsyncThunk(
  'positions/fetchVacant',
  async (_, { rejectWithValue }) => {
    try {
      const response = await positionService.getVacant();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vacant positions');
    }
  }
);

export const fetchPositionStats = createAsyncThunk(
  'positions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await positionService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch position stats');
    }
  }
);

export const fetchPositionIncumbents = createAsyncThunk(
  'positions/fetchIncumbents',
  async (id, { rejectWithValue }) => {
    try {
      const response = await positionService.getIncumbents(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch position incumbents');
    }
  }
);

export const fetchPositionReportingChain = createAsyncThunk(
  'positions/fetchReportingChain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await positionService.getReportingChain(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch position reporting chain');
    }
  }
);

export const createPosition = createAsyncThunk(
  'positions/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await positionService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create position');
    }
  }
);

export const updatePosition = createAsyncThunk(
  'positions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await positionService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update position');
    }
  }
);

export const deletePosition = createAsyncThunk(
  'positions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await positionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete position');
    }
  }
);

const positionSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    clearPositionError: (state) => {
      state.error = null;
    },
    clearPositionCurrent: (state) => {
      state.currentItem = null;
    },
    setPositionFilters: (state, action) => {
      state.filters = action.payload;
    },
    setPositionPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetPositionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPositionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchPositionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchVacantPositions.fulfilled, (state, action) => {
        state.vacantItems = action.payload.vacant_positions || action.payload;
      })
      .addCase(fetchPositionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        const newPosition = action.payload.data || action.payload;
        state.items.unshift(newPosition);
        state.totalCount += 1;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const updatedPosition = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedPosition.id);
        if (index !== -1) {
          state.items[index] = updatedPosition;
        }
        if (state.currentItem?.id === updatedPosition.id) {
          state.currentItem = updatedPosition;
        }
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearPositionError,
  clearPositionCurrent,
  setPositionFilters,
  setPositionPagination,
  resetPositionState,
} = positionSlice.actions;

export default positionSlice.reducer;