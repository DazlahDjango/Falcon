import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../../services/accounts/api/admin';

const initialState = {
  users: [],
  selectedAdminUser: null,
  roles: [],
  selectedAdminRole: null,
  permissions: [],
  selectedAdminPermission: null,
  tenants: [],
  selectedAdminTenant: null,
  systemInfo: null,
  systemHealth: null,
  systemConfig: null,
  userStats: null,
  tenantStats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    search: '',
    role: '',
    is_active: null,
    plan: '',
  },
};

// ============ Existing Thunks ============
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.admin?.pagination || { page: 1, pageSize: 20 };
      const filters = state.admin?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };

      console.log('[fetchAdminUsers] Calling getAdminUsers with params:', queryParams);
      const response = await adminApi.getAdminUsers(queryParams);

      console.log('[fetchAdminUsers] RAW RESPONSE:', response);
      console.log('[fetchAdminUsers] RESPONSE DATA:', response?.data);
      console.log('[fetchAdminUsers] RESPONSE STATUS:', response?.status);

      // ✅ Check if response is successful
      if (response?.status === 200) {
        console.log('[fetchAdminUsers] ✅ Success! Returning data');
        return response.data;
      } else {
        console.error('[fetchAdminUsers] ❌ Response status not 200:', response?.status);
        return rejectWithValue(`Failed with status: ${response?.status}`);
      }

    } catch (error) {
      console.error('[fetchAdminUsers] ❌ CATCH ERROR:', error);
      console.error('[fetchAdminUsers] Error response:', error.response);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin users');
    }
  }
);

export const fetchAdminUser = createAsyncThunk(
  'admin/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin user');
    }
  }
);

export const createAdminUser = createAsyncThunk(
  'admin/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.createAdminUser(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create admin user');
    }
  }
);

export const updateAdminUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateAdminUser(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update admin user');
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteAdminUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete admin user');
    }
  }
);

export const impersonateUser = createAsyncThunk(
  'admin/impersonateUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.impersonateUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to impersonate user');
    }
  }
);

export const forcePasswordReset = createAsyncThunk(
  'admin/forcePasswordReset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.forcePasswordReset(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to force password reset');
    }
  }
);

export const fetchAdminUserStats = createAsyncThunk(
  'admin/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminUserStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user stats');
    }
  }
);

export const fetchAdminRoles = createAsyncThunk(
  'admin/fetchRoles',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.admin?.pagination || { page: 1, pageSize: 20 };
      const filters = state.admin?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };
      const response = await adminApi.getAdminRoles(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin roles');
    }
  }
);

export const fetchAdminRole = createAsyncThunk(
  'admin/fetchRole',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminRole(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin role');
    }
  }
);

export const createAdminRole = createAsyncThunk(
  'admin/createRole',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.createAdminRole(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create admin role');
    }
  }
);

export const updateAdminRole = createAsyncThunk(
  'admin/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateAdminRole(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update admin role');
    }
  }
);

export const deleteAdminRole = createAsyncThunk(
  'admin/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteAdminRole(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete admin role');
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
      return rejectWithValue(error.response?.data?.error || 'Failed to initialize system roles');
    }
  }
);

export const fetchAdminPermissions = createAsyncThunk(
  'admin/fetchPermissions',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.admin?.pagination || { page: 1, pageSize: 20 };
      const filters = state.admin?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };
      const response = await adminApi.getAdminPermissions(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin permissions');
    }
  }
);

export const fetchAdminPermission = createAsyncThunk(
  'admin/fetchPermission',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminPermission(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin permission');
    }
  }
);

export const createAdminPermission = createAsyncThunk(
  'admin/createPermission',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.createAdminPermission(data);
      return response.data;
    } catch (error) {
      console.error('[createAdminPermission] Request data:', data);
      console.error('[createAdminPermission] Error response:', error.response);
      return rejectWithValue(error.response?.data?.error || 'Failed to create admin permission');
    }
  }
);

export const updateAdminPermission = createAsyncThunk(
  'admin/updatePermission',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateAdminPermission(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update admin permission');
    }
  }
);

export const deleteAdminPermission = createAsyncThunk(
  'admin/deletePermission',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteAdminPermission(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete admin permission');
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
      return rejectWithValue(error.response?.data?.error || 'Failed to initialize permissions');
    }
  }
);

export const fetchAdminTenants = createAsyncThunk(
  'admin/fetchTenants',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.admin?.pagination || { page: 1, pageSize: 20 };
      const filters = state.admin?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };
      const response = await adminApi.getAdminTenants(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin tenants');
    }
  }
);

export const fetchAdminTenant = createAsyncThunk(
  'admin/fetchTenant',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminTenant(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin tenant');
    }
  }
);

export const createAdminTenant = createAsyncThunk(
  'admin/createTenant',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.createAdminTenant(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create admin tenant');
    }
  }
);

export const updateAdminTenant = createAsyncThunk(
  'admin/updateTenant',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateAdminTenant(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update admin tenant');
    }
  }
);

