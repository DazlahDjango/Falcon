// frontend/src/services/dashboard/index.js

export { BaseDashboardService, apiClient, withRetry } from './dashboard.service';

export { executiveDashboardService } from './executive.service';
export { clientAdminDashboardService } from './clientAdmin.service';
export { superAdminDashboardService } from './superAdmin.service';
export { managerService } from './manager.service';
export { staffService } from './staff.service';
export { championService } from './champion.service';
export { readOnlyService } from './readOnly.service';

export { hierarchyService } from './hierarchy.service';
export { dashboardConfigService } from './config.service';
export { widgetService } from './widget.service';
export { favoriteService } from './favorite.service';
export { dashboardAlertService } from './alert.service';
export { exportService } from './export.service';
export { comparisonService } from './comparison.service';
export { viewPresetService } from './viewpreset.service';
export { dashboardWebSocket } from './websocket.service';

export const getDashboardService = (dashboardType) => {
  const map = {
    executive: executiveDashboardService,
    client_admin: clientAdminDashboardService,
    super_admin: superAdminDashboardService,
    manager: managerService,
    staff: staffService,
    champion: championService,
    read_only: readOnlyService,
  };
  return map[dashboardType] ?? null;
};
