/**
 * Validation Slice - Validations, Rejection Reasons, Escalations
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { validationService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchValidations = createAsyncThunk(
  'validation/fetchValidations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getValidations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingValidations = createAsyncThunk(
  'validation/fetchPendingValidations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getPendingValidations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingSummary = createAsyncThunk(
  'validation/fetchPendingSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getPendingSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRejectionReasons = createAsyncThunk(
  'validation/fetchRejectionReasons',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getRejectionReasons(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEscalations = createAsyncThunk(
  'validation/fetchEscalations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getEscalations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEscalation = createAsyncThunk(
  'validation/createEscalation',
  async ({ actualId, escalatedToId, reason }, { rejectWithValue }) => {
    try {
      const response = await validationService.createEscalation(actualId, escalatedToId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resolveEscalation = createAsyncThunk(
  'validation/resolveEscalation',
  async ({ id, resolution }, { rejectWithValue }) => {
    try {
      const response = await validationService.resolveEscalation(id, resolution);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyEscalations = createAsyncThunk(
  'validation/fetchMyEscalations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await validationService.getMyEscalations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  validations: [],
  pendingValidations: [],
  pendingSummary: null,
  rejectionReasons: [],
  escalations: [],
  myEscalations: [],
  
  loading: false,
  submitting: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const validationSlice = createSlice({
  name: 'validation',
  initialState,
  reducers: {
    clearPendingValidations: (state) => {
      state.pendingValidations = [];
      state.pendingSummary = null;
    },
    clearEscalations: (state) => {
      state.escalations = [];
      state.myEscalations = [];
    },
    clearErrors: (state) => {
      state.error = null;
    },
    removeValidationLocally: (state, action) => {
      state.pendingValidations = state.pendingValidations.filter(v => v.id !== action.payload);
      if (state.pendingSummary?.pending_count) {
        state.pendingSummary.pending_count -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchValidations.fulfilled, (state, action) => {
        state.loading = false;
        state.validations = action.payload.results || action.payload;
      })
      .addCase(fetchValidations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchPendingValidations.fulfilled, (state, action) => {
        state.pendingValidations = action.payload.results || action.payload;
      })
      
      .addCase(fetchPendingSummary.fulfilled, (state, action) => {
        state.pendingSummary = action.payload;
      })
      
      .addCase(fetchRejectionReasons.fulfilled, (state, action) => {
        state.rejectionReasons = action.payload.results || action.payload;
      })
      
      .addCase(fetchEscalations.fulfilled, (state, action) => {
        state.escalations = action.payload.results || action.payload;
      })
      
      .addCase(createEscalation.fulfilled, (state, action) => {
        state.escalations.unshift(action.payload);
      })
      
      .addCase(resolveEscalation.fulfilled, (state, action) => {
        const index = state.escalations.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.escalations[index] = action.payload;
        
        const myIndex = state.myEscalations.findIndex(e => e.id === action.payload.id);
        if (myIndex !== -1) state.myEscalations[myIndex] = action.payload;
      })
      
      .addCase(fetchMyEscalations.fulfilled, (state, action) => {
        state.myEscalations = action.payload.results || action.payload;
      });
  },
});

export const {
  clearPendingValidations,
  clearEscalations,
  clearErrors,
  removeValidationLocally,
} = validationSlice.actions;

export default validationSlice.reducer;