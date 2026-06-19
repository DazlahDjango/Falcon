// src/store/reviews/slices/finalRating.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { finalRatingService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchFinalRatings = createAsyncThunk(
  'finalRatings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await finalRatingService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFinalRating = createAsyncThunk(
  'finalRatings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveFinalRating = createAsyncThunk(
  'finalRatings/approve',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      return await finalRatingService.approve(id, notes);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const lockFinalRating = createAsyncThunk(
  'finalRatings/lock',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.lock(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const forceLockFinalRating = createAsyncThunk(
  'finalRatings/forceLock',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.forceLock(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calibrateFinalRating = createAsyncThunk(
  'finalRatings/calibrate',
  async ({ id, adjustedScore, reason }, { rejectWithValue }) => {
    try {
      return await finalRatingService.calibrate(id, adjustedScore, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const recalibrateFinalRating = createAsyncThunk(
  'finalRatings/recalibrate',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.recalibrate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const recalculateFinalRating = createAsyncThunk(
  'finalRatings/recalculate',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.recalculate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePIPFromRating = createAsyncThunk(
  'finalRatings/generatePIP',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.generatePip(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePromotionFromRating = createAsyncThunk(
  'finalRatings/generatePromotion',
  async (id, { rejectWithValue }) => {
    try {
      return await finalRatingService.generatePromotion(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyFinalRating = createAsyncThunk(
  'finalRatings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await finalRatingService.getMy();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFinalRatingDistribution = createAsyncThunk(
  'finalRatings/fetchDistribution',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await finalRatingService.getDistribution(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFinalRatingStats = createAsyncThunk(
  'finalRatings/fetchStats',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await finalRatingService.getStats(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  distribution: null,
  stats: null,
  myFinalRating: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
  sort: { field: 'created_at', order: 'desc' },
};

const finalRatingSlice = createSlice({
  name: 'finalRatings',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSort: (state, action) => {
      state.sort = action.payload;
      state.pagination.currentPage = 1;
    },
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelected: (state) => {
      state.selectedItem = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setDistribution: (state, action) => {
      state.distribution = action.payload;
    },
    setMyFinalRating: (state, action) => {
      state.myFinalRating = action.payload;
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
      if (state.myFinalRating?.id === action.payload.id) {
        state.myFinalRating = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchFinalRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinalRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchFinalRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchFinalRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinalRating.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchFinalRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    const handleUpdatedRating = (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
      if (state.myFinalRating?.id === action.payload.id) {
        state.myFinalRating = action.payload;
      }
    };

    builder
      .addCase(approveFinalRating.fulfilled, handleUpdatedRating)
      .addCase(lockFinalRating.fulfilled, handleUpdatedRating)
      .addCase(forceLockFinalRating.fulfilled, handleUpdatedRating)
      .addCase(calibrateFinalRating.fulfilled, handleUpdatedRating)
      .addCase(recalibrateFinalRating.fulfilled, handleUpdatedRating)
      .addCase(recalculateFinalRating.fulfilled, handleUpdatedRating);

    // My Final Rating
    builder
      .addCase(fetchMyFinalRating.fulfilled, (state, action) => {
        state.myFinalRating = action.payload;
      });

    // Distribution
    builder
      .addCase(fetchFinalRatingDistribution.fulfilled, (state, action) => {
        state.distribution = action.payload;
      });

    // Stats
    builder
      .addCase(fetchFinalRatingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  resetState,
  setFilters,
  clearFilters,
  setPagination,
  setSort,
  selectItem,
  clearSelected,
  clearErrors,
  setStats,
  setDistribution,
  setMyFinalRating,
  updateItem,
} = finalRatingSlice.actions;

export const resetFinalRatingState = resetState;
export const finalRatingReducer = finalRatingSlice.reducer;
export const finalRatingActions = finalRatingSlice.actions;
export default finalRatingReducer;