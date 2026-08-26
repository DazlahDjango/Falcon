/**
 * Actual Slice - Monthly Actuals, Evidence, Adjustments
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { actualService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchActuals = createAsyncThunk(
  'actual/fetchActuals',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.actual?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = {
        limit,
        offset,
        page,
        page_size: pageSize,
        ...params,
      };

      const response = await actualService.getActuals(queryParams);
      return {
        data: response.data,
        page,
        pageSize,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActual = createAsyncThunk(
  'actual/fetchActual',
  async (id, { rejectWithValue }) => {
    try {
      const response = await actualService.getActual(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createActual = createAsyncThunk(
  'actual/createActual',
  async ({ data, evidenceFile }, { rejectWithValue }) => {
    try {
      const response = await actualService.createActual(data, evidenceFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitActual = createAsyncThunk(
  'actual/submitActual',
  async (id, { rejectWithValue }) => {
    try {
      const response = await actualService.submitActual(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveActual = createAsyncThunk(
  'actual/approveActual',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await actualService.approveActual(id, comment);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectActual = createAsyncThunk(
  'actual/rejectActual',
  async ({ id, reasonId, comment }, { rejectWithValue }) => {
    try {
      const response = await actualService.rejectActual(id, reasonId, comment);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resubmitActual = createAsyncThunk(
  'actual/resubmitActual',
  async ({ id, actualValue, notes }, { rejectWithValue }) => {
    try {
      const response = await actualService.resubmitActual(id, actualValue, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateActual = createAsyncThunk(
  'actual/updateActual',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await actualService.updateActual(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadEvidence = createAsyncThunk(
  'actual/uploadEvidence',
  async ({ actualId, file, evidenceType, description }, { rejectWithValue }) => {
    try {
      const response = await actualService.uploadEvidence(actualId, file, evidenceType, description);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAdjustment = createAsyncThunk(
  'actual/createAdjustment',
  async ({ originalActualId, adjustedValue, reason }, { rejectWithValue }) => {
    try {
      const response = await actualService.createAdjustment(originalActualId, adjustedValue, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveAdjustment = createAsyncThunk(
  'actual/approveAdjustment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await actualService.approveAdjustment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  actuals: [],
  currentActual: null,
  evidence: [],
  adjustments: [],
  
  loading: false,
  submitting: false,
  uploading: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  
  filters: {
    status: null,
    year: null,
    month: null,
    kpi: null,
    user: null,
  },
};

// ============ Slice ============
const actualSlice = createSlice({
  name: 'actual',
  initialState,
  reducers: {
    clearCurrentActual: (state) => {
      state.currentActual = null;
      state.evidence = [];
    },
    setActualFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetActualFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    addLocalEvidence: (state, action) => {
      state.evidence.push(action.payload);
    },
    removeLocalEvidence: (state, action) => {
      state.evidence = state.evidence.filter(e => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch Actuals ============
      .addCase(fetchActuals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActuals.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.actuals = results;
        const activePageSize = pageSize || state.pagination.pageSize || 20;
        const activePage = page || state.pagination.page || 1;
        const totalPages = Math.max(1, Math.ceil(total / activePageSize));

        state.pagination = {
          page: activePage,
          pageSize: activePageSize,
          total,
          totalPages,
        };
      })
      .addCase(fetchActuals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============ Fetch Single Actual ============
      .addCase(fetchActual.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActual.fulfilled, (state, action) => {
        state.loading = false;
        state.currentActual = action.payload;
        state.evidence = action.payload.evidence || [];
      })
      .addCase(fetchActual.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============ Create Actual ============
      .addCase(createActual.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createActual.fulfilled, (state, action) => {
        state.submitting = false;
        state.actuals.unshift(action.payload);
      })
      .addCase(createActual.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Update Actual ============
      .addCase(updateActual.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateActual.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.actuals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.actuals[index] = action.payload;
        if (state.currentActual?.id === action.payload.id) state.currentActual = action.payload;
      })
      .addCase(updateActual.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Submit Actual ============
      .addCase(submitActual.fulfilled, (state, action) => {
        const index = state.actuals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.actuals[index] = action.payload;
        if (state.currentActual?.id === action.payload.id) state.currentActual = action.payload;
      })
      
      // ============ Approve Actual ============
      .addCase(approveActual.pending, (state, action) => {
        const id = action.meta.arg?.id;
        const index = state.actuals.findIndex(a => a.id === id);
        if (index !== -1) {
          state.actuals[index]._previousStatus = state.actuals[index].status;
          state.actuals[index].status = 'APPROVED';
        }
        if (state.currentActual?.id === id) {
          state.currentActual._previousStatus = state.currentActual.status;
          state.currentActual.status = 'APPROVED';
        }
      })
      .addCase(approveActual.fulfilled, (state, action) => {
        const index = state.actuals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.actuals[index] = action.payload;
        if (state.currentActual?.id === action.payload.id) state.currentActual = action.payload;
      })
      .addCase(approveActual.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        const index = state.actuals.findIndex(a => a.id === id);
        if (index !== -1 && state.actuals[index]._previousStatus) {
          state.actuals[index].status = state.actuals[index]._previousStatus;
          delete state.actuals[index]._previousStatus;
        }
        if (state.currentActual?.id === id && state.currentActual._previousStatus) {
          state.currentActual.status = state.currentActual._previousStatus;
          delete state.currentActual._previousStatus;
        }
        state.error = action.payload;
      })
      
      // ============ Reject Actual ============
      .addCase(rejectActual.pending, (state, action) => {
        const id = action.meta.arg?.id;
        const index = state.actuals.findIndex(a => a.id === id);
        if (index !== -1) {
          state.actuals[index]._previousStatus = state.actuals[index].status;
          state.actuals[index].status = 'REJECTED';
        }
        if (state.currentActual?.id === id) {
          state.currentActual._previousStatus = state.currentActual.status;
          state.currentActual.status = 'REJECTED';
        }
      })
      .addCase(rejectActual.fulfilled, (state, action) => {
        const index = state.actuals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.actuals[index] = action.payload;
        if (state.currentActual?.id === action.payload.id) state.currentActual = action.payload;
      })
      .addCase(rejectActual.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        const index = state.actuals.findIndex(a => a.id === id);
        if (index !== -1 && state.actuals[index]._previousStatus) {
          state.actuals[index].status = state.actuals[index]._previousStatus;
          delete state.actuals[index]._previousStatus;
        }
        if (state.currentActual?.id === id && state.currentActual._previousStatus) {
          state.currentActual.status = state.currentActual._previousStatus;
          delete state.currentActual._previousStatus;
        }
        state.error = action.payload;
      })
      
      // ============ Resubmit Actual ============
      .addCase(resubmitActual.fulfilled, (state, action) => {
        const index = state.actuals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.actuals[index] = action.payload;
        if (state.currentActual?.id === action.payload.id) state.currentActual = action.payload;
      })
      
      // ============ Upload Evidence ============
      .addCase(uploadEvidence.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadEvidence.fulfilled, (state, action) => {
        state.uploading = false;
        state.evidence.push(action.payload);
      })
      .addCase(uploadEvidence.rejected, (state) => {
        state.uploading = false;
      });
  },
});

export const {
  clearCurrentActual,
  setActualFilters,
  resetActualFilters,
  clearErrors,
  addLocalEvidence,
  removeLocalEvidence,
} = actualSlice.actions;

export default actualSlice.reducer;