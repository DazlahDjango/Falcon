// frontend/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';

// ==========================================
// Accounts Reducers
// ==========================================
import authReducer from './accounts/slice/authSlice';
import userReducer from './accounts/slice/userSlice';
import roleReducer from './accounts/slice/roleSlice';
import tenantReducer from './accounts/slice/tenantSlice';
import permissionReducer from './accounts/slice/permissionSlice';
import sessionReducer from './accounts/slice/sessionSlice';
import auditLogReducer from './accounts/slice/auditSlice';
import notificationReducer from './accounts/slice/notificationSlice';
import adminReducer from './accounts/slice/adminSlice';
import dashboardReducer from './accounts/slice/dashboardSlice';
import executiveReducer from './accounts/slice/executiveSlice';
import preferenceReducer from './accounts/slice/preferenceSlice';
import accountsTeamReducer from './accounts/slice/teamSlice';
import accountsUiReducer from './accounts/slice/uiSlice';
import accountsSecurityReducer from './accounts/slice/securitySlice';
import mfaReducer from './accounts/slice/mfaSlice';
import profileReducer from './accounts/slice/profileSlice';
import adminMfaReducer from './accounts/slice/adminMfaSlice';

// ==========================================
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
    tenant: tenantReducer,
    permissions: permissionReducer,
    sessions: sessionReducer,
    auditLogs: auditLogReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    dashboard: dashboardReducer,
    executive: executiveReducer,
    preferences: preferenceReducer,
    accTeam: accountsTeamReducer,
    mfa: mfaReducer,
    adminMfa: adminMfaReducer,
    profile: profileReducer,
    ui: accountsUiReducer,
    accountsSecurity: accountsSecurityReducer,

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