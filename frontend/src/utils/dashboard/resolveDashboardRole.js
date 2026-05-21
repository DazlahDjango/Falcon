import { DASHBOARD_TYPES } from '../../config/constants/dashboardConstants';

const ROLE_TO_DASHBOARD = {
  executive: DASHBOARD_TYPES.EXECUTIVE,
  client_admin: DASHBOARD_TYPES.CLIENT_ADMIN,
  super_admin: DASHBOARD_TYPES.SUPER_ADMIN,
  manager: DASHBOARD_TYPES.MANAGER,
  staff: DASHBOARD_TYPES.STAFF,
  employee: DASHBOARD_TYPES.STAFF,
  dashboard_champion: DASHBOARD_TYPES.CHAMPION,
  champion: DASHBOARD_TYPES.CHAMPION,
  read_only: DASHBOARD_TYPES.READ_ONLY,
  viewer: DASHBOARD_TYPES.READ_ONLY,
};

/**
 * Resolve which PMS dashboard shell/sidebar/API channel to use from accounts user payload.
 */
export const resolveDashboardRole = (user) => {
  if (!user) return DASHBOARD_TYPES.STAFF;

  const explicit = user.dashboard_role || user.dashboardRole;
  if (explicit && ROLE_TO_DASHBOARD[explicit]) {
    return ROLE_TO_DASHBOARD[explicit];
  }

  const role = user.role || user.primary_role;
  if (role && ROLE_TO_DASHBOARD[role]) {
    return ROLE_TO_DASHBOARD[role];
  }

  if (Array.isArray(user.roles)) {
    const priority = [
      DASHBOARD_TYPES.SUPER_ADMIN,
      DASHBOARD_TYPES.CLIENT_ADMIN,
      DASHBOARD_TYPES.EXECUTIVE,
      DASHBOARD_TYPES.CHAMPION,
      DASHBOARD_TYPES.MANAGER,
      DASHBOARD_TYPES.READ_ONLY,
      DASHBOARD_TYPES.STAFF,
    ];
    for (const dashType of priority) {
      const key = Object.entries(ROLE_TO_DASHBOARD).find(([, v]) => v === dashType)?.[0];
      if (key && user.roles.includes(key)) {
        return dashType;
      }
    }
  }

  return DASHBOARD_TYPES.STAFF;
};

export default resolveDashboardRole;
