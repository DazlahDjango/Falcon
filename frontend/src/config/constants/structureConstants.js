// Department Sensitivity Levels
export const DEPARTMENT_SENSITIVITY = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    RESTRICTED: 'restricted',
};

export const DEPARTMENT_SENSITIVITY_LABELS = {
    [DEPARTMENT_SENSITIVITY.PUBLIC]: 'Public',
    [DEPARTMENT_SENSITIVITY.INTERNAL]: 'Internal',
    [DEPARTMENT_SENSITIVITY.CONFIDENTIAL]: 'Confidential',
    [DEPARTMENT_SENSITIVITY.RESTRICTED]: 'Restricted',
};

export const DEPARTMENT_SENSITIVITY_COLORS = {
    [DEPARTMENT_SENSITIVITY.PUBLIC]: '#10B981',
    [DEPARTMENT_SENSITIVITY.INTERNAL]: '#3B82F6',
    [DEPARTMENT_SENSITIVITY.CONFIDENTIAL]: '#F59E0B',
    [DEPARTMENT_SENSITIVITY.RESTRICTED]: '#EF4444',
};

// Employment Types
export const EMPLOYMENT_TYPE = {
    PERMANENT: 'permanent',
    CONTRACT: 'contract',
    PROBATION: 'probation',
    INTERN: 'intern',
    CONSULTANT: 'consultant',
    TEMPORARY: 'temporary',
};

export const EMPLOYMENT_TYPE_LABELS = {
    [EMPLOYMENT_TYPE.PERMANENT]: 'Permanent',
    [EMPLOYMENT_TYPE.CONTRACT]: 'Contract',
    [EMPLOYMENT_TYPE.PROBATION]: 'Probation',
    [EMPLOYMENT_TYPE.INTERN]: 'Intern',
    [EMPLOYMENT_TYPE.CONSULTANT]: 'Consultant',
    [EMPLOYMENT_TYPE.TEMPORARY]: 'Temporary',
};

export const EMPLOYMENT_TYPE_COLORS = {
    [EMPLOYMENT_TYPE.PERMANENT]: '#10B981',
    [EMPLOYMENT_TYPE.CONTRACT]: '#3B82F6',
    [EMPLOYMENT_TYPE.PROBATION]: '#F59E0B',
    [EMPLOYMENT_TYPE.INTERN]: '#8B5CF6',
    [EMPLOYMENT_TYPE.CONSULTANT]: '#EC4899',
    [EMPLOYMENT_TYPE.TEMPORARY]: '#6B7280',
};

// Reporting Relation Types
export const REPORTING_RELATION_TYPE = {
    SOLID: 'solid',
    DOTTED: 'dotted',
    INTERIM: 'interim',
    PROJECT: 'project',
    MATRIX: 'matrix',
};

export const REPORTING_RELATION_TYPE_LABELS = {
    [REPORTING_RELATION_TYPE.SOLID]: 'Solid Line (Direct Manager)',
    [REPORTING_RELATION_TYPE.DOTTED]: 'Dotted Line (Functional Lead)',
    [REPORTING_RELATION_TYPE.INTERIM]: 'Interim/Temporary',
    [REPORTING_RELATION_TYPE.PROJECT]: 'Project-Based',
    [REPORTING_RELATION_TYPE.MATRIX]: 'Matrix Manager',
};

export const REPORTING_RELATION_TYPE_COLORS = {
    [REPORTING_RELATION_TYPE.SOLID]: '#10B981',
    [REPORTING_RELATION_TYPE.DOTTED]: '#F59E0B',
    [REPORTING_RELATION_TYPE.INTERIM]: '#EF4444',
    [REPORTING_RELATION_TYPE.PROJECT]: '#8B5CF6',
    [REPORTING_RELATION_TYPE.MATRIX]: '#EC4899',
};

// Cost Center Categories
export const COST_CENTER_CATEGORY = {
    OPERATIONAL: 'operational',
    CAPITAL: 'capital',
    PROJECT: 'project',
    DEPARTMENTAL: 'departmental',
    SHARED: 'shared',
};

