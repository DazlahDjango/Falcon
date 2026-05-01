import { createSelector } from '@reduxjs/toolkit';

// Base selectors
const selectDepartmentState = (state) => state.structure?.departments;
const selectTeamState = (state) => state.structure?.teams;
const selectPositionState = (state) => state.structure?.positions;
const selectEmploymentState = (state) => state.structure?.employments;
const selectReportingState = (state) => state.structure?.reporting;
const selectHierarchyState = (state) => state.structure?.hierarchy;
const selectOrgChartState = (state) => state.structure?.orgChart;
const selectCostCenterState = (state) => state.structure?.costCenters;
const selectLocationState = (state) => state.structure?.locations;
const selectStructureUiState = (state) => state.structure?.ui;

export const selectDepartments = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.items || []
);

export const selectDepartmentsLoading = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.loading === 'loading'
);

export const selectSelectedDepartment = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.selectedDepartment
);

export const selectDepartmentTree = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.tree
);

export const selectDepartmentStats = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.stats
);

export const selectDepartmentPagination = createSelector(
  [selectDepartmentState],
  (deptState) => ({
    page: deptState?.pagination?.page || 1,
    pageSize: deptState?.pagination?.pageSize || 50,
    total: deptState?.pagination?.total || 0,
    totalPages: deptState?.pagination?.totalPages || 0,
  })
);

export const selectDepartmentFilters = createSelector(
  [selectDepartmentState],
  (deptState) => deptState?.filters || {}
);

export const selectDepartmentsByParent = createSelector(
  [selectDepartments, (_, parentId) => parentId],
  (departments, parentId) => departments.filter(dept => dept.parent_id === parentId)
);

export const selectRootDepartments = createSelector(
  [selectDepartments],
  (departments) => departments.filter(dept => !dept.parent_id)
);

export const selectTeams = createSelector(
  [selectTeamState],
  (teamState) => teamState?.items || []
);

export const selectTeamsLoading = createSelector(
  [selectTeamState],
  (teamState) => teamState?.loading === 'loading'
);

export const selectSelectedTeam = createSelector(
  [selectTeamState],
  (teamState) => teamState?.selectedTeam
);

export const selectTeamHierarchy = createSelector(
  [selectTeamState],
  (teamState) => teamState?.hierarchy
);

export const selectTeamsByDepartment = createSelector(
  [selectTeams, (_, departmentId) => departmentId],
  (teams, departmentId) => teams.filter(team => team.department_id === departmentId)
);

export const selectPositions = createSelector(
  [selectPositionState],
  (posState) => posState?.items || []
);

export const selectPositionsLoading = createSelector(
  [selectPositionState],
  (posState) => posState?.loading === 'loading'
);

export const selectSelectedPosition = createSelector(
  [selectPositionState],
  (posState) => posState?.selectedPosition
);

export const selectVacantPositions = createSelector(
  [selectPositionState],
  (posState) => posState?.vacantPositions || []
);

export const selectPositionStats = createSelector(
  [selectPositionState],
  (posState) => posState?.stats
);

export const selectPositionsByLevel = createSelector(
  [selectPositions, (_, level) => level],
  (positions, level) => positions.filter(pos => pos.level === level)
);

export const selectEmployments = createSelector(
  [selectEmploymentState],
  (empState) => empState?.items || []
);

export const selectEmploymentsLoading = createSelector(
  [selectEmploymentState],
  (empState) => empState?.loading === 'loading'
);

export const selectSelectedEmployment = createSelector(
  [selectEmploymentState],
  (empState) => empState?.selectedEmployment
);

export const selectCurrentEmployment = createSelector(
  [selectEmploymentState],
  (empState) => empState?.currentEmployment
);

export const selectEmploymentStats = createSelector(
  [selectEmploymentState],
  (empState) => empState?.stats
);

export const selectEmploymentsByUser = createSelector(
  [selectEmployments, (_, userId) => userId],
  (employments, userId) => employments.filter(emp => emp.user_id === userId)
);

export const selectCurrentEmploymentsOnly = createSelector(
  [selectEmployments],
  (employments) => employments.filter(emp => emp.is_current && emp.is_active)
);

export const selectManagersList = createSelector(
  [selectEmployments],
  (employments) => employments.filter(emp => emp.is_manager)
);

export const selectExecutivesList = createSelector(
  [selectEmployments],
  (employments) => employments.filter(emp => emp.is_executive)
);

export const selectReportingLines = createSelector(
  [selectReportingState],
  (repState) => repState?.items || []
);

export const selectReportingLinesLoading = createSelector(
  [selectReportingState],
  (repState) => repState?.loading === 'loading'
);

export const selectMatrixRelations = createSelector(
  [selectReportingState],
  (repState) => repState?.matrixRelations || []
);

export const selectSpanOfControl = createSelector(
  [selectReportingState],
  (repState) => repState?.spanOfControl
);

export const selectOrganizationSpan = createSelector(
  [selectReportingState],
  (repState) => repState?.organizationSpan
);

