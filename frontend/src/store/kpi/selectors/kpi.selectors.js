import { createSelector } from '@reduxjs/toolkit';

// ============ Base Selectors ============
const selectKPIState = (state) => state?.kpi;
const selectFrameworkState = (state) => state?.framework;
const selectTargetState = (state) => state?.target;
const selectActualState = (state) => state?.actual;
const selectScoreState = (state) => state?.score;
const selectValidationState = (state) => state?.validation;
const selectDashboardState = (state) => state?.dashboard;
const selectAnalyticsState = (state) => state?.analytics;
const selectBulkState = (state) => state?.bulk;
const selectCalculationState = (state) => state?.calculation;
const selectSettingsState = (state) => state?.settings;
const selectHistoryState = (state) => state?.history;
const selectCascadeState = (state) => state?.kpi?.cascade || state?.cascade || {};
const selectExportState = (state) => state?.kpi?.exports || state?.exports || {};

// ============ KPI Selectors ============
export const selectKPIs = createSelector(
  [selectKPIState],
  (kpi) => kpi?.kpis || []
);

export const selectCurrentKPI = createSelector(
  [selectKPIState],
  (kpi) => kpi?.currentKPI || null
);

export const selectKPILoading = createSelector(
  [selectKPIState],
  (kpi) => kpi?.loading || false
);

export const selectKPILoadingDetails = createSelector(
  [selectKPIState],
  (kpi) => kpi?.loadingDetails || false
);

export const selectKPISubmitting = createSelector(
  [selectKPIState],
  (kpi) => kpi?.submitting || false
);

export const selectKPIError = createSelector(
  [selectKPIState],
  (kpi) => kpi?.error || null
);

export const selectValidationErrors = createSelector(
  [selectKPIState],
  (kpi) => kpi?.validationErrors || {}
);

export const selectKPIPagination = createSelector(
  [selectKPIState],
  (kpi) => kpi?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectKPIFilters = createSelector(
  [selectKPIState],
  (kpi) => kpi?.filters || {}
);

export const selectKPIValidation = createSelector(
  [selectKPIState],
  (kpi) => kpi?.kpiValidation || null
);

export const selectKPIWeights = createSelector(
  [selectKPIState],
  (kpi) => kpi?.weights || []
);

export const selectWeightValidation = createSelector(
  [selectKPIState],
  (kpi) => kpi?.weightValidation || null
);

export const selectDependencies = createSelector(
  [selectKPIState],
  (kpi) => kpi?.dependencies || []
);

export const selectStrategicLinkages = createSelector(
  [selectKPIState],
  (kpi) => kpi?.strategicLinkages || []
);

// User nested selectors
export const selectUserKPIs = (userId) => createSelector(
  [selectKPIState],
  (kpi) => kpi?.userKPIs?.[userId] || []
);

export const selectUserTargets = (userId) => createSelector(
  [selectKPIState],
  (kpi) => kpi?.userTargets?.[userId] || []
);

export const selectUserScores = (userId) => createSelector(
  [selectKPIState],
  (kpi) => kpi?.userScores?.[userId] || []
);

export const selectUserActuals = (userId) => createSelector(
  [selectKPIState],
  (kpi) => kpi?.userActuals?.[userId] || []
);

// ============ Framework Selectors ============
export const selectSectors = createSelector(
  [selectFrameworkState],
  (framework) => framework?.sectors || []
);

export const selectCurrentSector = createSelector(
  [selectFrameworkState],
  (framework) => framework?.currentSector || null
);

export const selectFrameworks = createSelector(
  [selectFrameworkState],
  (framework) => framework?.frameworks || []
);

export const selectCurrentFramework = createSelector(
  [selectFrameworkState],
  (framework) => framework?.currentFramework || null
);

export const selectCategories = createSelector(
  [selectFrameworkState],
  (framework) => framework?.categories || []
);

export const selectCurrentCategory = createSelector(
  [selectFrameworkState],
  (framework) => framework?.currentCategory || null
);

export const selectCategoryTree = createSelector(
  [selectFrameworkState],
  (framework) => framework?.categoryTree || []
);

export const selectTemplates = createSelector(
  [selectFrameworkState],
  (framework) => framework?.templates || []
);

export const selectCurrentTemplate = createSelector(
  [selectFrameworkState],
  (framework) => framework?.currentTemplate || null
);

export const selectFrameworkLoading = createSelector(
  [selectFrameworkState],
  (framework) => framework?.loading || false
);

export const selectFrameworkSubmitting = createSelector(
  [selectFrameworkState],
  (framework) => framework?.submitting || false
);

export const selectFrameworkError = createSelector(
  [selectFrameworkState],
  (framework) => framework?.error || null
);

// ============ Target Selectors ============
export const selectTargets = createSelector(
  [selectTargetState],
  (target) => target?.targets || []
);

export const selectCurrentTarget = createSelector(
  [selectTargetState],
  (target) => target?.currentTarget || null
);

export const selectMonthlyPhasing = (targetId) => createSelector(
  [selectTargetState],
  (target) => target?.monthlyPhasing?.[targetId] || []
);

export const selectTargetLoading = createSelector(
  [selectTargetState],
  (target) => target?.loading || false
);

export const selectTargetSubmitting = createSelector(
  [selectTargetState],
  (target) => target?.submitting || false
);

export const selectTargetPhasing = createSelector(
  [selectTargetState],
  (target) => target?.phasing || false
);

export const selectTargetValidating = createSelector(
  [selectTargetState],
  (target) => target?.validating || false
);

export const selectTargetError = createSelector(
  [selectTargetState],
  (target) => target?.error || null
);

export const selectTargetValidation = createSelector(
  [selectTargetState],
  (target) => target?.validation || null
);

export const selectTargetPagination = createSelector(
  [selectTargetState],
  (target) => target?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

// ============ Cascade Selectors ============
export const selectCascadeRules = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.cascadeRules || []
);

export const selectCurrentRule = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.currentRule || null
);

