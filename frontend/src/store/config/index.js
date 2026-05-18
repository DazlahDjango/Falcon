// frontend/src/store/config/index.js
import { combineReducers } from '@reduxjs/toolkit';
import {
  configSettingsReducer,
  backupReducer,
  maintenanceReducer,
  drReducer,
  healthReducer,
  scheduleReducer,
  quotaReducer,
  encryptionReducer,
  auditReducer,
  configDashboardReducer
} from './slices';

export const configReducer = combineReducers({
  settings: configSettingsReducer,
  backup: backupReducer,
  maintenance: maintenanceReducer,
  disasterRecovery: drReducer,
  health: healthReducer,
  schedule: scheduleReducer,
  quota: quotaReducer,
  encryption: encryptionReducer,
  audit: auditReducer,
  dashboard: configDashboardReducer
});

export * from './selectors';
export * from './slices';
export * from './middleware';