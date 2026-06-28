// src/store/reviews/slices/pip.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pipService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchPIPs = createAsyncThunk(
  'pips/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pipService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIP = createAsyncThunk(
  'pips/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.getByIdRaw(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPIP = createAsyncThunk(
  'pips/create',
  async (data, { rejectWithValue }) => {
    try {
      return await pipService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePIP = createAsyncThunk(
  'pips/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await pipService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchPIP = createAsyncThunk(
  'pips/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await pipService.update(id, data, true);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePIP = createAsyncThunk(
  'pips/delete',
  async (id, { rejectWithValue }) => {
    try {
      await pipService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approvePIP = createAsyncThunk(
  'pips/approve',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.approve(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const startPIP = createAsyncThunk(
  'pips/start',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.start(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const extendPIP = createAsyncThunk(
  'pips/extend',
  async ({ id, newEndDate, reason }, { rejectWithValue }) => {
    try {
      return await pipService.extend(id, newEndDate, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completePIP = createAsyncThunk(
  'pips/complete',
  async ({ id, outcome, notes }, { rejectWithValue }) => {
    try {
      return await pipService.complete(id, outcome, notes);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelPIP = createAsyncThunk(
  'pips/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.cancel(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPProgress = createAsyncThunk(
  'pips/fetchProgress',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.getProgress(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPIPAction = createAsyncThunk(
  'pips/addAction',
  async ({ id, actionData }, { rejectWithValue }) => {
    try {
      return await pipService.addAction(id, actionData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPIPReview = createAsyncThunk(
  'pips/addReview',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      return await pipService.addReview(id, reviewData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPFullReport = createAsyncThunk(
  'pips/fetchFullReport',
  async (id, { rejectWithValue }) => {
    try {
      return await pipService.getFullReport(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyPIPs = createAsyncThunk(
  'pips/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await pipService.getMy();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchManagingPIPs = createAsyncThunk(
  'pips/fetchManaging',
  async (_, { rejectWithValue }) => {
    try {
      return await pipService.getManaging();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActivePIPs = createAsyncThunk(
  'pips/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await pipService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOverduePIPs = createAsyncThunk(
  'pips/fetchOverdue',
  async (_, { rejectWithValue }) => {
    try {
      return await pipService.getOverdue();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPReport = createAsyncThunk(
  'pips/fetchReport',
  async (_, { rejectWithValue }) => {
    try {
      return await pipService.getReport();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPTrends = createAsyncThunk(
  'pips/fetchTrends',
  async (months = 6, { rejectWithValue }) => {
    try {
      return await pipService.getTrends(months);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePIPFromRating = createAsyncThunk(
  'pips/generateFromRating',
  async ({ ratingId, customData }, { rejectWithValue }) => {
    try {
      return await pipService.generateFromRating(ratingId, customData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  progress: null,
  stats: null,
  trends: null,
  report: null,
  myPIPs: [],
  managingPIPs: [],
  activePIPs: [],
  overduePIPs: [],
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

const pipSlice = createSlice({
  name: 'pips',
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
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchPIPs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchPIPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchPIP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIP.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchPIP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createPIP.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      });

    // Update & Patch
    const handleUpdateFulfilled = (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    };
    builder
      .addCase(updatePIP.fulfilled, handleUpdateFulfilled)
      .addCase(patchPIP.fulfilled, handleUpdateFulfilled)
      .addCase(approvePIP.fulfilled, handleUpdateFulfilled)
      .addCase(startPIP.fulfilled, handleUpdateFulfilled)
      .addCase(extendPIP.fulfilled, handleUpdateFulfilled)
      .addCase(completePIP.fulfilled, handleUpdateFulfilled)
      .addCase(cancelPIP.fulfilled, handleUpdateFulfilled);

    // Delete
    builder
      .addCase(deletePIP.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      });

    // Progress
    builder
      .addCase(fetchPIPProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      });

    // Report / Stats
    builder
      .addCase(fetchPIPReport.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Trends
    builder
      .addCase(fetchPIPTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      });

    // Full Report
    builder
      .addCase(fetchPIPFullReport.fulfilled, (state, action) => {
        state.report = action.payload;
      });

    // My PIPs
    builder
      .addCase(fetchMyPIPs.fulfilled, (state, action) => {
        state.myPIPs = action.payload;
      });

    // Managing PIPs
    builder
      .addCase(fetchManagingPIPs.fulfilled, (state, action) => {
        state.managingPIPs = action.payload;
      });

    // Active PIPs
    builder
      .addCase(fetchActivePIPs.fulfilled, (state, action) => {
        state.activePIPs = action.payload;
      });

    // Overdue PIPs
    builder
      .addCase(fetchOverduePIPs.fulfilled, (state, action) => {
        state.overduePIPs = action.payload;
      });
  },
});

export const {
  resetState: resetPIPState,
  setFilters: setPIPFilters,
  clearFilters: clearPIPFilters,
  setPagination: setPIPPagination,
  selectItem,
  clearSelected,
  clearErrors,
} = pipSlice.actions;
export const pipReducer = pipSlice.reducer;
export default pipReducer;
export const pipActions = pipSlice.actions;