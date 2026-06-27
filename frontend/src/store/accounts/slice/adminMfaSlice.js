import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminMfaApi from '../../../services/accounts/api/admin-mfa';
import * as securityApi from '../../../services/accounts/api/security';
import * as systemSettingsApi from '../../../services/accounts/api/system-settings';

const initialState = {
  systemSettings: null,
  systemSettingsLoading: false,
  systemSettingsError: null,
  systemSettingsUpdating: false,
  tenantPolicy: null,
  tenantPolicyLoading: false,
  tenantPolicyError: null,
  tenantPolicyUpdating: false,
  usersPolicy: [],
  usersPolicyLoading: false,
  usersPolicyError: null,
  currentUserPolicy: null,
  currentUserPolicyLoading: false,
  currentUserPolicyUpdating: false,
  userMFAStatus: null,
  userMFAStatusLoading: false,
  adminMFAStatus: null,
  adminMFAStatusLoading: false,
  resettingUserMFA: false,
  clearingDevices: false,
  stepUpVerified: false,
  stepUpVerifying: false,
  stepUpAction: null,
  stepUpExpiresAt: null,
  syncingPolicy: false,
  usersFilters: {
    search: '',
    role: '',
    mfa_enabled: null,
    mfa_required_override: null,
  },
  usersPage: 1,
  usersPageSize: 20,
  usersTotal: 0,
};

export const fetchSystemSettings = createAsyncThunk(
  'adminMfa/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.getSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch system settings');
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'adminMfa/updateSystemSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.updateSystemSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update system settings');
    }
  }
);

export const resetSystemSettings = createAsyncThunk(
  'adminMfa/resetSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.resetSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset system settings');
    }
  }
);

export const syncAllTenantsPolicy = createAsyncThunk(
  'adminMfa/syncAllTenantsPolicy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingsApi.syncPolicy();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync policy');
    }
  }
);

export const fetchTenantMFAPolicy = createAsyncThunk(
  'adminMfa/fetchTenantMFAPolicy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await securityApi.getTenantMFAPolicy();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant MFA policy');
    }
  }
);

export const updateTenantMFAPolicy = createAsyncThunk(
  'adminMfa/updateTenantMFAPolicy',
  async (mfa_required_roles, { rejectWithValue }) => {
    try {
      const response = await securityApi.updateTenantMFAPolicy({ mfa_required_roles });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update tenant MFA policy');
    }
  }
);

export const fetchAllUsersMFAPolicy = createAsyncThunk(
  'adminMfa/fetchAllUsersMFAPolicy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await securityApi.getUserMFAPolicies();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users MFA policy');
    }
  }
);

export const fetchUserMFAPolicy = createAsyncThunk(
  'adminMfa/fetchUserMFAPolicy',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await securityApi.getUserMFAPolicy(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user MFA policy');
    }
  }
);

export const updateUserMFAOverride = createAsyncThunk(
  'adminMfa/updateUserMFAOverride',
  async ({ userId, mfa_required }, { rejectWithValue }) => {
    try {
      const response = await securityApi.updateUserMFAPolicy(userId, { mfa_required });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user MFA override');
    }
  }
);

export const clearUserMFAOverride = createAsyncThunk(
  'adminMfa/clearUserMFAOverride',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await securityApi.clearUserMFAOverride(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear user MFA override');
    }
  }
);

export const fetchUserMFAStatus = createAsyncThunk(
  'adminMfa/fetchUserMFAStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await securityApi.getUserMFAStatus(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user MFA status');
    }
  }
);

export const resetUserMFA = createAsyncThunk(
  'adminMfa/resetUserMFA',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminMfaApi.resetUserMFA(userId, { reason });
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset user MFA');
    }
  }
);

export const clearUserDevices = createAsyncThunk(
  'adminMfa/clearUserDevices',
  async ({ userId, deviceId }, { rejectWithValue }) => {
    try {
      let response;
      if (deviceId) {
        response = await adminMfaApi.clearUserDevice(userId, deviceId);
      } else {
        response = await adminMfaApi.clearUserDevices(userId);
      }
      return { userId, deviceId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear user devices');
    }
  }
);

export const fetchAdminMFAStatus = createAsyncThunk(
  'adminMfa/fetchAdminMFAStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminMfaApi.getAdminMFAStatus(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin MFA status');
    }
  }
);

