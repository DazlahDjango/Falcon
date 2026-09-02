import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profilesApi from '../../../services/accounts/api/profiles';

const initialState = {
  profiles: [],
  currentProfile: null,
  selectedProfile: null,
  skills: [],
  certifications: [],
  isLoading: false,
  isUpdating: false,
  isUploading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    search: '',
    employee_type: '',
    department: '',
  },
};

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.profiles.pagination;
      const filters = state.profiles.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await profilesApi.getProfiles(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profiles');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'profiles/fetchProfile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await profilesApi.getProfile(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profiles/updateProfile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await profilesApi.updateProfile(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profiles/uploadAvatar',
  async ({ id, file, onProgress }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await profilesApi.uploadAvatar(id, formData, onProgress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload avatar');
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'profiles/deleteAvatar',
  async (id, { rejectWithValue }) => {
    try {
      const response = await profilesApi.deleteAvatar(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete avatar');
    }
  }
);

export const addSkill = createAsyncThunk(
  'profiles/addSkill',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await profilesApi.addSkill(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add skill');
    }
  }
);

export const updateSkill = createAsyncThunk(
  'profiles/updateSkill',
  async ({ id, skillName, data }, { rejectWithValue }) => {
    try {
      const response = await profilesApi.updateSkill(id, skillName, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update skill');
    }
  }
);

export const removeSkill = createAsyncThunk(
  'profiles/removeSkill',
  async ({ id, skillName }, { rejectWithValue }) => {
    try {
      await profilesApi.removeSkill(id, skillName);
      return skillName;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove skill');
    }
  }
);

export const addCertification = createAsyncThunk(
  'profiles/addCertification',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await profilesApi.addCertification(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add certification');
    }
  }
);

export const removeCertification = createAsyncThunk(
  'profiles/removeCertification',
  async ({ id, certName }, { rejectWithValue }) => {
    try {
      await profilesApi.removeCertification(id, certName);
      return certName;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove certification');
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'profiles/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profilesApi.getMyProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'profiles/updateMyProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await profilesApi.updateMyProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    setProfileFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setProfilePage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedProfile: (state) => {
      state.selectedProfile = null;
    },
    resetProfiles: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.profiles = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProfile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (state.selectedProfile?.id === action.payload.id) {
          state.selectedProfile = { ...state.selectedProfile, ...action.payload };
        }
        const index = state.profiles.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = { ...state.profiles[index], ...action.payload };
        }
        if (state.currentProfile?.id === action.payload.id) {
          state.currentProfile = { ...state.currentProfile, ...action.payload };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isUploading = false;
        const avatarUrl = action.payload.avatar_url || action.payload.url;
        if (state.selectedProfile) {
          state.selectedProfile.avatar = avatarUrl;
        }
        if (state.currentProfile) {
          state.currentProfile.avatar = avatarUrl;
        }
        const index = state.profiles.findIndex(p => p.id === state.selectedProfile?.id);
        if (index !== -1) {
          state.profiles[index].avatar = avatarUrl;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        if (state.selectedProfile) {
          state.selectedProfile.avatar = null;
        }
        if (state.currentProfile) {
          state.currentProfile.avatar = null;
        }
        const index = state.profiles.findIndex(p => p.id === state.selectedProfile?.id);
        if (index !== -1) {
          state.profiles[index].avatar = null;
        }
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        const skills = action.payload.skills || [
          ...(state.currentProfile?.skills || state.selectedProfile?.skills || []),
          action.payload.skill || action.payload,
        ];
        if (state.selectedProfile) {
          state.selectedProfile.skills = skills;
        }
        if (state.currentProfile) {
          state.currentProfile.skills = skills;
        }
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        const skills = action.payload.skills;
        if (skills) {
          if (state.selectedProfile) state.selectedProfile.skills = skills;
          if (state.currentProfile) state.currentProfile.skills = skills;
        } else if (action.payload.name) {
          if (state.selectedProfile?.skills) {
            const idx = state.selectedProfile.skills.findIndex(s => s.name === action.payload.name);
            if (idx !== -1) state.selectedProfile.skills[idx] = action.payload;
          }
          if (state.currentProfile?.skills) {
            const idx = state.currentProfile.skills.findIndex(s => s.name === action.payload.name);
            if (idx !== -1) state.currentProfile.skills[idx] = action.payload;
          }
        }
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        const skills = action.payload.skills || (
          state.currentProfile?.skills?.filter(s => s.name !== action.payload) || []
        );
        if (state.selectedProfile) {
          state.selectedProfile.skills = skills;
        }
        if (state.currentProfile) {
          state.currentProfile.skills = skills;
        }
      })
      .addCase(addCertification.fulfilled, (state, action) => {
        const certs = action.payload.certifications || [
          ...(state.currentProfile?.certifications || state.selectedProfile?.certifications || []),
          action.payload.certification || action.payload,
        ];
        if (state.selectedProfile) {
          state.selectedProfile.certifications = certs;
        }
        if (state.currentProfile) {
          state.currentProfile.certifications = certs;
        }
      })
      .addCase(removeCertification.fulfilled, (state, action) => {
        const certs = action.payload.certifications || (
          state.currentProfile?.certifications?.filter(c => c.name !== action.payload) || []
        );
        if (state.selectedProfile) {
          state.selectedProfile.certifications = certs;
        }
        if (state.currentProfile) {
          state.currentProfile.certifications = certs;
        }
      })
      .addCase(fetchMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentProfile = { ...state.currentProfile, ...action.payload };
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearProfileError,
  setProfileFilters,
  setProfilePage,
  clearSelectedProfile,
  resetProfiles,
} = profileSlice.actions;

export default profileSlice.reducer;