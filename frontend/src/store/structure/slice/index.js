import organizationalUnitReducer from './organizationalUnit.slice';
import divisionReducer from './divisionslice';
import departmentReducer from './departmentSlice';
import departmentTreeReducer from './departmentTree.slice';
import sectionReducer from './sectionslice';
import unitReducer from './unitslice';
import positionReducer from './positionSlice';
import employmentReducer from './employmentSlice';
import reportingLineReducer from './reportingLineSlice';
import interimAssignmentReducer from './interimAssignment.slice';
import costCenterReducer from './costCenterSlice';
import locationReducer from './locationSlice';
import hierarchyReducer from './hierarchySlice';
import orgChartReducer from './orgChartSlice';
import dashboardReducer from './dashboardSlice';
import healthReducer from './healthSlice';
import settingsReducer from './settingSlice';
import referenceDataReducer from './referenceDataSlice';

const structureReducer = {
  organizationalUnits: organizationalUnitReducer,
  divisions: divisionReducer,
  departments: departmentReducer,
  departmentTree: departmentTreeReducer,
  sections: sectionReducer,
  units: unitReducer,
  positions: positionReducer,
  employments: employmentReducer,
  reportingLines: reportingLineReducer,
  interimAssignments: interimAssignmentReducer,
  costCenters: costCenterReducer,
  locations: locationReducer,
  hierarchy: hierarchyReducer,
  orgCharts: orgChartReducer,
  dashboard: dashboardReducer,
  health: healthReducer,
  settings: settingsReducer,
  referenceData: referenceDataReducer,
};

export default structureReducer;
export {
  organizationalUnitReducer,
  divisionReducer,
  departmentReducer,
  departmentTreeReducer, 
  sectionReducer,
  unitReducer,
  positionReducer,
  employmentReducer,
  reportingLineReducer,
  interimAssignmentReducer,
  costCenterReducer,
  locationReducer,
  hierarchyReducer,
  orgChartReducer,
  dashboardReducer,
  healthReducer,
  settingsReducer,
  referenceDataReducer,
};