export const selectCascadeMaps = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.cascadeMaps || []
);

export const selectCurrentMap = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.currentMap || null
);

export const selectCascadeTree = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.cascadeTree || null
);

export const selectCascadeLoading = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.loading || false
);

export const selectCascadeSubmitting = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.submitting || false
);

export const selectCascadeError = createSelector(
  [selectCascadeState],
  (cascade) => cascade?.error || null
);

// ============ Actual Selectors ============
export const selectActuals = createSelector(
  [selectActualState],
  (actual) => actual?.actuals || []
);

export const selectCurrentActual = createSelector(
  [selectActualState],
  (actual) => actual?.currentActual || null
);

export const selectEvidence = createSelector(
  [selectActualState],
  (actual) => actual?.evidence || []
);

export const selectAdjustments = createSelector(
  [selectActualState],
  (actual) => actual?.adjustments || []
);

export const selectActualFilters = createSelector(
  [selectActualState],
  (actual) => actual?.filters || {}
);

export const selectActualLoading = createSelector(
  [selectActualState],
  (actual) => actual?.loading || false
);

export const selectActualSubmitting = createSelector(
  [selectActualState],
  (actual) => actual?.submitting || false
);

export const selectActualUploading = createSelector(
  [selectActualState],
  (actual) => actual?.uploading || false
);

export const selectActualError = createSelector(
  [selectActualState],
  (actual) => actual?.error || null
);

// ============ Score Selectors ============
export const selectScores = createSelector(
  [selectScoreState],
  (score) => score?.scores || []
);

export const selectMyScores = createSelector(
  [selectScoreState],
  (score) => score?.myScores || []
);

export const selectTeamScores = createSelector(
  [selectScoreState],
  (score) => score?.teamScores || []
);

export const selectScoreStatistics = createSelector(
  [selectScoreState],
  (score) => score?.scoreStatistics || null
);

export const selectAggregatedScores = createSelector(
  [selectScoreState],
  (score) => score?.aggregatedScores || []
);

export const selectOrganizationScores = createSelector(
  [selectScoreState],
  (score) => score?.organizationScores || null
);

export const selectDepartmentRanking = createSelector(
  [selectScoreState],
  (score) => score?.departmentRanking || []
);

export const selectRedAlerts = createSelector(
  [selectScoreState],
  (score) => score?.redAlerts || []
);

export const selectMyRedAlerts = createSelector(
  [selectScoreState],
  (score) => score?.myRedAlerts || []
);

export const selectScoreLoading = createSelector(
  [selectScoreState],
  (score) => score?.loading || false
);

export const selectScoreError = createSelector(
  [selectScoreState],
  (score) => score?.error || null
);