export const COST_CENTER_CATEGORY_LABELS = {
    [COST_CENTER_CATEGORY.OPERATIONAL]: 'Operational',
    [COST_CENTER_CATEGORY.CAPITAL]: 'Capital',
    [COST_CENTER_CATEGORY.PROJECT]: 'Project',
    [COST_CENTER_CATEGORY.DEPARTMENTAL]: 'Departmental',
    [COST_CENTER_CATEGORY.SHARED]: 'Shared Service',
};

// Location Types
export const LOCATION_TYPE = {
    HEADQUARTERS: 'headquarters',
    REGIONAL: 'regional',
    BRANCH: 'branch',
    REMOTE: 'remote',
    SATELLITE: 'satellite',
};

export const LOCATION_TYPE_LABELS = {
    [LOCATION_TYPE.HEADQUARTERS]: 'Headquarters',
    [LOCATION_TYPE.REGIONAL]: 'Regional Office',
    [LOCATION_TYPE.BRANCH]: 'Branch Office',
    [LOCATION_TYPE.REMOTE]: 'Remote Hub',
    [LOCATION_TYPE.SATELLITE]: 'Satellite Office',
};

// Hierarchy Version Types
export const HIERARCHY_VERSION_TYPE = {
    AUTO: 'auto',
    MANUAL: 'manual',
    RESTRUCTURE: 'restructure',
    YEARLY: 'yearly',
    ACQUISITION: 'acquisition',
};

export const HIERARCHY_VERSION_TYPE_LABELS = {
    [HIERARCHY_VERSION_TYPE.AUTO]: 'Auto-saved',
    [HIERARCHY_VERSION_TYPE.MANUAL]: 'Manual Snapshot',
    [HIERARCHY_VERSION_TYPE.RESTRUCTURE]: 'Reorganization',
    [HIERARCHY_VERSION_TYPE.YEARLY]: 'Yearly Archive',
    [HIERARCHY_VERSION_TYPE.ACQUISITION]: 'Merger/Acquisition',
};

// Status Types
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
    RESIGNED: 'resigned',
    ON_LEAVE: 'on_leave',
    TERMINATED: 'terminated',
};

export const STATUS_LABELS = {
    [STATUS.ACTIVE]: 'Active',
    [STATUS.INACTIVE]: 'Inactive',
    [STATUS.PENDING]: 'Pending',
    [STATUS.SUSPENDED]: 'Suspended',
    [STATUS.RESIGNED]: 'Resigned',
    [STATUS.ON_LEAVE]: 'On Leave',
    [STATUS.TERMINATED]: 'Terminated',
};

export const STATUS_COLORS = {
    [STATUS.ACTIVE]: '#10B981',
    [STATUS.INACTIVE]: '#6B7280',
    [STATUS.PENDING]: '#F59E0B',
    [STATUS.SUSPENDED]: '#EF4444',
    [STATUS.RESIGNED]: '#8B5CF6',
    [STATUS.ON_LEAVE]: '#3B82F6',
    [STATUS.TERMINATED]: '#DC2626',
};

// Default Values
export const DEFAULT_MAX_HIERARCHY_DEPTH = 20;
export const DEFAULT_MAX_DIRECT_REPORTS = 50;
export const DEFAULT_HEALTHY_SPAN_OF_CONTROL = 15;
export const DEFAULT_WARNING_SPAN_OF_CONTROL = 20;
export const DEFAULT_ORG_CHART_MAX_DEPTH = 10;
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_BULK_OPERATION_LIMIT = 100;

// API Endpoints
export const STRUCTURE_API_BASE = '/api/v1/structure';

