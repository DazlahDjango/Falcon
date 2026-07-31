// frontend/src/store/dashboard/slices/managerDashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { managerService } from '../../../services/dashboard/manager.service';

const initialState = {
  data: null,
  teamMembers: [],
  teamSummary: null,
  pendingApprovals: [],
  period: 'current',
  includeTeam: true,
  drillDownUserId: null,
  loading: false,
  approving: false,
  rejecting: false,
  exporting: false,
  error: null,
  lastUpdated: null
};

// ===================== ASYNC THUNKS =====================

export const fetchManagerDashboard = createAsyncThunk(
  'managerDashboard/fetchData',
  async ({ period, includeTeam, userId } = {}, { rejectWithValue }) => {
    try {
      const response = await managerService.getDashboardData({ period, includeTeam, userId });
      if (response?.data) {
        return response.data;
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to fetch manager dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch manager dashboard');
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'managerDashboard/fetchTeamMembers',
  async (userId = null, { rejectWithValue }) => {
    try {
      const response = await managerService.getTeamMembers(userId);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch team members');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team members');
    }
  }
);

export const fetchTeamSummary = createAsyncThunk(
  'managerDashboard/fetchTeamSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await managerService.getTeamSummary();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch team summary');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team summary');
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  'managerDashboard/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await managerService.getPendingApprovals();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch pending approvals');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending approvals');
    }
  }
);

export const approveSubmission = createAsyncThunk(
  'managerDashboard/approveSubmission',
  async ({ submissionId, comments }, { rejectWithValue }) => {
    try {
      const response = await managerService.approveSubmission(submissionId, comments);
      if (response?.success) {
        return { submissionId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to approve submission');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to approve submission');
    }
  }
);

export const rejectSubmission = createAsyncThunk(
  'managerDashboard/rejectSubmission',
  async ({ submissionId, comments }, { rejectWithValue }) => {
    try {
      const response = await managerService.rejectSubmission(submissionId, comments);
      if (response?.success) {
        return { submissionId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to reject submission');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject submission');
    }
  }
);

export const drillDownToUser = createAsyncThunk(
  'managerDashboard/drillDown',
  async ({ userId, period }, { rejectWithValue }) => {
    try {
      const response = await managerService.drillDown(userId, period);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to drill down');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to drill down');
    }
  }
);

export const exportManagerDashboard = createAsyncThunk(
  'managerDashboard/export',
  async ({ period, includeTeam, format }, { rejectWithValue }) => {
    try {
      const response = await managerService.exportDashboard({ period, includeTeam, format });
      if (response?.success || response?.data) {
        return { data: response.data, format };
      }
      return rejectWithValue(response?.message || 'Failed to export dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export dashboard');
    }
  }
);

export const refreshManagerDashboard = createAsyncThunk(
  'managerDashboard/refreshAll',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { period, includeTeam, drillDownUserId } = state.managerDashboard;
    
    await Promise.all([
      dispatch(fetchManagerDashboard({ period, includeTeam, userId: drillDownUserId })),
      dispatch(fetchTeamMembers(drillDownUserId)),
      dispatch(fetchTeamSummary()),
      dispatch(fetchPendingApprovals())
    ]);
    
    return { success: true };
  }
);

// ===================== SLICE =====================

const managerDashboardSlice = createSlice({
  name: 'managerDashboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    setIncludeTeam: (state, action) => {
      state.includeTeam = action.payload;
    },
    setDrillDownUserId: (state, action) => {
      state.drillDownUserId = action.payload;
    },
    resetDrillDown: (state) => {
      state.drillDownUserId = null;
    },
    clearManagerError: (state) => {
      state.error = null;
    },
    resetManagerState: () => initialState,
    updateManagerData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Manager Dashboard
      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Team Members
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })
      // Fetch Team Summary
      .addCase(fetchTeamSummary.fulfilled, (state, action) => {
        state.teamSummary = action.payload;
      })
      // Fetch Pending Approvals
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.pendingApprovals = action.payload;
      })
      // Approve Submission
      .addCase(approveSubmission.pending, (state) => {
        state.approving = true;
      })
      .addCase(approveSubmission.fulfilled, (state, action) => {
        state.approving = false;
        state.pendingApprovals = state.pendingApprovals.filter(
          p => p.id !== action.payload.submissionId
        );
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(approveSubmission.rejected, (state) => {
        state.approving = false;
      })
      // Reject Submission
      .addCase(rejectSubmission.pending, (state) => {
        state.rejecting = true;
      })
      .addCase(rejectSubmission.fulfilled, (state, action) => {
        state.rejecting = false;
        state.pendingApprovals = state.pendingApprovals.filter(
          p => p.id !== action.payload.submissionId
        );
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(rejectSubmission.rejected, (state) => {
        state.rejecting = false;
      })
      // Drill Down
      .addCase(drillDownToUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      // Export
      .addCase(exportManagerDashboard.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportManagerDashboard.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportManagerDashboard.rejected, (state) => {
        state.exporting = false;
      });
  }
});

export const {
  setPeriod,
  setIncludeTeam,
  setDrillDownUserId,
  resetDrillDown,
  clearManagerError,
  resetManagerState,
  updateManagerData
} = managerDashboardSlice.actions;

export default managerDashboardSlice.reducer;