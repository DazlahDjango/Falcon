// src/store/reviews/slices/pipAction.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pipActionService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchPIPActions = createAsyncThunk(
  'pipActions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pipActionService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPAction = createAsyncThunk(
  'pipActions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await pipActionService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPIPAction = createAsyncThunk(
  'pipActions/create',
  async (data, { rejectWithValue }) => {
    try {
      return await pipActionService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePIPAction = createAsyncThunk(
  'pipActions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await pipActionService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePIPAction = createAsyncThunk(
  'pipActions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await pipActionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completePIPAction = createAsyncThunk(
  'pipActions/complete',
  async ({ id, notes, evidence }, { rejectWithValue }) => {
    try {
      return await pipActionService.complete(id, notes, evidence);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyPIPAction = createAsyncThunk(
  'pipActions/verify',
  async (id, { rejectWithValue }) => {
    try {
      return await pipActionService.verify(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reopenPIPAction = createAsyncThunk(
  'pipActions/reopen',
  async (id, { rejectWithValue }) => {
    try {
      return await pipActionService.reopen(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPIPActionsForPIP = createAsyncThunk(
  'pipActions/fetchForPIP',
  async (pipId, { rejectWithValue }) => {
    try {
      return await pipActionService.getForPIP(pipId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  pipActions: [],
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

const pipActionSlice = createSlice({
  name: 'pipActions',
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
    clearPIPActions: (state) => {
      state.pipActions = [];
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchPIPActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPActions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchPIPActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchPIPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPAction.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchPIPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createPIPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPIPAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
        state.pipActions = [action.payload, ...state.pipActions];
      })
      .addCase(createPIPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updatePIPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePIPAction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const pipIndex = state.pipActions.findIndex((item) => item.id === action.payload.id);
        if (pipIndex !== -1) {
          state.pipActions[pipIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updatePIPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deletePIPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePIPAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.pipActions = state.pipActions.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deletePIPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Complete =====
    builder
      .addCase(completePIPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completePIPAction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const pipIndex = state.pipActions.findIndex((item) => item.id === action.payload.id);
        if (pipIndex !== -1) {
          state.pipActions[pipIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(completePIPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Verify =====
    builder
      .addCase(verifyPIPAction.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const pipIndex = state.pipActions.findIndex((item) => item.id === action.payload.id);
        if (pipIndex !== -1) {
          state.pipActions[pipIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // ===== Reopen =====
    builder
      .addCase(reopenPIPAction.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const pipIndex = state.pipActions.findIndex((item) => item.id === action.payload.id);
        if (pipIndex !== -1) {
          state.pipActions[pipIndex] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // ===== Fetch For PIP =====
    builder
      .addCase(fetchPIPActionsForPIP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPIPActionsForPIP.fulfilled, (state, action) => {
        state.loading = false;
        state.pipActions = action.payload;
      })
      .addCase(fetchPIPActionsForPIP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const pipActionReducer = pipActionSlice.reducer;
export default pipActionReducer;
export const pipActionActions = pipActionSlice.actions;
export const resetPIPActionState = pipActionSlice.actions.resetState;