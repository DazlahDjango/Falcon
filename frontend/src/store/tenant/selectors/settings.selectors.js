import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  settings: null,
  systemSettings: null,
  sectionSettings: {},
  loading: false,
  submitting: false,
  error: null,
  version: 0,
  resetResult: null,
};

export const selectSettingsState = (state) => {
    return state?.settings || state?.tenant?.settings || initialState;
};

export const selectSettings = createSelector(
  [selectSettingsState],
  (state) => state.settings || null
);

export const selectSystemSettings = createSelector(
  [selectSettingsState],
  (state) => state.systemSettings || null
);

export const selectSettingsLoading = createSelector(
  [selectSettingsState],
  (state) => state.loading || false
);

export const selectSettingsSubmitting = createSelector(
  [selectSettingsState],
  (state) => state.submitting || false
);

export const selectSettingsError = createSelector(
  [selectSettingsState],
  (state) => state.error || null
);

export const selectSettingsVersion = createSelector(
  [selectSettingsState],
  (state) => state.version || 0
);

export const selectResetResult = createSelector(
  [selectSettingsState],
  (state) => state.resetResult || null
);

export const selectSettingsSection = createSelector(
  [selectSettingsState, (state, section) => section],
  (state, section) => state.sectionSettings?.[section] || null
);

export const selectAllSections = createSelector(
  [selectSettingsState],
  (state) => state.sectionSettings || {}
);

export const selectIsolationSettings = createSelector(
  [selectSettings],
  (settings) => settings?.isolation || null
);

export const selectQuotaSettings = createSelector(
  [selectSettings],
  (settings) => settings?.quotas || null
);

export const selectBrandingSettings = createSelector(
  [selectSettings],
  (settings) => settings?.branding || null
);

export const selectFeatureSettings = createSelector(
  [selectSettings],
  (settings) => settings?.features || null
);

export const selectNotificationSettings = createSelector(
  [selectSettings],
  (settings) => settings?.notifications || null
);

export const selectIsolationEnabled = createSelector(
  [selectIsolationSettings],
  (isolation) => isolation?.enforce_schema_isolation || false
);

export const selectQuotaBlockingEnabled = createSelector(
  [selectQuotaSettings],
  (quotas) => quotas?.block_on_exceeded || false
);

export const selectPrimaryColor = createSelector(
  [selectBrandingSettings],
  (branding) => branding?.primary_color || '#2563EB'
);

export const selectSecondaryColor = createSelector(
  [selectBrandingSettings],
  (branding) => branding?.secondary_color || '#7C3AED'
);

export const selectFeatureEnabled = createSelector(
  [selectFeatureSettings, (state, feature) => feature],
  (features, feature) => features?.[feature] || false
);

export const selectCustomDomainsEnabled = createSelector(
  [selectFeatureSettings],
  (features) => features?.custom_domains || false
);

export const selectSslAutoRenewEnabled = createSelector(
  [selectFeatureSettings],
  (features) => features?.ssl_auto_renew || false
);

export const selectAuditLogsEnabled = createSelector(
  [selectFeatureSettings],
  (features) => features?.audit_logs || false
);

export const selectNotificationPreference = createSelector(
  [selectNotificationSettings, (state, key) => key],
  (notifications, key) => notifications?.[key] || false
);

export const selectDailySummaryEnabled = createSelector(
  [selectNotificationSettings],
  (notifications) => notifications?.daily_summary || false
);

export const selectWeeklyReportEnabled = createSelector(
  [selectNotificationSettings],
  (notifications) => notifications?.weekly_report || false
);

export const selectHasSettings = createSelector(
  [selectSettings],
  (settings) => settings !== null
);

export const selectHasSystemSettings = createSelector(
  [selectSystemSettings],
  (settings) => settings !== null
);

export const selectSettingsSectionKeys = createSelector(
  [selectAllSections],
  (sections) => Object.keys(sections) || []
);