// ============ Validation Selectors ============
export const selectValidations = createSelector(
  [selectValidationState],
  (validation) => validation?.validations || []
);

export const selectPendingValidations = createSelector(
  [selectValidationState],
  (validation) => validation?.pendingValidations || []
);

export const selectPendingSummary = createSelector(
  [selectValidationState],
  (validation) => validation?.pendingSummary || null
);

export const selectRejectionReasons = createSelector(
  [selectValidationState],
  (validation) => validation?.rejectionReasons || []
);

export const selectEscalations = createSelector(
  [selectValidationState],
  (validation) => validation?.escalations || []
);

export const selectMyEscalations = createSelector(
  [selectValidationState],
  (validation) => validation?.myEscalations || []
);

export const selectValidationLoading = createSelector(
  [selectValidationState],
  (validation) => validation?.loading || false
);

export const selectValidationSubmitting = createSelector(
  [selectValidationState],
  (validation) => validation?.submitting || false
);

export const selectValidationError = createSelector(
  [selectValidationState],
  (validation) => validation?.error || null
);

// ============ Dashboard Selectors ============
export const selectIndividualDashboard = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.individual || null
);

export const selectManagerDashboard = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.manager || null
);

export const selectExecutiveDashboard = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.executive || null
);

export const selectChampionDashboard = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.champion || null
);

export const selectAdminOverview = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.adminOverview || null
);

export const selectDashboardLoading = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.loading || false
);

export const selectDashboardError = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.error || null
);

export const selectDashboardLastUpdated = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard?.lastUpdated || null
);

// ============ Analytics Selectors ============
export const selectKPISummaries = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.kpiSummaries || []
);

export const selectDepartmentRollups = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.departmentRollups || []
);

export const selectOrganizationHealth = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.organizationHealth || null
);

export const selectOrganizationHealthHistory = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.organizationHealthHistory || []
);

export const selectInsights = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.insights || null
);

export const selectPredictions = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.predictions || null
);

export const selectHeatmap = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.heatmap || null
);

export const selectReportTask = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.reportTask || null
);

export const selectAnalyticsLoading = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.loading || false
);

export const selectAnalyticsExporting = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.exporting || false
);

export const selectAnalyticsError = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics?.error || null
);

// ============ Bulk Selectors ============
export const selectUploadResult = createSelector(
  [selectBulkState],
  (bulk) => bulk?.uploadResult || null
);

export const selectUploading = createSelector(
  [selectBulkState],
  (bulk) => bulk?.uploading || false
);

export const selectDownloading = createSelector(
  [selectBulkState],
  (bulk) => bulk?.downloading || false
);

export const selectUploadProgress = createSelector(
  [selectBulkState],
  (bulk) => bulk?.uploadProgress || 0
);

export const selectTemplateBlob = createSelector(
  [selectBulkState],
  (bulk) => bulk?.templateBlob || null
);

export const selectLastUpload = createSelector(
  [selectBulkState],
  (bulk) => bulk?.lastUpload || null
);

export const selectBulkError = createSelector(
  [selectBulkState],
  (bulk) => bulk?.error || null
);

// ============ Calculation Selectors ============
export const selectActiveTask = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.activeTask || null
);

export const selectTaskStatus = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.taskStatus || null
);

export const selectTriggering = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.triggering || false
);

export const selectPolling = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.polling || false
);

export const selectLastCalculation = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.lastCalculation || null
);

export const selectCalculationError = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.error || null
);

export const selectCalculationHistory = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.history?.items || []
);

export const selectCalculationHistoryPagination = createSelector(
  [selectCalculationState],
  (calculation) => ({
    page: calculation?.history?.page || 1,
    pageSize: calculation?.history?.pageSize || 20,
    total: calculation?.history?.total || 0,
    totalPages: calculation?.history?.totalPages || 0
  })
);

export const selectCalculationLoading = createSelector(
  [selectCalculationState],
  (calculation) => calculation?.loading || calculation?.triggering || calculation?.polling || false
);

// ============ Settings Selectors ============
export const selectSystemSettings = createSelector(
  [selectSettingsState],
  (settings) => settings?.systemSettings || null
);

export const selectReferenceData = createSelector(
  [selectSettingsState],
  (settings) => settings?.referenceData || { users: [], departments: [] }
);

export const selectNotificationPreferences = createSelector(
  [selectSettingsState],
  (settings) => settings?.notificationPreferences || null
);

