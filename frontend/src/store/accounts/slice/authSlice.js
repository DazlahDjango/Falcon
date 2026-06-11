import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../../services/accounts/api/auth';
import * as userApi from '../../../services/accounts/api/users';
import * as mfaApi from '../../../services/accounts/api/mfa';
import { setTokens, clearTokens, setTenantId, clearTenantId } from '../../../services/accounts/storage/secureStorage';

// ============================================================
// Async Thunks
// ============================================================

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                error.message || 
                                'Login failed';
            return rejectWithValue(errorMessage);
        }
    }
);

export const verifyMfa = createAsyncThunk(
    'auth/verifyMfa',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authApi.verifyMfa(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
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

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authApi.register(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Registration failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userApi.getCurrentUser();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await userApi.updateProfile(profileData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await authApi.changePassword(passwordData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to change password');
        }
    }
);

export const setupMfa = createAsyncThunk(
    'auth/setupMfa',
    async (deviceName = 'Authenticator', { rejectWithValue }) => {
        try {
            const response = await mfaApi.setupTotp(deviceName);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'MFA setup failed');
        }
    }
);

export const verifyMfaSetup = createAsyncThunk(
    'auth/verifyMfaSetup',
    async ({ otp, deviceId }, { rejectWithValue }) => {
        try {
            const response = await mfaApi.verifyTotpSetup(otp, deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
        }
    }
);

export const disableMfa = createAsyncThunk(
    'auth/disableMfa',
    async (deviceId = null, { rejectWithValue }) => {
        try {
            const response = await mfaApi.disableMfa(deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to disable MFA');
        }
    }
);

export const getBackupCodes = createAsyncThunk(
    'auth/getBackupCodes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await mfaApi.getBackupCodesStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to get backup codes');
        }
    }
);

export const regenerateBackupCodes = createAsyncThunk(
    'auth/regenerateBackupCodes',
    async (count = 10, { rejectWithValue }) => {
        try {
            const response = await mfaApi.generateBackupCodes(count);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to regenerate backup codes');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authApi.forgotPassword(email);
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
    async (token, { rejectWithValue }) => {
        try {
            const response = await authApi.verifyEmail(token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Email verification failed');
        }
    }
);

export const acceptInvitation = createAsyncThunk(
    'auth/acceptInvitation',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authApi.acceptInvitation(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to accept invitation');
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'auth/uploadAvatar',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await userApi.uploadAvatar(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to upload avatar');
        }
    }
);

export const removeAvatar = createAsyncThunk(
    'auth/removeAvatar',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userApi.removeAvatar();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to remove avatar');
        }
    }
);

export const resendVerification = createAsyncThunk(
    'auth/resendVerification',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authApi.resendVerification(email);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to resend verification email');
        }
    }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    requiresMfa: false,
    mfaToken: null,
    mfaSetup: null,
    twoFactorEnabled: false,
    invitationData: null,
    backupCodes: null,
    backupCodesRemaining: 0
};

// ============================================================
// Slice
// ============================================================

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
        },
        setInvitationData: (state, action) => {
            state.invitationData = action.payload;
        },
        clearInvitationData: (state) => {
            state.invitationData = null;
        },
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        clearMfaSetup: (state) => {
            state.mfaSetup = null;
        }
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
                if (action.payload.requires_mfa) {
                    state.requiresMfa = true;
                    state.mfaToken = action.payload.mfa_token;
                } else {
                    state.isAuthenticated = true;
                    state.requiresMfa = false;
                    state.mfaToken = null;
                    state.user = action.payload.user;
                    
                    const accessToken = action.payload.access || action.payload.access_token;
                    const refreshToken = action.payload.refresh || action.payload.refresh_token;
                    
                    if (accessToken && refreshToken) {
                        setTokens(accessToken, refreshToken).catch(err => {
                            console.error('Failed to set tokens:', err);
                        });
                    }
                    
                    if (state.user?.tenant_id) {
                        setTenantId(state.user.tenant_id).catch(err => {
                            console.error('Failed to set tenant ID:', err);
                        });
                    }
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
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
                state.user = action.payload.user;
                
                if (action.payload.access && action.payload.refresh) {
                    setTokens(action.payload.access, action.payload.refresh).catch(err => {
                        console.error('Failed to set tokens after MFA:', err);
                    });
                }
                
                if (action.payload.user?.tenant_id) {
                    setTenantId(action.payload.user.tenant_id).catch(err => {
                        console.error('Failed to set tenant ID after MFA:', err);
                    });
                }
            })
            .addCase(verifyMfa.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                return {
                    ...initialState,
                    isAuthenticated: false,
                    user: null
                };
            })
            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Update Profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = { ...state.user, ...action.payload };
            })
            // Change Password
            .addCase(changePassword.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.error = action.payload;
            })
            // MFA Setup
            .addCase(setupMfa.fulfilled, (state, action) => {
                state.mfaSetup = action.payload;
            })
            .addCase(verifyMfaSetup.fulfilled, (state) => {
                state.twoFactorEnabled = true;
                if (state.user) {
                    state.user.mfa_enabled = true;
                }
                state.mfaSetup = null;
            })
            .addCase(disableMfa.fulfilled, (state) => {
                state.twoFactorEnabled = false;
                if (state.user) {
                    state.user.mfa_enabled = false;
                }
            })
            // Backup Codes
            .addCase(getBackupCodes.fulfilled, (state, action) => {
                state.backupCodesRemaining = action.payload.remaining || 0;
            })
            .addCase(regenerateBackupCodes.fulfilled, (state, action) => {
                state.backupCodes = action.payload.data?.codes || action.payload.codes;
                state.backupCodesRemaining = state.backupCodes?.length || 0;
            })
            // Registration
            .addCase(register.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Accept Invitation
            .addCase(acceptInvitation.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.invitationData = null;
            });
    }
});

// ============================================================
// Actions
// ============================================================

export const { 
    clearError, 
    clearMfaState, 
    setInvitationData, 
    clearInvitationData, 
    setAuthenticated,
    clearMfaSetup 
} = authSlice.actions;

// ============================================================
// Selectors (AUTH ONLY)
// ============================================================

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectMfaSetup = (state) => state.auth.mfaSetup;
export const selectBackupCodesRemaining = (state) => state.auth.backupCodesRemaining;
export default authSlice.reducer;