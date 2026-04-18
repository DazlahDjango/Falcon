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
import organisationReducer from './organisation/slice/organisationSlice';
import subscriptionReducer from './organisation/slice/subscriptionSlice';
import departmentReducer from './organisation/slice/departmentSlice';
import positionReducer from './organisation/slice/positionSlice';
import domainReducer from './organisation/slice/domainSlice';
import brandingReducer from './organisation/slice/brandingSlice';
import settingsReducer from './organisation/slice/settingsSlice';
import kpiReducer from './organisation/slice/kpiSlice';
import orgUserReducer from './organisation/slice/userSlice';

// Destructing duplicates so they don't crash
import orgTeamReducer from './organisation/slice/teamSlice';
import orgAuditReducer from './organisation/slice/auditSlice';
import orgUiReducer from './organisation/slice/uiSlice';

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
    departments: departmentReducer,
    teams: orgTeamReducer,
    positions: positionReducer,
    domains: domainReducer,
    branding: brandingReducer,
    settings: settingsReducer,
    kpis: kpiReducer,
    orgUsers: orgUserReducer,
    audit: orgAuditReducer, 
    orgUi: orgUiReducer
});

export default rootReducer;