export const selectDirectReportsByManager = createSelector(
  [selectReportingLines, (_, managerId) => managerId],
  (reportingLines, managerId) => reportingLines.filter(line => line.manager_user_id === managerId && line.relation_type === 'solid')
);

export const selectSolidReportingLines = createSelector(
  [selectReportingLines],
  (reportingLines) => reportingLines.filter(line => line.relation_type === 'solid')
);

export const selectDottedReportingLines = createSelector(
  [selectReportingLines],
  (reportingLines) => reportingLines.filter(line => line.relation_type === 'dotted')
);

export const selectHierarchyVersions = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.versions || []
);

export const selectCurrentHierarchyVersion = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.currentVersion
);

export const selectHierarchyHealth = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.health
);

export const selectHierarchyHealthScore = createSelector(
  [selectHierarchyHealth],
  (health) => health?.health_score || 0
);

export const selectHierarchyStatus = createSelector(
  [selectHierarchyHealthScore],
  (score) => {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'warning';
    return 'critical';
  }
);

export const selectHierarchyValidation = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.validation
);

export const selectHierarchyCycles = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.cycles
);

export const selectHasHierarchyCycles = createSelector(
  [selectHierarchyCycles],
  (cycles) => (cycles?.department_cycles || 0) > 0 || (cycles?.team_cycles || 0) > 0
);

export const selectOrgChartTree = createSelector(
  [selectOrgChartState],
  (chartState) => chartState?.treeData
);

export const selectFlatOrgChart = createSelector(
  [selectOrgChartState],
  (chartState) => chartState?.flatData || []
);

export const selectOrgChartPreview = createSelector(
  [selectOrgChartState],
  (chartState) => chartState?.previewData
);

export const selectIsExporting = createSelector(
  [selectOrgChartState],
  (chartState) => chartState?.isExporting || false
);

export const selectCostCentersLoading = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.loading === 'loading'
);

export const selectCostCenterLoading = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.loading === 'loading'
);

export const selectCostCenters = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.items || []
);

export const selectSelectedCostCenter = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.selectedCostCenter
);

export const selectCostCenterTree = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.tree
);

export const selectCostCenterError = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.error
);

export const selectLocations = createSelector(
  [selectLocationState],
  (locState) => locState?.items || []
);

export const selectSelectedLocation = createSelector(
  [selectLocationState],
  (locState) => locState?.selectedLocation
);

export const selectLocationTree = createSelector(
  [selectLocationState],
  (locState) => locState?.tree
);

export const selectHeadquarters = createSelector(
  [selectLocationState],
  (locState) => locState?.headquarters
);

export const selectActiveTab = createSelector(
  [selectStructureUiState],
  (uiState) => uiState?.activeTab || 'departments'
);

export const selectSearchQuery = createSelector(
  [selectStructureUiState],
  (uiState) => uiState?.searchQuery || ''
);

export const selectSearchResults = createSelector(
  [selectStructureUiState],
  (uiState) => uiState?.searchResults || []
);

export const selectIsSearching = createSelector(
  [selectStructureUiState],
  (uiState) => uiState?.isSearching || false
);

export const selectSelectedItems = createSelector(
  [selectStructureUiState],
  (uiState) => uiState?.selectedItems || []
);

export const selectSelectedItemsCount = createSelector(
  [selectSelectedItems],
  (items) => items.length
);

export const selectModalState = createSelector(
  [selectStructureUiState, (_, modalName) => modalName],
  (uiState, modalName) => uiState?.modals[modalName] || { isOpen: false }
);

export const selectIsAnyModalOpen = createSelector(
  [selectStructureUiState],
  (uiState) => Object.values(uiState?.modals || {}).some(modal => modal.isOpen)
);

export const selectDepartmentWithChildren = createSelector(
  [selectDepartments, selectSelectedDepartment],
  (departments, selectedDept) => {
    if (!selectedDept) return null;
    const children = departments.filter(dept => dept.parent_id === selectedDept.id);
    return { ...selectedDept, children };
  }
);

export const selectTeamWithMembers = createSelector(
  [selectSelectedTeam, selectEmployments],
  (selectedTeam, employments) => {
    if (!selectedTeam) return null;
    const members = employments.filter(emp => emp.team_id === selectedTeam.id && emp.is_current);
    return { ...selectedTeam, members };
  }
);

export const selectPositionWithIncumbents = createSelector(
  [selectSelectedPosition, selectEmployments],
  (selectedPosition, employments) => {
    if (!selectedPosition) return null;
    const incumbents = employments.filter(emp => emp.position_id === selectedPosition.id && emp.is_current);
    return { ...selectedPosition, incumbents };
  }
);

// ==================== Team Selectors (Add these) ====================

export const selectTeamPagination = createSelector(
  [selectTeamState],
  (teamState) => ({
    page: teamState?.pagination?.page || 1,
    pageSize: teamState?.pagination?.pageSize || 50,
    total: teamState?.pagination?.total || 0,
    totalPages: teamState?.pagination?.totalPages || 0,
  })
);

export const selectTeamFilters = createSelector(
  [selectTeamState],
  (teamState) => teamState?.filters || {}
);

