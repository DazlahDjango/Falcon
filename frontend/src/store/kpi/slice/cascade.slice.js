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

// Repair cascade maps
export const repairCascade = createAsyncThunk(
  'cascade/repair',
  async ({ kpiId, year }, { rejectWithValue }) => {
    try {
      const response = await targetService.repairCascade(kpiId, year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch contributors for an organization target
export const fetchContributors = createAsyncThunk(
  'cascade/fetchContributors',
  async (orgTargetId, { rejectWithValue }) => {
    try {
      const response = await targetService.getContributors(orgTargetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch user contributions
export const fetchUserContributions = createAsyncThunk(
  'cascade/fetchUserContributions',
  async ({ userId, year } = {}, { rejectWithValue }) => {
    try {
      const response = await targetService.getUserContributions(userId, year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Rollback organization cascade
export const rollbackOrgCascade = createAsyncThunk(
  'cascade/rollbackOrg',
  async (orgTargetId, { rejectWithValue }) => {
    try {
      const response = await targetService.rollbackOrganizationCascade(orgTargetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verify cascade integrity
export const verifyCascadeIntegrity = createAsyncThunk(
  'cascade/verifyIntegrity',
  async (orgTargetId, { rejectWithValue }) => {
    try {
      const response = await targetService.verifyCascadeIntegrity(orgTargetId);
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
  
  // Contributors & Contributions
  contributors: [],
  userContributions: [],
  integrityReport: null,
  repairResult: null,
  
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
    clearIntegrityReport: (state) => {
      state.integrityReport = null;
    },
    clearRepairResult: (state) => {
      state.repairResult = null;
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
      .addCase(createCascadeMap.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCascadeMap.fulfilled, (state, action) => {
        state.submitting = false;
        if (Array.isArray(action.payload)) {
          state.cascadeMaps.unshift(...action.payload);
        } else if (action.payload) {
          state.cascadeMaps.unshift(action.payload);
        }
      })
      .addCase(createCascadeMap.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Cascade to Department
      .addCase(cascadeToDepartment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(cascadeToDepartment.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentMap = action.payload;
        if (Array.isArray(action.payload)) {
          state.cascadeMaps.unshift(...action.payload);
        } else if (action.payload) {
          state.cascadeMaps.unshift(action.payload);
        }
      })
      .addCase(cascadeToDepartment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Get Cascade Tree
      .addCase(getCascadeTree.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      .addCase(rollbackCascadeMap.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(rollbackCascadeMap.fulfilled, (state, action) => {
        state.submitting = false;
        state.cascadeMaps = state.cascadeMaps.filter(m => String(m.id) !== String(action.meta.arg));
      })
      .addCase(rollbackCascadeMap.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Repair Cascade
      .addCase(repairCascade.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(repairCascade.fulfilled, (state, action) => {
        state.submitting = false;
        state.repairResult = action.payload;
      })
      .addCase(repairCascade.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch Contributors
      .addCase(fetchContributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContributors.fulfilled, (state, action) => {
        state.loading = false;
        state.contributors = action.payload;
      })
      .addCase(fetchContributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Contributions
      .addCase(fetchUserContributions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserContributions.fulfilled, (state, action) => {
        state.loading = false;
        state.userContributions = action.payload;
      })
      .addCase(fetchUserContributions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Rollback Org Cascade
      .addCase(rollbackOrgCascade.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(rollbackOrgCascade.fulfilled, (state) => {
        state.submitting = false;
        state.cascadeMaps = [];
        state.cascadeTree = null;
      })
      .addCase(rollbackOrgCascade.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Verify Integrity
      .addCase(verifyCascadeIntegrity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCascadeIntegrity.fulfilled, (state, action) => {
        state.loading = false;
        state.integrityReport = action.payload;
      })
      .addCase(verifyCascadeIntegrity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentRule,
  clearCurrentMap,
  clearCascadeTree,
  clearIntegrityReport,
  clearRepairResult,
  clearErrors: clearCascadeErrors,
  setCascadeRules,
} = cascadeSlice.actions;

export default cascadeSlice.reducer;