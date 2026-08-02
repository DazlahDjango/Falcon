// frontend/src/store/dashboard/slices/staffDashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffService } from '../../../services/dashboard/staff.service';

const initialState = {
  data: null,
  myKPIs: [],
  pendingSubmissions: [],
  missionStatus: null,
  pendingTasks: [],
  period: 'current',
  loading: false,
  submitting: false,
  updatingMission: false,
  exporting: false,
  error: null,
  lastUpdated: null
};

// ===================== ASYNC THUNKS =====================

export const fetchStaffDashboard = createAsyncThunk(
  'staffDashboard/fetchData',
  async ({ period } = {}, { rejectWithValue }) => {
    try {
      const response = await staffService.getDashboardData({ period });
      if (response?.data) {
        return response.data;
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to fetch staff dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch staff dashboard');
    }
  }
);

export const fetchMyKPIs = createAsyncThunk(
  'staffDashboard/fetchMyKPIs',
  async (period = 'current', { rejectWithValue }) => {
    try {
      const response = await staffService.getMyKPIs(period);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch KPIs');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch KPIs');
    }
  }
);

export const fetchPendingSubmissions = createAsyncThunk(
  'staffDashboard/fetchPendingSubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getPendingSubmissions();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch pending submissions');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending submissions');
    }
  }
);

export const fetchMissionStatus = createAsyncThunk(
  'staffDashboard/fetchMissionStatus',
  async (period = 'current', { rejectWithValue }) => {
    try {
      const response = await staffService.getMissionStatus(period);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch mission status');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch mission status');
    }
  }
);

export const fetchPendingTasks = createAsyncThunk(
  'staffDashboard/fetchPendingTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getPendingTasks();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch tasks');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const submitKPI = createAsyncThunk(
  'staffDashboard/submitKPI',
  async ({ kpiId, value, comments }, { rejectWithValue }) => {
    try {
      const response = await staffService.submitKPI({ kpiId, value, comments });
      if (response?.success) {
        return { kpiId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to submit KPI');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit KPI');
    }
  }
);

export const updateMissionStatus = createAsyncThunk(
  'staffDashboard/updateMissionStatus',
  async (missionData, { rejectWithValue }) => {
    try {
      const response = await staffService.updateMissionStatus(missionData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update mission status');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update mission status');
    }
  }
);

export const exportStaffDashboard = createAsyncThunk(
  'staffDashboard/export',
  async ({ period, format }, { rejectWithValue }) => {
    try {
      const response = await staffService.exportDashboard({ period, format });
      if (response?.success || response?.data) {
        return { data: response.data, format };
      }
      return rejectWithValue(response?.message || 'Failed to export dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export dashboard');
    }
  }
);

export const refreshStaffDashboard = createAsyncThunk(
  'staffDashboard/refreshAll',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { period } = state.staffDashboard;
    
    await Promise.all([
      dispatch(fetchStaffDashboard({ period })),
      dispatch(fetchMyKPIs(period)),
      dispatch(fetchPendingSubmissions()),
      dispatch(fetchMissionStatus(period)),
      dispatch(fetchPendingTasks())
    ]);
    
    return { success: true };
  }
);

// ===================== SLICE =====================

const staffDashboardSlice = createSlice({
  name: 'staffDashboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearStaffError: (state) => {
      state.error = null;
    },
    resetStaffState: () => initialState,
    updateStaffData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    addLocalSubmission: (state, action) => {
      state.pendingSubmissions.unshift(action.payload);
    },
    removeLocalSubmission: (state, action) => {
      state.pendingSubmissions = state.pendingSubmissions.filter(
        s => s.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staff Dashboard
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My KPIs
      .addCase(fetchMyKPIs.fulfilled, (state, action) => {
        state.myKPIs = action.payload;
      })
      // Fetch Pending Submissions
      .addCase(fetchPendingSubmissions.fulfilled, (state, action) => {
        state.pendingSubmissions = action.payload;
      })
      // Fetch Mission Status
      .addCase(fetchMissionStatus.fulfilled, (state, action) => {
        state.missionStatus = action.payload;
      })
      // Fetch Pending Tasks
      .addCase(fetchPendingTasks.fulfilled, (state, action) => {
        state.pendingTasks = action.payload;
      })
      // Submit KPI
      .addCase(submitKPI.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitKPI.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastUpdated = new Date().toISOString();
        // Refresh data after submission
        const kpiIndex = state.myKPIs.findIndex(k => k.id === action.payload.kpiId);
        if (kpiIndex !== -1) {
          state.myKPIs[kpiIndex].status = 'submitted';
        }
      })
      .addCase(submitKPI.rejected, (state) => {
        state.submitting = false;
      })
      // Update Mission Status
      .addCase(updateMissionStatus.pending, (state) => {
        state.updatingMission = true;
      })
      .addCase(updateMissionStatus.fulfilled, (state, action) => {
        state.updatingMission = false;
        state.missionStatus = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateMissionStatus.rejected, (state) => {
        state.updatingMission = false;
      })
      // Export
      .addCase(exportStaffDashboard.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportStaffDashboard.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportStaffDashboard.rejected, (state) => {
        state.exporting = false;
      });
  }
});

export const {
  setPeriod,
  clearStaffError,
  resetStaffState,
  updateStaffData,
  addLocalSubmission,
  removeLocalSubmission
} = staffDashboardSlice.actions;

export default staffDashboardSlice.reducer;