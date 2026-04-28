import React from "react";
import { ROUTES } from "../config/constants";
// Lazy load KPI pages (adjust paths to match your actual files)
const KPIDashboardPage = React.lazy(() => import('../pages/kpi/KPIDashboardPage'));
const KPIManagementPage = React.lazy(() => import('../pages/kpi/KPIManagementPage'));
const TargetManagementPage = React.lazy(() => import('../pages/kpi/TargetManagementPage'));
const PerformanceTrackingPage = React.lazy(() => import('../pages/kpi/PerformanceTrackingPage'));
const ReportsAnalyticsPage = React.lazy(() => import('../pages/kpi/ReportsAnalyticsPage'));
const KPIValidationQueuePage = React.lazy(() => import('../pages/kpi/KPIValidationQueuePage'));
const KPIAdjustmentsPage = React.lazy(() => import('../pages/kpi/KPIAdjustmentsPage'));
const KPIDetailPage = React.lazy(() => import('../pages/kpi/KPIDetailPage'));
const KPICreatePage = React.lazy(() => import('../pages/kpi/KPICreatePage'));
const KPIEditPage = React.lazy(() => import('../pages/kpi/KPIEditPage'));

const kpiRoutes = [
    // Dashboard
    { path: ROUTES.KPI_DASHBOARD, element: <KPIDashboardPage /> },
    
    // KPI Management
    { path: ROUTES.KPI_MANAGEMENT, element: <KPIManagementPage /> },
    { path: ROUTES.KPI_CREATE, element: <KPICreatePage /> },
    { path: ROUTES.KPI_DETAIL, element: <KPIDetailPage /> },
    { path: ROUTES.KPI_EDIT, element: <KPIEditPage /> },
    
    // Targets
    { path: ROUTES.TARGETS, element: <TargetManagementPage /> },
    // Performance Tracking (Actuals)
    { path: ROUTES.ACTUALS, element: <PerformanceTrackingPage /> },
    { path: ROUTES.ACTUAL_SUBMIT, element: <PerformanceTrackingPage /> }, // Or use a dedicated component
    
    // Validation
    { path: ROUTES.KPI_VALIDATION, element: <KPIValidationQueuePage /> },
    { path: ROUTES.KPI_ADJUSTMENTS, element: <KPIAdjustmentsPage /> },
    // Reports
    { path: ROUTES.KPI_REPORTS, element: <ReportsAnalyticsPage /> },
];

export default kpiRoutes;