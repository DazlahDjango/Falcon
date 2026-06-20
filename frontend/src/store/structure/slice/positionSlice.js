import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { positionService } from '../../../services/structure/position.service';
import { initialPositionState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchPositions = createAsyncThunk(
  'structure/positions/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await positionService.list(params);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch positions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  'structure/positions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await positionService.getById(id);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch position';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchVacantPositions = createAsyncThunk(
  'structure/positions/fetchVacant',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await positionService.getVacant(filters);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch vacant positions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPositionStats = createAsyncThunk(
  'structure/positions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await positionService.getStats();
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch position stats';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPosition = createAsyncThunk(
  'structure/positions/create',
  async (data, { dispatch, rejectWithValue }) => {
    console.log('[Position Create] Submitting data:', data);
    try {
      const response = await positionService.create(data);
      console.log('[Position Create] Success! Response:', response);
      dispatch(showToast({ message: 'Position created successfully', type: 'success' }));
      dispatch(fetchPositions({}));
      dispatch(fetchPositionStats());
      return response.data;
    } catch (error) {
      console.error('[Position Create] Full error object:', error);
      console.error('[Position Create] Error rawResponse:', error?.rawResponse);
      console.error('[Position Create] Error response data:', error?.response?.data);
      let errorMessage = 'Failed to create position';
      if (error?.message && error?.message !== 'An error occurred') {
        errorMessage = error?.message;
      } else if (error?.errors && Object.keys(error.errors).length > 0) {
        const firstKey = Object.keys(error.errors)[0];
        const firstError = error.errors[firstKey];
        errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      } else if (error?.rawResponse) {
        const firstKey = Object.keys(error.rawResponse)[0];
        const firstError = error.rawResponse[firstKey];
        errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      }
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const updatePosition = createAsyncThunk(
  'structure/positions/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await positionService.update(id, data);
      dispatch(showToast({ message: 'Position updated successfully', type: 'success' }));
      dispatch(fetchPositionById(id));
      dispatch(fetchPositions({}));
      dispatch(fetchPositionStats());
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to update position';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePosition = createAsyncThunk(
  'structure/positions/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await positionService.delete(id);
      dispatch(showToast({ message: 'Position deleted successfully', type: 'success' }));
      dispatch(fetchPositions({}));
      dispatch(fetchVacantPositions());
      dispatch(fetchPositionStats());
      return id;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to delete position';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

const positionSlice = createSlice({
  name: 'structure/positions',
  initialState: initialPositionState,
  reducers: {
    setPositionPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setPositionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearPositionFilters: (state) => {
      state.filters = initialPositionState.filters;
      state.pagination.page = 1;
    },
    setPositionPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedPosition: (state) => {
      state.selectedPosition = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.selectedPosition = action.payload;
      })
      .addCase(fetchVacantPositions.fulfilled, (state, action) => {
        state.vacantPositions = action.payload?.results || action.payload || [];
      })
      .addCase(fetchPositionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.vacantPositions = state.vacantPositions.filter(item => item.id !== action.payload);
      });
  },
});

export const {
  setPositionPageSize,
  setPositionFilters,
  clearPositionFilters,
  setPositionPage,
  clearSelectedPosition,
} = positionSlice.actions;

export default positionSlice.reducer;