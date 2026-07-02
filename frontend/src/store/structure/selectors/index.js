import { createSelector } from '@reduxjs/toolkit';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

export const selectStructure = (state) => state.structure || EMPTY_OBJECT;

// ============================================
// ORGANIZATIONAL UNITS SELECTORS
// ============================================
export const selectOrganizationalUnits = (state) => state.structure?.organizationalUnits || {};
export const selectOrganizationalUnitsItems = (state) => selectOrganizationalUnits(state).items || [];
export const selectOrganizationalUnitsCurrent = (state) => selectOrganizationalUnits(state).currentItem || null;
export const selectOrganizationalUnitsRoot = createSelector(
  [selectOrganizationalUnits],
  (orgUnits) => orgUnits.rootItems || EMPTY_ARRAY
);
export const selectOrganizationalUnitsStats = (state) => selectOrganizationalUnits(state).stats || null;
export const selectOrganizationalUnitsLoading = (state) => selectOrganizationalUnits(state).isLoading || false;
export const selectOrganizationalUnitsError = (state) => selectOrganizationalUnits(state).error || null;
export const selectOrganizationalUnitsTotal = (state) => selectOrganizationalUnits(state).totalCount || 0;

// ============================================
// DIVISIONS SELECTORS
// ============================================
export const selectDivisions = (state) => state.structure?.divisions || EMPTY_OBJECT;
export const selectDivisionsItems = createSelector(
  [selectDivisions],
  (divisions) => divisions.items || EMPTY_ARRAY
);
export const selectDivisionsCurrent = (state) => selectDivisions(state).currentItem || null;
export const selectDivisionsStats = (state) => selectDivisions(state).stats || null;
export const selectDivisionsLoading = (state) => selectDivisions(state).isLoading || false;
export const selectDivisionsError = (state) => selectDivisions(state).error || null;
export const selectDivisionsTotal = (state) => selectDivisions(state).totalCount || 0;

// ============================================
// DEPARTMENTS SELECTORS
// ============================================
export const selectDepartments = (state) => state.structure?.departments || EMPTY_OBJECT;
export const selectDepartmentsItems = createSelector(
  [selectDepartments],
  (departments) => departments.items || EMPTY_ARRAY
);
export const selectDepartmentsCurrent = (state) => selectDepartments(state).currentItem || null;
export const selectDepartmentsRoot = createSelector(
  [selectDepartments],
  (departments) => departments.rootItems || EMPTY_ARRAY
);
export const selectDepartmentsStats = (state) => selectDepartments(state).stats || null;
export const selectDepartmentsLoading = (state) => selectDepartments(state).isLoading || false;
export const selectDepartmentsError = (state) => selectDepartments(state).error || null;
export const selectDepartmentsTotal = (state) => selectDepartments(state).totalCount || 0;

// ============================================
// DEPARTMENT TREE SELECTORS
// ============================================
export const selectDepartmentTree = (state) => state.structure?.departmentTree || EMPTY_OBJECT;
export const selectDepartmentTreeData = (state) => selectDepartmentTree(state).tree || null;
export const selectDepartmentTreeBranch = (state) => selectDepartmentTree(state).branch || null;
export const selectDepartmentTreePath = (state) => selectDepartmentTree(state).path || null;
export const selectDepartmentTreeSubtree = (state) => selectDepartmentTree(state).subtree || null;
export const selectDepartmentTreeLCA = (state) => selectDepartmentTree(state).lca || null;
export const selectDepartmentTreeLoading = (state) => selectDepartmentTree(state).isLoading || false;
export const selectDepartmentTreeError = (state) => selectDepartmentTree(state).error || null;

// ============================================
// SECTIONS SELECTORS
// ============================================
export const selectSections = (state) => state.structure?.sections || EMPTY_OBJECT;
export const selectSectionsItems = createSelector(
  [selectSections],
  (sections) => sections.items || EMPTY_ARRAY
);
export const selectSectionsCurrent = (state) => selectSections(state).currentItem || null;
export const selectSectionsLoading = (state) => selectSections(state).isLoading || false;
export const selectSectionsError = (state) => selectSections(state).error || null;
export const selectSectionsTotal = (state) => selectSections(state).totalCount || 0;

// ============================================
// UNITS SELECTORS
// ============================================
export const selectUnits = (state) => state.structure?.units || EMPTY_OBJECT;
export const selectUnitsItems = createSelector(
  [selectUnits],
  (units) => units.items || EMPTY_ARRAY
);
export const selectUnitsCurrent = (state) => selectUnits(state).currentItem || null;
export const selectUnitsStats = (state) => selectUnits(state).stats || null;
export const selectUnitsLoading = (state) => selectUnits(state).isLoading || false;
export const selectUnitsError = (state) => selectUnits(state).error || null;
export const selectUnitsTotal = (state) => selectUnits(state).totalCount || 0;

