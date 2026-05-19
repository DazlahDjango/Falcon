import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    healthCheckConsecutiveFailures: 3
  },
  loading: false,
  error: null
};

const configSettingsSlice = createSlice({
  name: 'configSettings',
  initialState,
  reducers: {
    setStorageType: (state, action) => { state.storageType = action.payload; },
    setEncryptionEnabled: (state, action) => { state.encryptionEnabled = action.payload; },
    setCompressionEnabled: (state, action) => { state.compressionEnabled = action.payload; },
    setDefaultRetentionDays: (state, action) => { state.defaultRetentionDays = action.payload; },
    setMaintenanceAutoApprove: (state, action) => { state.maintenanceAutoApprove = action.payload; },
    setBackupConcurrencyLimit: (state, action) => { state.backupConcurrencyLimit = action.payload; },
    setHealthCheckInterval: (state, action) => { state.healthCheckInterval = action.payload; },
    setDRAutoFailover: (state, action) => { state.drAutoFailover = action.payload; },
    setNotificationChannels: (state, action) => { state.notificationChannels = action.payload; },
    setAlertThresholds: (state, action) => { state.alertThresholds = { ...state.alertThresholds, ...action.payload }; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    resetConfigSettings: () => initialState
  }
});

export const {
  setStorageType, setEncryptionEnabled, setCompressionEnabled, setDefaultRetentionDays,
  setMaintenanceAutoApprove, setBackupConcurrencyLimit, setHealthCheckInterval,
  setDRAutoFailover, setNotificationChannels, setAlertThresholds, setLoading, setError, resetConfigSettings
} = configSettingsSlice.actions;
export default configSettingsSlice.reducer;