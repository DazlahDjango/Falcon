// Export slices as default
export { default as tenantReducer } from './tenantSlice';
export { default as tenantResourceReducer } from './tenantResourceSlice';
export { default as tenantDomainReducer } from './tenantDomainSlice';
export { default as tenantBackupReducer } from './tenantBackupSlice';
export { default as tenantMigrationReducer } from './tenantMigrationSlice';
export { default as tenantSchemaReducer } from './tenantSchemaSlice';
export { default as tenantProvisioningReducer } from './tenantProvisioningSlice';
export { default as tenantAuditReducer } from './tenantAuditSlice';
export { default as tenantDashboardReducer } from './tenantDashboardSlice';
export { default as tenantUIReducer } from './tenantUISlice';

// Export actions and selectors from tenantSlice ONLY (to avoid conflicts)
export * from './tenantSlice';
