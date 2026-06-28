// src/store/reviews/slices/referenceData.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsHealthService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchReferenceData = createAsyncThunk(
  'referenceData/fetch',
  async (include = ['users', 'departments', 'teams', 'positions', 'metrics'], { rejectWithValue }) => {
    try {
      return await reviewsHealthService.getReferenceData(include);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'referenceData/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewsHealthService.getReferenceData(['users']);
      return data.users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'referenceData/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewsHealthService.getReferenceData(['departments']);
      return data.departments || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTeams = createAsyncThunk(
  'referenceData/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewsHealthService.getReferenceData(['teams']);
      return data.teams || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPositions = createAsyncThunk(
  'referenceData/fetchPositions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewsHealthService.getReferenceData(['positions']);
      return data.positions || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'referenceData/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewsHealthService.getReferenceData(['metrics']);
      return data.metrics || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  data: null,
  users: [],
  departments: [],
  teams: [],
  positions: [],
  metrics: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearReferenceData: (state) => {
      state.data = null;
      state.users = [];
      state.departments = [];
      state.teams = [];
      state.positions = [];
      state.metrics = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchReferenceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferenceData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.users = action.payload.users || [];
        state.departments = action.payload.departments || [];
        state.teams = action.payload.teams || [];
        state.positions = action.payload.positions || [];
        state.metrics = action.payload.metrics || null;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchReferenceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Users =====
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Departments =====
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Teams =====
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Positions =====
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Metrics =====
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const reviewsReferenceDataReducer = referenceDataSlice.reducer;
export default reviewsReferenceDataReducer;
export const reviewsReferenceDataActions = referenceDataSlice.actions;
export const resetReferenceDataState = referenceDataSlice.actions.resetState;
