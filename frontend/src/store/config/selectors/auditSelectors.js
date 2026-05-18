export const selectAuditLogs = (state) => state.configAudit?.logs || [];
export const selectCurrentAuditLog = (state) => state.configAudit?.currentLog;
export const selectAuditStats = (state) => state.configAudit?.stats || {};
export const selectAuditFilters = (state) => state.configAudit?.filters || {};
export const selectAuditPagination = (state) => state.configAudit?.pagination || {};
export const selectAuditLoading = (state) => state.configAudit?.loading || false;
export const selectAuditError = (state) => state.configAudit?.error;

export const selectAuditLogsByAction = (state, action) => selectAuditLogs(state).filter(log => log.action === action);
export const selectAuditLogsByRole = (state, role) => selectAuditLogs(state).filter(log => log.performed_by_role === role);
export const selectAuditLogsByResult = (state, result) => selectAuditLogs(state).filter(log => log.result === result);
export const selectRecentAuditLogs = (state, limit = 20) => selectAuditLogs(state).slice(0, limit);
export const selectFailedActionsCount = (state) => selectAuditStats(state).failedActions || 0;