export const API_ENDPOINTS = {
    // Departments
    DEPARTMENTS: `${STRUCTURE_API_BASE}/departments/`,
    DEPARTMENT_TREE: `${STRUCTURE_API_BASE}/department-trees/`,
    DEPARTMENT_BY_CODE: (code) => `${STRUCTURE_API_BASE}/departments/by-code/${code}/`,
    DEPARTMENT_CHILDREN: (id) => `${STRUCTURE_API_BASE}/departments/${id}/children/`,
    DEPARTMENT_ANCESTORS: (id) => `${STRUCTURE_API_BASE}/departments/${id}/ancestors/`,
    DEPARTMENT_MOVE: (id) => `${STRUCTURE_API_BASE}/departments/${id}/move/`,
    // Teams
    TEAMS: `${STRUCTURE_API_BASE}/teams/`,
    TEAM_HIERARCHY: `${STRUCTURE_API_BASE}/team-hierarchies/`,
    TEAM_BY_CODE: (code) => `${STRUCTURE_API_BASE}/teams/by-code/${code}/`,
    TEAM_MEMBERS: (id) => `${STRUCTURE_API_BASE}/teams/${id}/members/`,
    TEAM_ADD_MEMBER: (id) => `${STRUCTURE_API_BASE}/teams/${id}/add-member/`,
    TEAM_REMOVE_MEMBER: (id) => `${STRUCTURE_API_BASE}/teams/${id}/remove-member/`,
    // Positions
    POSITIONS: `${STRUCTURE_API_BASE}/positions/`,
    POSITION_BY_CODE: (code) => `${STRUCTURE_API_BASE}/positions/by-code/${code}/`,
    POSITION_INCUMBENTS: (id) => `${STRUCTURE_API_BASE}/positions/${id}/incumbents/`,
    POSITION_REPORTING_CHAIN: (id) => `${STRUCTURE_API_BASE}/positions/${id}/reporting-chain/`,
    POSITIONS_VACANT: `${STRUCTURE_API_BASE}/positions/vacant/`,
    // Employments
    EMPLOYMENTS: `${STRUCTURE_API_BASE}/employments/`,
    EMPLOYMENTS_CURRENT: `${STRUCTURE_API_BASE}/employments/current/`,
    EMPLOYMENT_BY_USER: (userId) => `${STRUCTURE_API_BASE}/employments/by-user/${userId}/`,
    EMPLOYMENT_TRANSFER: `${STRUCTURE_API_BASE}/employments/transfer/`,
    EMPLOYMENT_BULK: `${STRUCTURE_API_BASE}/employments/bulk-create/`,
    // Reporting Lines
    REPORTING_LINES: `${STRUCTURE_API_BASE}/reporting-lines/`,
    REPORTING_BY_EMPLOYEE: (userId) => `${STRUCTURE_API_BASE}/reporting-lines/by-employee/${userId}/`,
    REPORTING_BY_MANAGER: (userId) => `${STRUCTURE_API_BASE}/reporting-lines/by-manager/${userId}/`,
    REPORTING_TEAM: (userId) => `${STRUCTURE_API_BASE}/reporting-lines/team/${userId}/`,
    REPORTING_CHAIN: (userId) => `${STRUCTURE_API_BASE}/reporting-lines/chain/${userId}/`,
    SPAN_OF_CONTROL: (userId) => `${STRUCTURE_API_BASE}/reporting-lines/span-of-control/${userId}/`,
    ORGANIZATION_SPAN: `${STRUCTURE_API_BASE}/reporting-lines/organization-span/`,
    // Hierarchy
    HIERARCHY: `${STRUCTURE_API_BASE}/hierarchy/`,
    HIERARCHY_CAPTURE: `${STRUCTURE_API_BASE}/hierarchy/capture/`,
    HIERARCHY_CURRENT: `${STRUCTURE_API_BASE}/hierarchy/current/`,
    HIERARCHY_HISTORY: `${STRUCTURE_API_BASE}/hierarchy/history/`,
    HIERARCHY_VALIDATE: `${STRUCTURE_API_BASE}/hierarchy/validate/`,
    HIERARCHY_RESTORE: (id) => `${STRUCTURE_API_BASE}/hierarchy/${id}/restore/`,
    HIERARCHY_COMPARE: (id, compareId) => `${STRUCTURE_API_BASE}/hierarchy/${id}/diff/${compareId}/`,
    // Org Charts
    ORG_CHARTS: `${STRUCTURE_API_BASE}/org-charts/`,
    ORG_CHART_JSON: `${STRUCTURE_API_BASE}/org-charts/json/`,
    ORG_CHART_CSV: `${STRUCTURE_API_BASE}/org-charts/csv/`,
    ORG_CHART_TEXT: `${STRUCTURE_API_BASE}/org-charts/text/`,
    ORG_CHART_VISIO: `${STRUCTURE_API_BASE}/org-charts/visio/`,
    ORG_CHART_TREE: `${STRUCTURE_API_BASE}/org-charts/tree/`,
    ORG_CHART_PREVIEW: `${STRUCTURE_API_BASE}/org-charts/preview/`,
    // Bulk Operations
    BULK_DEPARTMENTS: `${STRUCTURE_API_BASE}/bulk-operations/departments/`,
    BULK_EMPLOYMENTS: `${STRUCTURE_API_BASE}/bulk-operations/employments/`,
    BULK_REPORTING: `${STRUCTURE_API_BASE}/bulk-operations/reporting-lines/`,
    BULK_REASSIGN_MANAGER: `${STRUCTURE_API_BASE}/bulk-operations/reassign-manager/`,
    // Cost Centers
    COST_CENTERS: `${STRUCTURE_API_BASE}/cost-centers/`,
    COST_CENTER_BY_CODE: (code) => `${STRUCTURE_API_BASE}/cost-centers/by-code/${code}/`,
    COST_CENTER_BY_YEAR: (year) => `${STRUCTURE_API_BASE}/cost-centers/by-fiscal-year/${year}/`,
    // Locations
    LOCATIONS: `${STRUCTURE_API_BASE}/locations/`,
    LOCATION_BY_CODE: (code) => `${STRUCTURE_API_BASE}/locations/by-code/${code}/`,
    LOCATION_BY_COUNTRY: (country) => `${STRUCTURE_API_BASE}/locations/by-country/${country}/`,
    LOCATION_HEADQUARTERS: `${STRUCTURE_API_BASE}/locations/headquarters/`,
    LOCATION_UPDATE_OCCUPANCY: (id) => `${STRUCTURE_API_BASE}/locations/${id}/update-occupancy/`,
    // Dashboard & Health
    STRUCTURE_DASHBOARD: `${STRUCTURE_API_BASE}/dashboard/overview/`,
    STRUCTURE_HEALTH: `${STRUCTURE_API_BASE}/dashboard/hierarchy-health/`,
    STRUCTURE_TRENDS: `${STRUCTURE_API_BASE}/dashboard/trends/`,
    STRUCTURE_METRICS: `${STRUCTURE_API_BASE}/health/metrics/`,
    STRUCTURE_ADMIN_HEALTH: `${STRUCTURE_API_BASE}/health/admin/`,
    // Search
    STRUCTURE_SEARCH: `${STRUCTURE_API_BASE}/search/`,
    // Current User
    MY_EMPLOYMENT: `${STRUCTURE_API_BASE}/me/`,
    MY_TEAM: `${STRUCTURE_API_BASE}/my-team/`,
    MY_CHAIN: `${STRUCTURE_API_BASE}/my-chain/`,
};

