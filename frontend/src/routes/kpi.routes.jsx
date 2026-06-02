import React from "react";
import { ROUTES } from "../config/constants";

// Lazy load KPI pages
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
const KpiSettingsPage = React.lazy(() => import('../pages/kpi/KpiSettingsPage'));
const MyKPIsPage = React.lazy(() => import('../pages/kpi/MyKPIsPage'));
const KPIAnalyticsPage = React.lazy(() => import('../pages/kpi/KPIAnalyticsPage'));

// ============================================
// ADMIN PAGES (NEW)
// ============================================
const AdminOverviewPage = React.lazy(() => import('../pages/kpi/AdminOverviewPage'));
const SectorsPage = React.lazy(() => import('../pages/kpi/SectorsPage'));
const FrameworksPage = React.lazy(() => import('../pages/kpi/FrameworksPage'));
const CategoriesPage = React.lazy(() => import('../pages/kpi/CategoriesPage'));
const TemplatesPage = React.lazy(() => import('../pages/kpi/TemplatesPage'));

const kpiRoutes = [
    // ============================================
    // Dashboards
    // ============================================
    { path: ROUTES.KPI_DASHBOARD, element: <KPIDashboardPage /> },

    // ============================================
    // KPI Management
    // ============================================
    { path: ROUTES.KPI_MANAGEMENT, element: <KPIManagementPage /> },
    { path: ROUTES.KPI_CREATE, element: <KPICreatePage /> },
    { path: ROUTES.KPI_DETAIL, element: <KPIDetailPage /> },
    { path: ROUTES.KPI_EDIT, element: <KPIEditPage /> },
    { path: ROUTES.KPI_MY_KPIS, element: <MyKPIsPage /> },

    // ============================================
    // Targets
    // ============================================
    { path: ROUTES.TARGETS, element: <TargetManagementPage /> },
    { path: ROUTES.TARGET_PHASING, element: <TargetManagementPage /> },
    { path: ROUTES.TARGET_CASCADE, element: <TargetManagementPage /> },

    // ============================================
    // Performance Tracking (Actuals)
    // ============================================
    { path: ROUTES.ACTUALS, element: <PerformanceTrackingPage /> },
    { path: ROUTES.ACTUAL_SUBMIT, element: <PerformanceTrackingPage /> },

    // ============================================
    // Validation & Adjustments
    // ============================================
    { path: ROUTES.KPI_VALIDATION, element: <KPIValidationQueuePage /> },
    { path: ROUTES.KPI_ADJUSTMENTS, element: <KPIAdjustmentsPage /> },

    // ============================================
    // Reports & Analytics
    // ============================================
    { path: ROUTES.KPI_REPORTS, element: <ReportsAnalyticsPage /> },
    { path: ROUTES.KPI_ANALYTICS, element: <KPIAnalyticsPage /> },
    { path: ROUTES.KPI_HEATMAP, element: <KPIAnalyticsPage /> },

    // ============================================
    // System Settings (Super Admin / Client Admin)
    // ============================================
    { path: ROUTES.KPI_SETTINGS, element: <KpiSettingsPage /> },

    // ============================================
    // KPI ADMIN MODULES (Super Admin / Client Admin only)
    // ============================================
    { path: '/kpi/admin/overview', element: <AdminOverviewPage /> },
    { path: '/kpi/admin/sectors', element: <SectorsPage /> },
    { path: '/kpi/admin/frameworks', element: <FrameworksPage /> },
    { path: '/kpi/admin/categories', element: <CategoriesPage /> },
    { path: '/kpi/admin/templates', element: <TemplatesPage /> },
];

export default kpiRoutes;