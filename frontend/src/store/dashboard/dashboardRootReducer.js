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
});

export default dashboardRootReducer;