// WebSocket Events
export const WS_STRUCTURE_EVENTS = {
    ORG_EVENT: 'org_event',
    DEPARTMENT_CHANGE: 'department_change',
    TEAM_CHANGE: 'team_change',
    EMPLOYMENT_CHANGE: 'employment_change',
    REPORTING_CHANGE: 'reporting_change',
    CHAIN_UPDATED: 'chain_updated',
    MANAGER_CHANGED: 'manager_changed',
    NEW_SUBORDINATE: 'new_subordinate',
    PERMISSIONS_UPDATED: 'permissions_updated',
    ROLE_CHANGED: 'role_changed',
    HIERARCHY_ACCESS_CHANGED: 'hierarchy_access_changed',
};

// Query Keys (for React Query)
export const STRUCTURE_QUERY_KEYS = {
    DEPARTMENTS: 'departments',
    DEPARTMENT: 'department',
    DEPARTMENT_TREE: 'departmentTree',
    TEAMS: 'teams',
    TEAM: 'team',
    TEAM_HIERARCHY: 'teamHierarchy',
    POSITIONS: 'positions',
    POSITION: 'position',
    EMPLOYMENTS: 'employments',
    EMPLOYMENT: 'employment',
    CURRENT_EMPLOYMENT: 'currentEmployment',
    REPORTING_LINES: 'reportingLines',
    REPORTING_CHAIN: 'reportingChain',
    SPAN_OF_CONTROL: 'spanOfControl',
    HIERARCHY_VERSION: 'hierarchyVersion',
    HIERARCHY_VERSIONS: 'hierarchyVersions',
    ORG_CHART: 'orgChart',
    COST_CENTERS: 'costCenters',
    LOCATIONS: 'locations',
    STRUCTURE_STATS: 'structureStats',
    HIERARCHY_HEALTH: 'hierarchyHealth',
};

