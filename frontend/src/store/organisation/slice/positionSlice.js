import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { positionApi } from '../../../services/organisation/positionService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all positions
 */
export const fetchPositions = createAsyncThunk(
  'position/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await positionApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch positions');
    }
  }
);

/**
 * Fetch position by ID
 */
export const fetchPositionById = createAsyncThunk(
  'position/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await positionApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch position');
    }
  }
);

/**
 * Fetch position hierarchy
 */
export const fetchPositionHierarchy = createAsyncThunk(
  'position/fetchHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await positionApi.getHierarchy();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch position hierarchy');
    }
  }
);

/**
 * Create position
 */
export const createPosition = createAsyncThunk(
  'position/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await positionApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create position');
    }
  }
);

/**
 * Update position
 */
export const updatePosition = createAsyncThunk(
  'position/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await positionApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update position');
    }
  }
);

/**
 * Delete position
 */
export const deletePosition = createAsyncThunk(
  'position/delete',
  async (id, { rejectWithValue }) => {
    try {
      await positionApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete position');
    }
  }
);

/**
 * Update reporting relationship
 */
export const updateReportingTo = createAsyncThunk(
  'position/updateReportingTo',
  async ({ id, reportsToId }, { rejectWithValue }) => {
    try {
      const response = await positionApi.updateReportingTo(id, reportsToId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reporting relationship');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  positions: [],
  positionHierarchy: [],
  currentPosition: null,
  loading: false,
  error: null,
  total: 0,
};

// ============================================================
// Slice
// ============================================================

const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    clearCurrentPosition: (state) => {
      state.currentPosition = null;
    },
    clearPositionError: (state) => {
      state.error = null;
    },
    clearPositions: (state) => {
      state.positions = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchPositions
      // ============================================================
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchPositionHierarchy
      // ============================================================
      .addCase(fetchPositionHierarchy.fulfilled, (state, action) => {
        state.positionHierarchy = action.payload;
      })
      
      // ============================================================
      // fetchPositionById
      // ============================================================
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.currentPosition = action.payload;
      })
      
      // ============================================================
      // createPosition
      // ============================================================
      .addCase(createPosition.fulfilled, (state, action) => {
        state.positions.push(action.payload);
      })
      
      // ============================================================
      // updatePosition
      // ============================================================
      .addCase(updatePosition.fulfilled, (state, action) => {
        const index = state.positions.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
        if (state.currentPosition?.id === action.payload.id) {
          state.currentPosition = action.payload;
        }
      })
      
      // ============================================================
      // deletePosition
      // ============================================================
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.positions = state.positions.filter(p => p.id !== action.payload);
        if (state.currentPosition?.id === action.payload) {
          state.currentPosition = null;
        }
      })
      
      // ============================================================
      // updateReportingTo
      // ============================================================
      .addCase(updateReportingTo.fulfilled, (state, action) => {
        const index = state.positions.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
        if (state.currentPosition?.id === action.payload.id) {
          state.currentPosition = action.payload;
        }
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearCurrentPosition, clearPositionError, clearPositions } = positionSlice.actions;
export default positionSlice.reducer;