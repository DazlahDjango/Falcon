// src/store/reviews/slices/pipReview.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pipReviewService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchPIPReviews = createAsyncThunk(
  'pipReviews/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pipReviewService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPReview = createAsyncThunk(
  'pipReviews/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await pipReviewService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPIPReview = createAsyncThunk(
  'pipReviews/create',
  async (data, { rejectWithValue }) => {
    try {
      return await pipReviewService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePIPReview = createAsyncThunk(
  'pipReviews/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await pipReviewService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePIPReview = createAsyncThunk(
  'pipReviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await pipReviewService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPReviewsForPIP = createAsyncThunk(
  'pipReviews/fetchForPIP',
  async (pipId, { rejectWithValue }) => {
    try {
      return await pipReviewService.getForPIP(pipId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  pipReviews: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
};

const pipReviewSlice = createSlice({
  name: 'pipReviews',
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
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelected: (state) => {
      state.selectedItem = null;
    },
    clearPIPReviews: (state) => {
      state.pipReviews = [];
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchPIPReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchPIPReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchPIPReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPReview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchPIPReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createPIPReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPIPReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
        state.pipReviews = [action.payload, ...state.pipReviews];
      })
      .addCase(createPIPReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updatePIPReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePIPReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const pipIndex = state.pipReviews.findIndex((item) => item.id === action.payload.id);
        if (pipIndex !== -1) {
          state.pipReviews[pipIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updatePIPReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deletePIPReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePIPReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.pipReviews = state.pipReviews.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deletePIPReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch For PIP =====
    builder
      .addCase(fetchPIPReviewsForPIP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPReviewsForPIP.fulfilled, (state, action) => {
        state.loading = false;
        state.pipReviews = action.payload;
      })
      .addCase(fetchPIPReviewsForPIP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const pipReviewReducer = pipReviewSlice.reducer;
export const pipReviewActions = pipReviewSlice.actions;
export const resetPipReviewState = pipReviewSlice.actions.resetState;
