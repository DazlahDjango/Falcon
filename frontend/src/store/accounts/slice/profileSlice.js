import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';

export const fetchCurrentUserProfile = createAsyncThunk(
    'profile/fetchCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getCurrentUser();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/update',
    async (data, { rejectWithValue }) => {
        try {
            const response = await usersApi.updateProfile(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async ({ file, onProgress }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await usersApi.uploadAvatar(formData, onProgress);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to upload avatar');
        }
    }
);

export const deleteAvatar = createAsyncThunk(
    'profile/deleteAvatar',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.deleteAvatar();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete avatar');
        }
    }
);

export const changePassword = createAsyncThunk(
    'profile/changePassword',
    async ({ oldPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await usersApi.changePassword(oldPassword, newPassword);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to change password');
        }
    }
);

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
    avatarUploadProgress: 0,
    isUploadingAvatar: false
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
        },
        resetProfile: () => initialState,
        setAvatarProgress: (state, action) => {
            state.avatarUploadProgress = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Current User Profile
            .addCase(fetchCurrentUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = { ...state.profile, ...action.payload };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.isUploadingAvatar = true;
                state.avatarUploadProgress = 0;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.isUploadingAvatar = false;
                state.avatarUploadProgress = 100;
                if (state.profile) {
                    state.profile.avatar = action.payload.avatar_url;
                }
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.isUploadingAvatar = false;
                state.avatarUploadProgress = 0;
                state.error = action.payload;
            })
            // Delete Avatar
            .addCase(deleteAvatar.fulfilled, (state) => {
                if (state.profile) {
                    state.profile.avatar = null;
                }
            })
            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearProfileError, resetProfile, setAvatarProgress } = profileSlice.actions;

export const selectProfile = (state) => state.profile;
export const selectProfileData = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileError = (state) => state.profile.error;
export const selectAvatarUploadProgress = (state) => state.profile.avatarUploadProgress;
export const selectIsUploadingAvatar = (state) => state.profile.isUploadingAvatar;

export default profileSlice.reducer;