export const deleteAdminTenant = createAsyncThunk(
  'admin/deleteTenant',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteAdminTenant(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete admin tenant');
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

export const suspendTenant = createAsyncThunk(
  'admin/suspendTenant',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await adminApi.suspendTenant(id, { reason });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to suspend tenant');
    }
  }
);

export const activateTenant = createAsyncThunk(
  'admin/activateTenant',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.activateTenant(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to activate tenant');
    }
  }
);

export const fetchAdminTenantStats = createAsyncThunk(
  'admin/fetchTenantStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminTenantStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant stats');
    }
  }
);

export const fetchSystemInfo = createAsyncThunk(
  'admin/fetchSystemInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSystemInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch system info');
    }
  }
);

export const clearSystemCache = createAsyncThunk(
  'admin/clearSystemCache',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.clearSystemCache();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear system cache');
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

// ============ NEW THUNKS ============

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
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateSystemConfig(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update system config');
    }
  }
);

export const clearUserCache = createAsyncThunk(
  'admin/clearUserCache',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminApi.clearUserCache(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear user cache');
    }
  }
);

export const clearTenantCache = createAsyncThunk(
  'admin/clearTenantCache',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await adminApi.clearTenantCache(tenantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear tenant cache');
    }
  }
);

// ============================================
// SLICE
// ============================================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setAdminPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setAdminPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    clearSelectedAdminUser: (state) => {
      state.selectedAdminUser = null;
    },
    clearSelectedAdminRole: (state) => {
      state.selectedAdminRole = null;
    },
    clearSelectedAdminPermission: (state) => {
      state.selectedAdminPermission = null;
    },
    clearSelectedAdminTenant: (state) => {
      state.selectedAdminTenant = null;
    },
    resetAdmin: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ============ USER MANAGEMENT ============
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        console.log('✅ fetchAdminUsers.fulfilled - BEFORE update:', {
          currentUsers: state.users,
          payload: action.payload,
          results: action.payload?.results,
        });

        const results = action.payload?.results || action.payload || [];

        state.isLoading = false;
        state.users = results;

        state.pagination = {
          page:
            action.payload?.offset != null && action.payload?.limit
              ? (action.payload.offset / action.payload.limit) + 1
              : state.pagination?.page || 1,
          pageSize: action.payload?.limit || state.pagination?.pageSize || 20,
          total: action.payload?.count || 0,
        };

        state.error = null;

        console.log('✅ fetchAdminUsers.fulfilled - AFTER update:', {
          newUsers: state.users,
          newPagination: state.pagination,
        });
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createAdminUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.isCreating = false;
        // Optionally add new user to the list
        if (action.payload) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      .addCase(deleteAdminUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // ============ ROLE MANAGEMENT ============
      .addCase(fetchAdminRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload?.results || action.payload || [];
        state.pagination = {
          page: (action.payload?.offset / action.payload?.limit) + 1 || 1,
          pageSize: action.payload?.limit || 20,
          total: action.payload?.count || 0,
        };
      })
      .addCase(fetchAdminRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============ PERMISSION MANAGEMENT ============
      .addCase(fetchAdminPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload?.results || action.payload || [];
        state.pagination = {
          page: (action.payload?.offset / action.payload?.limit) + 1 || 1,
          pageSize: action.payload?.limit || 20,
          total: action.payload?.count || 0,
        };
      })
      .addCase(fetchAdminPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============ TENANT MANAGEMENT ============
      .addCase(fetchAdminTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants = action.payload?.results || action.payload || [];
        state.pagination = {
          page: (action.payload?.offset / action.payload?.limit) + 1 || 1,
          pageSize: action.payload?.limit || 20,
          total: action.payload?.count || 0,
        };
      })
      .addCase(fetchAdminTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============ SYSTEM MANAGEMENT ============
      .addCase(fetchSystemInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemInfo = action.payload;
      })
      .addCase(fetchSystemInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchSystemHealth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemHealth = action.payload;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchSystemConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemConfig = action.payload;
      })
      .addCase(fetchSystemConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateSystemConfig.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSystemConfig.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.systemConfig = action.payload;
      })
      .addCase(updateSystemConfig.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      .addCase(clearUserCache.fulfilled, (state) => {
        state.systemInfo = { ...state.systemInfo, user_cache_cleared_at: new Date().toISOString() };
      })
      .addCase(clearTenantCache.fulfilled, (state) => {
        state.systemInfo = { ...state.systemInfo, tenant_cache_cleared_at: new Date().toISOString() };
      });
  },
});

export const {
  clearAdminError,
  setAdminFilters,
  setAdminPage,
  setAdminPageSize,
  clearSelectedAdminUser,
  clearSelectedAdminRole,
  clearSelectedAdminPermission,
  clearSelectedAdminTenant,
  resetAdmin,
} = adminSlice.actions;

export default adminSlice.reducer;