// frontend/src/services/dashboard/index.js

// Export base service
export { BaseDashboardService, apiClient, withRetry } from './dashboard.service';

// Export all dashboard services
export { default as executiveService } from './dashboard.executive.service';
export { default as clientAdminService } from './clientadmin.service';
export { default as superAdminService } from './superadmin.service';
export { default as managerService } from './manager.service';
export { default as staffService } from './staff.service';
export { default as championService } from './champion.service';
export { default as readOnlyService } from './readOnly.service';

// Export other services
export { default as hierarchyService } from './hierarchy.service';
export { default as configService } from './config.service';
export { default as widgetService } from './widget.service';
export { default as favoriteService } from './favorite.service';
export { default as alertService } from './alert.service';
export { default as exportService } from './export.service';
export { default as comparisonService } from './comparison.service';
export { default as viewPresetService } from './viewpreset.service';
export { default as webSocketService } from './websocket.service';

// Helper function to get service by dashboard type
export const getDashboardService = (dashboardType) => {
  const services = {
    executive: 'executiveService',
    client_admin: 'clientAdminService',
    super_admin: 'superAdminService',
    manager: 'managerService',
    staff: 'staffService',
    champion: 'championService',
    read_only: 'readOnlyService',
  };
  
  const serviceName = services[dashboardType];
  if (!serviceName) {
    console.warn(`No service found for dashboard type: ${dashboardType}`);
    return null;
  }
  
  return exports[serviceName];
};