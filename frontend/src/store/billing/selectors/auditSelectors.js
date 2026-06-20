import { createSelector } from '@reduxjs/toolkit';

const selectAuditState = (state) => state.billing?.audit || {};

export const selectAuditLogs = createSelector([selectAuditState], (audit) => audit.items || []);
export const selectAuditSummary = createSelector([selectAuditState], (audit) => audit.summary);
export const selectAuditPagination = createSelector([selectAuditState], (audit) => audit.pagination);
export const selectAuditFilters = createSelector([selectAuditState], (audit) => audit.filters);
export const selectAuditLoading = createSelector([selectAuditState], (audit) => audit.loading);
export const selectAuditError = createSelector([selectAuditState], (audit) => audit.error);
export const selectAuditExporting = createSelector([selectAuditState], (audit) => audit.exporting);

export const selectAuditLogsByAction = (action) => createSelector([selectAuditLogs], (logs) => logs.filter(l => l.action === action));
export const selectAuditLogsByResource = (resourceType) => createSelector([selectAuditLogs], (logs) => logs.filter(l => l.resource_type === resourceType));
export const selectAuditLogsByUser = (userEmail) => createSelector([selectAuditLogs], (logs) => logs.filter(l => l.user_email === userEmail));
export const selectFailedAuditLogs = createSelector([selectAuditLogs], (logs) => logs.filter(l => !l.success));
export const selectSuccessfulAuditLogs = createSelector([selectAuditLogs], (logs) => logs.filter(l => l.success));
export const selectRecentAuditLogs = (limit = 20) => createSelector([selectAuditLogs], (logs) => logs.slice(0, limit));
export const selectAuditSummaryStats = createSelector([selectAuditSummary], (summary) => ({
    totalActions: summary?.total_actions || 0,
    failedActions: summary?.failed_actions || 0,
    successRate: summary?.success_rate || 0,
    byAction: summary?.by_action || [],
    byResource: summary?.by_resource || [],
}));