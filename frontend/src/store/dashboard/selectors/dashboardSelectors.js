// frontend/src/store/dashboard/selectors/dashboardSelectors.js

import { createSelector } from '@reduxjs/toolkit';

// ==================== BASE STATE SELECTORS ====================
const selectDashboardState = (state) => state?.dashboard;
const selectDashboardConfigState = (state) => state?.dashboardConfig;
const selectDashboardAlertsState = (state) => state?.dashboardAlerts;
const selectDashboardExportsState = (state) => state?.dashboardExports;
const selectDashboardComparisonsState = (state) => state?.dashboardComparisons;

// ===== ADD NEW SLICE SELECTORS =====
const selectManagerDashboardState = (state) => state?.managerDashboard;
const selectStaffDashboardState = (state) => state?.staffDashboard;
const selectChampionDashboardState = (state) => state?.championDashboard;
const selectReadOnlyDashboardState = (state) => state?.readOnlyDashboard;

// ==================== EXECUTIVE DASHBOARD SELECTORS ====================
export const selectExecutiveData = (state) => state?.dashboard?.executive?.data;
export const selectExecutiveDepartments = (state) => state?.dashboard?.executive?.departments;
export const selectExecutiveTrends = (state) => state?.dashboard?.executive?.trends;
export const selectExecutiveIssues = (state) => state?.dashboard?.executive?.issues;
export const selectExecutiveLoading = (state) => state?.dashboard?.executive?.loading;
export const selectExecutiveError = (state) => state?.dashboard?.executive?.error;
export const selectExecutiveLastUpdated = (state) => state?.dashboard?.executive?.lastUpdated;

export const selectExecutiveOverview = createSelector(
  [selectExecutiveData],
  (data) => data?.organization_overview || null
);

export const selectExecutiveDepartmentPerformance = createSelector(
  [selectExecutiveDepartments],
  (departments) => departments || []
);

export const selectExecutiveTopIssues = createSelector(
  [selectExecutiveIssues],
  (issues) => issues?.slice(0, 5) || []
);

export const selectExecutiveKpiTrends = createSelector(
  [selectExecutiveTrends],
  (trends) => trends || []
);

export const selectExecutiveHasData = createSelector(
  [selectExecutiveData],
  (data) => data !== null
);

export const selectExecutiveIsEmpty = createSelector(
  [selectExecutiveDepartments, selectExecutiveTrends],
  (departments, trends) => (!departments?.length && !trends?.length)
);

// ==================== CLIENT ADMIN DASHBOARD SELECTORS ====================
export const selectClientAdminData = (state) => state?.dashboard?.clientAdmin?.data;
export const selectClientAdminCompliance = (state) => state?.dashboard?.clientAdmin?.compliance;
export const selectClientAdminPendingApprovals = (state) => state?.dashboard?.clientAdmin?.pendingApprovals;
export const selectClientAdminMissingData = (state) => state?.dashboard?.clientAdmin?.missingData;
export const selectClientAdminUserActivity = (state) => state?.dashboard?.clientAdmin?.userActivity;
export const selectClientAdminKpiBreakdown = (state) => state?.dashboard?.clientAdmin?.kpiBreakdown;
export const selectClientAdminLoading = (state) => state?.dashboard?.clientAdmin?.loading;
export const selectClientAdminError = (state) => state?.dashboard?.clientAdmin?.error;
export const selectClientAdminLastUpdated = (state) => state?.dashboard?.clientAdmin?.lastUpdated;

export const selectClientAdminTenantOverview = createSelector(
  [selectClientAdminData],
  (data) => data?.tenant_overview || null
);

export const selectClientAdminComplianceRate = createSelector(
  [selectClientAdminCompliance],
  (compliance) => ({
    submissionRate: compliance?.data_submission_rate || 0,
    reviewRate: compliance?.review_completion_rate || 0,
    pendingReviews: compliance?.pending_reviews || 0,
    isHealthy: (compliance?.data_submission_rate || 0) >= 80
  })
);

