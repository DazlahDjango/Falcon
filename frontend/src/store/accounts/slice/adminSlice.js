import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../../services/accounts/api/admin';

export const fetchSystemStats = createAsyncThunk(
    'admin/fetchSystemStats',
    async (_, { rejectWithValue }) => {
        try {
            const [userStats, tenantStats, systemInfo] = await Promise.all([
                adminApi.getUserStats(),
                adminApi.getTenantStats(),
                adminApi.getSystemInfo()
            ]);
            return {
                users: userStats.data,
                tenants: tenantStats.data,
                system: systemInfo.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch system stats');
        }
    }
);

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
    'admin/deleteUserAdmin',
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
    'admin/activateUserAdmin',
    async (userId, { rejectWithValue }) => {
        try {
            await adminApi.updateUserAdmin(userId, { is_active: true });
            return { userId, is_active: true };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to activate user');
        }
    }
);

export const impersonateUser = createAsyncThunk(
    'admin/impersonateUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await adminApi.impersonateUser(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to impersonate user');
        }
    }
);

export const forcePasswordReset = createAsyncThunk(
    'admin/forcePasswordReset',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await adminApi.forcePasswordReset(userId);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to force password reset');
        }
    }
);

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

export const createTenantWithAdmin = createAsyncThunk(
    'admin/createTenantWithAdmin',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createTenantWithAdmin(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create tenant with admin');
        }
    }
);

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

export const initSystemRoles = createAsyncThunk(
    'admin/initSystemRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.initSystemRoles();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to init system roles');
        }
    }
);

export const initPermissions = createAsyncThunk(
    'admin/initPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.initPermissions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to init permissions');
        }
    }
);

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

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAdmin: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Fetch System Stats
            .addCase(fetchSystemStats.fulfilled, (state, action) => {
                state.stats = {
                    ...state.stats,
                    total_users: action.payload.users?.total_users || 0,
                    active_users: action.payload.users?.active_users || 0,
                    total_tenants: action.payload.tenants?.total_tenants || 0,
                    active_tenants: action.payload.tenants?.active_tenants || 0,
                    uptime: action.payload.system?.uptime || '0d',
                    api_requests: action.payload.system?.api_requests || 0,
                    request_trend: action.payload.system?.request_trend || null
                };
            })
            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                const payload = action.payload || {};
                const list = payload.results || (Array.isArray(payload) ? payload : []);
                state.users = Array.isArray(list) ? list : [];
                state.pagination = {
                    current_page: payload.current_page || 1,
                    total_pages: payload.total_pages || 1,
                    total_items: payload.count || state.users.length,
                    page_size: payload.page_size || 20
                };
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete User
            .addCase(deleteUserAdmin.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
                state.pagination.total_items -= 1;
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
            // Impersonate User
            .addCase(impersonateUser.fulfilled, (state, action) => {
                // Handle impersonation token - stored separately
            })
            // Force Password Reset
            .addCase(forcePasswordReset.fulfilled, (state) => {
                // Password reset initiated - no state update needed
            })
            // Fetch Tenants
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.tenants = action.payload.results || action.payload || [];
            })
            // Create/Update/Delete Tenant
            .addCase(createTenant.fulfilled, (state, action) => {
                state.tenants.unshift(action.payload);
                state.stats.total_tenants += 1;
            })
            .addCase(updateTenant.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.tenants[index] = action.payload;
            })
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.tenants = state.tenants.filter(t => t.id !== action.payload);
                state.stats.total_tenants -= 1;
            })
            .addCase(suspendTenant.fulfilled, (state, action) => {
                const tenant = state.tenants.find(t => t.id === action.payload.tenantId);
                if (tenant) tenant.is_active = action.payload.is_active;
            })
            .addCase(activateTenant.fulfilled, (state, action) => {
                const tenant = state.tenants.find(t => t.id === action.payload.tenantId);
                if (tenant) tenant.is_active = action.payload.is_active;
            })
            .addCase(createTenantWithAdmin.fulfilled, (state, action) => {
                state.tenants.unshift(action.payload.tenant);
                state.stats.total_tenants += 1;
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
            })
            // Init System Roles & Permissions
            .addCase(initSystemRoles.fulfilled, (state) => {
                // Roles initialized
            })
            .addCase(initPermissions.fulfilled, (state) => {
                // Permissions initialized
            });
    }
});
export const { clearError, resetAdmin } = adminSlice.actions;
export const selectAdmin = (state) => state.admin;
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminTenants = (state) => state.admin.tenants;
export const selectAdminHealth = (state) => state.admin.health;
export const selectAdminSystemConfig = (state) => state.admin.systemConfig;
export const selectAdminPagination = (state) => state.admin.pagination;
export const selectAdminLoading = (state) => state.admin.isLoading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;