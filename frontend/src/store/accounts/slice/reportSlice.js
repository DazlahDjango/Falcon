import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportsApi from '../../../services/accounts/api/reports';

const initialState = {
  reports: {
    userDirectory: null,
    roleDistribution: null,
    departmentDistribution: null,
    inactiveUsers: null,
    recentlyAdded: null,
    activitySummary: null,
    auditTrail: null,
    loginActivity: null,
    passwordChanges: null,
    roleChanges: null,
    suspensionLog: null,
    complianceSummary: null,
  },
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchUserDirectoryReport = createAsyncThunk(
  'reports/fetchUserDirectory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getUserDirectoryReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user directory report');
    }
  }
);

export const fetchRoleDistributionReport = createAsyncThunk(
  'reports/fetchRoleDistribution',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getRoleDistributionReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch role distribution report');
    }
  }
);

export const fetchDepartmentDistributionReport = createAsyncThunk(
  'reports/fetchDepartmentDistribution',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getDepartmentDistributionReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch department distribution report');
    }
  }
);

export const fetchInactiveUsersReport = createAsyncThunk(
  'reports/fetchInactiveUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getInactiveUsersReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inactive users report');
    }
  }
);

export const fetchRecentlyAddedReport = createAsyncThunk(
  'reports/fetchRecentlyAdded',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getRecentlyAddedReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recently added users report');
    }
  }
);

export const fetchActivitySummaryReport = createAsyncThunk(
  'reports/fetchActivitySummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getActivitySummaryReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user activity summary report');
    }
  }
);

export const fetchAuditTrailReport = createAsyncThunk(
  'reports/fetchAuditTrail',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getAuditTrailReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit trail report');
    }
  }
);

export const fetchLoginActivityReport = createAsyncThunk(
  'reports/fetchLoginActivity',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getLoginActivityReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch login activity report');
    }
  }
);

export const fetchPasswordChangesReport = createAsyncThunk(
  'reports/fetchPasswordChanges',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getPasswordChangesReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch password changes report');
    }
  }
);

export const fetchRoleChangesReport = createAsyncThunk(
  'reports/fetchRoleChanges',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getRoleChangesReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch role changes report');
    }
  }
);

export const fetchSuspensionLogReport = createAsyncThunk(
  'reports/fetchSuspensionLog',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getSuspensionLogReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch suspension log report');
    }
  }
);

export const fetchComplianceSummaryReport = createAsyncThunk(
  'reports/fetchComplianceSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getComplianceSummaryReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch compliance summary report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
    resetReports: () => initialState,
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder
      // Fulfilled actions
      .addCase(fetchUserDirectoryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.userDirectory = action.payload;
      })
      .addCase(fetchRoleDistributionReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.roleDistribution = action.payload;
      })
      .addCase(fetchDepartmentDistributionReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.departmentDistribution = action.payload;
      })
      .addCase(fetchInactiveUsersReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.inactiveUsers = action.payload;
      })
      .addCase(fetchRecentlyAddedReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.recentlyAdded = action.payload;
      })
      .addCase(fetchActivitySummaryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.activitySummary = action.payload;
      })
      .addCase(fetchAuditTrailReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.auditTrail = action.payload;
      })
      .addCase(fetchLoginActivityReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.loginActivity = action.payload;
      })
      .addCase(fetchPasswordChangesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.passwordChanges = action.payload;
      })
      .addCase(fetchRoleChangesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.roleChanges = action.payload;
      })
      .addCase(fetchSuspensionLogReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.suspensionLog = action.payload;
      })
      .addCase(fetchComplianceSummaryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.complianceSummary = action.payload;
      })
      // Pending actions
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.startsWith('reports/'),
        handlePending
      )
      // Rejected actions
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('reports/'),
        handleRejected
      );
  },
});

export const { clearReportError, resetReports } = reportSlice.actions;
export default reportSlice.reducer;
