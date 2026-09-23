import { DASHBOARD_TYPES } from '../../config/constants/dashboardConstants';

const ROLE_TO_DASHBOARD = {
  super_admin: DASHBOARD_TYPES.SUPER_ADMIN,
  client_admin: DASHBOARD_TYPES.CLIENT_ADMIN,
  admin: DASHBOARD_TYPES.CLIENT_ADMIN,
  executive: DASHBOARD_TYPES.EXECUTIVE,
  ceo: DASHBOARD_TYPES.EXECUTIVE,
  chief_executive_officer: DASHBOARD_TYPES.EXECUTIVE,
  c_suite: DASHBOARD_TYPES.EXECUTIVE,
  hr_admin: DASHBOARD_TYPES.CHAMPION,
  hr: DASHBOARD_TYPES.CHAMPION,
  dashboard_champion: DASHBOARD_TYPES.CHAMPION,
  champion: DASHBOARD_TYPES.CHAMPION,
  manager: DASHBOARD_TYPES.MANAGER,
  supervisor: DASHBOARD_TYPES.MANAGER,
  staff: DASHBOARD_TYPES.STAFF,
  employee: DASHBOARD_TYPES.STAFF,
  read_only: DASHBOARD_TYPES.READ_ONLY,
  viewer: DASHBOARD_TYPES.READ_ONLY,
};

/**
 * Resolve which PMS dashboard shell/sidebar/API channel to use from accounts user payload.
 */
export const resolveDashboardRole = (user) => {
  if (!user) return DASHBOARD_TYPES.STAFF;

  const rawRole = (user.dashboard_role || user.dashboardRole || user.role || user.primary_role || '')
    .toString()
    .toLowerCase()
    .trim();

  if (rawRole && ROLE_TO_DASHBOARD[rawRole]) {
    return ROLE_TO_DASHBOARD[rawRole];
  }

  // Also check role name strings like "HR Admin", "Chief Executive Officer", "Sales Manager"
  if (rawRole.includes('super_admin') || rawRole.includes('super admin')) return DASHBOARD_TYPES.SUPER_ADMIN;
  if (rawRole.includes('client_admin') || rawRole.includes('client admin')) return DASHBOARD_TYPES.CLIENT_ADMIN;
  if (rawRole.includes('ceo') || rawRole.includes('executive') || rawRole.includes('chief executive')) return DASHBOARD_TYPES.EXECUTIVE;
  if (rawRole.includes('hr') || rawRole.includes('champion')) return DASHBOARD_TYPES.CHAMPION;
  if (rawRole.includes('manager') || rawRole.includes('supervisor')) return DASHBOARD_TYPES.MANAGER;
  if (rawRole.includes('read_only') || rawRole.includes('read only') || rawRole.includes('viewer')) return DASHBOARD_TYPES.READ_ONLY;

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
      const match = user.roles.some((r) => {
        const lowerR = (r || '').toString().toLowerCase().trim();
        return ROLE_TO_DASHBOARD[lowerR] === dashType || lowerR === dashType;
      });
      if (match) return dashType;
    }
  }

  return DASHBOARD_TYPES.STAFF;
};

export default resolveDashboardRole;
