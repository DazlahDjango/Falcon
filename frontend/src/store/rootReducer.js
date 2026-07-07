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
import kpiModuleReducer from './kpi/index';

// ==========================================
// TENANT APP REDUCERS (ADD THIS)
// ==========================================
import { tenantReducers } from './tenant/index';

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

    // Tenant Reducers
    tenant: tenantReducers,

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
    kpis: kpiModuleReducer, // Add alias for redundancy

    // Billing State
    billing: billingReducer,

    // Reviews State
    reviews: reviewsReducer,

    // Config
    config: configReducer
});

export default rootReducer;