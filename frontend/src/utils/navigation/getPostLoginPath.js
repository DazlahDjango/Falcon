import { ROUTES } from '../../config/constants';
import { getDefaultRouteByRole } from '../../config/constants/dashboardRouteConstants';
import { DASHBOARD_TYPES } from '../../config/constants/dashboardConstants';
import { resolveDashboardRole } from '../dashboard/resolveDashboardRole';

const PMS_DASHBOARD_ROLES = new Set([
  DASHBOARD_TYPES.SUPER_ADMIN,
  DASHBOARD_TYPES.CLIENT_ADMIN,
  DASHBOARD_TYPES.EXECUTIVE,
  DASHBOARD_TYPES.MANAGER,
  DASHBOARD_TYPES.CHAMPION,
  DASHBOARD_TYPES.STAFF,
  DASHBOARD_TYPES.READ_ONLY,
]);

/**
 * Where to send the user immediately after login (or when visiting / while authenticated).
 * Platform roles use the integrated PMS dashboard app under /dashboard/*.
 */
export function getPostLoginPath(user) {
  const dashboardRole = resolveDashboardRole(user);
  if (PMS_DASHBOARD_ROLES.has(dashboardRole)) {
    return getDefaultRouteByRole(dashboardRole);
  }
  return ROUTES.KPI_DASHBOARD;
}

export default getPostLoginPath;