export const selectClientAdminPendingCount = createSelector(
  [selectClientAdminPendingApprovals],
  (approvals) => approvals?.length || 0
);

export const selectClientAdminHasCriticalIssues = createSelector(
  [selectClientAdminMissingData, selectClientAdminPendingApprovals],
  (missingData, pendingApprovals) => 
    (missingData?.length > 0) || (pendingApprovals?.length > 10)
);

export const selectClientAdminKpiHealth = createSelector(
  [selectClientAdminKpiBreakdown],
  (breakdown) => {
    if (!breakdown) return { green: 0, yellow: 0, red: 0, total: 0 };
    const byDepartment = breakdown.by_department || [];
    const totalGreen = byDepartment.reduce((sum, d) => sum + (d.green_count || 0), 0);
    const totalRed = byDepartment.reduce((sum, d) => sum + (d.red_count || 0), 0);
    const total = byDepartment.reduce((sum, d) => sum + (d.kpi_count || 0), 0);
    return {
      green: totalGreen,
      red: totalRed,
      yellow: total - totalGreen - totalRed,
      total
    };
  }
);

// ==================== SUPER ADMIN DASHBOARD SELECTORS ====================
export const selectSuperAdminData = (state) => state?.dashboard?.superAdmin?.data;
export const selectSuperAdminTenants = (state) => state?.dashboard?.superAdmin?.tenants;
export const selectSuperAdminSystemHealth = (state) => state?.dashboard?.superAdmin?.systemHealth;
export const selectSuperAdminSubscriptionAlerts = (state) => state?.dashboard?.superAdmin?.subscriptionAlerts;
export const selectSuperAdminPlatformMetrics = (state) => state?.dashboard?.superAdmin?.platformMetrics;
export const selectSuperAdminBillingOverview = (state) => state?.dashboard?.superAdmin?.billingOverview;
export const selectSuperAdminLoading = (state) => state?.dashboard?.superAdmin?.loading;
export const selectSuperAdminError = (state) => state?.dashboard?.superAdmin?.error;
export const selectSuperAdminLastUpdated = (state) => state?.dashboard?.superAdmin?.lastUpdated;

export const selectSuperAdminPlatformOverview = createSelector(
  [selectSuperAdminData],
  (data) => data?.platform_overview || null
);

export const selectSuperAdminTenantSummaries = createSelector(
  [selectSuperAdminTenants],
  (tenants) => tenants || []
);

export const selectSuperAdminCriticalTenants = createSelector(
  [selectSuperAdminTenants],
  (tenants) => (tenants || []).filter(t => t.health_score < 50)
);

export const selectSuperAdminExpiringSubscriptions = createSelector(
  [selectSuperAdminSubscriptionAlerts],
  (alerts) => alerts?.filter(a => a.alert_type === 'subscription_expiring') || []
);

export const selectSuperAdminTotalRevenue = createSelector(
  [selectSuperAdminBillingOverview],
  (billing) => ({
    monthly: billing?.monthly_recurring || 0,
    annual: billing?.annual_recurring || 0,
    totalActive: billing?.total_active_subscriptions || 0
  })
);

export const selectSuperAdminSystemStatus = createSelector(
  [selectSuperAdminSystemHealth],
  (health) => ({
    isOperational: health?.api_status === 'operational' && health?.database_status === 'operational',
    uptime: health?.uptime_percentage || 99.95,
    hasIncidents: !!health?.last_incident
  })
);

// ==================== MANAGER DASHBOARD SELECTORS ====================

export const selectManagerData = (state) => state?.managerDashboard?.data;
export const selectManagerTeamMembers = (state) => state?.managerDashboard?.teamMembers;
export const selectManagerTeamSummary = (state) => state?.managerDashboard?.teamSummary;
export const selectManagerPendingApprovals = (state) => state?.managerDashboard?.pendingApprovals;
export const selectManagerPeriod = (state) => state?.managerDashboard?.period;
export const selectManagerIncludeTeam = (state) => state?.managerDashboard?.includeTeam;
export const selectManagerDrillDownUserId = (state) => state?.managerDashboard?.drillDownUserId;
export const selectManagerLoading = (state) => state?.managerDashboard?.loading;
export const selectManagerApproving = (state) => state?.managerDashboard?.approving;
export const selectManagerRejecting = (state) => state?.managerDashboard?.rejecting;
export const selectManagerError = (state) => state?.managerDashboard?.error;
export const selectManagerLastUpdated = (state) => state?.managerDashboard?.lastUpdated;

