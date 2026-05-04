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
// Organisation Reducers
// ==========================================


// ==========================================
// KPI Reducers
// ==========================================
import kpiReducer from './kpi/slice/kpi';
import targetReducer from './kpi/slice/kpi/targetSlice';
import actualReducer from './kpi/slice/kpi/actualSlice';
import scoreReducer from './kpi/slice/kpi/scoreSlice';
import validationReducer from './kpi/slice/kpi/validationSlice';
import frameworkReducer from './kpi/slice/kpi/frameworkSlice';
import kpiDashboardReducer from './kpi/slice/kpi/dashboardSlice';
import kpiUiReducer from './kpi/slice/ui';
import kpiNotificationReducer from './kpi/notificationSlice';
import kpiAnalyticsReducer from './kpi/analyticsSlice';

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
} from './tenant/slice';

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
    ui: accountsUiReducer,

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
    kpi: kpiReducer,
    target: targetReducer,
    actual: actualReducer,
    score: scoreReducer,
    validation: validationReducer,
    framework: frameworkReducer,
    kpiDashboard: kpiDashboardReducer,
    kpiUi: kpiUiReducer,
    kpiNotifications: kpiNotificationReducer,
    kpiAnalytics: kpiAnalyticsReducer,

    // ==========================================
    // TENANT APP STATE (ADD THIS)
    // ==========================================
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
});

export default rootReducer;