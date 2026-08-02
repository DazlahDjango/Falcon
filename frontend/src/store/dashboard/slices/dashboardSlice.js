import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { executiveDashboardService, clientAdminDashboardService, superAdminDashboardService } from '../../../services/dashboard';

const initialState = {
  executive: {
    data: null,
    departments: [],
    trends: [],
    issues: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  clientAdmin: {
    data: null,
    compliance: null,
    pendingApprovals: [],
    missingData: [],
    userActivity: null,
    kpiBreakdown: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  superAdmin: {
    data: null,
    tenants: [],
    systemHealth: null,
    subscriptionAlerts: [],
    platformMetrics: null,
    billingOverview: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  activeDashboard: null,
  refreshInProgress: false
};

export const fetchExecutiveDashboard = createAsyncThunk(
  'dashboard/fetchExecutive',
  async ({ userId, filters } = {}, { rejectWithValue }) => {
    try {
      const response = await executiveDashboardService.getDashboardData(userId, filters);
      if (response?.data) {
        return response.data;
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to fetch executive dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch executive dashboard');
    }
  }
);

export const fetchExecutiveDepartments = createAsyncThunk(
  'dashboard/fetchExecutiveDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await executiveDashboardService.getDepartments();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch departments');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch departments');
    }
  }
);

export const fetchExecutiveTrends = createAsyncThunk(
  'dashboard/fetchExecutiveTrends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await executiveDashboardService.getTrends();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch trends');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trends');
    }
  }
);

export const fetchExecutiveIssues = createAsyncThunk(
  'dashboard/fetchExecutiveIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await executiveDashboardService.getTopIssues();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch issues');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch issues');
    }
  }
);

export const fetchClientAdminDashboard = createAsyncThunk(
  'dashboard/fetchClientAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getDashboardData();
      if (response?.data) {
        return response.data;
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to fetch client admin dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch client admin dashboard');
    }
  }
);

export const fetchClientAdminCompliance = createAsyncThunk(
  'dashboard/fetchClientAdminCompliance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getComplianceStatus();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch compliance');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch compliance');
    }
  }
);

export const fetchClientAdminPendingApprovals = createAsyncThunk(
  'dashboard/fetchClientAdminPendingApprovals',
  async ({ page = 1, pageSize = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getPendingApprovals(page, pageSize);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch pending approvals');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending approvals');
    }
  }
);

export const fetchClientAdminMissingData = createAsyncThunk(
  'dashboard/fetchClientAdminMissingData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getMissingDataAlerts();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch missing data');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch missing data');
    }
  }
);

export const fetchClientAdminUserActivity = createAsyncThunk(
  'dashboard/fetchClientAdminUserActivity',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getUserActivity(days);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch user activity');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user activity');
    }
  }
);

export const fetchClientAdminKpiBreakdown = createAsyncThunk(
  'dashboard/fetchClientAdminKpiBreakdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientAdminDashboardService.getKpiBreakdown();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch KPI breakdown');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch KPI breakdown');
    }
  }
);

export const fetchSuperAdminDashboard = createAsyncThunk(
  'dashboard/fetchSuperAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.getDashboardData();
      if (response?.data) {
        return response.data;
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return rejectWithValue(response?.message || 'Failed to fetch super admin dashboard');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch super admin dashboard');
    }
  }
);

export const fetchSuperAdminTenants = createAsyncThunk(
  'dashboard/fetchSuperAdminTenants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.getTenantsList(filters);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch tenants');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tenants');
    }
  }
);

export const fetchSuperAdminSystemHealth = createAsyncThunk(
  'dashboard/fetchSuperAdminSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.getSystemHealth();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch system health');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch system health');
    }
  }
);

export const fetchSuperAdminSubscriptionAlerts = createAsyncThunk(
  'dashboard/fetchSuperAdminSubscriptionAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.getSubscriptionAlerts();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch subscription alerts');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subscription alerts');
    }
  }
);

