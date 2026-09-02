/**
 * Target Slice - Annual Targets & Monthly Phasing Only
 * (Cascade functionality moved to cascade.slice)
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { targetService } from '../../../services/kpi';

// ============ Async Thunks ============

// Fetch all targets
export const fetchTargets = createAsyncThunk(
  'target/fetchTargets',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.target?.pagination || { page: 1, pageSize: 20 };
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

      const response = await targetService.getTargets(queryParams);
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

// Fetch single target
export const fetchTarget = createAsyncThunk(
  'target/fetchTarget',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetService.getTarget(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create target
export const createTarget = createAsyncThunk(
  'target/createTarget',
  async (data, { rejectWithValue }) => {
    try {
      const response = await targetService.createTarget(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update target
export const updateTarget = createAsyncThunk(
  'target/updateTarget',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await targetService.updateTarget(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete target
export const deleteTarget = createAsyncThunk(
  'target/deleteTarget',
  async (id, { rejectWithValue }) => {
    try {
      await targetService.deleteTarget(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Phase target - generate monthly distribution
export const phaseTarget = createAsyncThunk(
  'target/phaseTarget',
  async ({ id, strategy, strategyParams = {}, overwrite = true }, { rejectWithValue }) => {
    try {
      const response = await targetService.phaseTarget(id, strategy, strategyParams, overwrite);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Bulk update monthly phasing for a target
export const bulkUpdateMonthlyPhasing = createAsyncThunk(
  'target/bulkUpdateMonthlyPhasing',
  async ({ annualTargetId, months }, { rejectWithValue }) => {
    try {
      const response = await targetService.bulkUpdateMonthlyPhasing(annualTargetId, months);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch monthly phasing for a target
export const fetchPhasing = createAsyncThunk(
  'target/fetchPhasing',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetService.getPhasing(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Lock phasing cycle (lock all monthly targets for a period)
export const lockPhasingCycle = createAsyncThunk(
  'target/lockPhasingCycle',
  async ({ performanceCycle }, { rejectWithValue }) => {
    try {
      const cycle = typeof performanceCycle === 'string' ? performanceCycle : (performanceCycle?.performanceCycle || performanceCycle?.cycleName);
      const response = await targetService.lockPhasingCycle(cycle);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update individual monthly phasing value
export const updateMonthlyPhasing = createAsyncThunk(
  'target/updateMonthlyPhasing',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await targetService.updateMonthlyPhasing(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Lock individual monthly phasing
export const lockMonthlyPhasing = createAsyncThunk(
  'target/lockMonthlyPhasing',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetService.lockPhasing(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Validate target (check if phasing sums to annual target)
export const validateTarget = createAsyncThunk(
  'target/validateTarget',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetService.validateTarget(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  // Targets
  targets: [],
  currentTarget: null,
  
  // Monthly Phasing
  monthlyPhasing: {},
  
  // Validation
  validation: null,
  
  // UI State
  loading: false,
  submitting: false,
  phasing: false,
  validating: false,
  error: null,
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

// ============ Slice ============
const targetSlice = createSlice({
  name: 'target',
  initialState,
  reducers: {
    clearCurrentTarget: (state) => {
      state.currentTarget = null;
      state.validation = null;
    },
    clearMonthlyPhasing: (state) => {
      state.monthlyPhasing = {};
    },
    clearErrors: (state) => {
      state.error = null;
    },
    updateLocalPhasing: (state, action) => {
      const { targetId, phasing } = action.payload;
      state.monthlyPhasing[targetId] = phasing;
    },
    setTargetPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch Targets ============
      .addCase(fetchTargets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTargets.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.targets = results;
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
      .addCase(fetchTargets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============ Fetch Single Target ============
      .addCase(fetchTarget.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTarget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTarget = action.payload;
      })
      .addCase(fetchTarget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============ Create Target ============
      .addCase(createTarget.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createTarget.fulfilled, (state, action) => {
        state.submitting = false;
        state.targets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTarget.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Update Target ============
      .addCase(updateTarget.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateTarget.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.targets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.targets[index] = action.payload;
        if (state.currentTarget?.id === action.payload.id) state.currentTarget = action.payload;
      })
      .addCase(updateTarget.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Delete Target ============
      .addCase(deleteTarget.fulfilled, (state, action) => {
        state.targets = state.targets.filter(t => t.id !== action.payload);
        state.pagination.total -= 1;
      })
      
      // ============ Phase Target ============
      .addCase(phaseTarget.pending, (state) => {
        state.phasing = true;
        state.error = null;
      })
      .addCase(phaseTarget.fulfilled, (state, action) => {
        state.phasing = false;
        state.monthlyPhasing[action.meta.arg.id] = action.payload;
      })
      .addCase(phaseTarget.rejected, (state, action) => {
        state.phasing = false;
        state.error = action.payload;
      })
      
      // ============ Fetch Phasing ============
      .addCase(fetchPhasing.fulfilled, (state, action) => {
        state.monthlyPhasing[action.payload.id] = action.payload.data;
      })
      
      // ============ Update Monthly Phasing ============
      .addCase(updateMonthlyPhasing.fulfilled, (state, action) => {
        const targetId = action.meta.arg.id.split('_')[0]; // Extract targetId from phasing id
        if (targetId && state.monthlyPhasing[targetId]) {
          const index = state.monthlyPhasing[targetId].findIndex(p => p.id === action.meta.arg.id);
          if (index !== -1) {
            state.monthlyPhasing[targetId][index] = action.payload;
          }
        }
      })
      
      // ============ Lock Monthly Phasing ============
      .addCase(lockMonthlyPhasing.fulfilled, (state, action) => {
        const targetId = action.meta.arg.split('_')[0];
        if (targetId && state.monthlyPhasing[targetId]) {
          const index = state.monthlyPhasing[targetId].findIndex(p => p.id === action.meta.arg);
          if (index !== -1) {
            state.monthlyPhasing[targetId][index] = action.payload;
          }
        }
      })
      
      // ============ Lock Phasing Cycle ============
      .addCase(lockPhasingCycle.fulfilled, (state, action) => {
        // Refresh phasing data or show success message
        state.error = null;
      })
      
      // ============ Validate Target ============
      .addCase(validateTarget.pending, (state) => {
        state.validating = true;
      })
      .addCase(validateTarget.fulfilled, (state, action) => {
        state.validating = false;
        state.validation = action.payload;
      })
      .addCase(validateTarget.rejected, (state, action) => {
        state.validating = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrentTarget, 
  clearMonthlyPhasing, 
  clearErrors, 
  updateLocalPhasing,
  setTargetPagination,
} = targetSlice.actions;

export default targetSlice.reducer;