export const verifyStepUp = createAsyncThunk(
  'adminMfa/verifyStepUp',
  async ({ action, otp }, { rejectWithValue }) => {
    try {
      const response = await securityApi.verifyStepUp({ action, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Step-up verification failed');
    }
  }
);

const adminMfaSlice = createSlice({
  name: 'adminMfa',
  initialState,
  reducers: {
    clearAdminMfaErrors: (state) => {
      state.systemSettingsError = null;
      state.tenantPolicyError = null;
      state.usersPolicyError = null;
    },
    clearStepUpVerification: (state) => {
      state.stepUpVerified = false;
      state.stepUpAction = null;
      state.stepUpExpiresAt = null;
    },
    setAdminMfaUsersFilters: (state, action) => {
      state.usersFilters = { ...state.usersFilters, ...action.payload };
      state.usersPage = 1;
    },
    setAdminMfaUsersPage: (state, action) => {
      state.usersPage = action.payload;
    },
    resetAdminMfaState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.systemSettingsLoading = true;
        state.systemSettingsError = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.systemSettingsLoading = false;
        state.systemSettings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.systemSettingsLoading = false;
        state.systemSettingsError = action.payload;
      })
      .addCase(updateSystemSettings.pending, (state) => {
        state.systemSettingsUpdating = true;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.systemSettingsUpdating = false;
        state.systemSettings = action.payload;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.systemSettingsUpdating = false;
        state.systemSettingsError = action.payload;
      })
      .addCase(resetSystemSettings.pending, (state) => {
        state.systemSettingsUpdating = true;
      })
      .addCase(resetSystemSettings.fulfilled, (state, action) => {
        state.systemSettingsUpdating = false;
        state.systemSettings = action.payload;
      })
      .addCase(resetSystemSettings.rejected, (state, action) => {
        state.systemSettingsUpdating = false;
        state.systemSettingsError = action.payload;
      })
      .addCase(syncAllTenantsPolicy.pending, (state) => {
        state.syncingPolicy = true;
      })
      .addCase(syncAllTenantsPolicy.fulfilled, (state) => {
        state.syncingPolicy = false;
      })
      .addCase(syncAllTenantsPolicy.rejected, (state) => {
        state.syncingPolicy = false;
      })
      .addCase(fetchTenantMFAPolicy.pending, (state) => {
        state.tenantPolicyLoading = true;
        state.tenantPolicyError = null;
      })
      .addCase(fetchTenantMFAPolicy.fulfilled, (state, action) => {
        state.tenantPolicyLoading = false;
        state.tenantPolicy = action.payload;
        state.usersTotal = action.payload.users?.length || 0;
      })
      .addCase(fetchTenantMFAPolicy.rejected, (state, action) => {
        state.tenantPolicyLoading = false;
        state.tenantPolicyError = action.payload;
      })
      .addCase(updateTenantMFAPolicy.pending, (state) => {
        state.tenantPolicyUpdating = true;
      })
      .addCase(updateTenantMFAPolicy.fulfilled, (state, action) => {
        state.tenantPolicyUpdating = false;
        state.tenantPolicy = {
          ...state.tenantPolicy,
          mfa_required_roles: action.payload.mfa_required_roles,
          policy_version: action.payload.policy_version,
        };
      })
      .addCase(updateTenantMFAPolicy.rejected, (state, action) => {
        state.tenantPolicyUpdating = false;
        state.tenantPolicyError = action.payload;
      })
      .addCase(fetchAllUsersMFAPolicy.pending, (state) => {
        state.usersPolicyLoading = true;
        state.usersPolicyError = null;
      })
      .addCase(fetchAllUsersMFAPolicy.fulfilled, (state, action) => {
        state.usersPolicyLoading = false;
        state.usersPolicy = action.payload;
        state.usersTotal = action.payload.length;
      })
      .addCase(fetchAllUsersMFAPolicy.rejected, (state, action) => {
        state.usersPolicyLoading = false;
        state.usersPolicyError = action.payload;
      })
      .addCase(fetchUserMFAPolicy.pending, (state) => {
        state.currentUserPolicyLoading = true;
      })
      .addCase(fetchUserMFAPolicy.fulfilled, (state, action) => {
        state.currentUserPolicyLoading = false;
        state.currentUserPolicy = action.payload;
      })
      .addCase(fetchUserMFAPolicy.rejected, (state) => {
        state.currentUserPolicyLoading = false;
      })
      .addCase(updateUserMFAOverride.pending, (state) => {
        state.currentUserPolicyUpdating = true;
      })
      .addCase(updateUserMFAOverride.fulfilled, (state, action) => {
        state.currentUserPolicyUpdating = false;
        state.currentUserPolicy = action.payload.user;
        const index = state.usersPolicy.findIndex(u => u.id === action.payload.user.id);
        if (index !== -1) {
          state.usersPolicy[index] = {
            ...state.usersPolicy[index],
            mfa_required_override: action.payload.user.mfa_required_override,
            mfa_effective_required: action.payload.user.mfa_effective_required,
          };
        }
      })
      .addCase(updateUserMFAOverride.rejected, (state) => {
        state.currentUserPolicyUpdating = false;
      })
      .addCase(clearUserMFAOverride.fulfilled, (state, action) => {
        const index = state.usersPolicy.findIndex(u => u.id === action.meta.arg);
        if (index !== -1) {
          state.usersPolicy[index] = {
            ...state.usersPolicy[index],
            mfa_required_override: null,
            mfa_effective_required: state.usersPolicy[index].mfa_required_by_role,
          };
        }
      })
      .addCase(fetchUserMFAStatus.pending, (state) => {
        state.userMFAStatusLoading = true;
      })
      .addCase(fetchUserMFAStatus.fulfilled, (state, action) => {
        state.userMFAStatusLoading = false;
        state.userMFAStatus = action.payload;
      })
      .addCase(fetchUserMFAStatus.rejected, (state) => {
        state.userMFAStatusLoading = false;
      })
      .addCase(fetchAdminMFAStatus.pending, (state) => {
        state.adminMFAStatusLoading = true;
      })
      .addCase(fetchAdminMFAStatus.fulfilled, (state, action) => {
        state.adminMFAStatusLoading = false;
        state.adminMFAStatus = action.payload;
      })
      .addCase(fetchAdminMFAStatus.rejected, (state) => {
        state.adminMFAStatusLoading = false;
      })
      .addCase(resetUserMFA.pending, (state) => {
        state.resettingUserMFA = true;
      })
      .addCase(resetUserMFA.fulfilled, (state, action) => {
        state.resettingUserMFA = false;
        const index = state.usersPolicy.findIndex(u => u.id === action.payload.userId);
        if (index !== -1) {
          state.usersPolicy[index] = {
            ...state.usersPolicy[index],
            mfa_enabled: false,
            mfa_required_override: null,
          };
        }
      })
      .addCase(resetUserMFA.rejected, (state) => {
        state.resettingUserMFA = false;
      })
      .addCase(clearUserDevices.pending, (state) => {
        state.clearingDevices = true;
      })
      .addCase(clearUserDevices.fulfilled, (state) => {
        state.clearingDevices = false;
      })
      .addCase(clearUserDevices.rejected, (state) => {
        state.clearingDevices = false;
      })
      .addCase(verifyStepUp.pending, (state) => {
        state.stepUpVerifying = true;
      })
      .addCase(verifyStepUp.fulfilled, (state, action) => {
        state.stepUpVerifying = false;
        state.stepUpVerified = true;
        state.stepUpAction = action.payload.action;
        state.stepUpExpiresAt = action.payload.verified_until;
      })
      .addCase(verifyStepUp.rejected, (state) => {
        state.stepUpVerifying = false;
        state.stepUpVerified = false;
      });
  },
});

export const {
  clearAdminMfaErrors,
  clearStepUpVerification,
  setAdminMfaUsersFilters,
  setAdminMfaUsersPage,
  resetAdminMfaState,
} = adminMfaSlice.actions;

export default adminMfaSlice.reducer;