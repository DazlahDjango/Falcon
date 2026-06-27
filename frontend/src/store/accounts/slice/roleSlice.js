import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rolesApi from '../../../services/accounts/api/roles';

const initialState = {
  roles: [],
  selectedRole: null,
  systemRoles: [],
  assignableRoles: [],
  rolePermissions: [],
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
    role_type: '',
    is_system: null,
    is_assignable: null,
  },
};

export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.roles?.pagination || { page: 1, pageSize: 20 };
      const filters = state.roles?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };
      const response = await rolesApi.getRoles(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch roles');
    }
  }
);

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (id, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRole(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch role');
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (data, { rejectWithValue }) => {
    try {
      const response = await rolesApi.createRole(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await rolesApi.updateRole(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await rolesApi.deleteRole(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete role');
    }
  }
);

export const fetchSystemRoles = createAsyncThunk(
  'roles/fetchSystemRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getSystemRoles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch system roles');
    }
  }
);

export const fetchAssignableRoles = createAsyncThunk(
  'roles/fetchAssignableRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getAssignableRoles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch assignable roles');
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'roles/fetchRolePermissions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRolePermissions(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch role permissions');
    }
  }
);

export const assignPermissions = createAsyncThunk(
  'roles/assignPermissions',
  async ({ id, permissionIds }, { rejectWithValue }) => {
    try {
      const response = await rolesApi.assignPermissions(id, { permission_ids: permissionIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to assign permissions');
    }
  }
);

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    setRoleFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setRolePage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
      state.rolePermissions = [];
    },
    resetRoles: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.roles = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isCreating = false;
        state.roles.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.roles.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = { ...state.roles[index], ...action.payload };
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = { ...state.selectedRole, ...action.payload };
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      .addCase(deleteRole.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.roles = state.roles.filter(r => r.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      .addCase(fetchSystemRoles.fulfilled, (state, action) => {
        state.systemRoles = action.payload;
      })
      .addCase(fetchAssignableRoles.fulfilled, (state, action) => {
        state.assignableRoles = action.payload;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.rolePermissions = action.payload.permissions || action.payload || [];
      })
      .addCase(assignPermissions.fulfilled, (state, action) => {
        state.rolePermissions = action.payload.permissions || action.payload || [];
      });
  },
});

export const {
  clearRoleError,
  setRoleFilters,
  setRolePage,
  clearSelectedRole,
  resetRoles,
} = roleSlice.actions;

export default roleSlice.reducer;