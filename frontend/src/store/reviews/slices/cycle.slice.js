// src/store/reviews/slices/cycle.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewCycleService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchCycles = createAsyncThunk(
  'cycles/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewCycleService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCycle = createAsyncThunk(
  'cycles/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCycle = createAsyncThunk(
  'cycles/create',
  async (data, { rejectWithValue }) => {
    try {
      return await reviewCycleService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCycle = createAsyncThunk(
  'cycles/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewCycleService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchCycle = createAsyncThunk(
  'cycles/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewCycleService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCycle = createAsyncThunk(
  'cycles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewCycleService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveCycle = createAsyncThunk(
  'cycles/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewCycleService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCycleProgress = createAsyncThunk(
  'cycles/fetchProgress',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.getProgress(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCycle = createAsyncThunk(
  'cycles/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const freezeCycle = createAsyncThunk(
  'cycles/freeze',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.freeze(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completeCycle = createAsyncThunk(
  'cycles/complete',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.complete(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const forceCompleteCycle = createAsyncThunk(
  'cycles/forceComplete',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.forceComplete(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const archiveCycle = createAsyncThunk(
  'cycles/archive',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.archive(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendCycleReminders = createAsyncThunk(
  'cycles/sendReminders',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.sendReminders(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unarchiveCycle = createAsyncThunk(
  'cycles/unarchive',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.unarchive(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const extendCycle = createAsyncThunk(
  'cycles/extend',
  async ({ id, newEndDate, reason }, { rejectWithValue }) => {
    try {
      return await reviewCycleService.extend(id, newEndDate, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCycleParticipants = createAsyncThunk(
  'cycles/fetchParticipants',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.getParticipants(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCycleSummary = createAsyncThunk(
  'cycles/fetchSummary',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCycleService.getSummary(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  activeCycle: null,
  currentCycle: null,
  progress: null,
  participants: [],
  summary: null,
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

const cycleSlice = createSlice({
  name: 'cycles',
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
    setActiveCycle: (state, action) => {
      state.activeCycle = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
      if (state.activeCycle?.id === action.payload.id) {
        state.activeCycle = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload;
          state.pagination.totalItems = payload.length;
          state.pagination.totalPages = Math.ceil(payload.length / (state.pagination.pageSize || 20));
        } else if (payload && Array.isArray(payload.results)) {
          state.items = payload.results;
          state.pagination.totalItems = payload.count !== undefined ? payload.count : payload.results.length;
          state.pagination.totalPages = Math.ceil((payload.count !== undefined ? payload.count : payload.results.length) / (state.pagination.pageSize || 20));
        } else if (payload && payload.data && Array.isArray(payload.data.results)) {
          state.items = payload.data.results;
          state.pagination.totalItems = payload.data.count !== undefined ? payload.data.count : payload.data.results.length;
          state.pagination.totalPages = Math.ceil((payload.data.count !== undefined ? payload.data.count : payload.data.results.length) / (state.pagination.pageSize || 20));
        } else if (payload && Array.isArray(payload.data)) {
          state.items = payload.data;
          state.pagination.totalItems = payload.data.length;
          state.pagination.totalPages = Math.ceil(payload.data.length / (state.pagination.pageSize || 20));
        } else {
          state.items = [];
          state.pagination.totalItems = 0;
          state.pagination.totalPages = 0;
        }
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCycle.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
        state.currentCycle = action.payload;
      })
      .addCase(fetchCycle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createCycle.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      });

    // Update / Patch / Actions that return updated cycle
    const handleUpdatedCycle = (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
      if (state.activeCycle?.id === action.payload.id) {
        state.activeCycle = action.payload;
      }
    };

    builder
      .addCase(updateCycle.fulfilled, handleUpdatedCycle)
      .addCase(patchCycle.fulfilled, handleUpdatedCycle)
      .addCase(activateCycle.fulfilled, handleUpdatedCycle)
      .addCase(freezeCycle.fulfilled, handleUpdatedCycle)
      .addCase(completeCycle.fulfilled, handleUpdatedCycle)
      .addCase(forceCompleteCycle.fulfilled, handleUpdatedCycle)
      .addCase(archiveCycle.fulfilled, handleUpdatedCycle)
      .addCase(unarchiveCycle.fulfilled, handleUpdatedCycle)
      .addCase(extendCycle.fulfilled, handleUpdatedCycle);

    // Delete
    builder
      .addCase(deleteCycle.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
        if (String(state.selectedItem?.id) === String(action.payload)) {
          state.selectedItem = null;
        }
        if (String(state.activeCycle?.id) === String(action.payload)) {
          state.activeCycle = null;
        }
      });

    // Active Cycle
    builder
      .addCase(fetchActiveCycle.fulfilled, (state, action) => {
        state.activeCycle = action.payload;
      });

    // Progress
    builder
      .addCase(fetchCycleProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      });

    // Participants
    builder
      .addCase(fetchCycleParticipants.fulfilled, (state, action) => {
        state.participants = action.payload;
      });

    // Summary
    builder
      .addCase(fetchCycleSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
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
  setActiveCycle,
  setProgress,
  updateItem,
} = cycleSlice.actions;

export const resetCycleState = resetState;
export const setCycleFilters = setFilters;
export const clearCycleFilters = clearFilters;
export const setCyclePagination = setPagination;
export const cycleReducer = cycleSlice.reducer;
export const cycleActions = cycleSlice.actions;
export default cycleReducer;