import { createSlice } from '@reduxjs/toolkit';
import { apiToReduxSettings } from '../../../utils/config/settingsMapper';

const initialState = {
  version: 1,
  storageType: 's3',
  encryptionEnabled: true,
  compressionEnabled: true,
  defaultRetentionDays: 30,
  maintenanceAutoApprove: false,
  backupConcurrencyLimit: 4,
  healthCheckInterval: 300,
  drAutoFailover: false,
  notificationChannels: ['email', 'in_app'],
  alertThresholds: {
    backupFailure: 3,
    maintenanceOverlap: true,
    quotaWarningPercent: 80,
    healthCheckConsecutiveFailures: 3,
    maxResponseMs: 5000,
  },
  sections: {
    backup: {},
    maintenance: {},
    dr: {},
    notifications: {},
    storage: {},
    alert_thresholds: {},
  },
  loading: false,
  error: null,
  hydrated: false,
};

const configSettingsSlice = createSlice({
  name: 'configSettings',
  initialState,
  reducers: {
    hydrateFromApi: (state, action) => {
      const mapped = apiToReduxSettings(action.payload);
      return { ...state, ...mapped, loading: false, error: null, hydrated: true };
    },
    updateSection: (state, action) => {
      const { section, data } = action.payload;
      state.sections[section] = { ...state.sections[section], ...data };
    },
    setStorageType: (state, action) => { state.storageType = action.payload; },
    setEncryptionEnabled: (state, action) => { state.encryptionEnabled = action.payload; },
    setCompressionEnabled: (state, action) => { state.compressionEnabled = action.payload; },
    setDefaultRetentionDays: (state, action) => { state.defaultRetentionDays = action.payload; },
    setMaintenanceAutoApprove: (state, action) => { state.maintenanceAutoApprove = action.payload; },
    setBackupConcurrencyLimit: (state, action) => { state.backupConcurrencyLimit = action.payload; },
    setHealthCheckInterval: (state, action) => { state.healthCheckInterval = action.payload; },
    setDRAutoFailover: (state, action) => { state.drAutoFailover = action.payload; },
    setNotificationChannels: (state, action) => { state.notificationChannels = action.payload; },
    setAlertThresholds: (state, action) => {
      state.alertThresholds = { ...state.alertThresholds, ...action.payload };
    },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    resetConfigSettings: () => initialState,
  },
});

export const {
  hydrateFromApi,
  updateSection,
  setStorageType,
  setEncryptionEnabled,
  setCompressionEnabled,
  setDefaultRetentionDays,
  setMaintenanceAutoApprove,
  setBackupConcurrencyLimit,
  setHealthCheckInterval,
  setDRAutoFailover,
  setNotificationChannels,
  setAlertThresholds,
  setLoading,
  setError,
  resetConfigSettings,
} = configSettingsSlice.actions;

export default configSettingsSlice.reducer;
