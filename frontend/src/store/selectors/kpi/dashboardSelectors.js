import { createSelector } from '@reduxjs/toolkit';

const selectDashboardState = (state) => state.dashboard;
const selectIndividualState = (state) => state.dashboard.individual;
const selectManagerState = (state) => state.dashboard.manager;
const selectExecutiveState = (state) => state.dashboard.executive;
const selectChampionState = (state) => state.dashboard.champion;
const selectPeriodState = (state) => state.dashboard.period;

// Individual dashboard
export const selectIndividualDashboard = createSelector(
    [selectIndividualState],
    (individual) => individual.data
);

export const selectIndividualLoading = createSelector(
    [selectIndividualState],
    (individual) => individual.loading
);

export const selectIndividualError = createSelector(
    [selectIndividualState],
    (individual) => individual.error
);

export const selectOverallScore = createSelector(
    [selectIndividualDashboard],
    (dashboard) => dashboard?.overallScore || 0
);

export const selectMyKPIs = createSelector(
    [selectIndividualDashboard],
    (dashboard) => dashboard?.kpis || []
);

export const selectRecentActivity = createSelector(
    [selectIndividualDashboard],
    (dashboard) => dashboard?.recentActivity || []
);

// Manager dashboard
export const selectManagerDashboard = createSelector(
    [selectManagerState],
    (manager) => manager.data
);

export const selectManagerLoading = createSelector(
    [selectManagerState],
    (manager) => manager.loading
);

export const selectTeamMembers = createSelector(
    [selectManagerDashboard],
    (dashboard) => dashboard?.teamMembers || []
);

export const selectTeamSize = createSelector(
    [selectManagerDashboard],
    (dashboard) => dashboard?.teamSize || 0
);

export const selectTeamAverageScore = createSelector(
    [selectManagerDashboard],
    (dashboard) => dashboard?.teamAvgScore || 0
);

export const selectPendingValidationsCount = createSelector(
    [selectManagerDashboard],
    (dashboard) => dashboard?.pendingValidations || 0
);

// Executive dashboard
export const selectExecutiveDashboard = createSelector(
    [selectExecutiveState],
    (executive) => executive.data
);

export const selectExecutiveLoading = createSelector(
    [selectExecutiveState],
    (executive) => executive.loading
);

export const selectOrganizationHealth = createSelector(
    [selectExecutiveDashboard],
    (dashboard) => dashboard?.overallHealth || 0
);

export const selectDepartmentRankings = createSelector(
    [selectExecutiveDashboard],
    (dashboard) => dashboard?.departmentRankings || []
);

export const selectTrendData = createSelector(
    [selectExecutiveDashboard],
    (dashboard) => dashboard?.trendData || []
);

// Champion dashboard
export const selectChampionDashboard = createSelector(
    [selectChampionState],
    (champion) => champion.data
);

export const selectChampionLoading = createSelector(
    [selectChampionState],
    (champion) => champion.loading
);

export const selectDepartmentCompliance = createSelector(
    [selectChampionDashboard],
    (dashboard) => dashboard?.departmentCompliance || []
);

export const selectRedAlertsList = createSelector(
    [selectChampionDashboard],
    (dashboard) => dashboard?.redKPIAlerts || []
);

export const selectOrganizationSubmissionRate = createSelector(
    [selectChampionDashboard],
    (dashboard) => dashboard?.organizationSubmissionRate || 0
);

// Period selectors
export const selectDashboardPeriod = createSelector(
    [selectPeriodState],
    (period) => period
);

export const selectDashboardYear = createSelector(
    [selectDashboardPeriod],
    (period) => period.year
);

export const selectDashboardMonth = createSelector(
    [selectDashboardPeriod],
    (period) => period.month
);