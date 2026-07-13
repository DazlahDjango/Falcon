import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { resolveDashboardRole } from '../../../utils/dashboard/resolveDashboardRole';
import { DASHBOARD_TYPES } from '../../../config/constants/dashboardConstants';
import { DashboardProviders } from '../../../providers/DashboardProviders';
import MainLayout from '../Layout/MainLayout';

const ADMIN_PLATFORM_ROLES = new Set([
  DASHBOARD_TYPES.SUPER_ADMIN,
  DASHBOARD_TYPES.CLIENT_ADMIN,
]);

/**
 * Role-based layout that provides DashboardProviders and MainLayout for all routes.
 * Super/client admins and dashboard routes get the full dashboard experience.
 * Other roles (KPI, etc.) still get the same layout but with role-specific sidebars.
 */
const RoleBasedAppLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const dashboardRole = resolveDashboardRole(user);

  const isKpiRoute = pathname.startsWith('/kpi');
  const useDashboardShell =
    !isKpiRoute &&
    (ADMIN_PLATFORM_ROLES.has(dashboardRole) || pathname.startsWith('/dashboard'));

  // Both paths now use DashboardProviders + MainLayout
  // The difference is purely in the routing logic above for future extensibility
  return (
    <DashboardProviders>
      <MainLayout />
    </DashboardProviders>
  );
};

export default RoleBasedAppLayout;