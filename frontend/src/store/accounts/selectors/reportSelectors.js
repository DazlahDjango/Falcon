export const selectReportsState = (state) => state.reports || {};

export const selectReports = (state) => state.reports?.reports || {};

export const selectReportLoading = (state) => state.reports?.isLoading || false;

export const selectReportError = (state) => state.reports?.error || null;

// Individual selectors for reports
export const selectUserDirectoryReport = (state) => state.reports?.reports?.userDirectory || null;

export const selectRoleDistributionReport = (state) => state.reports?.reports?.roleDistribution || null;

export const selectDepartmentDistributionReport = (state) => state.reports?.reports?.departmentDistribution || null;

export const selectInactiveUsersReport = (state) => state.reports?.reports?.inactiveUsers || null;

export const selectRecentlyAddedReport = (state) => state.reports?.reports?.recentlyAdded || null;

export const selectActivitySummaryReport = (state) => state.reports?.reports?.activitySummary || null;

export const selectAuditTrailReport = (state) => state.reports?.reports?.auditTrail || null;

export const selectLoginActivityReport = (state) => state.reports?.reports?.loginActivity || null;

export const selectPasswordChangesReport = (state) => state.reports?.reports?.passwordChanges || null;

export const selectRoleChangesReport = (state) => state.reports?.reports?.roleChanges || null;

export const selectSuspensionLogReport = (state) => state.reports?.reports?.suspensionLog || null;

export const selectComplianceSummaryReport = (state) => state.reports?.reports?.complianceSummary || null;
