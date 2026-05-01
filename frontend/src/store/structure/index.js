/**
 * Structure Store - Barrel Export
 * Centralizes all structure-related Redux exports
 * Implements 3S: Organized, maintainable exports
 */

// Reducers
export { default as departmentReducer } from './slice/departmentSlice';
export { default as teamReducer } from './slice/teamSlice';
export { default as positionReducer } from './slice/positionSlice';
export { default as employmentReducer } from './slice/employmentSlice';
export { default as reportingReducer } from './slice/reportingSlice';
export { default as hierarchyReducer } from './slice/hierarchySlice';
export { default as orgChartReducer } from './slice/orgChartSlice';
export { default as costCenterReducer } from './slice/costCenterSlice';
export { default as locationReducer } from './slice/locationSlice';
export { default as structureUiReducer } from './slice/structureUiSlice';

// Async Thunks - Departments
export {
  fetchDepartments,
  fetchDepartmentById,
  fetchDepartmentTree,
  fetchDepartmentStats,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  moveDepartment,
  bulkCreateDepartments,
} from './slice/departmentSlice';

// Async Thunks - Teams
export {
  fetchTeams,
  fetchTeamById,
  fetchTeamHierarchy,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from './slice/teamSlice';

// Async Thunks - Positions
export {
  fetchPositions,
  fetchPositionById,
  fetchVacantPositions,
  fetchPositionStats,
  createPosition,
  updatePosition,
  deletePosition,
} from './slice/positionSlice';

// Async Thunks - Employments
export {
  fetchEmployments,
  fetchCurrentEmployments,
  fetchEmploymentById,
  fetchEmploymentsByUser,
  fetchMyEmployment,
  createEmployment,
  updateEmployment,
  deleteEmployment,
  transferEmployee,
} from './slice/employmentSlice';

// Async Thunks - Reporting
export {
  fetchReportingLines,
  fetchReportingLinesByEmployee,
  fetchReportingLinesByManager,
  fetchReportingChain,
  fetchSpanOfControl,
  fetchOrganizationSpan,
  createReportingLine,
  updateReportingLine,
  deleteReportingLine,
  assignMatrixReporting,
  assignInterimManager,
} from './slice/reportingSlice';

// Async Thunks - Hierarchy
export {
  fetchHierarchyVersions,
  fetchCurrentHierarchyVersion,
  fetchHierarchyVersionById,
  fetchHierarchyHealth,
  captureHierarchySnapshot,
  restoreHierarchyVersion,
  validateHierarchy,
  detectHierarchyCycles,
  repairHierarchyCycles,
} from './slice/hierarchySlice';

// Async Thunks - Org Chart
export {
  fetchOrgChartTree,
  fetchFullOrgChart,
  fetchFlatOrgChart,
  fetchOrgChartPreview,
  exportOrgChart,
} from './slice/orgChartSlice';

// Async Thunks - Cost Centers
export {
  fetchCostCenters,
  fetchCostCenterById,
  fetchCostCenterTree,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
} from './slice/costCenterSlice';

// Async Thunks - Locations
export {
  fetchLocations,
  fetchLocationById,
  fetchLocationTree,
  fetchHeadquarters,
  createLocation,
  updateLocation,
  deleteLocation,
  updateLocationOccupancy,
} from './slice/locationSlice';

// UI Actions
export {
  // Modal actions
  openDepartmentModal,
  closeDepartmentModal,
  openTeamModal,
  closeTeamModal,
  openPositionModal,
  closePositionModal,
  openEmploymentModal,
  closeEmploymentModal,
  openReportingModal,
  closeReportingModal,
  openConfirmDelete,
  closeConfirmDelete,
  openBulkUpload,
  closeBulkUpload,
  openBulkReassign,
  closeBulkReassign,
  openExportOptions,
  closeExportOptions,
  openRestoreVersion,
  closeRestoreVersion,
  openCycleDetection,
  closeCycleDetection,
  // Tab actions
  setActiveTab,
  // Search actions
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  clearSearch,
  // Bulk selection actions
  addSelectedItem,
  removeSelectedItem,
  toggleSelectedItem,
  selectAllItems,
  clearSelectedItems,
  setBulkAction,
  clearBulkAction,
  // Notification actions
  setNotification,
  clearNotification,
  // Reset
  resetStructureUi,
} from './slice/structureUiSlice';

// Department Actions
export {
  setDepartmentFilters,
  clearDepartmentFilters,
  setDepartmentPage,
  setDepartmentPageSize,
  clearSelectedDepartment,
} from './slice/departmentSlice';

// Team Actions
export {
  setTeamFilters,
  clearTeamFilters,
  setTeamPage,
  setTeamPageSize,
  clearSelectedTeam,
} from './slice/teamSlice';

// Position Actions
export {
  setPositionFilters,
  clearPositionFilters,
  setPositionPage,
  setPositionPageSize,
  clearSelectedPosition,
} from './slice/positionSlice';

// Employment Actions
export {
  setEmploymentFilters,
  clearEmploymentFilters,
  setEmploymentPage,
  setEmploymentPageSize,
  clearSelectedEmployment,
  clearCurrentEmployment,
} from './slice/employmentSlice';

// Reporting Actions
export {
  setReportingPage,
  clearSelectedReportingLine,
  clearMatrixRelations,
} from './slice/reportingSlice';

// Hierarchy Actions
export {
  setHierarchyFilters,
  clearHierarchyFilters,
  setHierarchyPage,
  setHierarchyPageSize,
  setSelectedVersion,
  clearSelectedVersion,
  clearHierarchyHealth,
} from './slice/hierarchySlice';

// Org Chart Actions
export {
  setExportFormat,
  clearOrgChartData,
  resetExportState,
} from './slice/orgChartSlice';

// Cost Center Actions
export {
  setCostCenterFilters,
  clearCostCenterFilters,
  setCostCenterPage,
  setCostCenterPageSize,
  clearSelectedCostCenter,
} from './slice/costCenterSlice';

// Location Actions
export {
  setLocationFilters,
  clearLocationFilters,
  setLocationPage,
  setLocationPageSize,
  clearSelectedLocation,
} from './slice/locationSlice';

// Selectors
export {
  // Department selectors
  selectDepartments,
  selectDepartmentsLoading,
  selectSelectedDepartment,
  selectDepartmentTree,
  selectDepartmentStats,
  selectDepartmentPagination,
  selectDepartmentFilters,
  selectDepartmentsByParent,
  selectRootDepartments,
  // Team selectors
  selectTeams,
  selectTeamsLoading,
  selectSelectedTeam,
  selectTeamHierarchy,
  selectTeamsByDepartment,
  // Position selectors
  selectPositions,
  selectPositionsLoading,
  selectSelectedPosition,
  selectVacantPositions,
  selectPositionStats,
  selectPositionsByLevel,
  // Employment selectors
  selectEmployments,
  selectEmploymentsLoading,
  selectSelectedEmployment,
  selectCurrentEmployment,
  selectEmploymentStats,
  selectEmploymentsByUser,
  selectCurrentEmploymentsOnly,
  selectManagersList,
  selectExecutivesList,
  // Reporting selectors
  selectReportingLines,
  selectReportingLinesLoading,
  selectMatrixRelations,
  selectSpanOfControl,
  selectOrganizationSpan,
  selectDirectReportsByManager,
  selectSolidReportingLines,
  selectDottedReportingLines,
  // Hierarchy selectors
  selectHierarchyVersions,
  selectCurrentHierarchyVersion,
  selectHierarchyHealth,
  selectHierarchyHealthScore,
  selectHierarchyStatus,
  selectHierarchyValidation,
  selectHierarchyCycles,
  selectHasHierarchyCycles,
  // Org Chart selectors
  selectOrgChartTree,
  selectFlatOrgChart,
  selectOrgChartPreview,
  selectIsExporting,
  // Cost Center selectors
  selectCostCenters,
  selectSelectedCostCenter,
  selectCostCenterTree,
  // Location selectors
  selectLocations,
  selectSelectedLocation,
  selectLocationTree,
  selectHeadquarters,
  // UI selectors
  selectActiveTab,
  selectSearchQuery,
  selectSearchResults,
  selectIsSearching,
  selectSelectedItems,
  selectSelectedItemsCount,
  selectModalState,
  selectIsAnyModalOpen,
  // Combined selectors
  selectDepartmentWithChildren,
  selectTeamWithMembers,
  selectPositionWithIncumbents,
  selectEmployeeFullInfo,
  // Filtered selectors
  selectFilteredDepartments,
  selectFilteredEmployments,
  // Additiona
  selectTeamPagination,
  selectTeamFilters,
  selectPositionPagination,
  selectPositionFilters,
  selectEmploymentPagination,
  selectEmploymentFilters,
  selectLocationLoading,
  selectLocationPagination,
  selectCostCenterLoading,
  selectCostCentersLoading,
  selectCostCenterError,
  selectCostCenterPagination,
  selectHierarchyVersionsLoading,
  selectHierarchyVersionPagination,
  selectReportingPagination,
  selectReportingFilters,
} from './slice/structureSelectors';

export {
  DepartmentStatus,
  DepartmentSensitivity,
  EmploymentType,
  ReportingRelationType,
  HierarchyVersionType,
  LoadingState,
  initialDepartmentState,
  initialTeamState,
  initialPositionState,
  initialEmploymentState,
  initialReportingState,
  initialHierarchyState,
  initialOrgChartState,
  initialCostCenterState,
  initialLocationState,
  initialStructureUiState,
} from './slice/structureTypes';