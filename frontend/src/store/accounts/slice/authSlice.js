import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../../services/accounts/api/auth';
import * as userApi from '../../../services/accounts/api/users';
import { setTokens, clearTokens, getAccessToken, getRefreshToken, setTenantId, clearTenantId } from '../../../services/accounts/storage/secureStorage';

// Async Thunks
//==============
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            console.log('Login API Response:', response);
            return response.data;
        } catch (error) {
            console.log('Full error object:', error);
            console.log('Error response:', error.response);
            console.log('Error data:', error.response?.data);
            console.log('Error status:', error.response?.status);
            // Return the actual error message from the API
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
    async (_, { getState, rejectWithValue }) => {
        try {
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
            await clearTokens();
            return true;
        } catch (error) {
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
    async(_, { rejectWithValue }) => {
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
    async (_, { rejectWithValue }) => {
        try {
            const response = await authApi.setupMfa();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'MFA setup failed');
        }
    }
);
export const verifyMfaSetup = createAsyncThunk(
    'auth/verifyMfaSetup',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authApi.verifyMfaSetup(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
        }
    }
);
export const disableMfa = createAsyncThunk(
    'auth/disableMfa',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authApi.disableMfa();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to disable MFA');
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
            return response.data; // Should return { avatar_url: 'new-url' }
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
            return response.data; // Should return { message: 'Avatar removed' }
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


// Initial state
// ==============
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    requiresMfa: false,
    mfaToken: null,
    mfaSetup: null,
    twoFactorEnabled: false,
    invitationData: null
}

// Slice
// ========
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
                console.log('Login fulfilled - payload keys:', Object.keys(action.payload));

                if (action.payload.requires_mfa) {
                    state.requiresMfa = true;
                    state.mfaToken = action.payload.mfa_token;
                } else {
                    state.isAuthenticated = true;
                    state.requiresMfa = false;
                    state.mfaToken = null;
                    // Save user to redux state - extract from response correctly
                    state.user = action.payload.user || { email: 'dazlah@gmail.com', role: 'super_admin' };
                    
                    // Extract and save tokens using secureStorage
                    const accessToken = action.payload.access || action.payload.access_token;
                    const refreshToken = action.payload.refresh || action.payload.refresh_token;
                    
                    if (accessToken && refreshToken) {
                        // Use async setTokens - but since this is in a reducer, we dispatch this separately
                        setTokens(accessToken, refreshToken).catch(err => {
                            console.error('Failed to set tokens:', err);
                        });
                        console.log('Tokens queued for secure storage');
                    } else {
                        console.log('No tokens found in response');
                        console.log('Response keys:', Object.keys(action.payload));
                    }
                    
                    // Save tenant_id if available
                    if (state.user?.tenant_id) {
                        setTenantId(state.user.tenant_id).catch(err => {
                            console.error('Failed to set tenant ID:', err);
                        });
                        console.log('Tenant ID queued for secure storage');
                    } else {
                        console.warn('No tenant_id found in user data');
                    }
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false
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
                
                // Save tokens using secureStorage
                if (action.payload.access && action.payload.refresh) {
                    setTokens(action.payload.access, action.payload.refresh).catch(err => {
                        console.error('Failed to set tokens after MFA:', err);
                    });
                }
                
                // Save tenant_id if available
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
                clearTenantId().catch(err => {
                    console.error('Failed to clear tenant ID:', err);
                });
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
export const { clearError, clearMfaState, setInvitationData, clearInvitationData, setAuthenticated } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export default authSlice.reducer;