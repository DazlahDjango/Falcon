// Department Types
export const DepartmentStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
};

export const DepartmentSensitivity = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
};

// Employment Types
export const EmploymentType = {
  PERMANENT: 'permanent',
  CONTRACT: 'contract',
  PROBATION: 'probation',
  INTERN: 'intern',
  CONSULTANT: 'consultant',
  TEMPORARY: 'temporary',
};

// Reporting Types
export const ReportingRelationType = {
  SOLID: 'solid',
  DOTTED: 'dotted',
  INTERIM: 'interim',
  PROJECT: 'project',
  MATRIX: 'matrix',
};

// Hierarchy Types
export const HierarchyVersionType = {
  AUTO: 'auto',
  MANUAL: 'manual',
  RESTRUCTURE: 'restructure',
  YEARLY: 'yearly',
  ACQUISITION: 'acquisition',
};

// Loading States
export const LoadingState = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

// Initial State Types
export const initialDepartmentState = {
  items: [],
  selectedDepartment: null,
  tree: null,
  stats: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    is_active: '',
    sensitivity_level: '',
    parent_id: '',
  },
};

export const initialTeamState = {
  items: [],
  selectedTeam: null,
  hierarchy: null,
  stats: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    is_active: '',
    department_id: '',
  },
};

export const initialEmploymentState = {
  items: [],
  selectedEmployment: null,
  currentEmployment: null,
  stats: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    employment_type: '',
    department_id: '',
    team_id: '',
    is_manager: '',
    is_executive: '',
    is_active: 'true',
  },
};

export const initialPositionState = {
  items: [],
  selectedPosition: null,
  vacantPositions: [],
  stats: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    level: '',
    grade: '',
    is_vacant: '',
  },
};

export const initialReportingState = {
  items: [],
  selectedReportingLine: null,
  matrixRelations: [],
  spanOfControl: null,
  organizationSpan: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
};

export const initialHierarchyState = {
  versions: [],
  currentVersion: null,
  selectedVersion: null,
  health: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

export const initialOrgChartState = {
  treeData: null,
  flatData: [],
  previewData: null,
  exportFormat: 'json',
  isExporting: false,
  loading: LoadingState.IDLE,
  error: null,
};

export const initialCostCenterState = {
  items: [],
  selectedCostCenter: null,
  tree: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
};

export const initialLocationState = {
  items: [],
  selectedLocation: null,
  tree: null,
  headquarters: null,
  loading: LoadingState.IDLE,
  error: null,
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  },
};

export const initialStructureUiState = {
  modals: {
    departmentModal: { isOpen: false, mode: 'create', data: null },
    teamModal: { isOpen: false, mode: 'create', data: null },
    positionModal: { isOpen: false, mode: 'create', data: null },
    employmentModal: { isOpen: false, mode: 'create', data: null },
    reportingModal: { isOpen: false, mode: 'create', data: null },
    confirmDelete: { isOpen: false, id: null, type: null, name: '' },
    bulkUpload: { isOpen: false, type: null },
    bulkReassign: { isOpen: false },
    exportOptions: { isOpen: false },
    restoreVersion: { isOpen: false, version: null },
    cycleDetection: { isOpen: false },
  },
  activeTab: 'departments',
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  selectedItems: [],
  bulkAction: null,
  notification: null,
};