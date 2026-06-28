// src/store/reviews/slices/feedbackSummary.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackSummaryService } from '../../../services/reviews';

// ============ Feedback Summary Thunks ============
export const fetchFeedbackSummaries = createAsyncThunk(
  'feedbackSummaries/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feedbackSummaryService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackSummary = createAsyncThunk(
  'feedbackSummaries/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackSummaryService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const shareFeedbackSummary = createAsyncThunk(
  'feedbackSummaries/share',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackSummaryService.share(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const regenerateFeedbackSummary = createAsyncThunk(
  'feedbackSummaries/regenerate',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackSummaryService.regenerate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyFeedbackSummary = createAsyncThunk(
  'feedbackSummaries/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackSummaryService.getMy();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackSummaryForCycle = createAsyncThunk(
  'feedbackSummaries/fetchForCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await feedbackSummaryService.getForCycle(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Feedback Summary Slice ============
const feedbackSummaryInitialState = {
  items: [],
  selectedItem: null,
  mySummary: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
};

const feedbackSummarySlice = createSlice({
  name: 'feedbackSummaries',
  initialState: feedbackSummaryInitialState,
  reducers: {
    resetSummaryState: (state) => {
      Object.assign(state, feedbackSummaryInitialState);
    },
    setSummaryPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectSummary: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedSummary: (state) => {
      state.selectedItem = null;
    },
    clearSummaryErrors: (state) => {
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
      .addCase(fetchFeedbackSummaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackSummaries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchFeedbackSummaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeedbackSummary.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(shareFeedbackSummary.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        if (state.mySummary?.id === action.payload.id) {
          state.mySummary = action.payload;
        }
      })
      .addCase(regenerateFeedbackSummary.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        if (state.mySummary?.id === action.payload.id) {
          state.mySummary = action.payload;
        }
      })
      .addCase(fetchMyFeedbackSummary.fulfilled, (state, action) => {
        state.mySummary = action.payload;
        state.selectedItem = action.payload;
      })
      .addCase(fetchFeedbackSummaryForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const feedbackSummaryReducer = feedbackSummarySlice.reducer;
export const feedbackSummaryActions = feedbackSummarySlice.actions;
export const resetSummaryState = feedbackSummarySlice.actions.resetSummaryState;
export default feedbackSummaryReducer;