// Validation Rules
export const VALIDATION_RULES = {
    DEPARTMENT_CODE: {
        pattern: /^[A-Z0-9][A-Z0-9\-_]{2,49}$/,
        message: 'Department code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores. Must start with letter or number.',
    },
    POSITION_JOB_CODE: {
        pattern: /^[A-Z]{2,4}-[0-9]{3,5}$/,
        message: 'Job code format: 2-4 uppercase letters, hyphen, 3-5 digits (e.g., ENG-001, MKT-1234)',
    },
    GRADE: {
        pattern: /^[A-Z][0-9]{1,2}[A-Z]?$/,
        message: 'Grade format: letter(s) followed by numbers (e.g., P4, M2, S3, D1)',
    },
    REPORTING_WEIGHT: {
        min: 0,
        max: 1,
        message: 'Reporting weight must be between 0 and 1',
    },
    MAX_HIERARCHY_DEPTH: {
        max: DEFAULT_MAX_HIERARCHY_DEPTH,
        message: `Hierarchy depth cannot exceed ${DEFAULT_MAX_HIERARCHY_DEPTH}`,
    },
};

// Chart Colors (ECharts compatible)
export const STRUCTURE_CHART_COLORS = {
    PRIMARY: '#3B82F6',
    SECONDARY: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#8B5CF6',
    GRAY: '#6B7280',
    DARK: '#1F2937',
    LIGHT: '#F3F4F6',
    // Department sensitivity
    public: '#10B981',
    internal: '#3B82F6',
    confidential: '#F59E0B',
    restricted: '#EF4444',
    // Employment types
    permanent: '#10B981',
    contract: '#3B82F6',
    probation: '#F59E0B',
    intern: '#8B5CF6',
    consultant: '#EC4899',
    temporary: '#6B7280',
    // Gradient
    gradient: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
};

