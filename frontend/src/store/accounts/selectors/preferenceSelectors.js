export const selectPreferencesState = (state) => state.preferences || {};

export const selectUserPreferences = (state) => state.preferences?.userPreferences || null;

export const selectUserPreferenceList = (state) => state.preferences?.userPreferenceList || [];

export const selectSelectedUserPreference = (state) => state.preferences?.selectedUserPreference || null;

export const selectTenantPreferences = (state) => state.preferences?.tenantPreferences || null;

export const selectTenantPreferenceList = (state) => state.preferences?.tenantPreferenceList || [];

export const selectSelectedTenantPreference = (state) => state.preferences?.selectedTenantPreference || null;

export const selectBranding = (state) => state.preferences?.branding || null;

export const selectPreferencesLoading = (state) => state.preferences?.isLoading || false;

export const selectPreferencesUpdating = (state) => state.preferences?.isUpdating || false;

export const selectPreferencesError = (state) => state.preferences?.error || null;

export const selectNotificationSettings = (state) => {
  const prefs = state.preferences?.userPreferences;
  return prefs?.notification_settings || {};
};

export const selectDashboardPreferences = (state) => {
  const prefs = state.preferences?.userPreferences;
  return prefs?.dashboard_preferences || {};
};

export const selectItemsPerPage = (state) => {
  const prefs = state.preferences?.userPreferences;
  return prefs?.items_per_page || 20;
};

export const selectDefaultDashboard = (state) => {
  const prefs = state.preferences?.userPreferences;
  return prefs?.default_dashboard || '';
};

export const selectTenantFeatures = (state) => {
  const prefs = state.preferences?.tenantPreferences;
  return prefs?.features || {};
};

export const selectTenantBranding = (state) => {
  const prefs = state.preferences?.tenantPreferences || state.preferences?.branding;
  return {
    logo_url: prefs?.logo_url || null,
    favicon_url: prefs?.favicon_url || null,
    primary_color: prefs?.primary_color || '#3B82F6',
    secondary_color: prefs?.secondary_color || '#6B7280',
  };
};

export const selectTenantDefaultLanguage = (state) => {
  const prefs = state.preferences?.tenantPreferences;
  return prefs?.default_language || 'en';
};

export const selectTenantDefaultTimezone = (state) => {
  const prefs = state.preferences?.tenantPreferences;
  return prefs?.default_timezone || 'Africa/Nairobi';
};

export const selectIsFeatureEnabled = (state, featureName) => {
  const features = state.preferences?.tenantPreferences?.features || {};
  return features[featureName] === true;
};