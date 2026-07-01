export const selectAuditState = (state) => state.auditLogs || {};

export const selectAuditLogs = (state) => state.auditLogs?.logs || [];

export const selectSelectedAuditLog = (state) => state.auditLogs?.selectedLog || null;

export const selectUserActivity = (state) => state.auditLogs?.userActivity || [];

export const selectUserActivitySummary = (state) => state.auditLogs?.userActivitySummary || null;

export const selectTenantActivitySummary = (state) => state.auditLogs?.tenantActivitySummary || null;

export const selectSecurityEvents = (state) => state.auditLogs?.securityEvents || [];

export const selectAnomalyDetection = (state) => state.auditLogs?.anomalyDetection || null;

export const selectComplianceReport = (state) => state.auditLogs?.complianceReport || null;

export const selectObjectHistory = (state) => state.auditLogs?.objectHistory || [];

export const selectAuditLoading = (state) => state.auditLogs?.isLoading || false;

export const selectAuditExporting = (state) => state.auditLogs?.isExporting || false;

export const selectAuditError = (state) => state.auditLogs?.error || null;

export const selectAuditPagination = (state) => state.auditLogs?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectAuditFilters = (state) => state.auditLogs?.filters || {};

export const selectAuditLogById = (state, id) => {
  const logs = state.auditLogs?.logs || [];
  return logs.find(l => l.id === id) || null;
};

export const selectAuditLogsBySeverity = (state, severity) => {
  const logs = state.auditLogs?.logs || [];
  return logs.filter(l => l.severity === severity);
};

export const selectAuditLogsByActionType = (state, actionType) => {
  const logs = state.auditLogs?.logs || [];
  return logs.filter(l => l.action_type === actionType);
};

export const selectSecurityEventsCount = (state) => {
  const events = state.auditLogs?.securityEvents || [];
  return events.length;
};

export const selectAnomalousUsers = (state) => {
  const anomaly = state.auditLogs?.anomalyDetection;
  return anomaly?.anomalous_users || [];
};

export const selectAuditLogCount = (state) => {
  const logs = state.auditLogs?.logs || [];
  return logs.length;
};