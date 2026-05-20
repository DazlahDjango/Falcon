import { createSelector } from '@reduxjs/toolkit';

const selectDashboardState = (state) => state.dashboard;
const selectDashboardConfigState = (state) => state.dashboardConfig;
const selectDashboardAlertsState = (state) => state.dashboardAlerts;
const selectDashboardExportsState = (state) => state.dashboardExports;
const selectDashboardComparisonsState = (state) => state.dashboardComparisons;

export const selectExecutiveData = (state) => state.dashboard?.executive?.data;
export const selectExecutiveDepartments = (state) => state.dashboard?.executive?.departments;
export const selectExecutiveTrends = (state) => state.dashboard?.executive?.trends;
export const selectExecutiveIssues = (state) => state.dashboard?.executive?.issues;
export const selectExecutiveLoading = (state) => state.dashboard?.executive?.loading;
export const selectExecutiveError = (state) => state.dashboard?.executive?.error;
export const selectExecutiveLastUpdated = (state) => state.dashboard?.executive?.lastUpdated;

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

// ==================== Client Admin Dashboard Selectors ====================
export const selectClientAdminData = (state) => state.dashboard?.clientAdmin?.data;
export const selectClientAdminCompliance = (state) => state.dashboard?.clientAdmin?.compliance;
export const selectClientAdminPendingApprovals = (state) => state.dashboard?.clientAdmin?.pendingApprovals;
export const selectClientAdminMissingData = (state) => state.dashboard?.clientAdmin?.missingData;
export const selectClientAdminUserActivity = (state) => state.dashboard?.clientAdmin?.userActivity;
export const selectClientAdminKpiBreakdown = (state) => state.dashboard?.clientAdmin?.kpiBreakdown;
export const selectClientAdminLoading = (state) => state.dashboard?.clientAdmin?.loading;
export const selectClientAdminError = (state) => state.dashboard?.clientAdmin?.error;
export const selectClientAdminLastUpdated = (state) => state.dashboard?.clientAdmin?.lastUpdated;

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

// ==================== Super Admin Dashboard Selectors ====================
export const selectSuperAdminData = (state) => state.dashboard?.superAdmin?.data;
export const selectSuperAdminTenants = (state) => state.dashboard?.superAdmin?.tenants;
export const selectSuperAdminSystemHealth = (state) => state.dashboard?.superAdmin?.systemHealth;
export const selectSuperAdminSubscriptionAlerts = (state) => state.dashboard?.superAdmin?.subscriptionAlerts;
export const selectSuperAdminPlatformMetrics = (state) => state.dashboard?.superAdmin?.platformMetrics;
export const selectSuperAdminBillingOverview = (state) => state.dashboard?.superAdmin?.billingOverview;
export const selectSuperAdminLoading = (state) => state.dashboard?.superAdmin?.loading;
export const selectSuperAdminError = (state) => state.dashboard?.superAdmin?.error;
export const selectSuperAdminLastUpdated = (state) => state.dashboard?.superAdmin?.lastUpdated;

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

// ==================== Shared Dashboard Selectors ====================
export const selectActiveDashboard = (state) => state.dashboard?.activeDashboard;
export const selectRefreshInProgress = (state) => state.dashboard?.refreshInProgress;

export const selectIsDashboardReady = createSelector(
  [selectActiveDashboard, selectExecutiveLoading, selectClientAdminLoading, selectSuperAdminLoading],
  (activeDashboard, executiveLoading, clientAdminLoading, superAdminLoading) => {
    if (activeDashboard === 'executive') return !executiveLoading;
    if (activeDashboard === 'client_admin') return !clientAdminLoading;
    if (activeDashboard === 'super_admin') return !superAdminLoading;
    return false;
  }
);

export const selectDashboardError = createSelector(
  [selectExecutiveError, selectClientAdminError, selectSuperAdminError, selectActiveDashboard],
  (executiveError, clientAdminError, superAdminError, activeDashboard) => {
    if (activeDashboard === 'executive') return executiveError;
    if (activeDashboard === 'client_admin') return clientAdminError;
    if (activeDashboard === 'super_admin') return superAdminError;
    return null;
  }
);

export const selectDashboardLastUpdated = createSelector(
  [selectExecutiveLastUpdated, selectClientAdminLastUpdated, selectSuperAdminLastUpdated, selectActiveDashboard],
  (executiveLast, clientAdminLast, superAdminLast, activeDashboard) => {
    if (activeDashboard === 'executive') return executiveLast;
    if (activeDashboard === 'client_admin') return clientAdminLast;
    if (activeDashboard === 'super_admin') return superAdminLast;
    return null;
  }
);

// ==================== Dashboard Config Selectors ====================
export const selectDashboardConfigs = (state) => state.dashboardConfig?.configs;
export const selectCurrentConfig = (state) => state.dashboardConfig?.currentConfig;
export const selectDashboardWidgets = (state) => state.dashboardConfig?.widgets;
export const selectDashboardFavorites = (state) => state.dashboardConfig?.favorites;
export const selectConfigLoading = (state) => state.dashboardConfig?.loading;
export const selectConfigSaving = (state) => state.dashboardConfig?.saving;
export const selectConfigError = (state) => state.dashboardConfig?.error;

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

// ==================== Dashboard Alerts Selectors ====================
export const selectAlerts = (state) => state.dashboardAlerts?.alerts;
export const selectAlertsTotal = (state) => state.dashboardAlerts?.total;
export const selectAlertsLoading = (state) => state.dashboardAlerts?.loading;
export const selectAlertsError = (state) => state.dashboardAlerts?.error;

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

// ==================== Dashboard Exports Selectors ====================
export const selectExports = (state) => state.dashboardExports?.exports;
export const selectExportHistory = (state) => state.dashboardExports?.history;
export const selectExportsTotal = (state) => state.dashboardExports?.total;
export const selectExportsLoading = (state) => state.dashboardExports?.loading;
export const selectExporting = (state) => state.dashboardExports?.exporting;
export const selectExportsError = (state) => state.dashboardExports?.error;

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

// ==================== Dashboard Comparisons Selectors ====================
export const selectComparisons = (state) => state.dashboardComparisons?.comparisons;
export const selectSelectedComparison = (state) => state.dashboardComparisons?.selectedComparison;
export const selectComparisonResults = (state) => state.dashboardComparisons?.comparisonResults;
export const selectComparisonsLoading = (state) => state.dashboardComparisons?.loading;
export const selectCalculating = (state) => state.dashboardComparisons?.calculating;
export const selectComparisonsError = (state) => state.dashboardComparisons?.error;

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