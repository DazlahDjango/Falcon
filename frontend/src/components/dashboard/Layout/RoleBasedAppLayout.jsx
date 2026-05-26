import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { resolveDashboardRole } from '../../../utils/dashboard/resolveDashboardRole';
import { DASHBOARD_TYPES } from '../../../config/constants/dashboardConstants';
import DashboardShell from '../common/DashboardShell';

const CommonMainLayout = React.lazy(() => import('../../common/Layout/MainLayout'));

const ADMIN_PLATFORM_ROLES = new Set([
  DASHBOARD_TYPES.SUPER_ADMIN,
  DASHBOARD_TYPES.CLIENT_ADMIN,
]);

/**
 * Super/client admins use the PMS dashboard shell for all routes (config, billing, tenant, etc.).
 * Other roles use the legacy app layout unless they are on a /dashboard/* path.
 */
const RoleBasedAppLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const dashboardRole = resolveDashboardRole(user);

  const isKpiRoute = pathname.startsWith('/kpi');
  const useDashboardShell =
    !isKpiRoute &&
    (ADMIN_PLATFORM_ROLES.has(dashboardRole) || pathname.startsWith('/dashboard'));

  if (useDashboardShell) {
    return <DashboardShell />;
  }

  return (
    <React.Suspense fallback={<div className="layout-loading">Loading…</div>}>
      <CommonMainLayout />
    </React.Suspense>
  );
};

export default RoleBasedAppLayout;
