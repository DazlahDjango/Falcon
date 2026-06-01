// frontend/src/routes/dashboard.routes.js
// PMS dashboard routes — SUPER ADMIN ONLY (debug mode)
import React from 'react';
import { DASHBOARD_ROUTES } from '../config/constants/dashboardRouteConstants';
import { DashboardShell } from '../components/dashboard/common/DashboardShell';
import DashboardIndexRedirect from '../components/dashboard/common/DashboardIndexRedirect';

// ============================================
// DEBUG HELPER
// ============================================
const debugLazy = (importFn, componentName) => {
  return React.lazy(() => {
    console.log(`🔄 [DEBUG] Attempting to load: ${componentName}`);

    return importFn()
      .then(module => {
        console.log(`✅ [DEBUG] Module loaded for: ${componentName}`);
        console.log(`📦 [DEBUG] Available exports:`, Object.keys(module));

        // Try named export first, then default
        const Component = module[componentName] || module.default;

        if (!Component) {
          console.error(`❌ [DEBUG] Component "${componentName}" not found!`);
          throw new Error(`${componentName} export not found. Available: ${Object.keys(module).join(', ')}`);
        }

        return { default: Component };
      })
      .catch(error => {
        console.error(`❌ [DEBUG] Failed to load ${componentName}:`, error);
        return {
          default: () => (
            <div style={{ padding: '20px', color: 'red', border: '1px solid red', margin: '20px' }}>
              <h3>Failed to load {componentName}</h3>
              <pre>{error.message}</pre>
            </div>
          )
        };
      });
  });
};

// ✅ FIXED: Import from index.js instead of individual files
const SuperAdminDashboard = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminDashboard'
);

const SuperAdminDashboardCustom = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminDashboardCustom'
);

const SuperAdminTenants = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminTenants'
);

const SuperAdminSystemHealth = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSystemHealth'
);

const SuperAdminSubscriptions = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSubscriptions'
);

const SuperAdminBilling = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminBilling'
);

const SuperAdminPlatformMetrics = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminPlatformMetrics'
);

const SuperAdminAuditLogs = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminAuditLogs'
);

const SuperAdminReports = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminReports'
);

const SuperAdminExports = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminExports'
);

const SuperAdminSettings = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminSettings'
);

// Loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  }}>
    <div>Loading Super Admin dashboard...</div>
  </div>
);

const withSuspense = (Component) => (
  <React.Suspense fallback={<LoadingFallback />}>
    <Component />
  </React.Suspense>
);

const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardShell />,
    children: [
      { index: true, element: <DashboardIndexRedirect /> },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, element: withSuspense(SuperAdminDashboard) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.CUSTOM_OVERVIEW, element: withSuspense(SuperAdminDashboardCustom) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, element: withSuspense(SuperAdminTenants) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, element: withSuspense(SuperAdminSystemHealth) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, element: withSuspense(SuperAdminSubscriptions) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, element: withSuspense(SuperAdminBilling) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, element: withSuspense(SuperAdminPlatformMetrics) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, element: withSuspense(SuperAdminAuditLogs) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.REPORTS, element: withSuspense(SuperAdminReports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.EXPORTS, element: withSuspense(SuperAdminExports) },
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.SETTINGS, element: withSuspense(SuperAdminSettings) },
    ],
  },
];

export default dashboardRoutes;