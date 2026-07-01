export const selectSystemSettingsState = (state) => state.systemSettings || {};

export const selectSystemSettings = (state) => state.systemSettings?.settings || null;

export const selectSystemSettingsLoading = (state) => state.systemSettings?.isLoading || false;

export const selectSystemSettingsUpdating = (state) => state.systemSettings?.isUpdating || false;

export const selectSystemSettingsResetting = (state) => state.systemSettings?.isResetting || false;

export const selectSystemSettingsSyncing = (state) => state.systemSettings?.isSyncing || false;

export const selectSystemSettingsError = (state) => state.systemSettings?.error || null;

export const selectSystemSettingsVersion = (state) => state.systemSettings?.version || null;

export const selectSystemSettingsValue = (state, key) => {
  const settings = state.systemSettings?.settings;
  if (!settings) return null;
  return settings[key] || null;
};

export const selectSystemMfaConfig = (state) => {
  const settings = state.systemSettings?.settings;
  return settings?.mfa || {};
};

export const selectSystemSessionConfig = (state) => {
  const settings = state.systemSettings?.settings;
  return settings?.sessions || {};
};

export const selectSystemLockoutConfig = (state) => {
  const settings = state.systemSettings?.settings;
  return settings?.lockout || {};
};

export const selectSystemPasswordConfig = (state) => {
  const settings = state.systemSettings?.settings;
  return settings?.password || {};
};

export const selectSystemAuditConfig = (state) => {
  const settings = state.systemSettings?.settings;
  return settings?.audit || {};
};