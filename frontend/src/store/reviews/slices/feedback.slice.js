// src/store/reviews/slices/feedback.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  feedbackRequestService,
  feedbackResponseService,
  feedbackSummaryService,
} from '../../../services/reviews';

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
  },
  extraReducers: (builder) => {
    // Fetch All
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
      });

    // Fetch One
    builder
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
      });

    // Create
    builder
      .addCase(createFeedbackRequest.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      });

    // Update
    builder
      .addCase(updateFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Delete
    builder
      .addCase(deleteFeedbackRequest.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      });

    // Remind
    builder
      .addCase(remindFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Cancel
    builder
      .addCase(cancelFeedbackRequest.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Bulk Create
    builder
      .addCase(bulkCreateFeedbackRequests.fulfilled, (state, action) => {
        state.items = [...action.payload, ...state.items];
      });

    // Fetch Pending
    builder
      .addCase(fetchPendingFeedbackRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      });

    // Fetch Overdue
    builder
      .addCase(fetchOverdueFeedbackRequests.fulfilled, (state, action) => {
        state.overdueRequests = action.payload;
      });

    // Fetch For Subject
    builder
      .addCase(fetchFeedbackRequestsForSubject.fulfilled, (state, action) => {
        state.items = action.payload;
      });

    // Fetch For Cycle
    builder
      .addCase(fetchFeedbackRequestsForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

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
  },
  extraReducers: (builder) => {
    // Fetch All
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
      });

    // Fetch One
    builder
      .addCase(fetchFeedbackResponse.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      });

    // Submit
    builder
      .addCase(submitFeedbackResponse.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
        state.items = [action.payload, ...state.items];
      });

    // Fetch For Request
    builder
      .addCase(fetchFeedbackResponseForRequest.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      });

    // Fetch For Subject
    builder
      .addCase(fetchFeedbackResponsesForSubject.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

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
  },
  extraReducers: (builder) => {
    // Fetch All
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
      });

    // Fetch One
    builder
      .addCase(fetchFeedbackSummary.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      });

    // Share
    builder
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
      });

    // Regenerate
    builder
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
      });

    // Fetch My
    builder
      .addCase(fetchMyFeedbackSummary.fulfilled, (state, action) => {
        state.mySummary = action.payload;
        state.selectedItem = action.payload;
      });

    // Fetch For Cycle
    builder
      .addCase(fetchFeedbackSummaryForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

// ============ Exports ============
export const feedbackRequestReducer = feedbackRequestSlice.reducer;
export const feedbackRequestActions = feedbackRequestSlice.actions;
export const resetRequestState = feedbackRequestSlice.actions.resetRequestState;

export const feedbackResponseReducer = feedbackResponseSlice.reducer;
export const feedbackResponseActions = feedbackResponseSlice.actions;
export const resetResponseState = feedbackResponseSlice.actions.resetResponseState;

export const feedbackSummaryReducer = feedbackSummarySlice.reducer;
export const feedbackSummaryActions = feedbackSummarySlice.actions;
export const resetSummaryState = feedbackSummarySlice.actions.resetSummaryState;