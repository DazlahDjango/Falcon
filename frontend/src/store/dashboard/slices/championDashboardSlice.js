// frontend/src/store/dashboard/slices/championDashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { championService } from '../../../services/dashboard/champion.service';

const initialState = {
  data: null,
  availableKPIs: [],
  assignedKPIs: [],
  templates: [],
  targetUserId: null,
  period: 'current',
  loading: false,
  saving: false,
  creatingTemplate: false,
  applyingTemplate: false,
  error: null,
  lastUpdated: null
};

// ===================== ASYNC THUNKS =====================

export const fetchEditableDashboard = createAsyncThunk(
  'championDashboard/fetchEditable',
  async ({ targetUserId, period } = {}, { rejectWithValue }) => {
    try {
      const response = await championService.getEditableDashboard(targetUserId, period);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch editable dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch editable dashboard');
    }
  }
);

export const fetchAvailableKPIs = createAsyncThunk(
  'championDashboard/fetchAvailableKPIs',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await championService.getAvailableKPIs(userId);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch available KPIs');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available KPIs');
    }
  }
);

export const fetchAssignedKPIs = createAsyncThunk(
  'championDashboard/fetchAssignedKPIs',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await championService.getAssignedKPIs(userId);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch assigned KPIs');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch assigned KPIs');
    }
  }
);

export const fetchTemplates = createAsyncThunk(
  'championDashboard/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await championService.getTemplates();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch templates');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch templates');
    }
  }
);

export const updateDashboardConfig = createAsyncThunk(
  'championDashboard/updateConfig',
  async ({ targetUserId, config }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.updateDashboardConfig({ userId: targetUserId, config });
      if (response?.success) {
        await dispatch(fetchEditableDashboard({ targetUserId }));
        await dispatch(fetchAssignedKPIs(targetUserId));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update dashboard config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update dashboard config');
    }
  }
);

export const addKPI = createAsyncThunk(
  'championDashboard/addKPI',
  async ({ targetUserId, kpiId, weight }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.addKPI({ userId: targetUserId, kpiId, weight });
      if (response?.success) {
        await dispatch(fetchAssignedKPIs(targetUserId));
        await dispatch(fetchAvailableKPIs(targetUserId));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to add KPI');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add KPI');
    }
  }
);

export const removeKPI = createAsyncThunk(
  'championDashboard/removeKPI',
  async ({ targetUserId, kpiId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.removeKPI({ userId: targetUserId, kpiId });
      if (response?.success) {
        await dispatch(fetchAssignedKPIs(targetUserId));
        await dispatch(fetchAvailableKPIs(targetUserId));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to remove KPI');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove KPI');
    }
  }
);

export const updateKPIWeights = createAsyncThunk(
  'championDashboard/updateWeights',
  async ({ targetUserId, weights }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.updateKPIWeights({ userId: targetUserId, weights });
      if (response?.success) {
        await dispatch(fetchAssignedKPIs(targetUserId));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update weights');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update weights');
    }
  }
);

export const updateKPITargets = createAsyncThunk(
  'championDashboard/updateTargets',
  async ({ targetUserId, targets, period }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.updateKPITargets({ userId: targetUserId, targets, period });
      if (response?.success) {
        await dispatch(fetchEditableDashboard({ targetUserId, period }));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update targets');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update targets');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'championDashboard/createTemplate',
  async ({ name, description, category, configuration }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.createTemplate({ name, description, category, configuration });
      if (response?.success) {
        await dispatch(fetchTemplates());
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create template');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create template');
    }
  }
);

export const applyTemplate = createAsyncThunk(
  'championDashboard/applyTemplate',
  async ({ templateId, targetUserId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await championService.applyTemplate(templateId, targetUserId);
      if (response?.success) {
        await dispatch(fetchEditableDashboard({ targetUserId }));
        await dispatch(fetchAssignedKPIs(targetUserId));
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to apply template');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to apply template');
    }
  }
);

export const refreshChampionDashboard = createAsyncThunk(
  'championDashboard/refreshAll',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { targetUserId, period } = state.championDashboard;
    
    await Promise.all([
      dispatch(fetchEditableDashboard({ targetUserId, period })),
      dispatch(fetchAvailableKPIs(targetUserId)),
      dispatch(fetchAssignedKPIs(targetUserId)),
      dispatch(fetchTemplates())
    ]);
    
    return { success: true };
  }
);

// ===================== SLICE =====================

const championDashboardSlice = createSlice({
  name: 'championDashboard',
  initialState,
  reducers: {
    setTargetUserId: (state, action) => {
      state.targetUserId = action.payload;
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearChampionError: (state) => {
      state.error = null;
    },
    resetChampionState: () => initialState,
    updateChampionData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Editable Dashboard
      .addCase(fetchEditableDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEditableDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchEditableDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Available KPIs
      .addCase(fetchAvailableKPIs.fulfilled, (state, action) => {
        state.availableKPIs = action.payload;
      })
      // Fetch Assigned KPIs
      .addCase(fetchAssignedKPIs.fulfilled, (state, action) => {
        state.assignedKPIs = action.payload;
      })
      // Fetch Templates
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })
      // Update Config
      .addCase(updateDashboardConfig.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateDashboardConfig.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateDashboardConfig.rejected, (state) => {
        state.saving = false;
      })
      // Add KPI
      .addCase(addKPI.pending, (state) => {
        state.saving = true;
      })
      .addCase(addKPI.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(addKPI.rejected, (state) => {
        state.saving = false;
      })
      // Remove KPI
      .addCase(removeKPI.pending, (state) => {
        state.saving = true;
      })
      .addCase(removeKPI.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(removeKPI.rejected, (state) => {
        state.saving = false;
      })
      // Update Weights
      .addCase(updateKPIWeights.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateKPIWeights.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateKPIWeights.rejected, (state) => {
        state.saving = false;
      })
      // Update Targets
      .addCase(updateKPITargets.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateKPITargets.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateKPITargets.rejected, (state) => {
        state.saving = false;
      })
      // Create Template
      .addCase(createTemplate.pending, (state) => {
        state.creatingTemplate = true;
      })
      .addCase(createTemplate.fulfilled, (state) => {
        state.creatingTemplate = false;
      })
      .addCase(createTemplate.rejected, (state) => {
        state.creatingTemplate = false;
      })
      // Apply Template
      .addCase(applyTemplate.pending, (state) => {
        state.applyingTemplate = true;
      })
      .addCase(applyTemplate.fulfilled, (state) => {
        state.applyingTemplate = false;
      })
      .addCase(applyTemplate.rejected, (state) => {
        state.applyingTemplate = false;
      });
  }
});

export const {
  setTargetUserId,
  setPeriod,
  clearChampionError,
  resetChampionState,
  updateChampionData
} = championDashboardSlice.actions;

export default championDashboardSlice.reducer;