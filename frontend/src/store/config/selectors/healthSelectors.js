export const selectHealthChecks = (state) => state.configHealth?.checks || [];
export const selectLatestHealthChecks = (state) => state.configHealth?.latestChecks || {};
export const selectHealthHistory = (state) => state.configHealth?.history || [];
export const selectSystemMetrics = (state) => state.configHealth?.systemMetrics || {};
export const selectHealthStats = (state) => state.configHealth?.stats || {};
export const selectHealthFilters = (state) => state.configHealth?.filters || {};
export const selectHealthPagination = (state) => state.configHealth?.pagination || {};
export const selectHealthLoading = (state) => state.configHealth?.loading || false;
export const selectHealthError = (state) => state.configHealth?.error;

export const selectHealthForApp = (state, appName) => selectLatestHealthChecks(state)[appName];
export const selectUnhealthyApps = (state) => {
  const checks = selectLatestHealthChecks(state);
  return Object.entries(checks).filter(([_, check]) => check.status === 'unhealthy').map(([appName]) => appName);
};
export const selectHealthyAppCount = (state) => selectHealthStats(state).healthyApps || 0;
export const selectAverageResponseTime = (state) => {
  const checks = Object.values(selectLatestHealthChecks(state));
  const validTimes = checks.filter(c => c.response_time_ms).map(c => c.response_time_ms);
  return validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
};