export const selectManagerPersonalKPIs = createSelector(
  [selectManagerData],
  (data) => data?.personal_kpis || []
);

export const selectManagerPersonalScore = createSelector(
  [selectManagerData],
  (data) => data?.personal_score || null
);

export const selectManagerTrafficLight = createSelector(
  [selectManagerData],
  (data) => data?.personal_traffic_light || 'yellow'
);

export const selectManagerTeamSummaryStats = createSelector(
  [selectManagerTeamSummary],
  (summary) => ({
    totalMembers: summary?.total_members || 0,
    averageScore: summary?.average_score || 0,
    greenCount: summary?.total_green || 0,
    yellowCount: summary?.total_yellow || 0,
    redCount: summary?.total_red || 0
  })
);

export const selectManagerPendingCount = createSelector(
  [selectManagerPendingApprovals],
  (approvals) => approvals?.length || 0
);

export const selectManagerHasPendingApprovals = createSelector(
  [selectManagerPendingCount],
  (count) => count > 0
);

export const selectManagerTeamMembersWithStatus = createSelector(
  [selectManagerTeamMembers],
  (members) => {
    if (!members) return [];
    return members.map(member => ({
      ...member,
      isCritical: member.traffic_light === 'red',
      isWarning: member.traffic_light === 'yellow',
      isHealthy: member.traffic_light === 'green'
    }));
  }
);

export const selectManagerTeamHealthScore = createSelector(
  [selectManagerTeamMembers],
  (members) => {
    if (!members || members.length === 0) return 0;
    const totalScore = members.reduce((sum, m) => sum + (m.overall_score || 0), 0);
    return totalScore / members.length;
  }
);

export const selectManagerIsDrilledDown = createSelector(
  [selectManagerDrillDownUserId],
  (userId) => !!userId
);

// ==================== STAFF DASHBOARD SELECTORS ====================

export const selectStaffData = (state) => state?.staffDashboard?.data;
export const selectStaffMyKPIs = (state) => state?.staffDashboard?.myKPIs;
export const selectStaffPendingSubmissions = (state) => state?.staffDashboard?.pendingSubmissions;
export const selectStaffMissionStatus = (state) => state?.staffDashboard?.missionStatus;
export const selectStaffPendingTasks = (state) => state?.staffDashboard?.pendingTasks;
export const selectStaffPeriod = (state) => state?.staffDashboard?.period;
export const selectStaffLoading = (state) => state?.staffDashboard?.loading;
export const selectStaffSubmitting = (state) => state?.staffDashboard?.submitting;
export const selectStaffUpdatingMission = (state) => state?.staffDashboard?.updatingMission;
export const selectStaffError = (state) => state?.staffDashboard?.error;
export const selectStaffLastUpdated = (state) => state?.staffDashboard?.lastUpdated;

export const selectStaffOverallScore = createSelector(
  [selectStaffData],
  (data) => data?.overall_score || null
);

export const selectStaffTrafficLight = createSelector(
  [selectStaffData],
  (data) => data?.traffic_light || 'yellow'
);

export const selectStaffKPIStats = createSelector(
  [selectStaffMyKPIs],
  (kpis) => {
    if (!kpis) return { green: 0, yellow: 0, red: 0, total: 0 };
    const green = kpis.filter(k => k.traffic_light === 'green').length;
    const yellow = kpis.filter(k => k.traffic_light === 'yellow').length;
    const red = kpis.filter(k => k.traffic_light === 'red').length;
    return { green, yellow, red, total: kpis.length };
  }
);

export const selectStaffPendingSubmissionCount = createSelector(
  [selectStaffPendingSubmissions],
  (submissions) => submissions?.length || 0
);

