import React from "react";
import { KPI_ROUTES } from "../config/constants/kpiRouteConstants";
import KPIErrorBoundary from "../components/kpi/common/KPIErrorBoundary";

const withBoundary = (element) => (
    <KPIErrorBoundary>
        {element}
    </KPIErrorBoundary>
);

// LAZY LOAD KPI PAGES
// ============================================

// Dashboard Pages
const IndividualDashboardPage = React.lazy(() => import('../pages/kpi/dashboard/IndividualDashboardPage'));
const ManagerDashboardPage = React.lazy(() => import('../pages/kpi/dashboard/ManagerDashboardPage'));
const ExecutiveDashboardPage = React.lazy(() => import('../pages/kpi/dashboard/ExecutiveDashboardPage'));
const ChampionDashboardPage = React.lazy(() => import('../pages/kpi/dashboard/ChampionDashboardPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/kpi/dashboard/AdminDashboardPage'));
// Admin Framework Pages (NEW - dedicated pages)
const CategoriesPage = React.lazy(() => import('../pages/kpi/admin/CategoriesPage'));
// KPI Management Pages
const KPIsPage = React.lazy(() => import('../pages/kpi/kpis/KPIsPage'));
const KPIDetailPage = React.lazy(() => import('../pages/kpi/kpis/KPIDetailPage'));
const KPIEditPage = React.lazy(() => import('../pages/kpi/kpis/KPIEditPage'));
// Target Pages
const TargetsPage = React.lazy(() => import('../pages/kpi/targets/TargetsPage'));
const TargetPhasingPage = React.lazy(() => import('../pages/kpi/targets/TargetPhasingPage'));
// Actual Pages
const ActualsPage = React.lazy(() => import('../pages/kpi/actuals/ActualsPage'));
const ActualAdjustmentsPage = React.lazy(() => import('../pages/kpi/actuals/ActualAdjustmentsPage'));
// Validation Pages
const ValidationsPage = React.lazy(() => import('../pages/kpi/validations/ValidationsPage'));
const EscalationsPage = React.lazy(() => import('../pages/kpi/validations/EscalationsPage'));
// Analytics Pages
const AnalyticsPage = React.lazy(() => import('../pages/kpi/analytics/AnalyticsPage'));
const ReportsPage = React.lazy(() => import('../pages/kpi/analytics/ReportsPage'));
const OrganizationHealthPage = React.lazy(() => import('../pages/kpi/analytics/OrganizationHealthPage'));
// Settings Pages
const SystemSettingsPage = React.lazy(() => import('../pages/kpi/settings/SystemSettingsPage'));
const ReferenceDataPage = React.lazy(() => import('../pages/kpi/settings/ReferenceDataPage'));
const NotificationPreferencesPage = React.lazy(() => import('../pages/kpi/settings/NotificationPreferencesPage'));
// Audit Pages
const AuditLogsPage = React.lazy(() => import('../pages/kpi/audit/AuditLogsPage'));
// Bulk Pages
const BulkUploadPage = React.lazy(() => import('../pages/kpi/bulk/BulkUploadPage'));
// Calculations Pages
const CalculationsPage = React.lazy(() => import('../pages/kpi/calculations/CalculationsPage'));
// User Pages
const UserKPIPage = React.lazy(() => import('../pages/kpi/users/UserKPIPage'));
// Score Pages
const ScoresPage = React.lazy(() => import('../pages/kpi/scores/ScoresPage'));
const MyScoresPage = React.lazy(() => import('../pages/kpi/scores/MyScoresPage'));
const TeamScoresPage = React.lazy(() => import('../pages/kpi/scores/TeamScoresPage'));
const RedAlertsPage = React.lazy(() => import('../pages/kpi/scores/RedAlertsPage'));
const AggregatedScoresPage = React.lazy(() => import('../pages/kpi/scores/AggregatedScoresPage'));

// KPI ROUTES CONFIGURATION
// ============================================

