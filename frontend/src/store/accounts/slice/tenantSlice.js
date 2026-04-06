import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as preferencesApi from '../../../services/accounts/api/preferences';

// Async Thunks
// ==============
export const fetchTenantPreferences = createAsyncThunk(
    'tenant/fetchPreferences',
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
    'tenant/updatePreferences',
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
    'tenant/updateBranding',
    async (data, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateTenantBranding(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update branding');
        }
    }
);
export const fetchTenantSettings = createAsyncThunk(
    'tenant/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.getTenantPreferences();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant settings');
        }
    }
);

export const updateTenantSettings = createAsyncThunk(
    'tenant/updateSettings',
    async (data, { rejectWithValue }) => {
        try {
            const response = await preferencesApi.updateTenantPreferences(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update tenant settings');
        }
    }
);

// Initial State
// =============
const initialState = {
    tenant: null,
    preferences: null,
    branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        logoUrl: null,
        faviconUrl: null
    },
    features: {},
    isLoading: false,
    error: null
};

// Slice
// ======
const tenantSlice = createSlice({
    name: 'tenant',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setTenant: (state, action) => {
            state.tenant = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Preferences
            .addCase(fetchTenantPreferences.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTenantPreferences.fulfilled, (state, action) => {
                state.isLoading = false;
                state.preferences = action.payload;
                state.tenant = {
                    id: action.payload.client_id,
                    name: action.payload.name,
                    slug: action.payload.slug,
                    subscription_plan: action.payload.subscription_plan
                };
                state.branding = {
                    primaryColor: action.payload.primary_color || '#2563eb',
                    secondaryColor: action.payload.secondary_color || '#7c3aed',
                    logoUrl: action.payload.logo_url,
                    faviconUrl: action.payload.favicon_url
                };
                state.features = action.payload.features || {};
            })
            .addCase(fetchTenantPreferences.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Preferences
            .addCase(updateTenantPreferences.fulfilled, (state, action) => {
                state.preferences = { ...state.preferences, ...action.payload };
                state.features = action.payload.features || state.features;
            })
            // Update Branding
            .addCase(updateTenantBranding.fulfilled, (state, action) => {
                state.branding = {
                    ...state.branding,
                    ...action.payload
                };
                if (state.preferences) {
                    state.preferences.primary_color = action.payload.primaryColor;
                    state.preferences.secondary_color = action.payload.secondaryColor;
                    state.preferences.logo_url = action.payload.logoUrl;
                    state.preferences.favicon_url = action.payload.faviconUrl;
                }
            });
    }
});
export const { clearError, setTenant } = tenantSlice.actions;
// Selectors
export const selectTenant = (state) => state.tenant.tenant;
export const selectTenantBranding = (state) => state.tenant.branding;
export const selectTenantFeatures = (state) => state.tenant.features;

export default tenantSlice.reducer;