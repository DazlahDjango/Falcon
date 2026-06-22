// src/store/reviews/slices/supervisorReview.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supervisorReviewService } from '../../../services/reviews';

// ============ Thunks ============
export const fetchSupervisorReviews = createAsyncThunk(
  'supervisorReviews/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await supervisorReviewService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupervisorReview = createAsyncThunk(
  'supervisorReviews/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSupervisorReview = createAsyncThunk(
  'supervisorReviews/create',
  async (data, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSupervisorReview = createAsyncThunk(
  'supervisorReviews/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchSupervisorReview = createAsyncThunk(
  'supervisorReviews/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.update(id, data, true);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSupervisorReview = createAsyncThunk(
  'supervisorReviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await supervisorReviewService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitSupervisorReview = createAsyncThunk(
  'supervisorReviews/submit',
  async (id, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.submit(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveSupervisorReviewDraft = createAsyncThunk(
  'supervisorReviews/saveDraft',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.saveDraft(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveSupervisorReview = createAsyncThunk(
  'supervisorReviews/approve',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.approve(id, comments);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectSupervisorReview = createAsyncThunk(
  'supervisorReviews/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.reject(id, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const requestChangesSupervisorReview = createAsyncThunk(
  'supervisorReviews/requestChanges',
  async ({ id, feedback }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.requestChanges(id, feedback);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetSupervisorReviewToDraft = createAsyncThunk(
  'supervisorReviews/resetToDraft',
  async (id, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.resetToDraft(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const compareSupervisorWithSelf = createAsyncThunk(
  'supervisorReviews/compare',
  async (id, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.compareWithSelf(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyReviewQueue = createAsyncThunk(
  'supervisorReviews/fetchMyQueue',
  async (_, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.getMyQueue();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  'supervisorReviews/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.getPendingApprovals();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupervisorReviewStats = createAsyncThunk(
  'supervisorReviews/fetchStats',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.getStats(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupervisorReviewsForCycle = createAsyncThunk(
  'supervisorReviews/fetchForCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.getForCycle(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupervisorReviewForEmployee = createAsyncThunk(
  'supervisorReviews/fetchForEmployee',
  async ({ employeeId, cycleId }, { rejectWithValue }) => {
    try {
      return await supervisorReviewService.getForEmployee(employeeId, cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============
const initialState = {
  items: [],
  selectedItem: null,
  comparison: null,
  myQueue: [],
  pendingApprovals: [],
  stats: null,
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

const supervisorReviewSlice = createSlice({
  name: 'supervisorReviews',
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
      state.comparison = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearMyQueue: (state) => {
      state.myQueue = [];
    },
    clearPendingApprovals: (state) => {
      state.pendingApprovals = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchSupervisorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchSupervisorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Patch
    builder
      .addCase(patchSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(patchSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit
    builder
      .addCase(submitSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(submitSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Save Draft
    builder
      .addCase(saveSupervisorReviewDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSupervisorReviewDraft.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(saveSupervisorReviewDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Approve
    builder
      .addCase(approveSupervisorReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveSupervisorReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(approveSupervisorReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reject
    builder
      .addCase(rejectSupervisorReview.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Request Changes
    builder
      .addCase(requestChangesSupervisorReview.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Reset to Draft
    builder
      .addCase(resetSupervisorReviewToDraft.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Compare
    builder
      .addCase(compareSupervisorWithSelf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareSupervisorWithSelf.fulfilled, (state, action) => {
        state.loading = false;
        state.comparison = action.payload;
      })
      .addCase(compareSupervisorWithSelf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch My Queue
    builder
      .addCase(fetchMyReviewQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviewQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.myQueue = action.payload;
      })
      .addCase(fetchMyReviewQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Pending Approvals
    builder
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = action.payload;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Stats
    builder
      .addCase(fetchSupervisorReviewStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorReviewStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSupervisorReviewStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch For Cycle
    builder
      .addCase(fetchSupervisorReviewsForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });

    // Fetch For Employee
    builder
      .addCase(fetchSupervisorReviewForEmployee.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      });
  },
});

export const supervisorReviewReducer = supervisorReviewSlice.reducer;
export default supervisorReviewReducer;
export const supervisorReviewActions = supervisorReviewSlice.actions;
export const resetSupervisorReviewState = supervisorReviewSlice.actions.resetState;