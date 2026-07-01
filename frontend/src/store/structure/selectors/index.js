export const selectStructure = (state) => state.structure || {};

export const selectOrganizationalUnits = (state) => state.structure?.organizationalUnits || {};
export const selectOrganizationalUnitsItems = (state) => selectOrganizationalUnits(state).items || [];
export const selectOrganizationalUnitsCurrent = (state) => selectOrganizationalUnits(state).currentItem || null;
export const selectOrganizationalUnitsRoot = (state) => selectOrganizationalUnits(state).rootItems || [];
export const selectOrganizationalUnitsStats = (state) => selectOrganizationalUnits(state).stats || null;
export const selectOrganizationalUnitsLoading = (state) => selectOrganizationalUnits(state).isLoading || false;
export const selectOrganizationalUnitsError = (state) => selectOrganizationalUnits(state).error || null;
export const selectOrganizationalUnitsTotal = (state) => selectOrganizationalUnits(state).totalCount || 0;

export const selectDivisions = (state) => state.structure?.divisions || {};
export const selectDivisionsItems = (state) => selectDivisions(state).items || [];
export const selectDivisionsCurrent = (state) => selectDivisions(state).currentItem || null;
export const selectDivisionsStats = (state) => selectDivisions(state).stats || null;
export const selectDivisionsLoading = (state) => selectDivisions(state).isLoading || false;
export const selectDivisionsError = (state) => selectDivisions(state).error || null;
export const selectDivisionsTotal = (state) => selectDivisions(state).totalCount || 0;

export const selectDepartments = (state) => state.structure?.departments || {};
export const selectDepartmentsItems = (state) => selectDepartments(state).items || [];
export const selectDepartmentsCurrent = (state) => selectDepartments(state).currentItem || null;
export const selectDepartmentsRoot = (state) => selectDepartments(state).rootItems || [];
export const selectDepartmentsStats = (state) => selectDepartments(state).stats || null;
export const selectDepartmentsLoading = (state) => selectDepartments(state).isLoading || false;
export const selectDepartmentsError = (state) => selectDepartments(state).error || null;
export const selectDepartmentsTotal = (state) => selectDepartments(state).totalCount || 0;

export const selectDepartmentTree = (state) => state.structure?.departmentTree || {};
export const selectDepartmentTreeData = (state) => selectDepartmentTree(state).tree || null;
export const selectDepartmentTreeBranch = (state) => selectDepartmentTree(state).branch || null;
export const selectDepartmentTreePath = (state) => selectDepartmentTree(state).path || null;
export const selectDepartmentTreeSubtree = (state) => selectDepartmentTree(state).subtree || null;
export const selectDepartmentTreeLCA = (state) => selectDepartmentTree(state).lca || null;
export const selectDepartmentTreeLoading = (state) => selectDepartmentTree(state).isLoading || false;
export const selectDepartmentTreeError = (state) => selectDepartmentTree(state).error || null;

export const selectSections = (state) => state.structure?.sections || {};
export const selectSectionsItems = (state) => selectSections(state).items || [];
export const selectSectionsCurrent = (state) => selectSections(state).currentItem || null;
export const selectSectionsLoading = (state) => selectSections(state).isLoading || false;
export const selectSectionsError = (state) => selectSections(state).error || null;
export const selectSectionsTotal = (state) => selectSections(state).totalCount || 0;

export const selectUnits = (state) => state.structure?.units || {};
export const selectUnitsItems = (state) => selectUnits(state).items || [];
export const selectUnitsCurrent = (state) => selectUnits(state).currentItem || null;
export const selectUnitsStats = (state) => selectUnits(state).stats || null;
export const selectUnitsLoading = (state) => selectUnits(state).isLoading || false;
export const selectUnitsError = (state) => selectUnits(state).error || null;
export const selectUnitsTotal = (state) => selectUnits(state).totalCount || 0;

export const selectPositions = (state) => state.structure?.positions || {};
export const selectPositionsItems = (state) => selectPositions(state).items || [];
export const selectPositionsCurrent = (state) => selectPositions(state).currentItem || null;
export const selectPositionsVacant = (state) => selectPositions(state).vacantItems || [];
export const selectPositionsStats = (state) => selectPositions(state).stats || null;
export const selectPositionsLoading = (state) => selectPositions(state).isLoading || false;
export const selectPositionsError = (state) => selectPositions(state).error || null;
export const selectPositionsTotal = (state) => selectPositions(state).totalCount || 0;

export const selectEmployments = (state) => state.structure?.employments || {};
export const selectEmploymentsItems = (state) => selectEmployments(state).items || [];
export const selectEmploymentsCurrent = (state) => selectEmployments(state).currentItem || null;
export const selectEmploymentsCurrentList = (state) => selectEmployments(state).currentEmployments || [];
export const selectEmploymentsStats = (state) => selectEmployments(state).stats || null;
export const selectEmploymentsLoading = (state) => selectEmployments(state).isLoading || false;
export const selectEmploymentsError = (state) => selectEmployments(state).error || null;
export const selectEmploymentsTotal = (state) => selectEmployments(state).totalCount || 0;

