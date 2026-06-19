// src/store/reviews/slices/feedbackRequest.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackRequestService } from '../../../services/reviews';

// ============ Feedback Request Thunks ============
export const fetchFeedbackRequests = createAsyncThunk(
  'feedbackRequests/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feedbackRequestService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackRequest = createAsyncThunk(
  'feedbackRequests/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFeedbackRequest = createAsyncThunk(
  'feedbackRequests/create',
  async (data, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFeedbackRequest = createAsyncThunk(
  'feedbackRequests/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFeedbackRequest = createAsyncThunk(
  'feedbackRequests/delete',
  async (id, { rejectWithValue }) => {
    try {
      await feedbackRequestService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const remindFeedbackRequest = createAsyncThunk(
  'feedbackRequests/remind',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.remind(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelFeedbackRequest = createAsyncThunk(
  'feedbackRequests/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.cancel(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkCreateFeedbackRequests = createAsyncThunk(
  'feedbackRequests/bulkCreate',
  async ({ reviewers, subjectId, cycleId, reviewerType, dueDate }, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.bulkCreate(
        reviewers,
        subjectId,
        cycleId,
        reviewerType,
        dueDate
      );
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingFeedbackRequests = createAsyncThunk(
  'feedbackRequests/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.getPending();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOverdueFeedbackRequests = createAsyncThunk(
  'feedbackRequests/fetchOverdue',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.getOverdue();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackRequestsForSubject = createAsyncThunk(
  'feedbackRequests/fetchForSubject',
  async (subjectId, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.getForSubject(subjectId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeedbackRequestsForCycle = createAsyncThunk(
  'feedbackRequests/fetchForCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await feedbackRequestService.getForCycle(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Feedback Request Slice ============
const feedbackRequestInitialState = {
  items: [],
  selectedItem: null,
  pendingRequests: [],
  overdueRequests: [],
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

const feedbackRequestSlice = createSlice({
  name: 'feedbackRequests',
  initialState: feedbackRequestInitialState,
  reducers: {
    resetRequestState: (state) => {
      Object.assign(state, feedbackRequestInitialState);
    },
    setRequestFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearRequestFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setRequestPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectRequest: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedItem = null;
    },
    clearRequestErrors: (state) => {
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
      .addCase(fetchFeedbackRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchFeedbackRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeedbackRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchFeedbackRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFeedbackRequest.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(updateFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deleteFeedbackRequest.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(remindFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(cancelFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(bulkCreateFeedbackRequests.fulfilled, (state, action) => {
        state.items = [...action.payload, ...state.items];
      })
      .addCase(fetchPendingFeedbackRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(fetchOverdueFeedbackRequests.fulfilled, (state, action) => {
        state.overdueRequests = action.payload;
      })
      .addCase(fetchFeedbackRequestsForSubject.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchFeedbackRequestsForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const {
  resetRequestState,
  setRequestFilters,
  clearRequestFilters,
  setRequestPagination,
  selectRequest,
  clearSelectedRequest,
  clearRequestErrors,
  updateItem,
} = feedbackRequestSlice.actions;

export const feedbackRequestReducer = feedbackRequestSlice.reducer;
export const feedbackRequestActions = feedbackRequestSlice.actions;
export default feedbackRequestReducer;