export const selectSettingsLoading = createSelector(
  [selectSettingsState],
  (settings) => settings?.loading || false
);

export const selectSettingsSaving = createSelector(
  [selectSettingsState],
  (settings) => settings?.saving || false
);

export const selectSettingsError = createSelector(
  [selectSettingsState],
  (settings) => settings?.error || null
);

// ============ Export Selectors ============
export const selectExporting = createSelector(
  [selectExportState],
  (exportState) => exportState?.exporting || false
);

export const selectExportBlob = createSelector(
  [selectExportState],
  (exportState) => exportState?.exportData || null
);

export const selectExportType = createSelector(
  [selectExportState],
  (exportState) => exportState?.exportType || null
);

export const selectExportProgress = createSelector(
  [selectExportState],
  (exportState) => exportState?.exportProgress || 0
);

export const selectExportError = createSelector(
  [selectExportState],
  (exportState) => exportState?.error || null
);

export const selectLastExport = createSelector(
  [selectExportState],
  (exportState) => exportState?.lastExport || null
);

// ============ History Selectors ============
export const selectKPIHistory = createSelector(
  [selectHistoryState],
  (history) => history?.kpiHistory || []
);

export const selectActualHistory = createSelector(
  [selectHistoryState],
  (history) => history?.actualHistory || []
);

export const selectTargetHistory = createSelector(
  [selectHistoryState],
  (history) => history?.targetHistory || []
);

export const selectKPIHistoryForKPI = (kpiId) => createSelector(
  [selectHistoryState],
  (history) => history?.kpiHistoryByKPI?.[kpiId] || []
);

export const selectActualHistoryForActual = (actualId) => createSelector(
  [selectHistoryState],
  (history) => history?.actualHistoryByActual?.[actualId] || []
);

export const selectTargetHistoryForTarget = (targetId) => createSelector(
  [selectHistoryState],
  (history) => history?.targetHistoryByTarget?.[targetId] || []
);

export const selectHistoryLoading = createSelector(
  [selectHistoryState],
  (history) => history?.loading || false
);

export const selectHistoryError = createSelector(
  [selectHistoryState],
  (history) => history?.error || null
);

// ============ Combined Selectors ============
export const selectKPIStats = createSelector(
  [selectKPIs, selectKPILoading],
  (kpis, loading) => ({
    total: kpis?.length || 0,
    active: kpis?.filter(k => k?.is_active)?.length || 0,
    inactive: kpis?.filter(k => !k?.is_active)?.length || 0,
    loading: loading || false,
  })
);

export const selectFrameworkStats = createSelector(
  [selectFrameworks, selectFrameworkLoading],
  (frameworks, loading) => ({
    total: frameworks?.length || 0,
    published: frameworks?.filter(f => f?.status === 'PUBLISHED')?.length || 0,
    draft: frameworks?.filter(f => f?.status === 'DRAFT')?.length || 0,
    loading: loading || false,
  })
);

export const selectTargetStats = createSelector(
  [selectTargets, selectTargetLoading],
  (targets, loading) => ({
    total: targets?.length || 0,
    byYear: targets?.reduce((acc, t) => {
      if (t?.year) acc[t.year] = (acc[t.year] || 0) + 1;
      return acc;
    }, {}) || {},
    loading: loading || false,
  })
);

export const selectActualStats = createSelector(
  [selectActuals, selectActualLoading],
  (actuals, loading) => ({
    total: actuals?.length || 0,
    pending: actuals?.filter(a => a?.status === 'PENDING')?.length || 0,
    approved: actuals?.filter(a => a?.status === 'APPROVED')?.length || 0,
    rejected: actuals?.filter(a => a?.status === 'REJECTED')?.length || 0,
    loading: loading || false,
  })
);

export const selectScoreStats = createSelector(
  [selectScores, selectScoreLoading],
  (scores, loading) => ({
    total: scores?.length || 0,
    average: scores?.reduce((sum, s) => sum + (s?.score || 0), 0) / (scores?.length || 1),
    green: scores?.filter(s => (s?.score || 0) >= 90)?.length || 0,
    yellow: scores?.filter(s => (s?.score || 0) >= 50 && (s?.score || 0) < 90)?.length || 0,
    red: scores?.filter(s => (s?.score || 0) < 50)?.length || 0,
    loading: loading || false,
  })
);