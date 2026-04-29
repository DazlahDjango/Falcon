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

// ==========================================
// Organisation Reducers
// ==========================================
import organisationReducer from './organisations/slice/organisationSlice';
import subscriptionReducer from './organisations/slice/subscriptionSlice';
import planReducer from './organisations/slice/planSlice';
import featureFlagReducer from './organisations/slice/featureFlagSlice';
import departmentReducer from './organisations/slice/departmentSlice';
import positionReducer from './organisations/slice/positionSlice';
import domainReducer from './organisations/slice/domainSlice';
import brandingReducer from './organisations/slice/brandingSlice';
import settingsReducer from './organisations/slice/settingsSlice';
import organisationsKpiReducer from './organisations/slice/kpiSlice';
import orgUserReducer from './organisations/slice/userSlice';

// Destructing duplicates so they don't crash
import orgTeamReducer from './organisations/slice/teamSlice';
import orgAuditReducer from './organisations/slice/auditSlice';
import orgUiReducer from './organisations/slice/uiSlice';

// ==========================================
// KPI Reducers
// ==========================================
import kpiReducer from './kpi/slice/kpi'
import targetReducer from './kpi/slice/kpi/targetSlice';
import actualReducer from './kpi/slice/kpi/actualSlice';
import scoreReducer from './kpi/slice/kpi/scoreSlice';
import validationReducer from './kpi/slice/kpi/validationSlice';
import frameworkReducer from './kpi/slice/kpi/frameworkSlice';
import kpiDashboardReducer from './kpi/slice/kpi/dashboardSlice';
import kpiUiReducer from './kpi/slice/ui';
import kpiNotificationReducer from './kpi/notificationSlice';
import kpiAnalyticsReducer from './kpi/analyticsSlice';

const rootReducer = combineReducers({
    // Accounts State
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
    ui: accountsUiReducer,
    
    // Organisation State
    organisation: organisationReducer,
    subscription: subscriptionReducer,
    plans: planReducer,
    featureFlags: featureFlagReducer,
    departments: departmentReducer,
    teams: orgTeamReducer,
    positions: positionReducer,
    domains: domainReducer,
    branding: brandingReducer,
    settings: settingsReducer,
    orgKpis: organisationsKpiReducer,
    orgUsers: orgUserReducer,
    audit: orgAuditReducer, 
    orgUi: orgUiReducer,

    // kpi
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

});
export default rootReducer;