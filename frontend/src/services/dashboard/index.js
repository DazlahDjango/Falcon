// frontend/src/services/dashboard/index.js

export { BaseDashboardService, apiClient, withRetry } from './dashboard.service';

export { executiveDashboardService } from './executive.service';
export { clientAdminDashboardService } from './clientAdmin.service';
export { superAdminDashboardService } from './superAdmin.service';
export { managerService } from './manager.service';
export { default as staffService } from './staff.service';
export { default as championService } from './champion.service';
export { default as readOnlyService } from './readOnly.service';

export { default as hierarchyService } from './hierarchy.service';
export { default as configService } from './config.service';
export { default as widgetService } from './widget.service';
export { default as favoriteService } from './favorite.service';
export { default as alertService } from './alert.service';
export { default as exportService } from './export.service';
export { default as comparisonService } from './comparison.service';
export { default as viewPresetService } from './viewpreset.service';
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
