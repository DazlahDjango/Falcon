// src/store/reviews/slices/competencyRating.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competencyRatingService } from '../../../services/reviews';

// ============ Competency Rating Thunks ============
export const fetchCompetencyRatings = createAsyncThunk(
  'competencyRatings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyRatingService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyRating = createAsyncThunk(
  'competencyRatings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyRatingService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRatingsByAssessment = createAsyncThunk(
  'competencyRatings/fetchByAssessment',
  async (assessmentId, { rejectWithValue }) => {
    try {
      return await competencyRatingService.getByAssessment(assessmentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRatingsByReview = createAsyncThunk(
  'competencyRatings/fetchByReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await competencyRatingService.getByReview(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkCreateCompetencyRatings = createAsyncThunk(
  'competencyRatings/bulkCreate',
  async ({ parentId, parentType, ratings }, { rejectWithValue }) => {
    try {
      return await competencyRatingService.bulkCreate(parentId, parentType, ratings);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Rating Slice ============
const competencyRatingInitialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
};

const competencyRatingSlice = createSlice({
  name: 'competencyRatings',
  initialState: competencyRatingInitialState,
  reducers: {
    resetRatingState: (state) => {
      Object.assign(state, competencyRatingInitialState);
    },
    setRatingPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectRating: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedRating: (state) => {
      state.selectedItem = null;
    },
    clearRatingErrors: (state) => {
      state.error = null;
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompetencyRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencyRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompetencyRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyRating.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetencyRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRatingsByAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingsByAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRatingsByAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRatingsByReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingsByReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRatingsByReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bulkCreateCompetencyRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCreateCompetencyRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(bulkCreateCompetencyRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const competencyRatingReducer = competencyRatingSlice.reducer;
export const competencyRatingActions = competencyRatingSlice.actions;
export const resetRatingState = competencyRatingSlice.actions.resetRatingState;
export default competencyRatingReducer;
