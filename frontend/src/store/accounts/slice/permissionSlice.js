import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as permissionsApi from '../../../services/accounts/api/permissions';

const initialState = {
  permissions: [],
  selectedPermission: null,
  permissionsByCategory: {},
  permissionsByLevel: {},
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    category: '',
    level: '',
    is_active: null,
    search: '',
  },
};

export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.permissions.pagination;
      const filters = state.permissions.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await permissionsApi.getPermissions(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions');
    }
  }
);

export const fetchPermission = createAsyncThunk(
  'permissions/fetchPermission',
  async (id, { rejectWithValue }) => {
    try {
      const response = await permissionsApi.getPermission(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch permission');
    }
  }
);

export const fetchPermissionsByCategory = createAsyncThunk(
  'permissions/fetchByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await permissionsApi.getPermissionsByCategory(category);
      return { category, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions by category');
    }
  }
);

export const fetchPermissionsByLevel = createAsyncThunk(
  'permissions/fetchByLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await permissionsApi.getPermissionsByLevel(level);
      return { level, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions by level');
    }
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissionError: (state) => {
      state.error = null;
    },
    setPermissionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPermissionPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
    },
    resetPermissions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.permissions = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPermission = action.payload;
      })
      .addCase(fetchPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPermissionsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissionsByCategory[action.payload.category] = action.payload.data;
      })
      .addCase(fetchPermissionsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPermissionsByLevel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsByLevel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissionsByLevel[action.payload.level] = action.payload.data;
      })
      .addCase(fetchPermissionsByLevel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPermissionError,
  setPermissionFilters,
  setPermissionPage,
  clearSelectedPermission,
  resetPermissions,
} = permissionSlice.actions;

// Selectors with defaults
export const selectPermissions = (state) => state.permissions || {};
export const selectPermissionsList = (state) => state.permissions?.permissions || [];
export const selectGroupedPermissions = (state) => state.permissions?.groupedPermissions || {};
export const selectPermissionCategories = (state) => state.permissions?.categories || ['kpi', 'review', 'user', 'tenant', 'report', 'workflow', 'admin'];
export const selectPermissionsLoading = (state) => state.permissions?.isLoading || false;
export const selectPermissionsError = (state) => state.permissions?.error || null;

export default permissionSlice.reducer;