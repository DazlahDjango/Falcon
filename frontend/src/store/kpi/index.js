import { combineReducers } from '@reduxjs/toolkit';
import kpiReducer from './slice/kpi.slice';
import frameworkReducer from './slice/framework.slice';
import targetReducer from './slice/target.slice';
import actualReducer from './slice/actual.slice';
import scoreReducer from './slice/score.slice';
import validationReducer from './slice/validation.slice';
import dashboardReducer from './slice/dashboard.slice';
import analyticsReducer from './slice/analytics.slice';
import bulkReducer from './slice/bulk.slice';
import calculationReducer from './slice/calculation.slice';
import settingsReducer from './slice/settings.slice';
import historyReducer from './slice/history.slice';
import exportReducer from './slice/export.slice';
import cascadeReducer from './slice/cascade.slice'; 
import kpiRealtimeReducer from './slice/kpiRealtimeSlice';

const kpiModuleReducer = combineReducers({
    // Core KPI
    kpis: kpiReducer,
    
    // Framework & Structure
    frameworks: frameworkReducer,
    
    // Targets & Cascade
    targets: targetReducer,
    
    // Actuals & Evidence
    actuals: actualReducer,
    
    // Scores & Analytics
    scores: scoreReducer,
    
    // Validation & Escalations
    validations: validationReducer,
    
    // Dashboards
    dashboards: dashboardReducer,
    
    // Analytics & Reports
    analytics: analyticsReducer,
    
    // Bulk Operations
    bulk: bulkReducer,
    
    // Calculations
    calculations: calculationReducer,
    
    // Settings & Reference Data
    settings: settingsReducer,
    
    // History/Audit
    history: historyReducer,
    
    // Exports  // ADD THIS
    exports: exportReducer,
    cascade: cascadeReducer,
    realtime: kpiRealtimeReducer,
});

export default kpiModuleReducer;

// Export all slices
export { default as kpiSlice } from './slice/kpi.slice';
export { default as frameworkSlice } from './slice/framework.slice';
export { default as targetSlice } from './slice/target.slice';
export { default as actualSlice } from './slice/actual.slice';
export { default as scoreSlice } from './slice/score.slice';
export { default as validationSlice } from './slice/validation.slice';
export { default as dashboardSlice } from './slice/dashboard.slice';
export { default as analyticsSlice } from './slice/analytics.slice';
export { default as bulkSlice } from './slice/bulk.slice';
export { default as calculationSlice } from './slice/calculation.slice';
export { default as settingsSlice } from './slice/settings.slice';
export { default as historySlice } from './slice/history.slice';
export { default as exportSlice } from './slice/export.slice'; 
export { default as cascadeSlice } from './slice/cascade.slice'; 

// Export all actions
export * from './slice/kpi.slice';
export * from './slice/framework.slice';
export * from './slice/target.slice';
export * from './slice/actual.slice';
export * from './slice/score.slice';
export * from './slice/validation.slice';
export * from './slice/dashboard.slice';
export * from './slice/analytics.slice';
export * from './slice/bulk.slice';
export * from './slice/calculation.slice';
export * from './slice/settings.slice';
export * from './slice/history.slice';
export * from './slice/export.slice';  
export * from './slice/cascade.slice';

// Export all selectors
export * from './selectors/kpi.selectors';