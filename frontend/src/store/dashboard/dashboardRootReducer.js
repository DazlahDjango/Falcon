import { combineReducers } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import dashboardConfigReducer from './slices/dashboardConfigSlice';
import dashboardAlertsReducer from './slices/dashboardAlertsSlice';
import dashboardExportsReducer from './slices/dashboardExportsSlice';
import dashboardComparisonsReducer from './slices/dashboardComparisonsSlice';
import managerDashboardReducer from './slices/managerDashboardSlice';
import staffDashboardReducer from './slices/staffDashboardSlice';
import championDashboardReducer from './slices/championDashboardSlice';
import readOnlyDashboardReducer from './slices/readOnlyDashboardSlice';

import kpiModuleReducer from '../kpi/index';

import { default as adminReducer } from '../accounts/slice/adminSlice';
import { default as authReducer} from '../accounts/slice/authSlice';
import { default as userReducer } from '../accounts/slice/userSlice';
import { default as profileReducer } from '../accounts/slice/profileSlice';
import { default as mfaReducer } from '../accounts/slice/mfaSlice';
import { default as roleReducer } from '../accounts/slice/roleSlice';
import { default as permissionReducer } from '../accounts/slice/permissionSlice';
import { default as sessionReducer } from '../accounts/slice/sessionSlice';
import { default as auditReducer } from '../accounts/slice/auditSlice';
import { default as preferenceReducer } from '../accounts/slice/preferenceSlice';
import { default as adminMfaReducer } from '../accounts/slice/adminMfaSlice';
import { default as securityReducer } from '../accounts/slice/securitySlice';
import { default as systemSettingsReducer } from '../accounts/slice/systemSettingsSlice';
import { default as accountsUiReducer } from '../accounts/slice/uiSlice';

/**
 * PMS dashboard state — mounted only via DashboardStoreProvider (not app rootReducer).
 */
const dashboardRootReducer = combineReducers({
  dashboard: dashboardReducer,
  dashboardConfig: dashboardConfigReducer,
  dashboardAlerts: dashboardAlertsReducer,
  dashboardExports: dashboardExportsReducer,
  dashboardComparisons: dashboardComparisonsReducer,
  managerDashboard: managerDashboardReducer,
  staffDashboard: staffDashboardReducer,
  championDashboard: championDashboardReducer,
  readOnlyDashboard: readOnlyDashboardReducer,
  // KPI State
  kpi: kpiModuleReducer,
  kpis: kpiModuleReducer,
  auth: authReducer,
  users: userReducer,
  roles: roleReducer,
  permissions: permissionReducer,
  sessions: sessionReducer,
  auditLogs: auditReducer,
  admin: adminReducer,
  preferences: preferenceReducer,
  mfa: mfaReducer,
  adminMfa: adminMfaReducer,
  profile: profileReducer,
  ui: accountsUiReducer,
  accountsSecurity: securityReducer,
  systemSettings: systemSettingsReducer,
});

export default dashboardRootReducer;
