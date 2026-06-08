// frontend/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';

// ==========================================
// Accounts Reducers
// ==========================================
import authReducer from './accounts/slice/authSlice';
import userReducer from './accounts/slice/userSlice';
import roleReducer from './accounts/slice/roleSlice';
import tenantReducer from './accounts/slice/tenantSlice';  // ← Accounts tenant (different)
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
import mfaReducer from './accounts//slice/mfaSlice';
import profileReducer from './accounts/slice/profileSlice';
import adminMfaReducer from './accounts/slice/adminMfaSlice';
// =============================================
// Structure Reducers
// =============================================
import structNotificationReducer from './structure/notificationSlice';
import uiReducer from './ui/slices/uiSlice'
import {
    departmentReducer,
    teamReducer,
    positionReducer,
    employmentReducer,
    reportingReducer,
    hierarchyReducer,
    orgChartReducer,
    costCenterReducer,
    locationReducer,
    structureUiReducer,
} from './structure';

// ==========================================
// KPI Reducers
// ==========================================
import kpiModuleReducer from './kpi';

// ==========================================
// TENANT APP REDUCERS (ADD THIS)
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

// ===============================
// Reviews Reducers
// ===============================
import { reviewsReducer } from './reviews';
import { billingReducer } from './billing';

// Config
// =====================
import { configReducer } from './config';

const rootReducer = combineReducers({
    // Accounts State
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
    tenant: tenantReducer,  // ← Accounts tenant (keep as is)
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

    // Tenant Reducers
    appTenant: appTenantReducer,           // Main tenant CRUD
    tenantResource: tenantResourceReducer, // Resource limits & quotas
    tenantDomain: tenantDomainReducer,     // Domain management
    tenantBackup: tenantBackupReducer,     // Backup operations
    tenantMigration: tenantMigrationReducer, // Migration tracking
    tenantSchema: tenantSchemaReducer,     // Schema information
    tenantProvisioning: tenantProvisioningReducer, // Provisioning status
    tenantAudit: tenantAuditReducer,       // Audit logs
    tenantDashboard: tenantDashboardReducer, // Dashboard statistics
    tenantUI: tenantUIReducer,             // UI state (modals, sidebar, filters)
    connections: connectionReducer,

    // Structure State
    structNotifications: structNotificationReducer,
    structure: combineReducers({
        departments: departmentReducer,
        teams: teamReducer,
        positions: positionReducer,
        employments: employmentReducer,
        reporting: reportingReducer,
        hierarchy: hierarchyReducer,
        orgChart: orgChartReducer,
        costCenters: costCenterReducer,
        locations: locationReducer,
        ui: structureUiReducer,
    }),

    // KPI State
    kpi: kpiModuleReducer,

    // Billing State
    billing: billingReducer,

    // Reviews State
    reviews: reviewsReducer,

    // Config
    config: configReducer
});

export default rootReducer;