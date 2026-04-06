import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as preferencesApi from '../../../services/accounts/api/preferences';
import * as notificationsApi from '../../../services/accounts/api/notifications';

// Async Thunks - User Preferences
// ================================
export const fetchUserPreferences = createAsyncThunk(
    'preferences/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.getUserPreferences();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user preferences');
        }
    }
);

export const updateUserPreferences = createAsyncThunk(
    'preferences/updateUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateUserPreferences(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update user preferences');
        }
    }
);

export const updateNotificationSettings = createAsyncThunk(
    'preferences/updateNotifications',
    async ({ eventType, channels }, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateNotificationSettings(eventType, channels);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update notification settings');
        }
    }
);
export const fetchNotificationSettings = createAsyncThunk(
    'preferences/fetchNotificationSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationsApi.getNotificationPreferences();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to load notification settings');
        }
    }
);

// Async Thunks - Tenant Preferences
// ===================================
export const fetchTenantPreferences = createAsyncThunk(
    'preferences/fetchTenant',
    async (_, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.getTenantPreferences();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant preferences');
        }
    }
);

export const updateTenantPreferences = createAsyncThunk(
    'preferences/updateTenant',
    async (data, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateTenantPreferences(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update tenant preferences');
        }
    }
);

export const updateTenantBranding = createAsyncThunk(
    'preferences/updateBranding',
    async (data, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateTenantBranding(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update tenant branding');
        }
    }
);

// Initial State
// ===============
const initialState = {
    // User Preferences
    userPreferences: {
        notification_settings: {},
        dashboard_preferences: {},
        items_per_page: 20,
        default_dashboard: 'overview',
        collapsed_sidebar: false,
        public_profile: false,
        show_email: true,
        show_phone: false,
        work_start_time: '09:00',
        work_end_time: '17:00',
        working_days: [0, 1, 2, 3, 4] // Monday to Friday
    },
    
    // Tenant Preferences
    tenantPreferences: {
        client_id: null,
        logo_url: null,
        favicon_url: null,
        primary_color: '#2563eb',
        secondary_color: '#7c3aed',
        features: {},
        default_language: 'en',
        available_languages: ['en'],
        default_timezone: 'Africa/Nairobi',
        audit_log_retention_days: 365,
        session_retention_days: 90,
        api_rate_limit: 100,
        webhook_url: null,
        mfa_required_roles: []
    },
    
    // UI State
    isLoading: false,
    isSaving: false,
    error: null,
    lastUpdated: null
};

// Slice
// ============
const preferenceSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetUserPreferences: (state) => {
            state.userPreferences = initialState.userPreferences;
        },
        resetTenantPreferences: (state) => {
            state.tenantPreferences = initialState.tenantPreferences;
        },
        updateLocalUserPreference: (state, action) => {
            const { key, value } = action.payload;
            state.userPreferences[key] = value;
        },
        updateLocalTenantPreference: (state, action) => {
            const { key, value } = action.payload;
            state.tenantPreferences[key] = value;
        },
        setThemePreference: (state, action) => {
            state.userPreferences.theme = action.payload;
        },
        setLanguagePreference: (state, action) => {
            state.userPreferences.language = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // ========== User Preferences ==========
            // Fetch User Preferences
            .addCase(fetchUserPreferences.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserPreferences.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userPreferences = { ...state.userPreferences, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchUserPreferences.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Update User Preferences
            .addCase(updateUserPreferences.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(updateUserPreferences.fulfilled, (state, action) => {
                state.isSaving = false;
                state.userPreferences = { ...state.userPreferences, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateUserPreferences.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })
            
            // Update Notification Settings
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.userPreferences.notification_settings = action.payload;
            })
            
            // ========== Tenant Preferences ==========
            // Fetch Tenant Preferences
            .addCase(fetchTenantPreferences.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTenantPreferences.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tenantPreferences = { ...state.tenantPreferences, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchTenantPreferences.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Update Tenant Preferences
            .addCase(updateTenantPreferences.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(updateTenantPreferences.fulfilled, (state, action) => {
                state.isSaving = false;
                state.tenantPreferences = { ...state.tenantPreferences, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateTenantPreferences.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })
            
            // Update Tenant Branding
            .addCase(updateTenantBranding.fulfilled, (state, action) => {
                state.tenantPreferences = { ...state.tenantPreferences, ...action.payload };
            });
    }
});

// ============================================================================
// Actions
// ============================================================================

export const {
    clearError,
    resetUserPreferences,
    resetTenantPreferences,
    updateLocalUserPreference,
    updateLocalTenantPreference,
    setThemePreference,
    setLanguagePreference
} = preferenceSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

// User Preference Selectors
export const selectUserPreferences = (state) => state.preferences.userPreferences;
export const selectNotificationSettings = (state) => state.preferences.userPreferences.notification_settings;
export const selectDashboardPreferences = (state) => state.preferences.userPreferences.dashboard_preferences;
export const selectItemsPerPage = (state) => state.preferences.userPreferences.items_per_page;
export const selectCollapsedSidebar = (state) => state.preferences.userPreferences.collapsed_sidebar;
export const selectThemePreference = (state) => state.preferences.userPreferences.theme || 'light';
export const selectLanguagePreference = (state) => state.preferences.userPreferences.language || 'en';

// Tenant Preference Selectors
export const selectTenantPreferences = (state) => state.preferences.tenantPreferences;
export const selectTenantBranding = (state) => ({
    logo_url: state.preferences.tenantPreferences.logo_url,
    favicon_url: state.preferences.tenantPreferences.favicon_url,
    primary_color: state.preferences.tenantPreferences.primary_color,
    secondary_color: state.preferences.tenantPreferences.secondary_color
});
export const selectTenantFeatures = (state) => state.preferences.tenantPreferences.features;
export const selectMfaRequiredRoles = (state) => state.preferences.tenantPreferences.mfa_required_roles;
export const selectDefaultTimezone = (state) => state.preferences.tenantPreferences.default_timezone;
export const selectDefaultLanguage = (state) => state.preferences.tenantPreferences.default_language;

// UI Selectors
export const selectPreferencesLoading = (state) => state.preferences.isLoading;
export const selectPreferencesSaving = (state) => state.preferences.isSaving;
export const selectPreferencesError = (state) => state.preferences.error;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a feature is enabled for the tenant
 * @param {Object} state - Redux state
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean}
 */
export const isFeatureEnabled = (state, featureName) => {
    return state.preferences.tenantPreferences.features?.[featureName] || false;
};

/**
 * Check if MFA is required for a role
 * @param {Object} state - Redux state
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const isMfaRequiredForRole = (state, role) => {
    return state.preferences.tenantPreferences.mfa_required_roles?.includes(role) || false;
};

export default preferenceSlice.reducer;