export const selectStaffHasPendingSubmissions = createSelector(
  [selectStaffPendingSubmissionCount],
  (count) => count > 0
);

export const selectStaffLatestMissionStatus = createSelector(
  [selectStaffMissionStatus],
  (mission) => ({
    hasReport: !!mission,
    status: mission?.status || 'draft',
    lastUpdated: mission?.updated_at || null
  })
);

export const selectStaffOverdueTasks = createSelector(
  [selectStaffPendingTasks],
  (tasks) => (tasks || []).filter(t => t.due_date && new Date(t.due_date) < new Date())
);

export const selectStaffOverdueCount = createSelector(
  [selectStaffOverdueTasks],
  (tasks) => tasks.length
);

// ==================== CHAMPION DASHBOARD SELECTORS ====================

export const selectChampionData = (state) => state?.championDashboard?.data;
export const selectChampionAvailableKPIs = (state) => state?.championDashboard?.availableKPIs;
export const selectChampionAssignedKPIs = (state) => state?.championDashboard?.assignedKPIs;
export const selectChampionTemplates = (state) => state?.championDashboard?.templates;
export const selectChampionTargetUserId = (state) => state?.championDashboard?.targetUserId;
export const selectChampionPeriod = (state) => state?.championDashboard?.period;
export const selectChampionLoading = (state) => state?.championDashboard?.loading;
export const selectChampionSaving = (state) => state?.championDashboard?.saving;
export const selectChampionCreatingTemplate = (state) => state?.championDashboard?.creatingTemplate;
export const selectChampionApplyingTemplate = (state) => state?.championDashboard?.applyingTemplate;
export const selectChampionError = (state) => state?.championDashboard?.error;
export const selectChampionLastUpdated = (state) => state?.championDashboard?.lastUpdated;

export const selectChampionTargetUser = createSelector(
  [selectChampionData],
  (data) => data?.target_user || null
);

export const selectChampionIsEditable = createSelector(
  [selectChampionData],
  (data) => data?.is_editable || false
);

export const selectChampionAssignedKPIsList = createSelector(
  [selectChampionAssignedKPIs],
  (kpis) => kpis || []
);

export const selectChampionAvailableKPIsList = createSelector(
  [selectChampionAvailableKPIs],
  (kpis) => kpis || []
);

export const selectChampionAssignedKPIsCount = createSelector(
  [selectChampionAssignedKPIs],
  (kpis) => kpis?.length || 0
);

export const selectChampionAvailableKPIsCount = createSelector(
  [selectChampionAvailableKPIs],
  (kpis) => kpis?.length || 0
);

export const selectChampionTemplatesList = createSelector(
  [selectChampionTemplates],
  (templates) => templates || []
);

export const selectChampionTemplatesByCategory = createSelector(
  [selectChampionTemplates, (_, category) => category],
  (templates, category) => (templates || []).filter(t => t.category === category)
);

export const selectChampionHasTemplates = createSelector(
  [selectChampionTemplates],
  (templates) => (templates?.length || 0) > 0
);

export const selectChampionTotalWeight = createSelector(
  [selectChampionAssignedKPIs],
  (kpis) => (kpis || []).reduce((sum, k) => sum + (k.weight || 1), 0)
);

// ==================== READ-ONLY DASHBOARD SELECTORS ====================

export const selectReadOnlyData = (state) => state?.readOnlyDashboard?.data;
export const selectReadOnlyPeriod = (state) => state?.readOnlyDashboard?.period;
export const selectReadOnlyViewType = (state) => state?.readOnlyDashboard?.viewType;
export const selectReadOnlyLoading = (state) => state?.readOnlyDashboard?.loading;
export const selectReadOnlyError = (state) => state?.readOnlyDashboard?.error;
export const selectReadOnlyLastUpdated = (state) => state?.readOnlyDashboard?.lastUpdated;

export const selectReadOnlyDashboardData = createSelector(
  [selectReadOnlyData],
  (data) => data?.data || null
);

