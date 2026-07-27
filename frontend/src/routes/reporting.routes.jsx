// frontend/src/routes/reporting.routes.jsx
import React from 'react';
import { REPORT_ROUTES } from '../config/constants/reportRouteConstants';

// LAZY LOAD REPORT PAGES
// ============================================

// Main Reports Pages
const ReportsPage = React.lazy(() => import('../pages/reports/ReportsPage'));
const ReportListPage = React.lazy(() => import('../pages/reports/ReportListPage'));
const ReportDetailPage = React.lazy(() => import('../pages/reports/ReportDetailPage'));
const ReportCreatePage = React.lazy(() => import('../pages/reports/ReportCreatePage'));
const ReportEditPage = React.lazy(() => import('../pages/reports/ReportEditPage'));
const ReportGeneratePage = React.lazy(() => import('../pages/reports/ReportGeneratePage'));
const ReportExportPage = React.lazy(() => import('../pages/reports/ReportExportPage'));

// Template Pages
const TemplatesPage = React.lazy(() => import('../pages/reports/TemplatesPage'));
const TemplateDetailPage = React.lazy(() => import('../pages/reports/TemplateDetailPage'));
const TemplateCreatePage = React.lazy(() => import('../pages/reports/TemplateCreatePage'));
const TemplateEditPage = React.lazy(() => import('../pages/reports/TemplateEditPage'));
const TemplateApplyPage = React.lazy(() => import('../pages/reports/TemplateApplyPage'));

// Schedule Pages
const SchedulesPage = React.lazy(() => import('../pages/reports/SchedulesPage'));
const ScheduleDetailPage = React.lazy(() => import('../pages/reports/ScheduleDetailPage'));
const ScheduleCreatePage = React.lazy(() => import('../pages/reports/ScheduleCreatePage'));
const ScheduleEditPage = React.lazy(() => import('../pages/reports/ScheduleEditPage'));

// Execution Pages
const ExecutionsPage = React.lazy(() => import('../pages/reports/ExecutionsPage'));
const ExecutionDetailPage = React.lazy(() => import('../pages/reports/ExecutionDetailPage'));

// Export Pages
const ExportsPage = React.lazy(() => import('../pages/reports/ExportsPage'));
const ExportDetailPage = React.lazy(() => import('../pages/reports/ExportDetailPage'));
const ExportCreatePage = React.lazy(() => import('../pages/reports/ExportCreatePage'));

// Dashboard Pages
const DashboardsPage = React.lazy(() => import('../pages/reports/DashboardsPage'));
const DashboardDetailPage = React.lazy(() => import('../pages/reports/DashboardDetailPage'));
const DashboardCreatePage = React.lazy(() => import('../pages/reports/DashboardCreatePage'));
const DashboardEditPage = React.lazy(() => import('../pages/reports/DashboardEditPage'));
const DashboardViewPage = React.lazy(() => import('../pages/reports/DashboardViewPage'));

// Share Pages
const SharesPage = React.lazy(() => import('../pages/reports/SharesPage'));
const ShareDetailPage = React.lazy(() => import('../pages/reports/ShareDetailPage'));
const ShareCreatePage = React.lazy(() => import('../pages/reports/ShareCreatePage'));
const ShareAccessPage = React.lazy(() => import('../pages/reports/ShareAccessPage'));

// Audit Pages
const AuditsPage = React.lazy(() => import('../pages/reports/AuditsPage'));
const AuditDetailPage = React.lazy(() => import('../pages/reports/AuditDetailPage'));

// Analytics Pages
const AnalyticsPage = React.lazy(() => import('../pages/reports/AnalyticsPage'));

// REPORT ROUTES CONFIGURATION
// ============================================