export const selectReportingLines = (state) => state.structure?.reportingLines || {};
export const selectReportingLinesItems = (state) => selectReportingLines(state).items || [];
export const selectReportingLinesCurrent = (state) => selectReportingLines(state).currentItem || null;
export const selectMyChain = (state) => selectReportingLines(state).myChain || null;
export const selectMyTeam = (state) => selectReportingLines(state).myTeam || [];
export const selectOrganizationSpan = (state) => selectReportingLines(state).organizationSpan || null;
export const selectReportingLinesLoading = (state) => selectReportingLines(state).isLoading || false;
export const selectReportingLinesError = (state) => selectReportingLines(state).error || null;
export const selectReportingLinesTotal = (state) => selectReportingLines(state).totalCount || 0;

export const selectInterimAssignments = (state) => state.structure?.interimAssignments || {};
export const selectInterimAssignmentsItems = (state) => selectInterimAssignments(state).items || [];
export const selectInterimAssignmentsCurrent = (state) => selectInterimAssignments(state).currentItem || null;
export const selectInterimAssignmentsActive = (state) => selectInterimAssignments(state).activeItems || [];
export const selectInterimAssignmentsExpiring = (state) => selectInterimAssignments(state).expiringItems || [];
export const selectInterimAssignmentsLoading = (state) => selectInterimAssignments(state).isLoading || false;
export const selectInterimAssignmentsError = (state) => selectInterimAssignments(state).error || null;
export const selectInterimAssignmentsTotal = (state) => selectInterimAssignments(state).totalCount || 0;

export const selectCostCenters = (state) => state.structure?.costCenters || {};
export const selectCostCentersItems = (state) => selectCostCenters(state).items || [];
export const selectCostCentersCurrent = (state) => selectCostCenters(state).currentItem || null;
export const selectCostCentersStats = (state) => selectCostCenters(state).stats || null;
export const selectCostCentersLoading = (state) => selectCostCenters(state).isLoading || false;
export const selectCostCentersError = (state) => selectCostCenters(state).error || null;
export const selectCostCentersTotal = (state) => selectCostCenters(state).totalCount || 0;

export const selectLocations = (state) => state.structure?.locations || {};
export const selectLocationsItems = (state) => selectLocations(state).items || [];
export const selectLocationsCurrent = (state) => selectLocations(state).currentItem || null;
export const selectLocationsHeadquarters = (state) => selectLocations(state).headquarters || null;
export const selectLocationsStats = (state) => selectLocations(state).stats || null;
export const selectLocationsLoading = (state) => selectLocations(state).isLoading || false;
export const selectLocationsError = (state) => selectLocations(state).error || null;
export const selectLocationsTotal = (state) => selectLocations(state).totalCount || 0;

export const selectHierarchy = (state) => state.structure?.hierarchy || {};
export const selectHierarchyItems = (state) => selectHierarchy(state).items || [];
export const selectHierarchyCurrent = (state) => selectHierarchy(state).currentItem || null;
export const selectHierarchyCurrentVersion = (state) => selectHierarchy(state).currentVersion || null;
export const selectHierarchyHistory = (state) => selectHierarchy(state).history || [];
export const selectHierarchyValidation = (state) => selectHierarchy(state).validationResult || null;
export const selectHierarchyLoading = (state) => selectHierarchy(state).isLoading || false;
export const selectHierarchyError = (state) => selectHierarchy(state).error || null;
export const selectHierarchyTotal = (state) => selectHierarchy(state).totalCount || 0;

export const selectOrgCharts = (state) => state.structure?.orgCharts || {};
export const selectOrgChartTree = (state) => selectOrgCharts(state).tree || null;
export const selectOrgChartPreview = (state) => selectOrgCharts(state).preview || null;
export const selectOrgChartLoading = (state) => selectOrgCharts(state).isLoading || false;
export const selectOrgChartError = (state) => selectOrgCharts(state).error || null;

export const selectDashboard = (state) => state.structure?.dashboard || {};
export const selectDashboardOverview = (state) => selectDashboard(state).overview || null;
export const selectDashboardHealth = (state) => selectDashboard(state).health || null;
export const selectDashboardTrends = (state) => selectDashboard(state).trends || null;
export const selectDashboardLoading = (state) => selectDashboard(state).isLoading || false;
export const selectDashboardError = (state) => selectDashboard(state).error || null;

export const selectHealth = (state) => state.structure?.health || {};
export const selectDatabaseHealth = (state) => selectHealth(state).database || null;
export const selectCacheHealth = (state) => selectHealth(state).cache || null;
export const selectServicesHealth = (state) => selectHealth(state).services || null;
export const selectAdminHealth = (state) => selectHealth(state).admin || null;
export const selectHealthMetrics = (state) => selectHealth(state).metrics || null;
export const selectHealthLoading = (state) => selectHealth(state).isLoading || false;
export const selectHealthError = (state) => selectHealth(state).error || null;

export const selectSettings = (state) => state.structure?.settings || {};
export const selectStructureSettings = (state) => selectSettings(state).settings || null;
export const selectSettingsVersion = (state) => selectSettings(state).version || null;
export const selectSettingsLoading = (state) => selectSettings(state).isLoading || false;
export const selectSettingsError = (state) => selectSettings(state).error || null;

export const selectReferenceData = (state) => state.structure?.referenceData || {};
export const selectReferenceDataAll = (state) => selectReferenceData(state).data || null;
export const selectReferenceCounts = (state) => selectReferenceData(state).counts || null;
export const selectReferenceOrgUnits = (state) => selectReferenceData(state).orgUnits || null;
export const selectReferenceUsers = (state) => selectReferenceData(state).users || null;
export const selectReferenceLoading = (state) => selectReferenceData(state).isLoading || false;
export const selectReferenceError = (state) => selectReferenceData(state).error || null;