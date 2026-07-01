// frontend/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';

// ==========================================
// Accounts Reducers
// ==========================================
import authReducer from './accounts/slice/authSlice';
import userReducer from './accounts/slice/userSlice';
import profileReducer from './accounts/slice/profileSlice';
import mfaReducer from './accounts/slice/mfaSlice';
import roleReducer from './accounts/slice/roleSlice';
import permissionReducer from './accounts/slice/permissionSlice';
import sessionReducer from './accounts/slice/sessionSlice';
import auditReducer from './accounts/slice/auditSlice';
import preferenceReducer from './accounts/slice/preferenceSlice';
import adminMfaReducer from './accounts/slice/adminMfaSlice';
import securityReducer from './accounts/slice/securitySlice';
import systemSettingsReducer from './accounts/slice/systemSettingsSlice';
import accountsUiReducer from './accounts/slice/uiSlice';
import { default as adminReducer } from './accounts/slice/adminSlice'
// =============================================
// Structure Reducers
// ==========================================
import structNotificationReducer from './structure/notificationSlice';
import uiReducer from './ui/slices/uiSlice';
import structureReducer from './structure/slice';

// ==========================================
// KPI Reducers
// ==========================================
import kpiModuleReducer from './kpi/index';

// ==========================================
// TENANT APP REDUCERS
// ==========================================
import {
    tenantReducer as appTenantReducer,
    tenantResourceReducer,
    tenantDomainReducer,
    tenantBackupReducer,
    tenantMigrationReducer,
    tenantSchemaReducer,
    tenantProvisioningReducer,
    tenantAuditReducer,
    tenantDashboardReducer,
    tenantUIReducer,
    connectionReducer,
} from './tenant/slice';

// ==========================================
// Reviews Reducers
// ==========================================
import { reviewsReducer } from './reviews';

// ==========================================
// Billing Reducers
// ==========================================
import { billingReducer } from './billing';

// ==========================================
// Config Reducers
// ==========================================
import { configReducer } from './config';

const rootReducer = combineReducers({
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    sessions: sessionReducer,
    auditLogs: auditReducer,
    admin: adminReducer,
    preferences: preferenceReducer,
    mfa: mfaReducer,
    adminMfa: adminMfaReducer,
    profile: profileReducer,
    ui: accountsUiReducer,
    accountsSecurity: securityReducer,
    systemSettings: systemSettingsReducer,

    appTenant: appTenantReducer,
    tenantResource: tenantResourceReducer,
    tenantDomain: tenantDomainReducer,
    tenantBackup: tenantBackupReducer,
    tenantMigration: tenantMigrationReducer,
    tenantSchema: tenantSchemaReducer,
    tenantProvisioning: tenantProvisioningReducer,
    tenantAudit: tenantAuditReducer,
    tenantDashboard: tenantDashboardReducer,
    tenantUI: tenantUIReducer,
    connections: connectionReducer,

    structNotifications: structNotificationReducer,
    structure: structureReducer,

    kpi: kpiModuleReducer,
    kpis: kpiModuleReducer,

    billing: billingReducer,

    reviews: reviewsReducer,

    config: configReducer,
});

export default rootReducer;