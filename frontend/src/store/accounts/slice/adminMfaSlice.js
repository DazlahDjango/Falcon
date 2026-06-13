import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminSystemApi from '../../../services/accounts/api/adminSystemSettings';

// ============================================================
// Async Thunks - System Settings
// ============================================================

export const fetchSystemSettings = createAsyncThunk(
    'adminMfa/fetchSystemSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.getSystemSettings();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch system settings');
        }
    }
);

export const updateSystemSettings = createAsyncThunk(
    'adminMfa/updateSystemSettings',
    async (patch, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.updateSystemSettings(patch);
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
            const response = await adminSystemApi.resetSystemSettings();
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
            const response = await adminSystemApi.syncAllTenantsPolicy();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to sync policy');
        }
    }
);

// ============================================================
// Async Thunks - Tenant MFA Policy
// ============================================================

export const fetchTenantMFAPolicy = createAsyncThunk(
    'adminMfa/fetchTenantMFAPolicy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.getTenantMFAPolicy();
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
            const response = await adminSystemApi.updateTenantMFAPolicy(mfa_required_roles);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update tenant MFA policy');
        }
    }
);

// ============================================================
// Async Thunks - User MFA Policy
// ============================================================

export const fetchAllUsersMFAPolicy = createAsyncThunk(
    'adminMfa/fetchAllUsersMFAPolicy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.getAllUsersMFAPolicy();
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
            const response = await adminSystemApi.getUserMFAPolicy(userId);
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
            const response = await adminSystemApi.updateUserMFAOverride(userId, mfa_required);
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
            const response = await adminSystemApi.clearUserMFAOverride(userId);
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
            const response = await adminSystemApi.getUserMFAStatus(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user MFA status');
        }
    }
);

// ============================================================
// Async Thunks - Admin MFA Reset
// ============================================================

export const resetUserMFA = createAsyncThunk(
    'adminMfa/resetUserMFA',
    async ({ userId, reason }, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.resetUserMFA(userId, reason);
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
            const response = await adminSystemApi.clearUserDevices(userId, deviceId);
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
            const response = await adminSystemApi.getAdminMFAStatus(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin MFA status');
        }
    }
);

// ============================================================
// Async Thunks - Step-Up Authentication
// ============================================================

export const verifyStepUp = createAsyncThunk(
    'adminMfa/verifyStepUp',
    async ({ action, otp }, { rejectWithValue }) => {
        try {
            const response = await adminSystemApi.verifyStepUp(action, otp);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Step-up verification failed');
        }
    }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
    // System Settings
    systemSettings: null,
    systemSettingsLoading: false,
    systemSettingsError: null,
    systemSettingsUpdating: false,

    // Tenant MFA Policy
    tenantPolicy: null,
    tenantPolicyLoading: false,
    tenantPolicyError: null,
    tenantPolicyUpdating: false,

    // User MFA Policy
    usersPolicy: [],
    usersPolicyLoading: false,
    usersPolicyError: null,
    currentUserPolicy: null,
    currentUserPolicyLoading: false,
    currentUserPolicyUpdating: false,

    // User MFA Status
    userMFAStatus: null,
    userMFAStatusLoading: false,

    // Admin MFA Status
    adminMFAStatus: null,
    adminMFAStatusLoading: false,

    // Reset Operations
    resettingUserMFA: false,
    clearingDevices: false,

    // Step-Up
    stepUpVerified: false,
    stepUpVerifying: false,
    stepUpAction: null,
    stepUpExpiresAt: null,

    // Sync Operations
    syncingPolicy: false,

    // Pagination & Filters
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

// ============================================================
// Slice
// ============================================================

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
        setUsersFilters: (state, action) => {
            state.usersFilters = { ...state.usersFilters, ...action.payload };
            state.usersPage = 1;
        },
        setUsersPage: (state, action) => {
            state.usersPage = action.payload;
        },
        resetAdminMfaState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // ========== System Settings ==========
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

            // ========== Tenant MFA Policy ==========
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

            // ========== User MFA Policy ==========
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
                // Update in users list
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
                // Update in users list
                const index = state.usersPolicy.findIndex(u => u.id === action.meta.arg);
                if (index !== -1) {
                    state.usersPolicy[index] = {
                        ...state.usersPolicy[index],
                        mfa_required_override: null,
                        mfa_effective_required: state.usersPolicy[index].mfa_required_by_role,
                    };
                }
            })

            // ========== User MFA Status ==========
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

            // ========== Admin MFA Status ==========
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

            // ========== Reset Operations ==========
            .addCase(resetUserMFA.pending, (state) => {
                state.resettingUserMFA = true;
            })
            .addCase(resetUserMFA.fulfilled, (state, action) => {
                state.resettingUserMFA = false;
                // Update user in list
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

            // ========== Step-Up Verification ==========
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

// ============================================================
// Actions & Selectors
// ============================================================

export const {
    clearAdminMfaErrors,
    clearStepUpVerification,
    setUsersFilters,
    setUsersPage,
    resetAdminMfaState,
} = adminMfaSlice.actions;

// Selectors
export const selectAdminMfa = (state) => state.adminMfa;
export const selectSystemSettings = (state) => state.adminMfa.systemSettings;
export const selectSystemSettingsLoading = (state) => state.adminMfa.systemSettingsLoading;
export const selectTenantPolicy = (state) => state.adminMfa.tenantPolicy;
export const selectTenantPolicyLoading = (state) => state.adminMfa.tenantPolicyLoading;
export const selectUsersPolicy = (state) => state.adminMfa.usersPolicy;
export const selectUsersPolicyLoading = (state) => state.adminMfa.usersPolicyLoading;
export const selectCurrentUserPolicy = (state) => state.adminMfa.currentUserPolicy;
export const selectUserMFAStatus = (state) => state.adminMfa.userMFAStatus;
export const selectAdminMFAStatus = (state) => state.adminMfa.adminMFAStatus;
export const selectStepUpVerified = (state) => state.adminMfa.stepUpVerified;
export const selectStepUpVerifying = (state) => state.adminMfa.stepUpVerifying;
export const selectResettingUserMFA = (state) => state.adminMfa.resettingUserMFA;
export const selectSyncingPolicy = (state) => state.adminMfa.syncingPolicy;

export default adminMfaSlice.reducer;