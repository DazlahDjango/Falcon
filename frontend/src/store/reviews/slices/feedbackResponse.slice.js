// src/store/reviews/slices/feedbackResponse.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackResponseService } from '../../../services/reviews';

// ============ Feedback Response Thunks ============
export const fetchFeedbackResponses = createAsyncThunk(
  'feedbackResponses/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feedbackResponseService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackResponse = createAsyncThunk(
  'feedbackResponses/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackResponseService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitFeedbackResponse = createAsyncThunk(
  'feedbackResponses/submit',
  async ({ requestId, data }, { rejectWithValue }) => {
    try {
      return await feedbackResponseService.submit(requestId, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackResponseForRequest = createAsyncThunk(
  'feedbackResponses/fetchForRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      return await feedbackResponseService.getForRequest(requestId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackResponsesForSubject = createAsyncThunk(
  'feedbackResponses/fetchForSubject',
  async (subjectId, { rejectWithValue }) => {
    try {
      return await feedbackResponseService.getForSubject(subjectId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Feedback Response Slice ============
const feedbackResponseInitialState = {
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

const feedbackResponseSlice = createSlice({
  name: 'feedbackResponses',
  initialState: feedbackResponseInitialState,
  reducers: {
    resetResponseState: (state) => {
      Object.assign(state, feedbackResponseInitialState);
    },
    setResponsePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectResponse: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedResponse: (state) => {
      state.selectedItem = null;
    },
    clearResponseErrors: (state) => {
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
      .addCase(fetchFeedbackResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchFeedbackResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeedbackResponse.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(submitFeedbackResponse.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(fetchFeedbackResponseForRequest.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(fetchFeedbackResponsesForSubject.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const feedbackResponseReducer = feedbackResponseSlice.reducer;
export const feedbackResponseActions = feedbackResponseSlice.actions;
export const resetResponseState = feedbackResponseSlice.actions.resetResponseState;
export default feedbackResponseReducer;
