// ============================================
// Structure API Constants - Following KPI App Pattern
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const STRUCTURE_API_BASE = `${API_BASE}/structure/`;
export const API_VERSION = 'v1';
export const STRUCTURE_API_PREFIX = `/api/${API_VERSION}/structure`;

// ============================================
// 1. ORGANIZATIONAL UNITS ENDPOINTS
// ============================================

export const ORGANIZATIONAL_UNIT_ENDPOINTS = {
    LIST: `${API_BASE}/structure/organizational-units/`,
    DETAIL: (id) => `${API_BASE}/structure/organizational-units/${id}/`,
    CREATE: `${API_BASE}/structure/organizational-units/`,
    UPDATE: (id) => `${API_BASE}/structure/organizational-units/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/organizational-units/${id}/`,
    BY_LEVEL: (level) => `${API_BASE}/structure/organizational-units/by-level/${level}/`,
    BY_PATH: (path) => `${API_BASE}/structure/organizational-units/by-path/${path}/`,
    ROOT: `${API_BASE}/structure/organizational-units/root/`,
    STATS: `${API_BASE}/structure/organizational-units/stats/`,
    SUBTREE: (id) => `${API_BASE}/structure/organizational-units/${id}/subtree/`,
    CHILDREN: (orgUnitId) => `${API_BASE}/structure/organizational-units/${orgUnitId}/children/`,
    EMPLOYMENTS: (orgUnitId) => `${API_BASE}/structure/organizational-units/${orgUnitId}/employments/`,
    QUERY_PARAMS: {
        LEVEL: 'level',
        PARENT: 'parent',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 2. DIVISIONS ENDPOINTS
// ============================================

export const DIVISION_ENDPOINTS = {
    LIST: `${API_BASE}/structure/divisions/`,
    DETAIL: (id) => `${API_BASE}/structure/divisions/${id}/`,
    CREATE: `${API_BASE}/structure/divisions/`,
    UPDATE: (id) => `${API_BASE}/structure/divisions/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/divisions/${id}/`,
    STATS: `${API_BASE}/structure/divisions/stats/`,
    DEPARTMENTS: (id) => `${API_BASE}/structure/divisions/${id}/departments/`,
    EMPLOYMENTS: (divisionId) => `${API_BASE}/structure/divisions/${divisionId}/employments/`,
    QUERY_PARAMS: {
        CODE: 'code',
        NAME: 'name',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 3. DEPARTMENTS ENDPOINTS
// ============================================

export const DEPARTMENT_ENDPOINTS = {
    LIST: `${API_BASE}/structure/departments/`,
    DETAIL: (id) => `${API_BASE}/structure/departments/${id}/`,
    CREATE: `${API_BASE}/structure/departments/`,
    UPDATE: (id) => `${API_BASE}/structure/departments/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/departments/${id}/`,
    BY_CODE: (code) => `${API_BASE}/structure/departments/by-code/${code}/`,
    ROOT: `${API_BASE}/structure/departments/root/`,
    STATS: `${API_BASE}/structure/departments/stats/`,
    CHILDREN: (id) => `${API_BASE}/structure/departments/${id}/children/`,
    SECTIONS: (id) => `${API_BASE}/structure/departments/${id}/sections/`,
    EMPLOYMENTS: (id) => `${API_BASE}/structure/departments/${id}/employments/`,
    ANCESTORS: (id) => `${API_BASE}/structure/departments/${id}/ancestors/`,
    MOVE: (id) => `${API_BASE}/structure/departments/${id}/move/`,
    // Department Tree endpoints
    TREE_FULL: `${API_BASE}/structure/department-trees/full/`,
    TREE_BRANCH: (deptId) => `${API_BASE}/structure/department-trees/branch/${deptId}/`,
    TREE_PATH: (deptId) => `${API_BASE}/structure/department-trees/path/${deptId}/`,
    TREE_SUBTREE: (deptId) => `${API_BASE}/structure/department-trees/subtree/${deptId}/`,
    TREE_LCA: `${API_BASE}/structure/department-trees/lca/`,
    QUERY_PARAMS: {
        CODE: 'code',
        PARENT: 'parent',
        IS_ACTIVE: 'is_active',
        SENSITIVITY_LEVEL: 'sensitivity_level',
        SEARCH: 'search',
        ORDERING: 'ordering',
        DEPT_A: 'dept_a',
        DEPT_B: 'dept_b',
    },
};

// ============================================
// 4. SECTIONS ENDPOINTS
// ============================================

export const SECTION_ENDPOINTS = {
    LIST: `${API_BASE}/structure/sections/`,
    DETAIL: (id) => `${API_BASE}/structure/sections/${id}/`,
    CREATE: `${API_BASE}/structure/sections/`,
    UPDATE: (id) => `${API_BASE}/structure/sections/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/sections/${id}/`,
    BY_CODE: (code) => `${API_BASE}/structure/sections/by-code/${code}/`,
    UNITS: (id) => `${API_BASE}/structure/sections/${id}/units/`,
    EMPLOYMENTS: (id) => `${API_BASE}/structure/sections/${id}/employments/`,
    QUERY_PARAMS: {
        CODE: 'code',
        PARENT: 'parent',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 5. UNITS ENDPOINTS
// ============================================

export const UNIT_ENDPOINTS = {
    LIST: `${API_BASE}/structure/units/`,
    DETAIL: (id) => `${API_BASE}/structure/units/${id}/`,
    CREATE: `${API_BASE}/structure/units/`,
    UPDATE: (id) => `${API_BASE}/structure/units/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/units/${id}/`,
    BY_CODE: (code) => `${API_BASE}/structure/units/by-code/${code}/`,
    STATS: `${API_BASE}/structure/units/stats/`,
    EMPLOYMENTS: (id) => `${API_BASE}/structure/units/${id}/employments/`,
    QUERY_PARAMS: {
        CODE: 'code',
        PARENT: 'parent',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 6. POSITIONS ENDPOINTS
// ============================================

export const POSITION_ENDPOINTS = {
    LIST: `${API_BASE}/structure/positions/`,
    DETAIL: (id) => `${API_BASE}/structure/positions/${id}/`,
    CREATE: `${API_BASE}/structure/positions/`,
    UPDATE: (id) => `${API_BASE}/structure/positions/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/positions/${id}/`,
    BY_CODE: (jobCode) => `${API_BASE}/structure/positions/by-code/${jobCode}/`,
    VACANT: `${API_BASE}/structure/positions/vacant/`,
    STATS: `${API_BASE}/structure/positions/stats/`,
    INCUMBENTS: (id) => `${API_BASE}/structure/positions/${id}/incumbents/`,
    REPORTING_CHAIN: (id) => `${API_BASE}/structure/positions/reporting-chain/${id}/`,
    REPORTS: (positionId) => `${API_BASE}/structure/positions/${positionId}/reports/`,
    QUERY_PARAMS: {
        JOB_CODE: 'job_code',
        GRADE: 'grade',
        LEVEL: 'level',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 7. EMPLOYMENTS ENDPOINTS
// ============================================

export const EMPLOYMENT_ENDPOINTS = {
    LIST: `${API_BASE}/structure/employments/`,
    DETAIL: (id) => `${API_BASE}/structure/employments/${id}/`,
    CREATE: `${API_BASE}/structure/employments/`,
    UPDATE: (id) => `${API_BASE}/structure/employments/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/employments/${id}/`,
    CURRENT: `${API_BASE}/structure/employments/current/`,
    BY_USER: (userId) => `${API_BASE}/structure/employments/by-user/${userId}/`,
    STATS: `${API_BASE}/structure/employments/stats/`,
    TRANSFER: `${API_BASE}/structure/employments/transfer/`,
    BULK_CREATE: `${API_BASE}/structure/employments/bulk-create/`,
    ME: `${API_BASE}/structure/me/`,
    QUERY_PARAMS: {
        USER_ID: 'user_id',
        POSITION: 'position',
        DIVISION: 'division',
        DEPARTMENT: 'department',
        SECTION: 'section',
        UNIT: 'unit',
        IS_CURRENT: 'is_current',
        IS_ACTIVE: 'is_active',
        IS_MANAGER: 'is_manager',
        EMPLOYMENT_TYPE: 'employment_type',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 8. REPORTING LINES ENDPOINTS
// ============================================

export const REPORTING_LINE_ENDPOINTS = {
    LIST: `${API_BASE}/structure/reporting-lines/`,
    DETAIL: (id) => `${API_BASE}/structure/reporting-lines/${id}/`,
    CREATE: `${API_BASE}/structure/reporting-lines/`,
    UPDATE: (id) => `${API_BASE}/structure/reporting-lines/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/reporting-lines/${id}/`,
    BY_EMPLOYEE: (userId) => `${API_BASE}/structure/reporting-lines/by-employee/${userId}/`,
    BY_MANAGER: (userId) => `${API_BASE}/structure/reporting-lines/by-manager/${userId}/`,
    CHAIN: (userId) => `${API_BASE}/structure/reporting-lines/chain/${userId}/`,
    SPAN_OF_CONTROL: (managerId) => `${API_BASE}/structure/reporting-lines/span-of-control/${managerId}/`,
    ORGANIZATION_SPAN: `${API_BASE}/structure/reporting-lines/organization-span/`,
    ASSIGN_MANAGER: `${API_BASE}/structure/reporting-lines/assign-manager/`,
    REMOVE_MANAGER: `${API_BASE}/structure/reporting-lines/remove-manager/`,
    MY_CHAIN: `${API_BASE}/structure/my-chain/`,
    MY_TEAM: `${API_BASE}/structure/my-team/`,
    QUERY_PARAMS: {
        EMPLOYEE: 'employee',
        MANAGER: 'manager',
        IS_ACTIVE: 'is_active',
        EFFECTIVE_FROM: 'effective_from',
        EFFECTIVE_TO: 'effective_to',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 9. INTERIM ASSIGNMENTS ENDPOINTS
// ============================================

export const INTERIM_ASSIGNMENT_ENDPOINTS = {
    LIST: `${API_BASE}/structure/interim-assignments/`,
    DETAIL: (id) => `${API_BASE}/structure/interim-assignments/${id}/`,
    CREATE: `${API_BASE}/structure/interim-assignments/`,
    UPDATE: (id) => `${API_BASE}/structure/interim-assignments/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/interim-assignments/${id}/`,
    BY_EMPLOYEE: (userId) => `${API_BASE}/structure/interim-assignments/by-employee/${userId}/`,
    ACTIVE: `${API_BASE}/structure/interim-assignments/active/`,
    EXPIRING_SOON: `${API_BASE}/structure/interim-assignments/expiring-soon/`,
    ASSIGN: `${API_BASE}/structure/interim-assignments/assign/`,
    END: `${API_BASE}/structure/interim-assignments/end/`,
    QUERY_PARAMS: {
        EMPLOYEE: 'employee',
        INTERIM_MANAGER: 'interim_manager',
        IS_ACTIVE: 'is_active',
        EFFECTIVE_FROM: 'effective_from',
        EFFECTIVE_TO: 'effective_to',
        DAYS: 'days',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 10. COST CENTERS ENDPOINTS
// ============================================

export const COST_CENTER_ENDPOINTS = {
    LIST: `${API_BASE}/structure/cost-centers/`,
    DETAIL: (id) => `${API_BASE}/structure/cost-centers/${id}/`,
    CREATE: `${API_BASE}/structure/cost-centers/`,
    UPDATE: (id) => `${API_BASE}/structure/cost-centers/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/cost-centers/${id}/`,
    BY_CODE: (code) => `${API_BASE}/structure/cost-centers/by-code/${code}/`,
    BY_FISCAL_YEAR: (year) => `${API_BASE}/structure/cost-centers/by-fiscal-year/${year}/`,
    BY_ORG_UNIT: (orgUnitId) => `${API_BASE}/structure/cost-centers/by-org-unit/${orgUnitId}/`,
    BY_LEVEL: (level) => `${API_BASE}/structure/cost-centers/by-level/${level}/`,
    STATS: `${API_BASE}/structure/cost-centers/stats/`,
    CHILDREN: (id) => `${API_BASE}/structure/cost-centers/${id}/children/`,
    UTILIZATION: (id) => `${API_BASE}/structure/cost-centers/${id}/utilization/`,
    QUERY_PARAMS: {
        CODE: 'code',
        CATEGORY: 'category',
        FISCAL_YEAR: 'fiscal_year',
        IS_ACTIVE: 'is_active',
        IS_SHARED: 'is_shared',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 11. LOCATIONS ENDPOINTS
// ============================================

export const LOCATION_ENDPOINTS = {
    LIST: `${API_BASE}/structure/locations/`,
    DETAIL: (id) => `${API_BASE}/structure/locations/${id}/`,
    CREATE: `${API_BASE}/structure/locations/`,
    UPDATE: (id) => `${API_BASE}/structure/locations/${id}/`,
    DELETE: (id) => `${API_BASE}/structure/locations/${id}/`,
    BY_CODE: (code) => `${API_BASE}/structure/locations/by-code/${code}/`,
    BY_COUNTRY: (country) => `${API_BASE}/structure/locations/by-country/${country}/`,
    BY_ORG_UNIT: (orgUnitId) => `${API_BASE}/structure/locations/by-org-unit/${orgUnitId}/`,
    HEADQUARTERS: `${API_BASE}/structure/locations/headquarters/`,
    STATS: `${API_BASE}/structure/locations/stats/`,
    SUB_LOCATIONS: (id) => `${API_BASE}/structure/locations/${id}/sub-locations/`,
    UPDATE_OCCUPANCY: (id) => `${API_BASE}/structure/locations/${id}/update-occupancy/`,
    QUERY_PARAMS: {
        CODE: 'code',
        TYPE: 'type',
        COUNTRY: 'country',
        CITY: 'city',
        IS_ACTIVE: 'is_active',
        IS_HEADQUARTERS: 'is_headquarters',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 12. HIERARCHY VERSIONS ENDPOINTS
// ============================================

export const HIERARCHY_ENDPOINTS = {
    LIST: `${API_BASE}/structure/hierarchy/`,
    DETAIL: (id) => `${API_BASE}/structure/hierarchy/${id}/`,
    CURRENT: `${API_BASE}/structure/hierarchy/current/`,
    HISTORY: `${API_BASE}/structure/hierarchy/history/`,
    CAPTURE: `${API_BASE}/structure/hierarchy/capture/`,
    AUTO_CAPTURE: `${API_BASE}/structure/hierarchy/auto-capture/`,
    RESTORE: (id) => `${API_BASE}/structure/hierarchy/${id}/restore/`,
    DIFF: (id, compareToId) => `${API_BASE}/structure/hierarchy/${id}/diff/${compareToId}/`,
    VALIDATE: `${API_BASE}/structure/hierarchy/validate/`,
    QUERY_PARAMS: {
        VERSION_TYPE: 'version_type',
        IS_CURRENT: 'is_current',
        LIMIT: 'limit',
        ORDERING: 'ordering',
    },
};

// ============================================
// 13. ORG CHART ENDPOINTS
// ============================================

export const ORG_CHART_ENDPOINTS = {
    JSON: `${API_BASE}/structure/org-charts/json/`,
    CSV: `${API_BASE}/structure/org-charts/csv/`,
    TEXT: `${API_BASE}/structure/org-charts/text/`,
    VISIO: `${API_BASE}/structure/org-charts/visio/`,
    TREE: `${API_BASE}/structure/org-charts/tree/`,
    PREVIEW: `${API_BASE}/structure/org-charts/preview/`,
    QUERY_PARAMS: {
        FORMAT: 'format',
        ENTITY: 'entity',
        ROOT_UNIT_ID: 'root_unit_id',
        MAX_DEPTH: 'max_depth',
        INCLUDE_INACTIVE: 'include_inactive',
        CURRENT_ONLY: 'current_only',
        ACTIVE_ONLY: 'active_only',
    },
};

// ============================================
// 14. BULK OPERATIONS ENDPOINTS
// ============================================

export const BULK_ENDPOINTS = {
    DEPARTMENTS: `${API_BASE}/structure/bulk-operations/departments/`,
    EMPLOYMENTS: `${API_BASE}/structure/bulk-operations/employments/`,
    REPORTING_LINES: `${API_BASE}/structure/bulk-operations/reporting-lines/`,
    REASSIGN_MANAGER: `${API_BASE}/structure/bulk-operations/reassign-manager/`,
    QUERY_PARAMS: {
        ACTION: 'action',
    },
};

// ============================================
// 15. DASHBOARD ENDPOINTS
// ============================================

export const DASHBOARD_ENDPOINTS = {
    OVERVIEW: `${API_BASE}/structure/dashboard/overview/`,
    HIERARCHY_HEALTH: `${API_BASE}/structure/dashboard/hierarchy-health/`,
    TRENDS: `${API_BASE}/structure/dashboard/trends/`,
    QUERY_PARAMS: {
        MONTHS: 'months',
    },
};

// ============================================
// 16. HEALTH ENDPOINTS
// ============================================

export const HEALTH_ENDPOINTS = {
    DATABASE: `${API_BASE}/structure/health/database/`,
    CACHE: `${API_BASE}/structure/health/cache/`,
    SERVICES: `${API_BASE}/structure/health/services/`,
    ADMIN: `${API_BASE}/structure/health/admin/`,
    METRICS: `${API_BASE}/structure/health/metrics/`,
};

// ============================================
// 17. SYSTEM SETTINGS ENDPOINTS
// ============================================

export const SYSTEM_SETTINGS_ENDPOINTS = {
    GET: `${API_BASE}/structure/system-settings/`,
    UPDATE: `${API_BASE}/structure/system-settings/`,
    RESET: `${API_BASE}/structure/system-settings/reset/`,
};

// ============================================
// 18. REFERENCE DATA ENDPOINTS
// ============================================

export const REFERENCE_DATA_ENDPOINTS = {
    GET: `${API_BASE}/structure/reference-data/`,
    QUERY_PARAMS: {
        INCLUDE: 'include',
    },
};

// ============================================
// 19. SEARCH ENDPOINTS
// ============================================

export const SEARCH_ENDPOINTS = {
    SEARCH: `${API_BASE}/structure/search/`,
    QUERY_PARAMS: {
        SEARCH: 'search',
        LEVEL: 'level',
        IS_ACTIVE: 'is_active',
    },
};

// ============================================
// WEBSOCKET ENDPOINTS
// ============================================

export const STRUCTURE_WS = {
    ORG_UNIT_UPDATES: (tenantId) => `${WS_BASE}/structure/org-unit/${tenantId}/`,
    EMPLOYMENT_UPDATES: (tenantId) => `${WS_BASE}/structure/employment/${tenantId}/`,
    REPORTING_UPDATES: (tenantId) => `${WS_BASE}/structure/reporting/${tenantId}/`,
    HIERARCHY_UPDATES: (tenantId) => `${WS_BASE}/structure/hierarchy/${tenantId}/`,
    DASHBOARD_UPDATES: (tenantId) => `${WS_BASE}/structure/dashboard/${tenantId}/`,
};

// ============================================
// API STATUS & HTTP CONSTANTS
// ============================================

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// STRUCTURE ERROR CODES
// ============================================

export const STRUCTURE_ERROR_CODES = {
    DUPLICATE_CODE: 'DUPLICATE_CODE',
    INVALID_PARENT: 'INVALID_PARENT',
    HIERARCHY_CYCLE: 'HIERARCHY_CYCLE',
    SELF_PARENT: 'SELF_PARENT',
    TENANT_MISMATCH: 'TENANT_MISMATCH',
    EMPLOYMENT_OVERLAP: 'EMPLOYMENT_OVERLAP',
    POSITION_OCCUPIED: 'POSITION_OCCUPIED',
    REPORTING_CYCLE: 'REPORTING_CYCLE',
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    COST_CENTER_IN_USE: 'COST_CENTER_IN_USE',
    LOCATION_IN_USE: 'LOCATION_IN_USE',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    TENANT_ISOLATION_ERROR: 'TENANT_ISOLATION_ERROR',
    SNAPSHOT_NOT_FOUND: 'SNAPSHOT_NOT_FOUND',
    VERSION_CONFLICT: 'VERSION_CONFLICT',
};

// ============================================
// STRUCTURE CONSTANTS
// ============================================

export const STRUCTURE_ENTITY_TYPES = {
    ORGANIZATIONAL_UNIT: 'organizational_unit',
    DIVISION: 'division',
    DEPARTMENT: 'department',
    SECTION: 'section',
    UNIT: 'unit',
    POSITION: 'position',
    EMPLOYMENT: 'employment',
    REPORTING_LINE: 'reporting_line',
    INTERIM_ASSIGNMENT: 'interim_assignment',
    COST_CENTER: 'cost_center',
    LOCATION: 'location',
    HIERARCHY_VERSION: 'hierarchy_version',
};

export const ORG_LEVELS = {
    DIVISION: 'division',
    DEPARTMENT: 'department',
    SECTION: 'section',
    UNIT: 'unit',
};

export const EMPLOYMENT_TYPES = {
    PERMANENT: 'permanent',
    CONTRACT: 'contract',
    PROBATION: 'probation',
    INTERN: 'intern',
    CONSULTANT: 'consultant',
    TEMPORARY: 'temporary',
};

export const REPORTING_TYPES = {
    SOLID: 'solid',
    DOTTED: 'dotted',
    INTERIM: 'interim',
    FUNCTIONAL: 'functional',
    PROJECT: 'project',
};

export const COST_CENTER_CATEGORIES = {
    OPERATIONAL: 'operational',
    CAPITAL: 'capital',
    PROJECT: 'project',
    DEPARTMENTAL: 'departmental',
    SHARED: 'shared',
};

export const LOCATION_TYPES = {
    HEADQUARTERS: 'headquarters',
    REGIONAL: 'regional',
    BRANCH: 'branch',
    REMOTE: 'remote',
    SATELLITE: 'satellite',
};

export const HIERARCHY_VERSION_TYPES = {
    AUTO: 'auto',
    MANUAL: 'manual',
    RESTRUCTURE: 'restructure',
    YEARLY: 'yearly',
    ACQUISITION: 'acquisition',
};

export const SENSITIVITY_LEVELS = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    RESTRICTED: 'restricted',
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    STRUCTURE_API_BASE,
    API_VERSION,
    STRUCTURE_API_PREFIX,
    ORGANIZATIONAL_UNIT_ENDPOINTS,
    DIVISION_ENDPOINTS,
    DEPARTMENT_ENDPOINTS,
    SECTION_ENDPOINTS,
    UNIT_ENDPOINTS,
    POSITION_ENDPOINTS,
    EMPLOYMENT_ENDPOINTS,
    REPORTING_LINE_ENDPOINTS,
    INTERIM_ASSIGNMENT_ENDPOINTS,
    COST_CENTER_ENDPOINTS,
    LOCATION_ENDPOINTS,
    HIERARCHY_ENDPOINTS,
    ORG_CHART_ENDPOINTS,
    BULK_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    HEALTH_ENDPOINTS,
    SYSTEM_SETTINGS_ENDPOINTS,
    REFERENCE_DATA_ENDPOINTS,
    SEARCH_ENDPOINTS,
    STRUCTURE_WS,
    API_STATUS,
    HTTP_STATUS,
    STRUCTURE_ERROR_CODES,
    STRUCTURE_ENTITY_TYPES,
    ORG_LEVELS,
    EMPLOYMENT_TYPES,
    REPORTING_TYPES,
    COST_CENTER_CATEGORIES,
    LOCATION_TYPES,
    HIERARCHY_VERSION_TYPES,
    SENSITIVITY_LEVELS,
};