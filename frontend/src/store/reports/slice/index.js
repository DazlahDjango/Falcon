import { combineReducers } from '@reduxjs/toolkit';
import reportReducer from './report.slice';
import templateReducer from './template.slice';
import scheduleReducer from './schedule.slice';
import executionReducer from './execution.slice';
import exportReducer from './export.slice';
import dashboardReducer from './dashboard.slice';
import widgetReducer from './widget.slice';
import filterReducer from './filter.slice';
import shareReducer from './share.slice';
import auditReducer from './audit.slice';
import analyticsReducer from './analytics.slice';

export const reportReducers = combineReducers({
    report: reportReducer,
    template: templateReducer,
    schedule: scheduleReducer,
    execution: executionReducer,
    export: exportReducer,
    dashboard: dashboardReducer,
    widget: widgetReducer,
    filter: filterReducer,
    share: shareReducer,
    audit: auditReducer,
    analytics: analyticsReducer,
});

export default reportReducers;

export {
    default as reportReducer,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportReport,
    updateReportStatus,
    performReportAction,
    fetchMyReports,
    fetchPublicReports,
    fetchReportTypes,
    fetchReportStatuses,
    clearCurrentReport,
    clearErrors as clearReportErrors,
    setFilters as setReportFilters,
    resetFilters as resetReportFilters,
    setPagination as setReportPagination,
    clearAllReports,
    updateGenerationProgress,
    resetGenerationStatus,
} from './report.slice';

export {
    default as templateReducer,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    performTemplateAction,
    applyTemplate,
    fetchPrebuiltTemplates,
    fetchDefaultTemplates,
    fetchPopularTemplates,
    fetchTemplatesBySector,
    fetchTemplateTypes,
    clearCurrentTemplate,
    clearErrors as clearTemplateErrors,
    setFilters as setTemplateFilters,
    resetFilters as resetTemplateFilters,
    setPagination as setTemplatePagination,
    clearAllTemplates,
} from './template.slice';

export {
    default as scheduleReducer,
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    performScheduleAction,
    fetchScheduleHistory,
    fetchUpcomingRuns,
    fetchDueSchedules,
    fetchOverdueSchedules,
    fetchFrequencies,
    clearCurrentSchedule,
    clearErrors as clearScheduleErrors,
    setFilters as setScheduleFilters,
    resetFilters as resetScheduleFilters,
    setPagination as setSchedulePagination,
    clearAllSchedules,
} from './schedule.slice';

export {
    default as executionReducer,
    fetchExecutions,
    fetchExecution,
    fetchExecutionLogs,
    fetchExecutionsByReport,
    fetchExecutionStatuses,
    clearCurrentExecution,
    clearErrors as clearExecutionErrors,
    setFilters as setExecutionFilters,
    resetFilters as resetExecutionFilters,
    setPagination as setExecutionPagination,
    clearAllExecutions,
} from './execution.slice';

export {
    default as exportReducer,
    fetchExports,
    fetchExport,
    createExport,
    downloadExport,
    regenerateExport,
    fetchMyExports,
    fetchExportFormats,
    clearCurrentExport,
    clearErrors as clearExportErrors,
    setFilters as setExportFilters,
    resetFilters as resetExportFilters,
    setPagination as setExportPagination,
    clearAllExports,
    resetDownloading,
} from './export.slice';

export {
    default as dashboardReducer,
    fetchDashboards,
    fetchDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    performDashboardAction,
    updateDashboardLayout,
    refreshDashboard,
    fetchMyDashboards,
    fetchDefaultDashboard,
    fetchDashboardTypes,
    clearCurrentDashboard,
    clearErrors as clearDashboardErrors,
    setFilters as setDashboardFilters,
    resetFilters as resetDashboardFilters,
    setPagination as setDashboardPagination,
    clearAllDashboards,
    updateLayoutState,
} from './dashboard.slice';

export {
    default as widgetReducer,
    fetchWidgets,
    fetchWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    fetchWidgetData,
    performWidgetAction,
    refreshWidget,
    fetchWidgetTypes,
    fetchWidgetsByDashboard,
    clearCurrentWidget,
    clearErrors as clearWidgetErrors,
    setFilters as setWidgetFilters,
    resetFilters as resetWidgetFilters,
    setPagination as setWidgetPagination,
    clearAllWidgets,
    clearWidgetData,
} from './widget.slice';

export {
    default as filterReducer,
    fetchFilters,
    fetchFilter,
    createFilter,
    updateFilter,
    deleteFilter,
    applyFilter,
    setDefaultFilter,
    duplicateFilter,
    fetchGlobalFilters,
    fetchMyFilters,
    fetchFilterTypes,
    clearCurrentFilter,
    clearErrors as clearFilterErrors,
    setFiltersState,
    resetFiltersState,
    setPagination as setFilterPagination,
    clearAllFilters,
    clearAppliedFilters,
    setAppliedFilters,
} from './filter.slice';

export {
    default as shareReducer,
    fetchShares,
    fetchShare,
    createShare,
    updateShare,
    deleteShare,
    accessShare,
    deactivateShare,
    activateShare,
    fetchSharesByReport,
    fetchShareTypes,
    fetchSharePermissions,
    clearCurrentShare,
    clearErrors as clearShareErrors,
    setFilters as setShareFilters,
    resetFilters as resetShareFilters,
    setPagination as setSharePagination,
    clearAllShares,
    setAccessToken,
} from './share.slice';

export {
    default as auditReducer,
    fetchAudits,
    fetchAudit,
    fetchAuditsByReport,
    fetchAuditsByUser,
    fetchAuditActions,
    fetchAuditStats,
    clearCurrentAudit,
    clearErrors as clearAuditErrors,
    setFilters as setAuditFilters,
    resetFilters as resetAuditFilters,
    setPagination as setAuditPagination,
    clearAllAudits,
    clearStats,
} from './audit.slice';

export {
    default as analyticsReducer,
    analyzeTrend,
    analyzePerformance,
    analyzeComparative,
    analyzePredictive,
    detectAnomalies,
    clearAnalytics,
    clearErrors as clearAnalyticsErrors,
    setFilters as setAnalyticsFilters,
    resetFilters as resetAnalyticsFilters,
    clearHistory,
    setCurrentAnalysis,
} from './analytics.slice';