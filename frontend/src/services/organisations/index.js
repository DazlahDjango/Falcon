// Export base API client
export { default as api } from './api';

// Export all services
export { 
  organisationApi, 
  contactApi, 
  exportApi, 
  importApi, 
  approvalApi,
  apiTokenApi,
  authApi
} from './organisationService';

export { subscriptionApi } from './subscriptionService';
export { planApi } from './planService';
export { departmentApi } from './departmentService';
export { teamApi } from './teamService';
export { positionApi } from './positionService';
export { domainApi } from './domainService';
export { brandingApi } from './brandingService';
export { auditApi } from './auditService';
export { kpiApi } from './kpiService';
export { userApi, roleApi } from './userService';
export { settingsApi } from './settingsService';

// Force Vite HMR Cache bust
export const SERVICE_VERSION = '1.1.1';