// ==================== Position Selectors (Add these) ====================

export const selectPositionPagination = createSelector(
  [selectPositionState],
  (posState) => ({
    page: posState?.pagination?.page || 1,
    pageSize: posState?.pagination?.pageSize || 50,
    total: posState?.pagination?.total || 0,
    totalPages: posState?.pagination?.totalPages || 0,
  })
);

export const selectPositionFilters = createSelector(
  [selectPositionState],
  (posState) => posState?.filters || {}
);

// ==================== Employment Selectors (Add these) ====================

export const selectEmploymentPagination = createSelector(
  [selectEmploymentState],
  (empState) => ({
    page: empState?.pagination?.page || 1,
    pageSize: empState?.pagination?.pageSize || 50,
    total: empState?.pagination?.total || 0,
    totalPages: empState?.pagination?.totalPages || 0,
  })
);

export const selectEmploymentFilters = createSelector(
  [selectEmploymentState],
  (empState) => empState?.filters || {}
);

// ==================== Location Selectors (Add these) ====================

export const selectLocationLoading = createSelector(
  [selectLocationState],
  (locState) => locState?.loading === 'loading'
);

export const selectLocationPagination = createSelector(
  [selectLocationState],
  (locState) => ({
    page: locState?.pagination?.page || 1,
    pageSize: locState?.pagination?.pageSize || 50,
    total: locState?.pagination?.total || 0,
    totalPages: locState?.pagination?.totalPages || 0,
  })
);

// ==================== Cost Center Selectors (continued) ====================

export const selectCostCenterPagination = createSelector(
  [selectCostCenterState],
  (ccState) => ({
    page: ccState?.pagination?.page || 1,
    pageSize: ccState?.pagination?.pageSize || 50,
    total: ccState?.pagination?.total || 0,
    totalPages: ccState?.pagination?.totalPages || 0,
  })
);

export const selectCostCenterFilters = createSelector(
  [selectCostCenterState],
  (ccState) => ccState?.filters || {}
);

// ==================== Hierarchy Version Selectors (Add these) ====================

export const selectHierarchyVersionsLoading = createSelector(
  [selectHierarchyState],
  (hierState) => hierState?.loading === 'loading'
);

export const selectHierarchyVersionPagination = createSelector(
  [selectHierarchyState],
  (hierState) => ({
    page: hierState?.pagination?.page || 1,
    pageSize: hierState?.pagination?.pageSize || 20,
    total: hierState?.pagination?.total || 0,
    totalPages: hierState?.pagination?.totalPages || 0,
  })
);

// ==================== Reporting Selectors (Add these if missing) ====================

export const selectReportingPagination = createSelector(
  [selectReportingState],
  (repState) => ({
    page: repState?.pagination?.page || 1,
    pageSize: repState?.pagination?.pageSize || 50,
    total: repState?.pagination?.total || 0,
    totalPages: repState?.pagination?.totalPages || 0,
  })
);

export const selectReportingFilters = createSelector(
  [selectReportingState],
  (repState) => repState?.filters || {}
);

export const selectEmployeeFullInfo = createSelector(
  [selectCurrentEmployment, selectEmployments, selectReportingLines],
  (currentEmployment, employments, reportingLines) => {
    if (!currentEmployment) return null;
    const history = employments.filter(emp => emp.user_id === currentEmployment.user_id);
    const managers = reportingLines.filter(line => line.employee_user_id === currentEmployment.user_id);
    const directReports = reportingLines.filter(line => line.manager_user_id === currentEmployment.user_id);
    return {
      current: currentEmployment,
      history,
      managers,
      directReports,
      totalManagers: managers.length,
      totalDirectReports: directReports.length,
    };
  }
);

export const selectFilteredDepartments = createSelector(
  [selectDepartments, selectDepartmentFilters],
  (departments, filters) => {
    return departments.filter(dept => {
      if (filters.search && !dept.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !dept.code.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.is_active !== '' && dept.is_active !== (filters.is_active === 'true')) {
        return false;
      }
      if (filters.sensitivity_level && dept.sensitivity_level !== filters.sensitivity_level) {
        return false;
      }
      if (filters.parent_id && dept.parent_id !== filters.parent_id) {
        return false;
      }
      return true;
    });
  }
);

export const selectFilteredEmployments = createSelector(
  [selectEmployments, selectEmploymentFilters],
  (employments, filters) => {
    return employments.filter(emp => {
      if (filters.search && !emp.user_id?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.employment_type && emp.employment_type !== filters.employment_type) {
        return false;
      }
      if (filters.department_id && emp.department_id !== filters.department_id) {
        return false;
      }
      if (filters.team_id && emp.team_id !== filters.team_id) {
        return false;
      }
      if (filters.is_manager !== '' && emp.is_manager !== (filters.is_manager === 'true')) {
        return false;
      }
      if (filters.is_executive !== '' && emp.is_executive !== (filters.is_executive === 'true')) {
        return false;
      }
      if (filters.is_active !== '' && emp.is_active !== (filters.is_active === 'true')) {
        return false;
      }
      return true;
    });
  }
);