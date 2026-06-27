import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../../services/accounts/api/auth';
import * as usersApi from '../../../services/accounts/api/users';
import {
  setTokens,
  clearTokens,
  setTenantId,
  clearTenantId,
  getAccessToken,
} from '../../../services/accounts/storage/secureStorage';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  requiresMfa: false,
  mfaToken: null,
  mfaPending: false,
  sessionId: null,
};

// ============ Existing Thunks ============
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const verifyMfa = createAsyncThunk(
  'auth/verifyMfa',
  async ({ mfaToken, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyMFA({ mfa_token: mfaToken, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const refreshToken = state.auth?.refreshToken || await getAccessToken();
      if (refreshToken) {
        await authApi.logout({ refresh: refreshToken });
      }
      await clearTokens();
      await clearTenantId();
      return true;
    } catch (error) {
      await clearTokens();
      await clearTenantId();
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getMe();
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await clearTokens();
        await clearTenantId();
        return rejectWithValue('Session expired');
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await getAccessToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      const response = await authApi.refreshToken({ refresh: refreshToken });
      return response.data;
    } catch (error) {
      await clearTokens();
      await clearTenantId();
      return rejectWithValue(error.response?.data?.error || 'Session refresh failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { isAuthenticated: false };
      }
      const result = await dispatch(fetchCurrentUser()).unwrap();
      return { isAuthenticated: true, user: result };
    } catch (error) {
      await clearTokens();
      await clearTenantId();
      return rejectWithValue(error);
    }
  }
);

// ============ NEW THUNKS ============

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const registerTenant = createAsyncThunk(
  'auth/registerTenant',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.registerTenant(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Tenant registration failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset password');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Email verification failed');
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.resendVerification(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to resend verification');
    }
  }
);

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMfaState: (state) => {
      state.requiresMfa = false;
      state.mfaToken = null;
      state.mfaPending = false;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        if (data.requires_mfa) {
          state.requiresMfa = true;
          state.mfaToken = data.mfa_token;
          state.mfaPending = true;
        } else {
          state.isAuthenticated = true;
          state.requiresMfa = false;
          state.mfaToken = null;
          state.mfaPending = false;
          state.user = data.user || data.user_data || null;
          state.sessionId = data.session_id || null;
          if (data.access && data.refresh) {
            setTokens(data.access, data.refresh);
          }
          if (state.user?.tenant_id) {
            setTenantId(state.user.tenant_id);
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Verify MFA
      .addCase(verifyMfa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.requiresMfa = false;
        state.mfaToken = null;
        state.mfaPending = false;
        state.user = action.payload.user || action.payload.user_data || null;
        state.sessionId = action.payload.session_id || null;
        if (action.payload.access && action.payload.refresh) {
          setTokens(action.payload.access, action.payload.refresh);
        }
        if (state.user?.tenant_id) {
          setTenantId(state.user.tenant_id);
        }
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'MFA verification failed';
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, () => {
        return { ...initialState, isInitialized: true };
      })
      .addCase(logout.rejected, () => {
        return { ...initialState, isInitialized: true };
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (state.user?.tenant_id) {
          setTenantId(state.user.tenant_id);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user || null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Refresh Session
      .addCase(refreshSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.access) {
          setTokens(action.payload.access, action.payload.refresh);
        }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register Tenant
      .addCase(registerTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerTenant.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMfaState,
  setAuthenticated,
  updateUser,
  setSessionId,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;