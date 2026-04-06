import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './accounts/slice/authSlice';
import userReducer from './accounts/slice/userSlice';
import tenantReducer from './accounts/slice/tenantSlice';
import notificationReducer from './accounts/slice/notificationSlice';
import uiReducer from './accounts/slice/uiSlice';
import roleReducer from './accounts/slice/roleSlice';
import permissionReducer from './accounts/slice/permissionSlice';
import sessionReducer from './accounts/slice/sessionSlice';
import auditReducer from './accounts/slice/auditSlice';
import adminReducer from './accounts/slice/adminSlice';
import dashboardReducer from './accounts/slice/dashboardSlice';
import teamReducer from './accounts/slice/teamSlice';
import executiveReducer from './accounts/slice/executiveSlice';
import preferenceReducer from  './accounts/slice/preferenceSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    tenant: tenantReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    sessions: sessionReducer,
    audit: auditReducer,
    admin: adminReducer,
    dashboard: dashboardReducer,
    team: teamReducer,
    executive: executiveReducer,
    preferences: preferenceReducer
});
export default rootReducer;