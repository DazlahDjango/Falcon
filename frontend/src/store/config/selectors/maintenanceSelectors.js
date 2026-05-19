export const selectMaintenanceWindows = (state) => state.configMaintenance?.windows || [];
export const selectCurrentMaintenanceWindow = (state) => state.configMaintenance?.currentWindow;
export const selectMaintenanceLogs = (state) => state.configMaintenance?.logs || [];
export const selectActiveMaintenanceWindows = (state) => state.configMaintenance?.activeWindows || [];
export const selectUpcomingMaintenanceWindows = (state) => state.configMaintenance?.upcomingWindows || [];
export const selectMaintenanceStats = (state) => state.configMaintenance?.stats || {};
export const selectMaintenanceFilters = (state) => state.configMaintenance?.filters || {};
export const selectMaintenancePagination = (state) => state.configMaintenance?.pagination || {};
export const selectMaintenanceLoading = (state) => state.configMaintenance?.loading || false;
export const selectMaintenanceError = (state) => state.configMaintenance?.error;
export const selectGlobalMaintenanceActive = (state) => state.configMaintenance?.globalMaintenanceActive || false;
export const selectGlobalMaintenanceType = (state) => state.configMaintenance?.globalMaintenanceType;
export const selectGlobalMaintenanceMessage = (state) => state.configMaintenance?.globalMaintenanceMessage;

export const selectIsAppUnderMaintenance = (state, appName) => {
  const globalActive = selectGlobalMaintenanceActive(state);
  const globalType = selectGlobalMaintenanceType(state);
  if (globalActive && globalType === 'full') return true;
  if (globalActive && globalType === 'partial') {
    const affectedApps = state.configMaintenance?.globalMaintenanceAffectedApps || [];
    return affectedApps.includes(appName);
  }
  return false;
};
export const selectActiveMaintenanceCount = (state) => selectActiveMaintenanceWindows(state).length;
export const selectTotalDowntimeMinutes = (state) => selectMaintenanceStats(state).totalDowntimeMinutes || 0;