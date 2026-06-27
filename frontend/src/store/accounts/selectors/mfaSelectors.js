export const selectMfaState = (state) => state.mfa || {};

export const selectMfaDevices = (state) => state.mfa?.devices || [];

export const selectSelectedMfaDevice = (state) => state.mfa?.selectedDevice || null;

export const selectMfaStatus = (state) => state.mfa?.mfaStatus || null;

export const selectMfaBackupCodes = (state) => state.mfa?.backupCodes || [];

export const selectMfaBackupCodesStatus = (state) => state.mfa?.backupCodesStatus || null;

export const selectMfaActivity = (state) => state.mfa?.mfaActivity || [];

export const selectMfaFailureRate = (state) => state.mfa?.mfaFailureRate || null;

export const selectMfaAuditLogs = (state) => state.mfa?.auditLogs || [];

export const selectMfaAuditSummary = (state) => state.mfa?.auditSummary || null;

export const selectMfaLoading = (state) => state.mfa?.isLoading || false;

export const selectMfaSettingUp = (state) => state.mfa?.isSettingUp || false;

export const selectMfaVerifying = (state) => state.mfa?.isVerifying || false;

export const selectMfaGenerating = (state) => state.mfa?.isGenerating || false;

export const selectMfaError = (state) => state.mfa?.error || null;

export const selectMfaPagination = (state) => state.mfa?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectMfaFilters = (state) => state.mfa?.filters || {};

export const selectMfaDeviceById = (state, id) => {
  const devices = state.mfa?.devices || [];
  return devices.find(d => d.id === id) || null;
};

export const selectMfaPrimaryDevice = (state) => {
  const devices = state.mfa?.devices || [];
  return devices.find(d => d.is_primary === true) || null;
};

export const selectMfaVerifiedDevices = (state) => {
  const devices = state.mfa?.devices || [];
  return devices.filter(d => d.is_verified === true);
};

export const selectMfaActiveDevices = (state) => {
  const devices = state.mfa?.devices || [];
  return devices.filter(d => d.is_active === true);
};

export const selectMfaTotpDevices = (state) => {
  const devices = state.mfa?.devices || [];
  return devices.filter(d => d.device_type === 'totp');
};

export const selectMfaEnabled = (state) => {
  const status = state.mfa?.mfaStatus;
  return status?.enabled || false;
};

export const selectMfaHasDevices = (state) => {
  const status = state.mfa?.mfaStatus;
  return status?.has_active_devices || false;
};

export const selectMfaBackupCodesRemaining = (state) => {
  const status = state.mfa?.mfaStatus;
  return status?.backup_codes_remaining || 0;
};

export const selectMfaRequiresMfa = (state) => {
  const status = state.mfa?.mfaStatus;
  return status?.requires_mfa || false;
};