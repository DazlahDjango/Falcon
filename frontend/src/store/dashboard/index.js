// frontend/src/store/dashboard/index.js

// Slices
export { default as dashboardReducer } from './slices/dashboardSlice';
export { default as dashboardConfigReducer } from './slices/dashboardConfigSlice';
export { default as dashboardAlertsReducer } from './slices/dashboardAlertsSlice';
export { default as dashboardExportsReducer } from './slices/dashboardExportsSlice';
export { default as dashboardComparisonsReducer } from './slices/dashboardComparisonsSlice';

// ===== ADD NEW SLICES =====
export { default as managerDashboardReducer } from './slices/managerDashboardSlice';
export { default as staffDashboardReducer } from './slices/staffDashboardSlice';
export { default as championDashboardReducer } from './slices/championDashboardSlice';
export { default as readOnlyDashboardReducer } from './slices/readOnlyDashboardSlice';

// Actions
export * from './slices/dashboardSlice';
export * from './slices/dashboardConfigSlice';
export * from './slices/dashboardAlertsSlice';
export * from './slices/dashboardExportsSlice';
export * from './slices/dashboardComparisonsSlice';

// ===== ADD NEW ACTIONS =====
export * from './slices/managerDashboardSlice';
export * from './slices/staffDashboardSlice';
export * from './slices/championDashboardSlice';
export * from './slices/readOnlyDashboardSlice';

// Selectors
export * from './selectors/dashboardSelectors';

// Middleware
export {
  dashboardWebsocketMiddleware,
  dashboardCacheMiddleware,
  dashboardThrottleMiddleware,
  disconnectAllWebSockets,
  loadDashboardFromCache,
  loadConfigFromCache,
  loadAlertsFromCache,
  loadExportsFromCache,
  loadComparisonsFromCache,
  getThrottleStatus,
  resetThrottleForUser
} from './middleware';