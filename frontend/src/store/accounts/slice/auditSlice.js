import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as auditApi from '../../../services/accounts/api/audit';

const initialState = {
  logs: [],
  selectedLog: null,
  userActivity: [],
  userActivitySummary: null,
  tenantActivitySummary: null,
  securityEvents: [],
  anomalyDetection: null,
  complianceReport: null,
  objectHistory: [],
  isLoading: false,
  isExporting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    action: '',
    action_type: '',
    severity: '',
    user: '',
    start_date: '',
    end_date: '',
  },
};

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchLogs',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.auditLogs.pagination;
      const filters = state.auditLogs.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await auditApi.getAuditLogs(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs');
    }
  }
);

export const fetchAuditLog = createAsyncThunk(
  'audit/fetchLog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await auditApi.getAuditLog(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit log');
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'audit/fetchUserActivity',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await auditApi.getUserActivity(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user activity');
    }
  }
);

export const fetchUserActivitySummary = createAsyncThunk(
  'audit/fetchUserActivitySummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getUserActivitySummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user activity summary');
    }
  }
);

export const fetchTenantActivitySummary = createAsyncThunk(
  'audit/fetchTenantActivitySummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getTenantActivitySummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant activity summary');
    }
  }
);

export const fetchSecurityEvents = createAsyncThunk(
  'audit/fetchSecurityEvents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getSecurityEvents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch security events');
    }
  }
);

export const fetchAnomalyDetection = createAsyncThunk(
  'audit/fetchAnomalyDetection',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getAnomalyDetection(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch anomaly detection');
    }
  }
);

export const fetchComplianceReport = createAsyncThunk(
  'audit/fetchComplianceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getComplianceReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch compliance report');
    }
  }
);

export const fetchObjectHistory = createAsyncThunk(
  'audit/fetchObjectHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getObjectHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch object history');
    }
  }
);

export const exportAuditLogs = createAsyncThunk(
  'audit/exportLogs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await auditApi.exportAuditLogs(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export audit logs');
    }
  }
);

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearAuditError: (state) => {
      state.error = null;
    },
    setAuditFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setAuditPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
    resetAudit: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.logs = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuditLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLog = action.payload;
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivity = action.payload.activities || action.payload || [];
      })
      .addCase(fetchUserActivitySummary.fulfilled, (state, action) => {
        state.userActivitySummary = action.payload;
      })
      .addCase(fetchTenantActivitySummary.fulfilled, (state, action) => {
        state.tenantActivitySummary = action.payload;
      })
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.securityEvents = action.payload.events || action.payload || [];
      })
      .addCase(fetchAnomalyDetection.fulfilled, (state, action) => {
        state.anomalyDetection = action.payload;
      })
      .addCase(fetchComplianceReport.fulfilled, (state, action) => {
        state.complianceReport = action.payload;
      })
      .addCase(fetchObjectHistory.fulfilled, (state, action) => {
        state.objectHistory = action.payload.history || action.payload || [];
      })
      .addCase(exportAuditLogs.pending, (state) => {
        state.isExporting = true;
        state.error = null;
      })
      .addCase(exportAuditLogs.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportAuditLogs.rejected, (state, action) => {
        state.isExporting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearAuditError,
  setAuditFilters,
  setAuditPage,
  clearSelectedLog,
  resetAudit,
} = auditSlice.actions;

export default auditSlice.reducer;