// Table Columns Configuration
export const DEPARTMENT_TABLE_COLUMNS = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'parent', label: 'Parent', sortable: true },
    { key: 'depth', label: 'Depth', sortable: true },
    { key: 'headcount', label: 'Headcount', sortable: true },
    { key: 'sensitivity', label: 'Sensitivity', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

export const TEAM_TABLE_COLUMNS = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'teamLead', label: 'Team Lead', sortable: true },
    { key: 'memberCount', label: 'Members', sortable: true },
    { key: 'maxMembers', label: 'Capacity', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

export const POSITION_TABLE_COLUMNS = [
    { key: 'jobCode', label: 'Job Code', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'grade', label: 'Grade', sortable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'incumbents', label: 'Incumbents', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

export const EMPLOYMENT_TABLE_COLUMNS = [
    { key: 'user', label: 'User', sortable: true },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'team', label: 'Team', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'effectiveFrom', label: 'From', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250];

// Local Storage Keys
export const STRUCTURE_STORAGE_KEYS = {
    DEPARTMENT_FILTERS: 'structure_department_filters',
    TEAM_FILTERS: 'structure_team_filters',
    POSITION_FILTERS: 'structure_position_filters',
    EMPLOYMENT_FILTERS: 'structure_employment_filters',
    ORG_CHART_SETTINGS: 'structure_org_chart_settings',
    UI_PREFERENCES: 'structure_ui_preferences',
};

// Export Formats
export const EXPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    TEXT: 'text',
    VISIO: 'visio',
    PDF: 'pdf',
    PNG: 'png',
};

export const EXPORT_FORMAT_LABELS = {
    [EXPORT_FORMATS.JSON]: 'JSON',
    [EXPORT_FORMATS.CSV]: 'CSV',
    [EXPORT_FORMATS.TEXT]: 'Text (ASCII)',
    [EXPORT_FORMATS.VISIO]: 'Visio (VDX)',
    [EXPORT_FORMATS.PDF]: 'PDF',
    [EXPORT_FORMATS.PNG]: 'PNG Image',
};

// Chart Types for Org Visualization
export const ORG_CHART_TYPES = {
    TREE: 'tree',
    SUNBURST: 'sunburst',
    TREEMAP: 'treemap',
    FORCE: 'force',
    RADIAL: 'radial',
};

export const ORG_CHART_TYPE_LABELS = {
    [ORG_CHART_TYPES.TREE]: 'Tree Layout',
    [ORG_CHART_TYPES.SUNBURST]: 'Sunburst',
    [ORG_CHART_TYPES.TREEMAP]: 'Treemap',
    [ORG_CHART_TYPES.FORCE]: 'Force-Directed Graph',
    [ORG_CHART_TYPES.RADIAL]: 'Radial Tree',
};

// ============================================
// ROUTE CONSTANTS - MUST MATCH YOUR SIDEBAR
// ============================================
export const STRUCTURE_ROUTES = {
    // Dashboard
    DASHBOARD: '/app/structure/dashboard',
    
    // Departments
    DEPARTMENTS: '/app/structure/departments',
    DEPARTMENT_TREE: '/app/structure/departments/tree',
    DEPARTMENT_CREATE: '/app/structure/departments/create',
    DEPARTMENT_DETAIL: (id = ':id') => `/app/structure/departments/${id}`,
    DEPARTMENT_EDIT: (id = ':id') => `/app/structure/departments/${id}/edit`,
    
    // Teams
    TEAMS: '/app/structure/teams',
    TEAM_HIERARCHY: '/app/structure/teams/hierarchy',
    TEAM_CREATE: '/app/structure/teams/create',
    TEAM_DETAIL: (id = ':id') => `/app/structure/teams/${id}`,
    TEAM_EDIT: (id = ':id') => `/app/structure/teams/${id}/edit`,
    
    // Positions
    POSITIONS: '/app/structure/positions',
    POSITION_CREATE: '/app/structure/positions/create',
    POSITION_DETAIL: (id = ':id') => `/app/structure/positions/${id}`,
    POSITION_EDIT: (id = ':id') => `/app/structure/positions/${id}/edit`,
    
    // Employments
    EMPLOYMENTS: '/app/structure/employments',
    EMPLOYMENT_CREATE: '/app/structure/employments/create',
    EMPLOYMENT_DETAIL: (id = ':id') => `/app/structure/employments/${id}`,
    EMPLOYMENT_EDIT: (id = ':id') => `/app/structure/employments/${id}/edit`,
    EMPLOYMENT_TRANSFER: (userId = ':userId?') => `/app/structure/employments/transfer/${userId}`,
    
    // Reporting Lines
    REPORTING_LINES: '/app/structure/reporting-lines',
    REPORTING_LINE_CREATE: '/app/structure/reporting-lines/create',
    REPORTING_LINE_EDIT: (id = ':id') => `/app/structure/reporting-lines/${id}/edit`,
    
    // Cost Centers
    COST_CENTERS: '/app/structure/cost-centers',
    COST_CENTER_CREATE: '/app/structure/cost-centers/create',
    COST_CENTER_EDIT: (id = ':id') => `/app/structure/cost-centers/${id}/edit`,
    
    // Locations
    LOCATIONS: '/app/structure/locations',
    LOCATION_CREATE: '/app/structure/locations/create',
    LOCATION_EDIT: (id = ':id') => `/app/structure/locations/${id}/edit`,
    
    // Hierarchy
    HIERARCHY_VERSIONS: '/app/structure/hierarchy/versions',
    HIERARCHY_COMPARE: (versionA = ':versionA', versionB = ':versionB') => `/app/structure/hierarchy/compare/${versionA}/${versionB}`,
    
    // Visualizations
    ORG_CHART: '/app/structure/org-chart',
    DEPARTMENT_TREES: '/app/structure/department-trees',
    TEAM_HIERARCHIES: '/app/structure/team-hierarchies',
    
    // My Information
    MY_EMPLOYMENT: '/app/structure/me',
    MY_TEAM: '/app/structure/my-team',
    MY_CHAIN: '/app/structure/my-chain',
};