export const selectReadOnlyCanEdit = createSelector(
  [selectReadOnlyData],
  (data) => data?.can_edit || false
);

export const selectReadOnlyCanExport = createSelector(
  [selectReadOnlyData],
  (data) => data?.can_export || false
);

export const selectReadOnlyIsReadOnly = createSelector(
  [selectReadOnlyData],
  (data) => data?.read_only || true
);

export const selectReadOnlyDashboardType = createSelector(
  [selectReadOnlyViewType, selectReadOnlyData],
  (viewType, data) => data?.dashboard_type || viewType
);

// ==================== SHARED DASHBOARD SELECTORS ====================
export const selectActiveDashboard = (state) => state?.dashboard?.activeDashboard;
export const selectRefreshInProgress = (state) => state?.dashboard?.refreshInProgress;

export const selectIsDashboardReady = createSelector(
  [selectActiveDashboard, selectExecutiveLoading, selectClientAdminLoading, selectSuperAdminLoading, selectManagerLoading, selectStaffLoading],
  (activeDashboard, executiveLoading, clientAdminLoading, superAdminLoading, managerLoading, staffLoading) => {
    if (activeDashboard === 'executive') return !executiveLoading;
    if (activeDashboard === 'client_admin') return !clientAdminLoading;
    if (activeDashboard === 'super_admin') return !superAdminLoading;
    if (activeDashboard === 'manager') return !managerLoading;
    if (activeDashboard === 'staff') return !staffLoading;
    return false;
  }
);

export const selectDashboardError = createSelector(
  [selectExecutiveError, selectClientAdminError, selectSuperAdminError, selectManagerError, selectStaffError, selectActiveDashboard],
  (executiveError, clientAdminError, superAdminError, managerError, staffError, activeDashboard) => {
    if (activeDashboard === 'executive') return executiveError;
    if (activeDashboard === 'client_admin') return clientAdminError;
    if (activeDashboard === 'super_admin') return superAdminError;
    if (activeDashboard === 'manager') return managerError;
    if (activeDashboard === 'staff') return staffError;
    return null;
  }
);

export const selectDashboardLastUpdated = createSelector(
  [selectExecutiveLastUpdated, selectClientAdminLastUpdated, selectSuperAdminLastUpdated, selectManagerLastUpdated, selectStaffLastUpdated, selectActiveDashboard],
  (executiveLast, clientAdminLast, superAdminLast, managerLast, staffLast, activeDashboard) => {
    if (activeDashboard === 'executive') return executiveLast;
    if (activeDashboard === 'client_admin') return clientAdminLast;
    if (activeDashboard === 'super_admin') return superAdminLast;
    if (activeDashboard === 'manager') return managerLast;
    if (activeDashboard === 'staff') return staffLast;
    return null;
  }
);

// ==================== DASHBOARD CONFIG SELECTORS ====================
export const selectDashboardConfigs = (state) => state?.dashboardConfig?.configs;
export const selectCurrentConfig = (state) => state?.dashboardConfig?.currentConfig;
export const selectDashboardWidgets = (state) => state?.dashboardConfig?.widgets;
export const selectDashboardFavorites = (state) => state?.dashboardConfig?.favorites;
export const selectConfigLoading = (state) => state?.dashboardConfig?.loading;
export const selectConfigSaving = (state) => state?.dashboardConfig?.saving;
export const selectConfigError = (state) => state?.dashboardConfig?.error;

export const selectCurrentConfigLayout = createSelector(
  [selectCurrentConfig],
  (config) => config?.layout || { widgets: [], columns: 12, cellHeight: 100 }
);

export const selectCurrentConfigFilters = createSelector(
  [selectCurrentConfig],
  (config) => config?.default_filters || { period: 'monthly' }
);

export const selectWidgetsByType = createSelector(
  [selectDashboardWidgets, (_, widgetType) => widgetType],
  (widgets, widgetType) => (widgets || []).filter(w => w.widget_type === widgetType)
);

