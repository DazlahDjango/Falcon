// frontend/src/store/tenant/slice/tenantDashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TenantService, HealthService, StatsService } from '../../../services/tenant';

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
    'tenantDashboard/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await StatsService.getSystemStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTenantActivity = createAsyncThunk(
    'tenantDashboard/fetchTenantActivity',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await StatsService.getTenantGrowth(12);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSystemHealth = createAsyncThunk(
    'tenantDashboard/fetchSystemHealth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await HealthService.getSystemHealth();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRecentTenants = createAsyncThunk(
    'tenantDashboard/fetchRecentTenants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await TenantService.getTenants({ page: 1, page_size: 5, ordering: '-created_at' });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDashboardAlerts = createAsyncThunk(
    'tenantDashboard/fetchDashboardAlerts',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch alerts from various sources
            const [expiringSubscriptions, failedBackups, quotaWarnings] = await Promise.all([
                TenantService.getTenants({ subscription_expiring_soon: true }),
                BackupService.getBackups({ status: 'failed', limit: 5 }),
                // Add quota warnings fetch
            ]);
            return { expiringSubscriptions, failedBackups, quotaWarnings };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    stats: {
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        provisioningTenants: 0,
    },
    activityData: [],
    healthData: {
        status: 'healthy',
        database: 'healthy',
        cache: 'healthy',
        worker: 'healthy',
    },
    recentTenants: [],
    alerts: [],
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
    },
    extraReducers: (builder) => {
        builder
            // Fetch Dashboard Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Tenant Activity
            .addCase(fetchTenantActivity.fulfilled, (state, action) => {
                state.activityData = action.payload;
            })
            // Fetch System Health
            .addCase(fetchSystemHealth.fulfilled, (state, action) => {
                state.healthData = action.payload;
            })
            // Fetch Recent Tenants
            .addCase(fetchRecentTenants.fulfilled, (state, action) => {
                state.recentTenants = action.payload.results || action.payload;
            })
            // Fetch Dashboard Alerts
            .addCase(fetchDashboardAlerts.fulfilled, (state, action) => {
                const alerts = [];
                if (action.payload.expiringSubscriptions?.length) {
                    alerts.push({ type: 'warning', title: 'Expiring Subscriptions', count: action.payload.expiringSubscriptions.length });
                }
                if (action.payload.failedBackups?.length) {
                    alerts.push({ type: 'critical', title: 'Failed Backups', count: action.payload.failedBackups.length });
                }
                state.alerts = alerts;
            });
    },
});

export const { clearDashboardError } = tenantDashboardSlice.actions;
export default tenantDashboardSlice.reducer;