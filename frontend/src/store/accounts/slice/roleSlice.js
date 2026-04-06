import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rolesApi from '../../../services/accounts/api/roles';

// Async Thunks
// =============
export const fetchRoles = createAsyncThunk(
    'roles/fetch',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await rolesApi.getRoles(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch roles');
        }
    }
);
export const fetchRoleById = createAsyncThunk(
    'roles/fetchById',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await rolesApi.getRoleById(roleId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch role');
        }
    }
);
export const createRole = createAsyncThunk(
    'roles/create',
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await rolesApi.createRole(roleData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create role');
        }
    }
);
export const updateRole = createAsyncThunk(
    'roles/update',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await rolesApi.updateRole(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update role');
        }
    }
);
export const deleteRole = createAsyncThunk(
    'roles/delete',
    async (roleId, { rejectWithValue }) => {
        try {
            await rolesApi.deleteRole(roleId);
            return roleId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete role');
        }
    }
);
export const fetchAssignableRoles = createAsyncThunk(
    'roles/fetchAssignable',
    async (_, { rejectWithValue }) => {
        try {
            const response = await rolesApi.getAssignableRoles();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch assignable roles');
        }
    }
);

// Initial State
// ===============
const initialState = {
    roles: [],
    selectedRole: null,
    assignableRoles: [],
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
// ======
const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedRole: (state) => {
            state.selectedRole = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Roles
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload.results;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Role By ID
            .addCase(fetchRoleById.fulfilled, (state, action) => {
                state.selectedRole = action.payload;
            })           
            // Create Role
            .addCase(createRole.fulfilled, (state, action) => {
                state.roles.unshift(action.payload);
            })
            // Update Role
            .addCase(updateRole.fulfilled, (state, action) => {
                const index = state.roles.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
                if (state.selectedRole?.id === action.payload.id) {
                    state.selectedRole = action.payload;
                }
            })
            // Delete Role
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.roles = state.roles.filter(r => r.id !== action.payload);
                if (state.selectedRole?.id === action.payload) {
                    state.selectedRole = null;
                }
            })
            // Fetch Assignable Roles
            .addCase(fetchAssignableRoles.fulfilled, (state, action) => {
                state.assignableRoles = action.payload;
            });
    }
});
export const { clearError, clearSelectedRole } = roleSlice.actions;

export default roleSlice.reducer;