import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  kpiService,
  frameworkService,
  targetService,
  actualService,
  scoreService,
} from '../../../services/kpi';

// ============ Async Thunks ============

// KPI CRUD
export const fetchKPIs = createAsyncThunk(
  'kpi/fetchKPIs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kpiService.getKPIs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchKPI = createAsyncThunk(
  'kpi/fetchKPI',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kpiService.getKPI(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createKPI = createAsyncThunk(
  'kpi/createKPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await kpiService.createKPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKPI = createAsyncThunk(
  'kpi/updateKPI',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await kpiService.updateKPI(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteKPI = createAsyncThunk(
  'kpi/deleteKPI',
  async (id, { rejectWithValue }) => {
    try {
      await kpiService.deleteKPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateKPI = createAsyncThunk(
  'kpi/activateKPI',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kpiService.activateKPI(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateKPI = createAsyncThunk(
  'kpi/deactivateKPI',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await kpiService.deactivateKPI(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const validateKPI = createAsyncThunk(
  'kpi/validateKPI',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kpiService.validateKPI(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// KPI Weights
export const fetchKPIWeights = createAsyncThunk(
  'kpi/fetchKPIWeights',
  async ({ kpiId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getKPIWeights(kpiId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKPIWeights = createAsyncThunk(
  'kpi/updateKPIWeights',
  async ({ kpiId, weights }, { rejectWithValue }) => {
    try {
      const response = await kpiService.updateKPIWeights(kpiId, weights);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const validateWeightSum = createAsyncThunk(
  'kpi/validateWeightSum',
  async ({ userId, weights }, { rejectWithValue }) => {
    try {
      const response = await kpiService.validateWeightSum(userId, weights);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// KPI Dependencies
export const fetchDependencies = createAsyncThunk(
  'kpi/fetchDependencies',
  async ({ kpiId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getDependencies(kpiId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDependency = createAsyncThunk(
  'kpi/createDependency',
  async (data, { rejectWithValue }) => {
    try {
      const response = await kpiService.createDependency(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDependency = createAsyncThunk(
  'kpi/deleteDependency',
  async (id, { rejectWithValue }) => {
    try {
      await kpiService.deleteDependency(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Strategic Linkages
export const fetchStrategicLinkages = createAsyncThunk(
  'kpi/fetchStrategicLinkages',
  async ({ kpiId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getStrategicLinkages(kpiId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createStrategicLinkage = createAsyncThunk(
  'kpi/createStrategicLinkage',
  async ({ kpiId, data }, { rejectWithValue }) => {
    try {
      const response = await kpiService.createStrategicLinkage(kpiId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStrategicLinkage = createAsyncThunk(
  'kpi/deleteStrategicLinkage',
  async (id, { rejectWithValue }) => {
    try {
      await kpiService.deleteStrategicLinkage(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// User Nested (My KPIs)
export const fetchUserKPIs = createAsyncThunk(
  'kpi/fetchUserKPIs',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getUserKPIs(userId, params);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserTargets = createAsyncThunk(
  'kpi/fetchUserTargets',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getUserTargets(userId, params);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserScores = createAsyncThunk(
  'kpi/fetchUserScores',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getUserScores(userId, params);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserActuals = createAsyncThunk(
  'kpi/fetchUserActuals',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiService.getUserActuals(userId, params);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  // KPIs
  kpis: [],
  currentKPI: null,
  kpiValidation: null,
  
  // Weights
  weights: [],
  weightValidation: null,
  
  // Dependencies
  dependencies: [],
  
  // Strategic Linkages
  strategicLinkages: [],
  
  // User nested data
  userKPIs: {},
  userTargets: {},
  userScores: {},
  userActuals: {},
  
  // UI State
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  validationErrors: {},
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  
  // Filters
  filters: {
    framework: null,
    category: null,
    sector: null,
    kpi_type: null,
    is_active: null,
    search: '',
  },
};

// ============ Slice ============
const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    clearCurrentKPI: (state) => {
      state.currentKPI = null;
      state.kpiValidation = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setKpiPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearUserData: (state, action) => {
      const { userId } = action.payload;
      delete state.userKPIs[userId];
      delete state.userTargets[userId];
      delete state.userScores[userId];
      delete state.userActuals[userId];
    },
    clearAllUserData: (state) => {
      state.userKPIs = {};
      state.userTargets = {};
      state.userScores = {};
      state.userActuals = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch KPIs ============
      .addCase(fetchKPIs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKPIs.fulfilled, (state, action) => {
        state.loading = false;
        state.kpis = action.payload.results || action.payload;
        if (action.payload.count) {
          state.pagination.total = action.payload.count;
          state.pagination.totalPages = Math.ceil(action.payload.count / state.pagination.pageSize);
        }
      })
      .addCase(fetchKPIs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============ Fetch Single KPI ============
      .addCase(fetchKPI.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchKPI.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentKPI = action.payload;
      })
      .addCase(fetchKPI.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      
      // ============ Create KPI ============
      .addCase(createKPI.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createKPI.fulfilled, (state, action) => {
        state.submitting = false;
        state.kpis.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createKPI.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Update KPI ============
      .addCase(updateKPI.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateKPI.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentKPI = action.payload;
        const index = state.kpis.findIndex(k => k.id === action.payload.id);
        if (index !== -1) state.kpis[index] = action.payload;
      })
      .addCase(updateKPI.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // ============ Delete KPI ============
      .addCase(deleteKPI.fulfilled, (state, action) => {
        state.kpis = state.kpis.filter(k => k.id !== action.payload);
        state.pagination.total -= 1;
      })
      
      // ============ Activate/Deactivate KPI ============
      .addCase(activateKPI.fulfilled, (state, action) => {
        state.currentKPI = action.payload;
        const index = state.kpis.findIndex(k => k.id === action.payload.id);
        if (index !== -1) state.kpis[index] = action.payload;
      })
      .addCase(deactivateKPI.fulfilled, (state, action) => {
        state.currentKPI = action.payload;
        const index = state.kpis.findIndex(k => k.id === action.payload.id);
        if (index !== -1) state.kpis[index] = action.payload;
      })
      
      // ============ Validate KPI ============
      .addCase(validateKPI.fulfilled, (state, action) => {
        state.kpiValidation = action.payload;
      })
      
      // ============ Weights ============
      .addCase(fetchKPIWeights.fulfilled, (state, action) => {
        state.weights = action.payload.results || action.payload;
      })
      .addCase(updateKPIWeights.fulfilled, (state, action) => {
        state.weights = action.payload;
      })
      .addCase(validateWeightSum.fulfilled, (state, action) => {
        state.weightValidation = action.payload;
      })
      
      // ============ Dependencies ============
      .addCase(fetchDependencies.fulfilled, (state, action) => {
        state.dependencies = action.payload.results || action.payload;
      })
      .addCase(createDependency.fulfilled, (state, action) => {
        state.dependencies.push(action.payload);
      })
      .addCase(deleteDependency.fulfilled, (state, action) => {
        state.dependencies = state.dependencies.filter(d => d.id !== action.payload);
      })
      
      // ============ Strategic Linkages ============
      .addCase(fetchStrategicLinkages.fulfilled, (state, action) => {
        state.strategicLinkages = action.payload.results || action.payload;
      })
      .addCase(createStrategicLinkage.fulfilled, (state, action) => {
        state.strategicLinkages.push(action.payload);
      })
      .addCase(deleteStrategicLinkage.fulfilled, (state, action) => {
        state.strategicLinkages = state.strategicLinkages.filter(l => l.id !== action.payload);
      })
      
      // ============ User Nested Data ============
      .addCase(fetchUserKPIs.fulfilled, (state, action) => {
        state.userKPIs[action.payload.userId] = action.payload.data;
      })
      .addCase(fetchUserTargets.fulfilled, (state, action) => {
        state.userTargets[action.payload.userId] = action.payload.data;
      })
      .addCase(fetchUserScores.fulfilled, (state, action) => {
        state.userScores[action.payload.userId] = action.payload.data;
      })
      .addCase(fetchUserActuals.fulfilled, (state, action) => {
        state.userActuals[action.payload.userId] = action.payload.data;
      });
  },
});

// ============ Export Actions ============
export const {
  clearCurrentKPI,
  clearErrors,
  setFilters,
  resetFilters,
  setKpiPagination,
  clearUserData,
  clearAllUserData,
} = kpiSlice.actions;

// ============ Export Reducer ============
export default kpiSlice.reducer;