const reportingRoutes = [
  // Main Reports
  {
    path: REPORT_ROUTES.BASE,
    element: <ReportsPage />,
    children: [
      { path: '', element: <ReportListPage /> },
      { path: REPORT_ROUTES.REPORTS, element: <ReportListPage /> },
      { path: REPORT_ROUTES.REPORT_CREATE, element: <ReportCreatePage /> },
      { path: REPORT_ROUTES.REPORT_DETAIL(':id'), element: <ReportDetailPage /> },
      { path: REPORT_ROUTES.REPORT_EDIT(':id'), element: <ReportEditPage /> },
      { path: REPORT_ROUTES.REPORT_VIEW(':id'), element: <ReportDetailPage /> },
      { path: REPORT_ROUTES.REPORT_GENERATE(':id'), element: <ReportGeneratePage /> },
      { path: REPORT_ROUTES.REPORT_EXPORT(':id'), element: <ReportExportPage /> },
      { path: REPORT_ROUTES.REPORT_SETTINGS(':id'), element: <ReportDetailPage /> },
      { path: REPORT_ROUTES.REPORT_HISTORY(':id'), element: <ReportDetailPage /> },
      { path: REPORT_ROUTES.MY_REPORTS, element: <ReportListPage /> },
      { path: REPORT_ROUTES.PUBLIC_REPORTS, element: <ReportListPage /> },
    ],
  },
  // Templates
  {
    path: REPORT_ROUTES.TEMPLATES,
    element: <ReportsPage />,
    children: [
      { path: '', element: <TemplatesPage /> },
      { path: REPORT_ROUTES.TEMPLATE_CREATE, element: <TemplateCreatePage /> },
      { path: REPORT_ROUTES.TEMPLATE_DETAIL(':id'), element: <TemplateDetailPage /> },
      { path: REPORT_ROUTES.TEMPLATE_EDIT(':id'), element: <TemplateEditPage /> },
      { path: REPORT_ROUTES.TEMPLATE_APPLY(':id'), element: <TemplateApplyPage /> },
      { path: REPORT_ROUTES.TEMPLATE_PREBUILT, element: <TemplatesPage /> },
    ],
  },
  // Schedules
  {
    path: REPORT_ROUTES.SCHEDULES,
    element: <ReportsPage />,
    children: [
      { path: '', element: <SchedulesPage /> },
      { path: REPORT_ROUTES.SCHEDULE_CREATE, element: <ScheduleCreatePage /> },
      { path: REPORT_ROUTES.SCHEDULE_DETAIL(':id'), element: <ScheduleDetailPage /> },
      { path: REPORT_ROUTES.SCHEDULE_EDIT(':id'), element: <ScheduleEditPage /> },
      { path: REPORT_ROUTES.SCHEDULE_HISTORY(':id'), element: <ScheduleDetailPage /> },
      { path: REPORT_ROUTES.SCHEDULE_DUE, element: <SchedulesPage /> },
    ],
  },
  // Executions
  {
    path: REPORT_ROUTES.EXECUTIONS,
    element: <ReportsPage />,
    children: [
      { path: '', element: <ExecutionsPage /> },
      { path: REPORT_ROUTES.EXECUTION_DETAIL(':id'), element: <ExecutionDetailPage /> },
    ],
  },
  // Exports
  {
    path: REPORT_ROUTES.EXPORTS,
    element: <ReportsPage />,
    children: [
      { path: '', element: <ExportsPage /> },
      { path: REPORT_ROUTES.EXPORT_DETAIL(':id'), element: <ExportDetailPage /> },
      { path: REPORT_ROUTES.EXPORT_CREATE, element: <ExportCreatePage /> },
      { path: REPORT_ROUTES.MY_EXPORTS, element: <ExportsPage /> },
    ],
  },
  // Dashboards
  {
    path: REPORT_ROUTES.DASHBOARDS,
    element: <ReportsPage />,
    children: [
      { path: '', element: <DashboardsPage /> },
      { path: REPORT_ROUTES.DASHBOARD_CREATE, element: <DashboardCreatePage /> },
      { path: REPORT_ROUTES.DASHBOARD_DETAIL(':id'), element: <DashboardDetailPage /> },
      { path: REPORT_ROUTES.DASHBOARD_EDIT(':id'), element: <DashboardEditPage /> },
      { path: REPORT_ROUTES.DASHBOARD_VIEW(':id'), element: <DashboardViewPage /> },
      { path: REPORT_ROUTES.DASHBOARD_SHARE(':id'), element: <DashboardDetailPage /> },
      { path: REPORT_ROUTES.MY_DASHBOARDS, element: <DashboardsPage /> },
      { path: REPORT_ROUTES.DEFAULT_DASHBOARD, element: <DashboardsPage /> },
    ],
  },
  // Shares
  {
    path: REPORT_ROUTES.SHARES,
    element: <ReportsPage />,
    children: [
      { path: '', element: <SharesPage /> },
      { path: REPORT_ROUTES.SHARE_CREATE, element: <ShareCreatePage /> },
      { path: REPORT_ROUTES.SHARE_DETAIL(':id'), element: <ShareDetailPage /> },
      { path: REPORT_ROUTES.SHARED_WITH_ME, element: <SharesPage /> },
    ],
  },
  // Share Access (Public route)
  { path: REPORT_ROUTES.SHARE_ACCESS(':token'), element: <ShareAccessPage /> },
  // Audits
  {
    path: REPORT_ROUTES.AUDITS,
    element: <ReportsPage />,
    children: [
      { path: '', element: <AuditsPage /> },
      { path: REPORT_ROUTES.AUDIT_DETAIL(':id'), element: <AuditDetailPage /> },
    ],
  },
  // Analytics
  {
    path: REPORT_ROUTES.ANALYTICS,
    element: <ReportsPage />,
    children: [
      { path: '', element: <AnalyticsPage /> },
      { path: REPORT_ROUTES.ANALYTICS_TREND, element: <AnalyticsPage /> },
      { path: REPORT_ROUTES.ANALYTICS_PERFORMANCE, element: <AnalyticsPage /> },
      { path: REPORT_ROUTES.ANALYTICS_COMPARATIVE, element: <AnalyticsPage /> },
      { path: REPORT_ROUTES.ANALYTICS_PREDICTIVE, element: <AnalyticsPage /> },
      { path: REPORT_ROUTES.ANALYTICS_ANOMALY, element: <AnalyticsPage /> },
    ],
  },
  // Reporting (Generate/Export actions)
  {
    path: REPORT_ROUTES.REPORTING,
    element: <ReportsPage />,
    children: [
      { path: '', element: <ReportListPage /> },
      { path: REPORT_ROUTES.REPORTING_GENERATE, element: <ReportGeneratePage /> },
      { path: REPORT_ROUTES.REPORTING_EXPORT, element: <ReportExportPage /> },
      { path: REPORT_ROUTES.REPORTING_BULK, element: <ExportsPage /> },
      { path: REPORT_ROUTES.REPORTING_STATUS(':taskId'), element: <ExportsPage /> },
    ],
  },
  // Admin
  {
    path: REPORT_ROUTES.ADMIN,
    element: <ReportsPage />,
    children: [
      { path: '', element: <DashboardsPage /> },
      { path: REPORT_ROUTES.ADMIN_OVERVIEW, element: <DashboardsPage /> },
      { path: REPORT_ROUTES.ADMIN_SETTINGS, element: <TemplatesPage /> },
    ],
  },
];

