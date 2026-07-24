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
import reportReducer from './accounts/slice/reportSlice';
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
import { tenantReducers } from './tenant/index';

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
import { reportReducers } from './reports';

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
    profiles: profileReducer,
    ui: accountsUiReducer,
    accountsSecurity: securityReducer,
    systemSettings: systemSettingsReducer,
    reports: reportReducer,

    // Tenant Reducers
    tenant: tenantReducers,
    // Structure
    structNotifications: structNotificationReducer,
    structure: structureReducer,
    // KPI
    kpi: kpiModuleReducer,
    kpis: kpiModuleReducer,
    // Billing
    billing: billingReducer,
    // Reviews
    reviews: reviewsReducer,
    // Config
    config: configReducer,
    // Report
    report: reportReducers,
});

export default rootReducer;