// ============================================
// POSITIONS SELECTORS
// ============================================
export const selectPositions = (state) => state.structure?.positions || EMPTY_OBJECT;
export const selectPositionsItems = createSelector(
  [selectPositions],
  (positions) => positions.items || EMPTY_ARRAY
);
export const selectPositionsCurrent = (state) => selectPositions(state).currentItem || null;
export const selectPositionsVacant = createSelector(
  [selectPositions],
  (positions) => positions.vacantItems || EMPTY_ARRAY
);
export const selectPositionsStats = (state) => selectPositions(state).stats || null;
export const selectPositionsLoading = (state) => selectPositions(state).isLoading || false;
export const selectPositionsError = (state) => selectPositions(state).error || null;
export const selectPositionsTotal = (state) => selectPositions(state).totalCount || 0;

// ============================================
// EMPLOYMENTS SELECTORS
// ============================================
export const selectEmployments = (state) => state.structure?.employments || EMPTY_OBJECT;
export const selectEmploymentsItems = createSelector(
  [selectEmployments],
  (employments) => employments.items || EMPTY_ARRAY
);
export const selectEmploymentsCurrent = (state) => selectEmployments(state).currentItem || null;
export const selectEmploymentsCurrentList = createSelector(
  [selectEmployments],
  (employments) => employments.currentEmployments || EMPTY_ARRAY
);
export const selectEmploymentsStats = (state) => selectEmployments(state).stats || null;
export const selectEmploymentsLoading = (state) => selectEmployments(state).isLoading || false;
export const selectEmploymentsError = (state) => selectEmployments(state).error || null;
export const selectEmploymentsTotal = (state) => selectEmployments(state).totalCount || 0;

// ============================================
// REPORTING LINES SELECTORS
// ============================================
export const selectReportingLines = (state) => state.structure?.reportingLines || EMPTY_OBJECT;
export const selectReportingLinesItems = createSelector(
  [selectReportingLines],
  (reportingLines) => reportingLines.items || EMPTY_ARRAY
);
export const selectReportingLinesCurrent = (state) => selectReportingLines(state).currentItem || null;
export const selectMyChain = (state) => selectReportingLines(state).myChain || null;
export const selectMyTeam = createSelector(
  [selectReportingLines],
  (reportingLines) => reportingLines.myTeam || EMPTY_ARRAY
);
export const selectOrganizationSpan = (state) => selectReportingLines(state).organizationSpan || null;
export const selectReportingLinesLoading = (state) => selectReportingLines(state).isLoading || false;
export const selectReportingLinesError = (state) => selectReportingLines(state).error || null;
export const selectReportingLinesTotal = (state) => selectReportingLines(state).totalCount || 0;

// ============================================
// INTERIM ASSIGNMENTS SELECTORS
// ============================================
export const selectInterimAssignments = (state) => state.structure?.interimAssignments || EMPTY_OBJECT;
export const selectInterimAssignmentsItems = createSelector(
  [selectInterimAssignments],
  (interimAssignments) => interimAssignments.items || EMPTY_ARRAY
);
export const selectInterimAssignmentsCurrent = (state) => selectInterimAssignments(state).currentItem || null;
export const selectInterimAssignmentsActive = createSelector(
  [selectInterimAssignments],
  (interimAssignments) => interimAssignments.activeItems || EMPTY_ARRAY
);
export const selectInterimAssignmentsExpiring = createSelector(
  [selectInterimAssignments],
  (interimAssignments) => interimAssignments.expiringItems || EMPTY_ARRAY
);
export const selectInterimAssignmentsLoading = (state) => selectInterimAssignments(state).isLoading || false;
export const selectInterimAssignmentsError = (state) => selectInterimAssignments(state).error || null;
export const selectInterimAssignmentsTotal = (state) => selectInterimAssignments(state).totalCount || 0;

// ============================================
// COST CENTERS SELECTORS
// ============================================
export const selectCostCenters = (state) => state.structure?.costCenters || EMPTY_OBJECT;
export const selectCostCentersItems = createSelector(
  [selectCostCenters],
  (costCenters) => costCenters.items || EMPTY_ARRAY
);
export const selectCostCentersCurrent = (state) => selectCostCenters(state).currentItem || null;
export const selectCostCentersStats = (state) => selectCostCenters(state).stats || null;
export const selectCostCentersLoading = (state) => selectCostCenters(state).isLoading || false;
export const selectCostCentersError = (state) => selectCostCenters(state).error || null;
export const selectCostCentersTotal = (state) => selectCostCenters(state).totalCount || 0;

