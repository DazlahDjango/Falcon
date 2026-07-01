import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as preferencesApi from '../../../services/accounts/api/preferences';

const initialState = {
  userPreferences: null,
  userPreferenceList: [],
  selectedUserPreference: null,
  tenantPreferences: null,
  tenantPreferenceList: [],
  selectedTenantPreference: null,
  branding: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const fetchUserPreferences = createAsyncThunk(
  'preferences/fetchUserPreferences',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.preferences.pagination;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...params,
      };
      const response = await preferencesApi.getUserPreferences(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user preferences');
    }
  }
);

export const fetchUserPreference = createAsyncThunk(
  'preferences/fetchUserPreference',
  async (id, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getUserPreference(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user preference');
    }
  }
);

export const updateUserPreference = createAsyncThunk(
  'preferences/updateUserPreference',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateUserPreference(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user preference');
    }
  }
);

export const fetchMyPreferences = createAsyncThunk(
  'preferences/fetchMyPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getMyPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch my preferences');
    }
  }
);

export const updateMyPreferences = createAsyncThunk(
  'preferences/updateMyPreferences',
  async (data, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateMyPreferences(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update my preferences');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'preferences/updateNotificationSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateNotificationSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update notification settings');
    }
  }
);

export const fetchTenantPreferences = createAsyncThunk(
  'preferences/fetchTenantPreferences',
  async (params, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getTenantPreferences(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant preferences');
    }
  }
);

export const fetchTenantPreference = createAsyncThunk(
  'preferences/fetchTenantPreference',
  async (id, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getTenantPreference(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant preference');
    }
  }
);

export const updateTenantPreference = createAsyncThunk(
  'preferences/updateTenantPreference',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateTenantPreference(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update tenant preference');
    }
  }
);

export const fetchMyTenantPreferences = createAsyncThunk(
  'preferences/fetchMyTenantPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getMyTenantPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant preferences');
    }
  }
);

export const updateMyTenantPreferences = createAsyncThunk(
  'preferences/updateMyTenantPreferences',
  async (data, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateMyTenantPreferences(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update tenant preferences');
    }
  }
);

export const updateBranding = createAsyncThunk(
  'preferences/updateBranding',
  async (data, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateBranding(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update branding');
    }
  }
);

const preferenceSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferenceError: (state) => {
      state.error = null;
    },
    clearSelectedUserPreference: (state) => {
      state.selectedUserPreference = null;
    },
    clearSelectedTenantPreference: (state) => {
      state.selectedTenantPreference = null;
    },
    resetPreferences: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.userPreferenceList = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserPreference.fulfilled, (state, action) => {
        state.selectedUserPreference = action.payload;
      })
      .addCase(updateUserPreference.fulfilled, (state, action) => {
        const index = state.userPreferenceList.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.userPreferenceList[index] = { ...state.userPreferenceList[index], ...action.payload };
        }
        if (state.selectedUserPreference?.id === action.payload.id) {
          state.selectedUserPreference = { ...state.selectedUserPreference, ...action.payload };
        }
        if (state.userPreferences?.id === action.payload.id) {
          state.userPreferences = { ...state.userPreferences, ...action.payload };
        }
      })
      .addCase(fetchMyPreferences.fulfilled, (state, action) => {
        state.userPreferences = action.payload;
      })
      .addCase(updateMyPreferences.fulfilled, (state, action) => {
        state.userPreferences = { ...state.userPreferences, ...action.payload };
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        if (state.userPreferences) {
          state.userPreferences.notification_settings = action.payload;
        }
      })
      .addCase(fetchTenantPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.tenantPreferenceList = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchTenantPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTenantPreference.fulfilled, (state, action) => {
        state.selectedTenantPreference = action.payload;
      })
      .addCase(updateTenantPreference.fulfilled, (state, action) => {
        const index = state.tenantPreferenceList.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.tenantPreferenceList[index] = { ...state.tenantPreferenceList[index], ...action.payload };
        }
        if (state.selectedTenantPreference?.id === action.payload.id) {
          state.selectedTenantPreference = { ...state.selectedTenantPreference, ...action.payload };
        }
        if (state.tenantPreferences?.id === action.payload.id) {
          state.tenantPreferences = { ...state.tenantPreferences, ...action.payload };
        }
      })
      .addCase(fetchMyTenantPreferences.fulfilled, (state, action) => {
        state.tenantPreferences = action.payload;
        state.branding = {
          logo_url: action.payload.logo_url,
          favicon_url: action.payload.favicon_url,
          primary_color: action.payload.primary_color,
          secondary_color: action.payload.secondary_color,
        };
      })
      .addCase(updateMyTenantPreferences.fulfilled, (state, action) => {
        state.tenantPreferences = { ...state.tenantPreferences, ...action.payload };
      })
      .addCase(updateBranding.fulfilled, (state, action) => {
        state.branding = { ...state.branding, ...action.payload };
        if (state.tenantPreferences) {
          state.tenantPreferences.logo_url = action.payload.logo_url;
          state.tenantPreferences.favicon_url = action.payload.favicon_url;
          state.tenantPreferences.primary_color = action.payload.primary_color;
          state.tenantPreferences.secondary_color = action.payload.secondary_color;
        }
      });
  },
});

export const {
  clearPreferenceError,
  clearSelectedUserPreference,
  clearSelectedTenantPreference,
  resetPreferences,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;