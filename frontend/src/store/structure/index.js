export { default as structureReducer } from './slice';
export { default as structNotificationReducer } from './notificationSlice';
export * from './slice';
export * from './selectors';

// Re-export individual slices for rootReducer
export {
    default as organizationalUnitReducer,
    default as divisionReducer,
    default as departmentReducer,
    default as sectionReducer,
    default as unitReducer,
    default as positionReducer,
    default as employmentReducer,
    default as reportingLineReducer,
    default as interimAssignmentReducer,
    default as costCenterReducer,
    default as locationReducer,
    default as hierarchyReducer,
    default as orgChartReducer,
    default as dashboardReducer,
    default as healthReducer,
    default as settingsReducer,
    default as referenceDataReducer,
} from './slice';