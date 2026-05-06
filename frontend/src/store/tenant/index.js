// Export all slices
export { default as tenantReducer } from './slice/tenantSlice';
export { default as tenantResourceReducer } from './slice/tenantResourceSlice';
export { default as tenantDomainReducer } from './slice/tenantDomainSlice';
export { default as tenantBackupReducer } from './slice/tenantBackupSlice';
export { default as tenantMigrationReducer } from './slice/tenantMigrationSlice';
export { default as tenantSchemaReducer } from './slice/tenantSchemaSlice';
export { default as tenantProvisioningReducer } from './slice/tenantProvisioningSlice';
export { default as tenantAuditReducer } from './slice/tenantAuditSlice';
export { default as tenantDashboardReducer } from './slice/tenantDashboardSlice';
export { default as tenantUIReducer } from './slice/tenantUISlice';

// Export everything from tenantSlice
export * from './slice/tenantSlice';

// Export from tenantResourceSlice
export * from './slice/tenantResourceSlice';

// Export from other slices
export * from './slice/tenantDomainSlice';
export * from './slice/tenantBackupSlice';
export * from './slice/tenantMigrationSlice';
export * from './slice/tenantSchemaSlice';
export * from './slice/tenantProvisioningSlice';
export * from './slice/tenantAuditSlice';
export * from './slice/tenantDashboardSlice';
export * from './slice/tenantUISlice';

// Export middleware
export { tenantMiddlewares } from './middleware';
