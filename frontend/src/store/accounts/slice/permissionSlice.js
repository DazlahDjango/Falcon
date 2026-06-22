/**
 * Permission Slice - Permission management state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as permissionsApi from '../../../services/accounts/api/permissions';

// Async Thunks
// =============
export const fetchPermissions = createAsyncThunk(
    'permissions/fetch',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await permissionsApi.getPermissions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions');
        }
    }
);
export const fetchPermissionsByCategory = createAsyncThunk(
    'permissions/fetchByCategory',
    async (category, { rejectWithValue }) => {
        try {
            const response = await permissionsApi.getPermissionsByCategory(category);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions');
        }
    }
);

// Initial State
// ================
const initialState = {
    permissions: [],
    groupedPermissions: {},
    categories: ['kpi', 'review', 'user', 'tenant', 'report', 'workflow', 'admin'],
    isLoading: false,
    error: null
};

// Slice
// =======
const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Permissions
            .addCase(fetchPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.permissions = action.payload.results;
                // Group permissions by category
                const grouped = {};
                action.payload.results.forEach(perm => {
                    if (!grouped[perm.category]) {
                        grouped[perm.category] = [];
                    }
                    grouped[perm.category].push(perm);
                });
                state.groupedPermissions = grouped;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Permissions By Category
            .addCase(fetchPermissionsByCategory.fulfilled, (state, action) => {
                state.groupedPermissions[action.meta.arg] = action.payload.results;
            });
    }
});
export const { clearError } = permissionSlice.actions;

// Selectors with defaults
export const selectPermissions = (state) => state.permissions || {};
export const selectPermissionsList = (state) => state.permissions?.permissions || [];
export const selectGroupedPermissions = (state) => state.permissions?.groupedPermissions || {};
export const selectPermissionCategories = (state) => state.permissions?.categories || ['kpi', 'review', 'user', 'tenant', 'report', 'workflow', 'admin'];
export const selectPermissionsLoading = (state) => state.permissions?.isLoading || false;
export const selectPermissionsError = (state) => state.permissions?.error || null;

export default permissionSlice.reducer;