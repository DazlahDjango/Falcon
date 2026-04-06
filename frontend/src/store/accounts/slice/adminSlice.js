import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../../services/accounts/api/admin';

// Async Thunks
// =============
// System Stats
export const fetchSystemStats = createAsyncThunk(
    'admin/fetchSystemStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getUserStats();
            const tenantStats = await adminApi.getTenantStats();
            const systemInfo = await adminApi.getSystemInfo();
            return { users: response.data, tenants: tenantStats.data, system: systemInfo.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch system stats');
        }
    }
);
// User Management
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getAllUsers(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
        }
    }
);
export const deleteUserAdmin = createAsyncThunk(
    'admin/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            await adminApi.deleteUserAdmin(userId);
            return userId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
        }
    }
);
export const suspendUser = createAsyncThunk(
    'admin/suspendUser',
    async (userId, { rejectWithValue }) => {
        try {
            await adminApi.updateUserAdmin(userId, { is_active: false });
            return { userId, is_active: false };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to suspend user');
        }
    }
);
export const activateUserAdmin = createAsyncThunk(
    'admin/activateUser',
    async (userId, { rejectWithValue }) => {
        try {
            await adminApi.updateUserAdmin(userId, { is_active: true });
            return { userId, is_active: true };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to activate user');
        }
    }
);
// Tenant Management
export const fetchTenants = createAsyncThunk(
    'admin/fetchTenants',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getTenants(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenants');
        }
    }
);
export const createTenant = createAsyncThunk(
    'admin/createTenant',
    async (tenantData, { rejectWithValue }) => {
        try {
            const response = await adminApi.createTenant(tenantData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create tenant');
        }
    }
);
export const updateTenant = createAsyncThunk(
    'admin/updateTenant',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateTenant(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update tenant');
        }
    }
);
export const deleteTenant = createAsyncThunk(
    'admin/deleteTenant',
    async (tenantId, { rejectWithValue }) => {
        try {
            await adminApi.deleteTenant(tenantId);
            return tenantId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete tenant');
        }
    }
);
export const suspendTenant = createAsyncThunk(
    'admin/suspendTenant',
    async (tenantId, { rejectWithValue }) => {
        try {
            await adminApi.suspendTenant(tenantId);
            return { tenantId, is_active: false };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to suspend tenant');
        }
    }
);
export const activateTenant = createAsyncThunk(
    'admin/activateTenant',
    async (tenantId, { rejectWithValue }) => {
        try {
            await adminApi.activateTenant(tenantId);
            return { tenantId, is_active: true };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to activate tenant');
        }
    }
);
// System Management
export const fetchSystemHealth = createAsyncThunk(
    'admin/fetchSystemHealth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSystemHealth();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch system health');
        }
    }
);
export const fetchSystemConfig = createAsyncThunk(
    'admin/fetchSystemConfig',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSystemConfig();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch system config');
        }
    }
);
export const updateSystemConfig = createAsyncThunk(
    'admin/updateSystemConfig',
    async (config, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateSystemConfig(config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update system config');
        }
    }
);
export const clearCache = createAsyncThunk(
    'admin/clearCache',
    async (_, { rejectWithValue }) => {
        try {
            await adminApi.clearSystemCache();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to clear cache');
        }
    }
);
export const clearUserCache = createAsyncThunk(
    'admin/clearUserCache',
    async (userId, { rejectWithValue }) => {
        try {
            await adminApi.clearUserCache(userId);
            return userId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to clear user cache');
        }
    }
);

export const clearTenantCache = createAsyncThunk(
    'admin/clearTenantCache',
    async (tenantId, { rejectWithValue }) => {
        try {
            await adminApi.clearTenantCache(tenantId);
            return tenantId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to clear tenant cache');
        }
    }
);

// Initial State
// ===============
const initialState = {
    stats: {
        total_users: 0,
        active_users: 0,
        total_tenants: 0,
        active_tenants: 0,
        uptime: '0d',
        api_requests: 0,
        request_trend: null
    },
    users: [],
    tenants: [],
    health: null,
    systemConfig: null,
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 20
    },
    isLoading: false,
    error: null
};

// Slice
// =========
const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch System Stats
            .addCase(fetchSystemStats.fulfilled, (state, action) => {
                state.stats = {
                    ...state.stats,
                    total_users: action.payload.users.total_users,
                    active_users: action.payload.users.active_users,
                    total_tenants: action.payload.tenants.total_tenants,
                    active_tenants: action.payload.tenants.active_tenants,
                    uptime: action.payload.system.uptime,
                    api_requests: action.payload.system.api_requests,
                    request_trend: action.payload.system.request_trend
                };
            })
            // Fetch All Users
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.users = action.payload.results;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            // Delete User
            .addCase(deleteUserAdmin.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
            })
            // Suspend/Activate User
            .addCase(suspendUser.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.userId);
                if (user) user.is_active = action.payload.is_active;
            })
            .addCase(activateUserAdmin.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.userId);
                if (user) user.is_active = action.payload.is_active;
            })
            // Fetch Tenants
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.tenants = action.payload.results;
            })
            // Create/Update/Delete Tenant
            .addCase(createTenant.fulfilled, (state, action) => {
                state.tenants.unshift(action.payload);
            })
            .addCase(updateTenant.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.tenants[index] = action.payload;
            })
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.tenants = state.tenants.filter(t => t.id !== action.payload);
            })
            .addCase(suspendTenant.fulfilled, (state, action) => {
                const tenant = state.tenants.find(t => t.id === action.payload.tenantId);
                if (tenant) tenant.is_active = action.payload.is_active;
            })
            .addCase(activateTenant.fulfilled, (state, action) => {
                const tenant = state.tenants.find(t => t.id === action.payload.tenantId);
                if (tenant) tenant.is_active = action.payload.is_active;
            })
            // System Health
            .addCase(fetchSystemHealth.fulfilled, (state, action) => {
                state.health = action.payload;
            })
            // System Config
            .addCase(fetchSystemConfig.fulfilled, (state, action) => {
                state.systemConfig = action.payload;
            })
            .addCase(updateSystemConfig.fulfilled, (state, action) => {
                state.systemConfig = { ...state.systemConfig, ...action.payload };
            });
    }
});
export const { clearError } = adminSlice.actions;

export default adminSlice.reducer;