const kpiRoutes = [
    // Dashboards
    { path: KPI_ROUTES.DASHBOARD, element: withBoundary(<IndividualDashboardPage />) },
    { path: KPI_ROUTES.MANAGER_DASHBOARD, element: withBoundary(<ManagerDashboardPage />) },
    { path: KPI_ROUTES.EXECUTIVE_DASHBOARD, element: withBoundary(<ExecutiveDashboardPage />) },
    { path: KPI_ROUTES.CHAMPION_DASHBOARD, element: withBoundary(<ChampionDashboardPage />) },
    { path: KPI_ROUTES.ADMIN_OVERVIEW, element: withBoundary(<AdminDashboardPage />) },

    // Admin KPI Modules (Framework Management)
    { path: KPI_ROUTES.ADMIN_CATEGORIES, element: <CategoriesPage /> },
    { path: '/kpi/categories', element: <CategoriesPage /> },
    { path: KPI_ROUTES.ADMIN_CATEGORY_CREATE, element: <CategoriesPage /> },
    { path: KPI_ROUTES.ADMIN_CATEGORY_EDIT(':id'), element: <CategoriesPage /> },
    // KPI Management
    { path: KPI_ROUTES.KPI_MANAGEMENT, element: <KPIsPage /> },
    { path: '/kpi/kpis', element: <KPIsPage /> },
    { path: KPI_ROUTES.KPI_CREATE, element: <KPIsPage /> },
    { path: '/kpi/kpis/create', element: <KPIsPage /> },
    { path: KPI_ROUTES.KPI_DETAIL(':id'), element: <KPIDetailPage /> },
    { path: '/kpi/kpis/:id', element: <KPIDetailPage /> },
    { path: KPI_ROUTES.KPI_EDIT(':id'), element: <KPIEditPage /> },
    { path: '/kpi/kpis/:id/edit', element: <KPIEditPage /> },
    { path: KPI_ROUTES.KPI_MY_KPIS, element: <KPIsPage /> },
    // KPI Weights & Dependencies
    { path: KPI_ROUTES.KPI_WEIGHTS(':kpiId'), element: <KPIDetailPage /> },
    { path: KPI_ROUTES.KPI_DEPENDENCIES(':kpiId'), element: <KPIDetailPage /> },
    { path: KPI_ROUTES.KPI_STRATEGIC_LINKAGES(':kpiId'), element: <KPIDetailPage /> },
    // Target Management
    { path: KPI_ROUTES.TARGETS, element: <TargetsPage /> },
    { path: KPI_ROUTES.TARGET_PHASING(':targetId'), element: <TargetPhasingPage /> },
    { path: KPI_ROUTES.TARGET_CASCADE, element: <TargetsPage /> },
    { path: KPI_ROUTES.TARGET_CASCADE_RULES, element: <TargetsPage /> },
    { path: KPI_ROUTES.TARGET_CASCADE_MAP, element: <TargetsPage /> },
    // Actual Data
    { path: KPI_ROUTES.ACTUALS, element: <ActualsPage /> },
    { path: KPI_ROUTES.ACTUAL_SUBMIT, element: <ActualsPage /> },
    { path: KPI_ROUTES.ACTUAL_HISTORY, element: <ActualsPage /> },
    { path: KPI_ROUTES.ACTUAL_ADJUSTMENTS, element: <ActualAdjustmentsPage /> },
    { path: KPI_ROUTES.ACTUAL_EVIDENCE(':actualId'), element: <ActualsPage /> },
    // Scores (Handled by Analytics/Insights pages)
    { path: KPI_ROUTES.SCORES, element: <ScoresPage /> },
    { path: KPI_ROUTES.SCORE_MY_SCORES, element: <MyScoresPage /> },
    { path: KPI_ROUTES.SCORE_TEAM_SCORES, element: <TeamScoresPage /> },
    { path: KPI_ROUTES.SCORE_STATISTICS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.SCORE_TRAFFIC_LIGHTS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.SCORE_RED_ALERTS, element: <RedAlertsPage /> },
    // Aggregated Scores
    { path: KPI_ROUTES.AGGREGATED_SCORES, element: <AggregatedScoresPage /> },
    { path: KPI_ROUTES.AGGREGATED_SCORES_ORGANIZATION, element: <OrganizationHealthPage /> },
    { path: KPI_ROUTES.AGGREGATED_SCORES_DEPARTMENTS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.AGGREGATED_SCORES_RANKING, element: <AnalyticsPage /> },
    // Validations & Escalations
    { path: KPI_ROUTES.VALIDATIONS, element: <ValidationsPage /> },
    { path: KPI_ROUTES.VALIDATIONS_PENDING, element: <ValidationsPage /> },
    { path: KPI_ROUTES.VALIDATIONS_HISTORY, element: <ValidationsPage /> },
    { path: KPI_ROUTES.ESCALATIONS, element: <EscalationsPage /> },
    { path: KPI_ROUTES.ESCALATIONS_MY, element: <EscalationsPage /> },
    // Reports & Analytics
    { path: KPI_ROUTES.REPORTS, element: <ReportsPage /> },
    { path: KPI_ROUTES.REPORTS_CUSTOM, element: <ReportsPage /> },
    { path: KPI_ROUTES.REPORTS_EXPORT, element: <ReportsPage /> },
    { path: KPI_ROUTES.ANALYTICS_INSIGHTS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.ANALYTICS_PREDICTIONS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.KPI_ANALYTICS, element: <AnalyticsPage /> },
    { path: KPI_ROUTES.KPI_HEATMAP, element: <AnalyticsPage /> },
    // Organization Health
    { path: KPI_ROUTES.ORGANIZATION_HEALTH, element: <OrganizationHealthPage /> },
    // Bulk Operations
    { path: KPI_ROUTES.BULK_UPLOAD, element: <BulkUploadPage /> },
    { path: KPI_ROUTES.BULK_KPI_UPLOAD, element: <BulkUploadPage /> },
    { path: KPI_ROUTES.BULK_ACTUAL_UPLOAD, element: <BulkUploadPage /> },
    { path: KPI_ROUTES.BULK_TARGET_UPLOAD, element: <BulkUploadPage /> },
    // Calculations
    { path: KPI_ROUTES.CALCULATIONS, element: <CalculationsPage /> },
    { path: KPI_ROUTES.CALCULATIONS_TRIGGER, element: <CalculationsPage /> },
    { path: KPI_ROUTES.CALCULATIONS_STATUS(':taskId'), element: <CalculationsPage /> },
    // System Settings
    { path: KPI_ROUTES.SYSTEM_SETTINGS, element: <SystemSettingsPage /> },
    { path: KPI_ROUTES.REFERENCE_DATA, element: <ReferenceDataPage /> },
    { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, element: <NotificationPreferencesPage /> },
    { path: KPI_ROUTES.KPI_SETTINGS, element: <SystemSettingsPage /> },
    // Audit Logs
    { path: KPI_ROUTES.AUDIT_LOGS, element: <AuditLogsPage /> },
    // User Nested Routes
    { path: KPI_ROUTES.USER_KPIS(':userId'), element: <UserKPIPage /> },
    { path: KPI_ROUTES.USER_TARGETS(':userId'), element: <UserKPIPage /> },
    { path: KPI_ROUTES.USER_SCORES(':userId'), element: <UserKPIPage /> },
    { path: KPI_ROUTES.USER_ACTUALS(':userId'), element: <UserKPIPage /> },
];

