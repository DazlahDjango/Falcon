import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService } from '../../../services/tenant';

// Async Thunks
export const fetchTenantStats = createAsyncThunk(
    'tenantDashboard/fetchTenantStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenantStats?.();
            return response?.data || { totalTenants: 0, activeTenants: 0, suspendedTenants: 0, totalRevenue: 0 };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRecentTenants = createAsyncThunk(
    'tenantDashboard/fetchRecentTenants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getRecentTenants?.();
            return response?.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDashboardAlerts = createAsyncThunk(
    'tenantDashboard/fetchDashboardAlerts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getDashboardAlerts?.();
            return response?.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchActivityData = createAsyncThunk(
    'tenantDashboard/fetchActivityData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getActivityData?.();
            return response?.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchHealthData = createAsyncThunk(
    'tenantDashboard/fetchHealthData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getHealthData?.();
            return response?.data || { status: 'healthy', uptime: 99.9 };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    stats: null,
    recentTenants: [],
    alerts: [],
    activityData: null,
    healthData: null,
    loading: false,
    error: null,
};

// Slice
const tenantDashboardSlice = createSlice({
    name: 'tenantDashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
        resetDashboard: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stats
            .addCase(fetchTenantStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchTenantStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Recent Tenants
            .addCase(fetchRecentTenants.fulfilled, (state, action) => {
                state.recentTenants = action.payload;
            })
            // Fetch Alerts
            .addCase(fetchDashboardAlerts.fulfilled, (state, action) => {
                state.alerts = action.payload;
            })
            // Fetch Activity Data
            .addCase(fetchActivityData.fulfilled, (state, action) => {
                state.activityData = action.payload;
            })
            // Fetch Health Data
            .addCase(fetchHealthData.fulfilled, (state, action) => {
                state.healthData = action.payload;
            });
    },
});

// Actions
export const { clearDashboardError, resetDashboard } = tenantDashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.tenantDashboard?.stats;
export const selectActivityData = (state) => state.tenantDashboard?.activityData;
export const selectHealthData = (state) => state.tenantDashboard?.healthData;
export const selectRecentTenants = (state) => state.tenantDashboard?.recentTenants || [];
export const selectDashboardAlerts = (state) => state.tenantDashboard?.alerts || [];
export const selectDashboardLoading = (state) => state.tenantDashboard?.loading || false;
export const selectDashboardError = (state) => state.tenantDashboard?.error;

export default tenantDashboardSlice.reducer;
