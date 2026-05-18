export const selectDRPlans = (state) => state.configDR?.plans || [];
export const selectCurrentDRPlan = (state) => state.configDR?.currentPlan;
export const selectDRExecutions = (state) => state.configDR?.executions || [];
export const selectCurrentDRExecution = (state) => state.configDR?.currentExecution;
export const selectDRMetrics = (state) => state.configDR?.metrics || {};
export const selectDRStats = (state) => state.configDR?.stats || {};
export const selectDRFilters = (state) => state.configDR?.filters || {};
export const selectDRPagination = (state) => state.configDR?.pagination || {};
export const selectDRLoading = (state) => state.configDR?.loading || false;
export const selectDRError = (state) => state.configDR?.error;
export const selectActiveDRProgress = (state) => state.configDR?.activeDRProgress;

export const selectActiveDRPlans = (state) => selectDRPlans(state).filter(plan => plan.status === 'active');
export const selectPlansNeedingTesting = (state) => selectDRPlans(state).filter(plan => plan.needs_testing === true);
export const selectRecentDRExecutions = (state, limit = 10) => selectDRExecutions(state).slice(0, limit);
export const selectRTOAchievementRate = (state) => selectDRMetrics(state).rtoAchievementRate || 0;
export const selectRPOAchievementRate = (state) => selectDRMetrics(state).rpoAchievementRate || 0;