export const selectVisibleWidgets = createSelector(
  [selectDashboardWidgets],
  (widgets) => (widgets || []).filter(w => w.is_visible !== false).sort((a, b) => a.order - b.order)
);

export const selectFavoritesOrdered = createSelector(
  [selectDashboardFavorites],
  (favorites) => (favorites || []).sort((a, b) => a.order - b.order)
);

export const selectIsFavorite = createSelector(
  [selectDashboardFavorites, (_, kpiId) => kpiId],
  (favorites, kpiId) => (favorites || []).some(f => f.kpi_id === kpiId)
);

// ==================== DASHBOARD ALERTS SELECTORS ====================
export const selectAlerts = (state) => state?.dashboardAlerts?.alerts;
export const selectAlertsTotal = (state) => state?.dashboardAlerts?.total;
export const selectAlertsLoading = (state) => state?.dashboardAlerts?.loading;
export const selectAlertsError = (state) => state?.dashboardAlerts?.error;

export const selectCriticalAlerts = createSelector(
  [selectAlerts],
  (alerts) => (alerts || []).filter(a => a.severity === 'critical')
);

export const selectWarningAlerts = createSelector(
  [selectAlerts],
  (alerts) => (alerts || []).filter(a => a.severity === 'warning')
);

export const selectInfoAlerts = createSelector(
  [selectAlerts],
  (alerts) => (alerts || []).filter(a => a.severity === 'info')
);

export const selectActiveAlerts = createSelector(
  [selectAlerts],
  (alerts) => (alerts || []).filter(a => a.is_active !== false)
);

export const selectAlertByType = createSelector(
  [selectAlerts, (_, alertType) => alertType],
  (alerts, alertType) => (alerts || []).filter(a => a.alert_type === alertType)
);

export const selectHasCriticalAlerts = createSelector(
  [selectCriticalAlerts],
  (critical) => critical.length > 0
);

// ==================== DASHBOARD EXPORTS SELECTORS ====================
export const selectExports = (state) => state?.dashboardExports?.exports;
export const selectExportHistory = (state) => state?.dashboardExports?.history;
export const selectExportsTotal = (state) => state?.dashboardExports?.total;
export const selectExportsLoading = (state) => state?.dashboardExports?.loading;
export const selectExporting = (state) => state?.dashboardExports?.exporting;
export const selectExportsError = (state) => state?.dashboardExports?.error;

export const selectActiveExports = createSelector(
  [selectExports],
  (exports) => (exports || []).filter(e => e.is_active)
);

export const selectPendingExports = createSelector(
  [selectExports],
  (exports) => (exports || []).filter(e => e.is_active && e.last_run_status !== 'success')
);

export const selectRecentExports = createSelector(
  [selectExportHistory],
  (history) => (history || []).slice(0, 10)
);

// ==================== DASHBOARD COMPARISONS SELECTORS ====================
export const selectComparisons = (state) => state?.dashboardComparisons?.comparisons;
export const selectSelectedComparison = (state) => state?.dashboardComparisons?.selectedComparison;
export const selectComparisonResults = (state) => state?.dashboardComparisons?.comparisonResults;
export const selectComparisonsLoading = (state) => state?.dashboardComparisons?.loading;
export const selectCalculating = (state) => state?.dashboardComparisons?.calculating;
export const selectComparisonsError = (state) => state?.dashboardComparisons?.error;

export const selectPublicComparisons = createSelector(
  [selectComparisons],
  (comparisons) => (comparisons || []).filter(c => c.is_public)
);

export const selectComparisonsByType = createSelector(
  [selectComparisons, (_, comparisonType) => comparisonType],
  (comparisons, comparisonType) => (comparisons || []).filter(c => c.comparison_type === comparisonType)
);

export const selectComparisonVariance = createSelector(
  [selectComparisonResults],
  (results) => results?.variance_percentage || 0
);

export const selectComparisonDirection = createSelector(
  [selectComparisonResults],
  (results) => {
    const variance = results?.variance_percentage || 0;
    if (variance > 0) return 'up';
    if (variance < 0) return 'down';
    return 'stable';
  }
); 