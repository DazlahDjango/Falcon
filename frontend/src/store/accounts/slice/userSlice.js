import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';

const initialState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  userTeam: [],
  reportingChain: [],
  myTeam: [],
  myReportingChain: [],
  invitations: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    role: '',
    is_active: null,
    is_verified: null,
    department: '',
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.users?.pagination || { page: 1, pageSize: 20 };
      const filters = state.users?.filters || {};
      const page = params?.page || pagination.page;
      const limit = params?.pageSize || pagination.pageSize;
      const offset = (page - 1) * limit;
      const queryParams = {
        limit,
        offset,
        ...filters,
        ...params,
      };
      const response = await usersApi.getUsers(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await usersApi.createUser(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
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
  async (id, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.activateUser(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to activate user');
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.deactivateUser(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to deactivate user');
    }
  }
);

export const unlockUser = createAsyncThunk(
  'users/unlockUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.unlockUser(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to unlock user');
    }
  }
);

export const assignUserRole = createAsyncThunk(
  'users/assignUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await usersApi.assignUserRole(id, { role });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to assign role');
    }
  }
);

export const fetchUserTeam = createAsyncThunk(
  'users/fetchUserTeam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUserTeam(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch team');
    }
  }
);

export const fetchReportingChain = createAsyncThunk(
  'users/fetchReportingChain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUserReportingChain(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reporting chain');
    }
  }
);

export const fetchMyTeam = createAsyncThunk(
  'users/fetchMyTeam',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getMyTeam();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch my team');
    }
  }
);

export const fetchMyReportingChain = createAsyncThunk(
  'users/fetchMyReportingChain',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getMyReportingChain();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reporting chain');
    }
  }
);

export const fetchInvitations = createAsyncThunk(
  'users/fetchInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getInvitations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch invitations');
    }
  }
);

export const sendInvitation = createAsyncThunk(
  'users/sendInvitation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await usersApi.sendInvitation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send invitation');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setUserFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setUserPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setUserPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetUsers: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.users = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        state.pagination.total -= 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], is_active: true };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, is_active: true };
        }
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], is_active: false };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, is_active: false };
        }
      })
      .addCase(unlockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], locked_until: null, login_attempts: 0 };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, locked_until: null, login_attempts: 0 };
        }
      })
      .addCase(assignUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], role: action.payload.data.role };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, role: action.payload.data.role };
        }
      })
      .addCase(fetchUserTeam.fulfilled, (state, action) => {
        state.userTeam = action.payload.data.team || action.payload.data || [];
      })
      .addCase(fetchReportingChain.fulfilled, (state, action) => {
        state.reportingChain = action.payload.data.reporting_chain || action.payload.data || [];
      })
      .addCase(fetchMyTeam.fulfilled, (state, action) => {
        state.myTeam = action.payload.team || action.payload || [];
      })
      .addCase(fetchMyReportingChain.fulfilled, (state, action) => {
        state.myReportingChain = action.payload.reporting_chain || action.payload || [];
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload.invitations || action.payload || [];
      })
      .addCase(sendInvitation.fulfilled, (state, action) => {
        state.invitations.unshift(action.payload);
      });
  },
});

export const {
  clearUserError,
  setUserFilters,
  setUserPage,
  setUserPageSize,
  clearSelectedUser,
  resetUsers,
} = userSlice.actions;

export default userSlice.reducer;