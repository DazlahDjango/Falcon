// frontend/src/hooks/tenant/index.js

// Core Tenant Hooks
export { useTenant } from './useTenant';
export { useTenants } from './useTenants';
export { useTenantCreate } from './useTenantCreate';
export { useTenantUpdate } from './useTenantUpdate';
export { useTenantDelete } from './useTenantDelete';
export { useTenantActions } from './useTenantActions';

// Resource & Usage Hooks
export { useTenantResources } from './useTenantResources';
export { useTenantUsage } from './useTenantUsage';
export { useTenantQuota } from './useTenantQuota';

// Domain & Backup Hooks
export { useTenantDomains } from './useTenantDomains';
export { useTenantBackups } from './useTenantBackups';

// Migration & Schema Hooks
export { useTenantMigrations } from './useTenantMigrations';
export { useTenantSchema } from './useTenantSchema';

// Provisioning & WebSocket Hooks
export { useTenantProvisioning } from './useTenantProvisioning';
export { useTenantWebSocket } from './useTenantWebSocket';

// Audit Logs Hook
export { useTenantAuditLogs } from './useTenantAuditLogs';