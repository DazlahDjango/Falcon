export const selectQuotas = (state) => state.configQuota?.quotas || [];
export const selectCurrentQuota = (state) => state.configQuota?.currentQuota;
export const selectOverThresholdQuotas = (state) => state.configQuota?.overThresholdQuotas || [];
export const selectExceededQuotas = (state) => state.configQuota?.exceededQuotas || [];
export const selectQuotaStats = (state) => state.configQuota?.stats || {};
export const selectQuotaFilters = (state) => state.configQuota?.filters || {};
export const selectQuotaPagination = (state) => state.configQuota?.pagination || {};
export const selectQuotaLoading = (state) => state.configQuota?.loading || false;
export const selectQuotaError = (state) => state.configQuota?.error;

export const selectQuotaForTenant = (state, tenantId) => selectQuotas(state).find(q => q.tenant_id === tenantId);
export const selectQuotaForApp = (state, appName) => selectQuotas(state).find(q => q.app_name === appName);
export const selectSystemQuota = (state) => selectQuotas(state).find(q => q.tenant === null && q.app === null);
export const selectTotalUsagePercent = (state) => selectQuotaStats(state).usagePercent || 0;