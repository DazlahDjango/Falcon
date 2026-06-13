/**
 * Cascade Slice - Target cascading from organization to departments to individuals
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { targetService } from '../../../services/kpi';

// ============ Async Thunks ============

// Fetch cascade rules
export const fetchCascadeRules = createAsyncThunk(
  'cascade/fetchRules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await targetService.getCascadeRules(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create cascade rule
export const createCascadeRule = createAsyncThunk(
  'cascade/createRule',
  async (data, { rejectWithValue }) => {
    try {
      const response = await targetService.createCascadeRule(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update cascade rule
export const updateCascadeRule = createAsyncThunk(
  'cascade/updateRule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await targetService.updateCascadeRule(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete cascade rule
export const deleteCascadeRule = createAsyncThunk(
  'cascade/deleteRule',
  async (id, { rejectWithValue }) => {
    try {
      await targetService.deleteCascadeRule(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Set default cascade rule
export const setDefaultCascadeRule = createAsyncThunk(
  'cascade/setDefaultRule',
  async (id, { rejectWithValue }) => {
    try {
      const response = await targetService.setDefaultCascadeRule(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch cascade maps
export const fetchCascadeMaps = createAsyncThunk(
  'cascade/fetchMaps',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await targetService.getCascadeMaps(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create cascade map (cascade from organization)
export const createCascadeMap = createAsyncThunk(
  'cascade/createMap',
  async (data, { rejectWithValue }) => {
    try {
      const response = await targetService.createCascadeMap(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cascade to department
export const cascadeToDepartment = createAsyncThunk(
  'cascade/cascadeToDepartment',
  async ({ deptTargetId, ruleId, userIds = [], weights = {} }, { rejectWithValue }) => {
    try {
      const response = await targetService.cascadeDepartment(deptTargetId, ruleId, userIds, weights);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get cascade tree
export const getCascadeTree = createAsyncThunk(
  'cascade/getTree',
  async (orgTargetId, { rejectWithValue }) => {
    try {
      const response = await targetService.getCascadeTree(orgTargetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Rollback cascade map
export const rollbackCascadeMap = createAsyncThunk(
  'cascade/rollbackMap',
  async (mapId, { rejectWithValue }) => {
    try {
      const response = await targetService.rollbackCascadeMap(mapId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  // Cascade Rules
  cascadeRules: [],
  currentRule: null,
  
  // Cascade Maps
  cascadeMaps: [],
  currentMap: null,
  
  // Cascade Tree
  cascadeTree: null,
  
  // UI State
  loading: false,
  submitting: false,
  error: null,
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const cascadeSlice = createSlice({
  name: 'cascade',
  initialState,
  reducers: {
    clearCurrentRule: (state) => {
      state.currentRule = null;
    },
    clearCurrentMap: (state) => {
      state.currentMap = null;
    },
    clearCascadeTree: (state) => {
      state.cascadeTree = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setCascadeRules: (state, action) => {
      state.cascadeRules = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cascade Rules
      .addCase(fetchCascadeRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCascadeRules.fulfilled, (state, action) => {
        state.loading = false;
        state.cascadeRules = action.payload.results || action.payload;
        if (action.payload.count) {
          state.pagination.total = action.payload.count;
        }
      })
      .addCase(fetchCascadeRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Cascade Rule
      .addCase(createCascadeRule.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createCascadeRule.fulfilled, (state, action) => {
        state.submitting = false;
        state.cascadeRules.unshift(action.payload);
      })
      .addCase(createCascadeRule.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Update Cascade Rule
      .addCase(updateCascadeRule.fulfilled, (state, action) => {
        const index = state.cascadeRules.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.cascadeRules[index] = action.payload;
        if (state.currentRule?.id === action.payload.id) state.currentRule = action.payload;
      })
      
      // Delete Cascade Rule
      .addCase(deleteCascadeRule.fulfilled, (state, action) => {
        state.cascadeRules = state.cascadeRules.filter(r => r.id !== action.payload);
      })
      
      // Set Default Cascade Rule
      .addCase(setDefaultCascadeRule.fulfilled, (state, action) => {
        state.cascadeRules = state.cascadeRules.map(rule => ({
          ...rule,
          is_default: rule.id === action.payload.id,
        }));
      })
      
      // Fetch Cascade Maps
      .addCase(fetchCascadeMaps.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCascadeMaps.fulfilled, (state, action) => {
        state.loading = false;
        state.cascadeMaps = action.payload.results || action.payload;
      })
      .addCase(fetchCascadeMaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Cascade Map
      .addCase(createCascadeMap.fulfilled, (state, action) => {
        state.cascadeMaps.push(action.payload);
      })
      
      // Cascade to Department
      .addCase(cascadeToDepartment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(cascadeToDepartment.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentMap = action.payload;
      })
      .addCase(cascadeToDepartment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Get Cascade Tree
      .addCase(getCascadeTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCascadeTree.fulfilled, (state, action) => {
        state.loading = false;
        state.cascadeTree = action.payload;
      })
      .addCase(getCascadeTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Rollback Cascade Map
      .addCase(rollbackCascadeMap.fulfilled, (state, action) => {
        // Refresh maps or remove the rolled back map
        state.cascadeMaps = state.cascadeMaps.filter(m => m.id !== action.meta.arg);
      });
  },
});

export const {
  clearCurrentRule,
  clearCurrentMap,
  clearCascadeTree,
  clearErrors,
  setCascadeRules,
} = cascadeSlice.actions;

export default cascadeSlice.reducer;