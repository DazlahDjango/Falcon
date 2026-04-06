import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';
import * as authApi from '../../../services/accounts/api/auth';

// Async Thunks
// =============
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params, { rejectWithValue }) => {
        try {
            const response = await usersApi.getUsers(params);
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
        }
    }
);
export const fetchUserById = createAsyncThunk(
    'users/fetchUserById',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.getUserById(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
        }
    }
);
export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await usersApi.createUser(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create user');
        }
    }
);
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await usersApi.updateUser(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update user');
        }
    }
);
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            await usersApi.deleteUser(userId);
            return userId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
        }
    }
);
export const activateUser = createAsyncThunk(
    'users/activateUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.activateUser(userId);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to activate user');
        }
    }
);
export const deactivateUser = createAsyncThunk(
    'users/deactivateUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.deactivateUser(userId);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to deactivate user');
        }
    }
);
export const unlockUser = createAsyncThunk(
    'users/unlockUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.unlockUser(userId);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to unlock user');
        }
    }
);
export const assignRole = createAsyncThunk(
    'users/assignRole',
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const response = await usersApi.assignRole(userId, role);
            return { userId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to assign role');
        }
    }
);
export const inviteUser = createAsyncThunk(
    'users/inviteUser',
    async (inviteData, { rejectWithValue }) => {
        try {
            const response = await authApi.inviteUser(inviteData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to send invitation');
        }
    }
);

// Initial State
// ===============
const initialState = {
    users: [],
    selectedUser: null,
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 20
    },
    filters: {
        search: '',
        role: '',
        is_active: undefined,
        is_verified: undefined,
        mfa_enabled: undefined,
        department_id: '',
        joined_after: '',
        joined_before: ''
    },
    isLoading: false,
    error: null,
    invitations: [],
    invitationLoading: false
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers : {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.current_page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.current_page = 1;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.results;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create user
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
                state.pagination.total_items += 1;
            })
            // Update User
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
                state.pagination.total_items -= 1;
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
            })
            // Activate & Deactivate user
            .addCase(activateUser.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.userId);
                if (user) user.is_active = true;
                if (state.selectedUser?.id === action.payload.userId) {
                    state.selectedUser.is_active = true;
                }
            })
            .addCase(deactivateUser.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.userId);
                if (user) user.is_active = false;
                if (state.selectedUser?.id === action.payload.userId) {
                    state.selectedUser.is_active = false;
                }
            })
            // Unlock User
            .addCase(unlockUser.fulfilled, (state, action) => {
                if (state.selectedUser?.id === action.payload.userId) {
                    state.selectedUser.locked_until = null;
                    state.selectedUser.login_attempts = 0;
                }
            })
            // Assign Role
            .addCase(assignRole.fulfilled, (state, action) => {
                const user = state.users.find(u => u.id === action.payload.userId);
                if (user) user.role = action.payload.data.role;
                if (state.selectedUser?.id === action.payload.userId) {
                    state.selectedUser.role = action.payload.data.role;
                }
            })
            // Invite User
            .addCase(inviteUser.pending, (state) => {
                state.invitationLoading = true;
            })
            .addCase(inviteUser.fulfilled, (state, action) => {
                state.invitationLoading = false;
                state.invitations.unshift(action.payload);
            })
            .addCase(inviteUser.rejected, (state, action) => {
                state.invitationLoading = false;
                state.error = action.payload;
            });
    }
});
export const { setFilters, resetFilters, clearSelectedUser, clearError } = userSlice.actions;
// Selectors
export const selectUsers = (state) => state.users;
export const selectSelectedUser = (state) => state.users.selectedUser;

export default userSlice.reducer;