// HELPER FUNCTION TO BUILD PATHS WITH PARAMS
export const buildReportPath = (path, params = {}) => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
};

// NAMED EXPORTS FOR COMMON PATHS
export const ReportPaths = {
  // Base
  Base: REPORT_ROUTES.BASE,
  Dashboard: REPORT_ROUTES.DASHBOARD,

  // Reports
  Reports: REPORT_ROUTES.REPORTS,
  ReportCreate: REPORT_ROUTES.REPORT_CREATE,
  ReportDetail: (id) => buildReportPath(REPORT_ROUTES.REPORT_DETAIL(':id'), { id }),
  ReportEdit: (id) => buildReportPath(REPORT_ROUTES.REPORT_EDIT(':id'), { id }),
  ReportView: (id) => buildReportPath(REPORT_ROUTES.REPORT_VIEW(':id'), { id }),
  ReportGenerate: (id) => buildReportPath(REPORT_ROUTES.REPORT_GENERATE(':id'), { id }),
  ReportExport: (id) => buildReportPath(REPORT_ROUTES.REPORT_EXPORT(':id'), { id }),
  ReportSettings: (id) => buildReportPath(REPORT_ROUTES.REPORT_SETTINGS(':id'), { id }),
  ReportHistory: (id) => buildReportPath(REPORT_ROUTES.REPORT_HISTORY(':id'), { id }),
  MyReports: REPORT_ROUTES.MY_REPORTS,
  PublicReports: REPORT_ROUTES.PUBLIC_REPORTS,

  // Templates
  Templates: REPORT_ROUTES.TEMPLATES,
  TemplateCreate: REPORT_ROUTES.TEMPLATE_CREATE,
  TemplateDetail: (id) => buildReportPath(REPORT_ROUTES.TEMPLATE_DETAIL(':id'), { id }),
  TemplateEdit: (id) => buildReportPath(REPORT_ROUTES.TEMPLATE_EDIT(':id'), { id }),
  TemplateApply: (id) => buildReportPath(REPORT_ROUTES.TEMPLATE_APPLY(':id'), { id }),
  TemplatePrebuilt: REPORT_ROUTES.TEMPLATE_PREBUILT,

  // Schedules
  Schedules: REPORT_ROUTES.SCHEDULES,
  ScheduleCreate: REPORT_ROUTES.SCHEDULE_CREATE,
  ScheduleDetail: (id) => buildReportPath(REPORT_ROUTES.SCHEDULE_DETAIL(':id'), { id }),
  ScheduleEdit: (id) => buildReportPath(REPORT_ROUTES.SCHEDULE_EDIT(':id'), { id }),
  ScheduleHistory: (id) => buildReportPath(REPORT_ROUTES.SCHEDULE_HISTORY(':id'), { id }),
  ScheduleDue: REPORT_ROUTES.SCHEDULE_DUE,

  // Executions
  Executions: REPORT_ROUTES.EXECUTIONS,
  ExecutionDetail: (id) => buildReportPath(REPORT_ROUTES.EXECUTION_DETAIL(':id'), { id }),

  // Exports
  Exports: REPORT_ROUTES.EXPORTS,
  ExportDetail: (id) => buildReportPath(REPORT_ROUTES.EXPORT_DETAIL(':id'), { id }),
  ExportCreate: REPORT_ROUTES.EXPORT_CREATE,
  MyExports: REPORT_ROUTES.MY_EXPORTS,

  // Dashboards
  Dashboards: REPORT_ROUTES.DASHBOARDS,
  DashboardCreate: REPORT_ROUTES.DASHBOARD_CREATE,
  DashboardDetail: (id) => buildReportPath(REPORT_ROUTES.DASHBOARD_DETAIL(':id'), { id }),
  DashboardEdit: (id) => buildReportPath(REPORT_ROUTES.DASHBOARD_EDIT(':id'), { id }),
  DashboardView: (id) => buildReportPath(REPORT_ROUTES.DASHBOARD_VIEW(':id'), { id }),
  DashboardShare: (id) => buildReportPath(REPORT_ROUTES.DASHBOARD_SHARE(':id'), { id }),
  MyDashboards: REPORT_ROUTES.MY_DASHBOARDS,
  DefaultDashboard: REPORT_ROUTES.DEFAULT_DASHBOARD,

  // Shares
  Shares: REPORT_ROUTES.SHARES,
  ShareCreate: REPORT_ROUTES.SHARE_CREATE,
  ShareDetail: (id) => buildReportPath(REPORT_ROUTES.SHARE_DETAIL(':id'), { id }),
  ShareAccess: (token) => buildReportPath(REPORT_ROUTES.SHARE_ACCESS(':token'), { token }),
  SharedWithMe: REPORT_ROUTES.SHARED_WITH_ME,

  // Audits
  Audits: REPORT_ROUTES.AUDITS,
  AuditDetail: (id) => buildReportPath(REPORT_ROUTES.AUDIT_DETAIL(':id'), { id }),

  // Analytics
  Analytics: REPORT_ROUTES.ANALYTICS,
  AnalyticsTrend: REPORT_ROUTES.ANALYTICS_TREND,
  AnalyticsPerformance: REPORT_ROUTES.ANALYTICS_PERFORMANCE,
  AnalyticsComparative: REPORT_ROUTES.ANALYTICS_COMPARATIVE,
  AnalyticsPredictive: REPORT_ROUTES.ANALYTICS_PREDICTIVE,
  AnalyticsAnomaly: REPORT_ROUTES.ANALYTICS_ANOMALY,

  // Reporting
  Reporting: REPORT_ROUTES.REPORTING,
  ReportingGenerate: REPORT_ROUTES.REPORTING_GENERATE,
  ReportingExport: REPORT_ROUTES.REPORTING_EXPORT,
  ReportingBulk: REPORT_ROUTES.REPORTING_BULK,
  ReportingStatus: (taskId) => buildReportPath(REPORT_ROUTES.REPORTING_STATUS(':taskId'), { taskId }),

  // Admin
  Admin: REPORT_ROUTES.ADMIN,
  AdminOverview: REPORT_ROUTES.ADMIN_OVERVIEW,
  AdminSettings: REPORT_ROUTES.ADMIN_SETTINGS,
};

// EXPORT ROUTES
export default reportingRoutes;