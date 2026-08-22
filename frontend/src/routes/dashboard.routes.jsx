// frontend/src/routes/dashboard.routes.js
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

// ============================================
// SUPER ADMIN COMPONENTS
// ============================================
const SuperAdminDashboard = debugLazy(
  () => import('../pages/dashboard'),
  'SuperAdminDashboard'
);

// ============================================
// CLIENT ADMIN COMPONENTS
// ============================================
const ClientAdminOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ClientAdminOverview'
);


// ============================================
// EXECUTIVE COMPONENTS
// ============================================
const ExecutiveOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ExecutiveOverview'
);

// ============================================
// MANAGER COMPONENTS
// ============================================
const ManagerOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ManagerOverview'
);

// ============================================
// STAFF COMPONENTS
// ============================================
const StaffOverview = debugLazy(
  () => import('../pages/dashboard'),
  'StaffOverview'
);

// ============================================
// CHAMPION COMPONENTS
// ============================================
const ChampionOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ChampionOverview'
);

// ============================================
// READ-ONLY COMPONENTS
// ============================================
const ReadOnlyOverview = debugLazy(
  () => import('../pages/dashboard'),
  'ReadOnlyOverview'
);

// Loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  }}>
    <div>Loading Dashboard...</div>
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

      // SUPER ADMIN ROUTES
      { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, element: withSuspense(SuperAdminDashboard) },

      // CLIENT ADMIN ROUTES
      { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, element: withSuspense(ClientAdminOverview) },

      // EXECUTIVE ROUTES
      { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, element: withSuspense(ExecutiveOverview) },

      // MANAGER ROUTES
      { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, element: withSuspense(ManagerOverview) },

      // STAFF ROUTES
      { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, element: withSuspense(StaffOverview) },

      // CHAMPION ROUTES
      { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, element: withSuspense(ChampionOverview) },

      // READ-ONLY ROUTES
      { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, element: withSuspense(ReadOnlyOverview) },
    ],
  },
];

export default dashboardRoutes;