// ============================================
// LOCATIONS SELECTORS
// ============================================
export const selectLocations = (state) => state.structure?.locations || EMPTY_OBJECT;
export const selectLocationsItems = createSelector(
  [selectLocations],
  (locations) => locations.items || EMPTY_ARRAY
);
export const selectLocationsCurrent = (state) => selectLocations(state).currentItem || null;
export const selectLocationsHeadquarters = (state) => selectLocations(state).headquarters || null;
export const selectLocationsStats = (state) => selectLocations(state).stats || null;
export const selectLocationsLoading = (state) => selectLocations(state).isLoading || false;
export const selectLocationsError = (state) => selectLocations(state).error || null;
export const selectLocationsTotal = (state) => selectLocations(state).totalCount || 0;

// ============================================
// HIERARCHY SELECTORS
// ============================================
export const selectHierarchy = (state) => state.structure?.hierarchy || EMPTY_OBJECT;
export const selectHierarchyItems = createSelector(
  [selectHierarchy],
  (hierarchy) => hierarchy.items || EMPTY_ARRAY
);
export const selectHierarchyCurrent = (state) => selectHierarchy(state).currentItem || null;
export const selectHierarchyCurrentVersion = (state) => selectHierarchy(state).currentVersion || null;
export const selectHierarchyHistory = createSelector(
  [selectHierarchy],
  (hierarchy) => hierarchy.history || EMPTY_ARRAY
);
export const selectHierarchyValidation = (state) => selectHierarchy(state).validationResult || null;
export const selectHierarchyLoading = (state) => selectHierarchy(state).isLoading || false;
export const selectHierarchyError = (state) => selectHierarchy(state).error || null;
export const selectHierarchyTotal = (state) => selectHierarchy(state).totalCount || 0;

// ============================================
// ORG CHARTS SELECTORS
// ============================================
export const selectOrgCharts = (state) => state.structure?.orgCharts || EMPTY_OBJECT;
export const selectOrgChartTree = (state) => selectOrgCharts(state).tree || null;
export const selectOrgChartPreview = (state) => selectOrgCharts(state).preview || null;
export const selectOrgChartLoading = (state) => selectOrgCharts(state).isLoading || false;
export const selectOrgChartError = (state) => selectOrgCharts(state).error || null;

// ============================================
// DASHBOARD SELECTORS
// ============================================
export const selectDashboard = (state) => state.structure?.dashboard || EMPTY_OBJECT;
export const selectDashboardOverview = (state) => selectDashboard(state).overview || null;
export const selectDashboardHealth = (state) => selectDashboard(state).health || null;
export const selectDashboardTrends = (state) => selectDashboard(state).trends || null;
export const selectDashboardLoading = (state) => selectDashboard(state).isLoading || false;
export const selectDashboardError = (state) => selectDashboard(state).error || null;

// ============================================
// HEALTH SELECTORS
// ============================================
export const selectHealth = (state) => state.structure?.health || EMPTY_OBJECT;
export const selectDatabaseHealth = (state) => selectHealth(state).database || null;
export const selectCacheHealth = (state) => selectHealth(state).cache || null;
export const selectServicesHealth = (state) => selectHealth(state).services || null;
export const selectAdminHealth = (state) => selectHealth(state).admin || null;
export const selectHealthMetrics = (state) => selectHealth(state).metrics || null;
export const selectHealthLoading = (state) => selectHealth(state).isLoading || false;
export const selectHealthError = (state) => selectHealth(state).error || null;

// ============================================
// SETTINGS SELECTORS
// ============================================
export const selectSettings = (state) => state.structure?.settings || EMPTY_OBJECT;
export const selectStructureSettings = (state) => selectSettings(state).settings || null;
export const selectSettingsVersion = (state) => selectSettings(state).version || null;
export const selectSettingsLoading = (state) => selectSettings(state).isLoading || false;
export const selectSettingsError = (state) => selectSettings(state).error || null;

// ============================================
// REFERENCE DATA SELECTORS
// ============================================
export const selectReferenceData = (state) => state.structure?.referenceData || EMPTY_OBJECT;
export const selectReferenceDataAll = (state) => selectReferenceData(state).data || null;
export const selectReferenceCounts = (state) => selectReferenceData(state).counts || null;
export const selectReferenceOrgUnits = (state) => selectReferenceData(state).orgUnits || null;
export const selectReferenceUsers = (state) => selectReferenceData(state).users || null;
export const selectReferenceLoading = (state) => selectReferenceData(state).isLoading || false;
export const selectReferenceError = (state) => selectReferenceData(state).error || null;