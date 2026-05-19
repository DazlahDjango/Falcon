export const maintenanceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type === 'maintenance/startMaintenance/fulfilled') {
    console.log('[MaintenanceMiddleware] Maintenance started:', action.payload);
    const { dispatch } = store;
    dispatch({ type: 'maintenance/fetchActiveWindows' });
    setTimeout(() => {
      dispatch({ type: 'configDashboard/fetchOverview' });
    }, 500);
  }
  if (action.type === 'maintenance/stopMaintenance/fulfilled') {
    console.log('[MaintenanceMiddleware] Maintenance stopped:', action.payload);
    const { dispatch } = store;
    dispatch({ type: 'maintenance/fetchActiveWindows' });
    dispatch({ type: 'configDashboard/fetchOverview' });
  }
  if (action.type === 'maintenance/scheduleMaintenance/fulfilled') {
    console.log('[MaintenanceMiddleware] Maintenance scheduled:', action.payload);
  }
  return result;
};