// HELPER FUNCTION TO BUILD PATHS WITH PARAMS
export const buildKpiPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};
// EXPORT ROUTES
export default kpiRoutes;
// NAMED EXPORTS FOR COMMON PATHS
export const KpiPaths = {
    // Dashboards
    Dashboard: KPI_ROUTES.DASHBOARD,
    ManagerDashboard: KPI_ROUTES.MANAGER_DASHBOARD,
    ExecutiveDashboard: KPI_ROUTES.EXECUTIVE_DASHBOARD,
    ChampionDashboard: KPI_ROUTES.CHAMPION_DASHBOARD,
    AdminDashboard: KPI_ROUTES.ADMIN_OVERVIEW,
    // Admin Framework
    AdminCategories: KPI_ROUTES.ADMIN_CATEGORIES,
    // KPI Management
    KPIs: KPI_ROUTES.KPI_MANAGEMENT,
    KPIDetail: (id) => buildKpiPath('/kpi/kpis/:id', { id }),
    KPIEdit: (id) => buildKpiPath('/kpi/kpis/:id/edit', { id }),
    KPICreate: '/kpi/kpis/create',
    MyKPIs: KPI_ROUTES.KPI_MY_KPIS,
    // Targets
    Targets: KPI_ROUTES.TARGETS,
    TargetPhasing: (id) => buildKpiPath(KPI_ROUTES.TARGET_PHASING(':targetId'), { targetId: id }),
    // Actuals
    Actuals: KPI_ROUTES.ACTUALS,
    SubmitActual: KPI_ROUTES.ACTUAL_SUBMIT,
    ActualAdjustments: KPI_ROUTES.ACTUAL_ADJUSTMENTS,
    // Validations
    Validations: KPI_ROUTES.VALIDATIONS,
    PendingValidations: KPI_ROUTES.VALIDATIONS_PENDING,
    Escalations: KPI_ROUTES.ESCALATIONS,
    // Analytics
    Analytics: KPI_ROUTES.ANALYTICS_INSIGHTS,
    Reports: KPI_ROUTES.REPORTS,
    OrganizationHealth: KPI_ROUTES.ORGANIZATION_HEALTH,
    // Settings
    SystemSettings: KPI_ROUTES.SYSTEM_SETTINGS,
    ReferenceData: KPI_ROUTES.REFERENCE_DATA,
    NotificationPreferences: KPI_ROUTES.NOTIFICATION_PREFERENCES,
    // Operations
    BulkUpload: KPI_ROUTES.BULK_UPLOAD,
    Calculations: KPI_ROUTES.CALCULATIONS,
    AuditLogs: KPI_ROUTES.AUDIT_LOGS,
    // User
    UserKPIs: (userId) => buildKpiPath(KPI_ROUTES.USER_KPIS(':userId'), { userId }),
};