export const fetchSuperAdminPlatformMetrics = createAsyncThunk(
  'dashboard/fetchSuperAdminPlatformMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.getPlatformMetrics();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch platform metrics');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch platform metrics');
    }
  }
);

export const refreshTenantSnapshot = createAsyncThunk(
  'dashboard/refreshTenantSnapshot',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await superAdminDashboardService.refreshTenantSnapshot(tenantId);
      if (response?.success) {
        return { tenantId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to refresh tenant snapshot');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh tenant snapshot');
    }
  }
);

export const refreshAllDashboards = createAsyncThunk(
  'dashboard/refreshAll',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const activeDashboard = state.dashboard.activeDashboard;
    
    if (activeDashboard === 'executive') {
      await dispatch(fetchExecutiveDashboard());
      await dispatch(fetchExecutiveDepartments());
      await dispatch(fetchExecutiveTrends());
      await dispatch(fetchExecutiveIssues());
    } else if (activeDashboard === 'client_admin') {
      await dispatch(fetchClientAdminDashboard());
      await dispatch(fetchClientAdminCompliance());
      await dispatch(fetchClientAdminPendingApprovals());
      await dispatch(fetchClientAdminMissingData());
      await dispatch(fetchClientAdminUserActivity());
      await dispatch(fetchClientAdminKpiBreakdown());
    } else if (activeDashboard === 'super_admin') {
      await dispatch(fetchSuperAdminDashboard());
      await dispatch(fetchSuperAdminTenants());
      await dispatch(fetchSuperAdminSystemHealth());
      await dispatch(fetchSuperAdminSubscriptionAlerts());
      await dispatch(fetchSuperAdminPlatformMetrics());
    }
    
    return { success: true, dashboard: activeDashboard };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveDashboard: (state, action) => {
      state.activeDashboard = action.payload;
    },
    clearExecutiveData: (state) => {
      state.executive.data = null;
      state.executive.departments = [];
      state.executive.trends = [];
      state.executive.issues = [];
      state.executive.error = null;
    },
    clearClientAdminData: (state) => {
      state.clientAdmin.data = null;
      state.clientAdmin.compliance = null;
      state.clientAdmin.pendingApprovals = [];
      state.clientAdmin.missingData = [];
      state.clientAdmin.userActivity = null;
      state.clientAdmin.kpiBreakdown = null;
      state.clientAdmin.error = null;
    },
    clearSuperAdminData: (state) => {
      state.superAdmin.data = null;
      state.superAdmin.tenants = [];
      state.superAdmin.systemHealth = null;
      state.superAdmin.subscriptionAlerts = [];
      state.superAdmin.platformMetrics = null;
      state.superAdmin.billingOverview = null;
      state.superAdmin.error = null;
    },
    clearAllDashboards: (state) => {
      state.executive = initialState.executive;
      state.clientAdmin = initialState.clientAdmin;
      state.superAdmin = initialState.superAdmin;
      state.activeDashboard = null;
    },
    updateExecutiveData: (state, action) => {
      state.executive.data = { ...state.executive.data, ...action.payload };
      state.executive.lastUpdated = new Date().toISOString();
    },
    updateClientAdminData: (state, action) => {
      state.clientAdmin.data = { ...state.clientAdmin.data, ...action.payload };
      state.clientAdmin.lastUpdated = new Date().toISOString();
    },
    updateSuperAdminData: (state, action) => {
      state.superAdmin.data = { ...state.superAdmin.data, ...action.payload };
      state.superAdmin.lastUpdated = new Date().toISOString();
    },
    setRefreshInProgress: (state, action) => {
      state.refreshInProgress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Executive Dashboard
      .addCase(fetchExecutiveDashboard.pending, (state) => {
        state.executive.loading = true;
        state.executive.error = null;
      })
      .addCase(fetchExecutiveDashboard.fulfilled, (state, action) => {
        state.executive.loading = false;
        state.executive.data = action.payload;
        state.executive.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchExecutiveDashboard.rejected, (state, action) => {
        state.executive.loading = false;
        state.executive.error = action.payload;
      })
      .addCase(fetchExecutiveDepartments.fulfilled, (state, action) => {
        state.executive.departments = action.payload;
      })
      .addCase(fetchExecutiveTrends.fulfilled, (state, action) => {
        state.executive.trends = action.payload;
      })
      .addCase(fetchExecutiveIssues.fulfilled, (state, action) => {
        state.executive.issues = action.payload;
      })
      // Client Admin Dashboard
      .addCase(fetchClientAdminDashboard.pending, (state) => {
        state.clientAdmin.loading = true;
        state.clientAdmin.error = null;
      })
      .addCase(fetchClientAdminDashboard.fulfilled, (state, action) => {
        state.clientAdmin.loading = false;
        state.clientAdmin.data = action.payload;
        state.clientAdmin.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchClientAdminDashboard.rejected, (state, action) => {
        state.clientAdmin.loading = false;
        state.clientAdmin.error = action.payload;
      })
      .addCase(fetchClientAdminCompliance.fulfilled, (state, action) => {
        state.clientAdmin.compliance = action.payload;
      })
      .addCase(fetchClientAdminPendingApprovals.fulfilled, (state, action) => {
        state.clientAdmin.pendingApprovals = action.payload.results || action.payload;
      })
      .addCase(fetchClientAdminMissingData.fulfilled, (state, action) => {
        state.clientAdmin.missingData = action.payload;
      })
      .addCase(fetchClientAdminUserActivity.fulfilled, (state, action) => {
        state.clientAdmin.userActivity = action.payload;
      })
      .addCase(fetchClientAdminKpiBreakdown.fulfilled, (state, action) => {
        state.clientAdmin.kpiBreakdown = action.payload;
      })
      // Super Admin Dashboard
      .addCase(fetchSuperAdminDashboard.pending, (state) => {
        state.superAdmin.loading = true;
        state.superAdmin.error = null;
      })
      .addCase(fetchSuperAdminDashboard.fulfilled, (state, action) => {
        state.superAdmin.loading = false;
        state.superAdmin.data = action.payload;
        state.superAdmin.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSuperAdminDashboard.rejected, (state, action) => {
        state.superAdmin.loading = false;
        state.superAdmin.error = action.payload;
      })
      .addCase(fetchSuperAdminTenants.fulfilled, (state, action) => {
        state.superAdmin.tenants = action.payload.results || action.payload;
      })
      .addCase(fetchSuperAdminSystemHealth.fulfilled, (state, action) => {
        state.superAdmin.systemHealth = action.payload;
      })
      .addCase(fetchSuperAdminSubscriptionAlerts.fulfilled, (state, action) => {
        state.superAdmin.subscriptionAlerts = action.payload;
      })
      .addCase(fetchSuperAdminPlatformMetrics.fulfilled, (state, action) => {
        state.superAdmin.platformMetrics = action.payload;
      })
      .addCase(refreshTenantSnapshot.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        const index = state.superAdmin.tenants.findIndex(t => t.client_id === tenantId);
        if (index !== -1) {
          state.superAdmin.tenants[index] = { ...state.superAdmin.tenants[index], ...data };
        }
      })
      .addCase(refreshAllDashboards.pending, (state) => {
        state.refreshInProgress = true;
      })
      .addCase(refreshAllDashboards.fulfilled, (state) => {
        state.refreshInProgress = false;
      })
      .addCase(refreshAllDashboards.rejected, (state) => {
        state.refreshInProgress = false;
      });
  }
});

export const {
  setActiveDashboard,
  clearExecutiveData,
  clearClientAdminData,
  clearSuperAdminData,
  clearAllDashboards,
  updateExecutiveData,
  updateClientAdminData,
  updateSuperAdminData,
  setRefreshInProgress
} = dashboardSlice.actions;

export default dashboardSlice.reducer;