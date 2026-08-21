// ============================================
// Structure Route Constants
// ============================================

export const STRUCTURE_ROUTES = {
    // Base
    BASE: '/structure',
    
    // Organizational Units
    ORG_UNITS: '/structure/org-units',
    ORG_UNIT_DETAIL: (id = ':id') => `/structure/org-units/${id}`,
    ORG_UNIT_CREATE: '/structure/org-units/create',
    ORG_UNIT_EDIT: (id = ':id') => `/structure/org-units/${id}/edit`,
    ORG_UNIT_TREE: '/structure/org-units/tree',
    
    // Divisions
    DIVISIONS: '/structure/divisions',
    DIVISION_DETAIL: (id = ':id') => `/structure/divisions/${id}`,
    DIVISION_CREATE: '/structure/divisions/create',
    DIVISION_EDIT: (id = ':id') => `/structure/divisions/${id}/edit`,
    
    // Departments
    DEPARTMENTS: '/structure/departments',
    DEPARTMENT_DETAIL: (id = ':id') => `/structure/departments/${id}`,
    DEPARTMENT_CREATE: '/structure/departments/create',
    DEPARTMENT_EDIT: (id = ':id') => `/structure/departments/${id}/edit`,
    DEPARTMENT_TREE: '/structure/departments/tree',
    DEPARTMENT_BRANCH: (id = ':id') => `/structure/departments/tree/branch/${id}`,
    
    // Sections
    SECTIONS: '/structure/sections',
    SECTION_DETAIL: (id = ':id') => `/structure/sections/${id}`,
    SECTION_CREATE: '/structure/sections/create',
    SECTION_EDIT: (id = ':id') => `/structure/sections/${id}/edit`,
    
    // Units
    UNITS: '/structure/units',
    UNIT_DETAIL: (id = ':id') => `/structure/units/${id}`,
    UNIT_CREATE: '/structure/units/create',
    UNIT_EDIT: (id = ':id') => `/structure/units/${id}/edit`,
    
    // Positions
    POSITIONS: '/structure/positions',
    POSITION_DETAIL: (id = ':id') => `/structure/positions/${id}`,
    POSITION_CREATE: '/structure/positions/create',
    POSITION_EDIT: (id = ':id') => `/structure/positions/${id}/edit`,
    POSITION_VACANT: '/structure/positions/vacant',
    POSITION_REPORTING_CHAIN: (id = ':id') => `/structure/positions/${id}/chain`,
    
    // Employments
    EMPLOYMENTS: '/structure/employments',
    EMPLOYMENT_DETAIL: (id = ':id') => `/structure/employments/${id}`,
    EMPLOYMENT_CREATE: '/structure/employments/create',
    EMPLOYMENT_EDIT: (id = ':id') => `/structure/employments/${id}/edit`,
    EMPLOYMENT_CURRENT: '/structure/employments/current',
    EMPLOYMENT_BY_USER: (userId = ':userId') => `/structure/employments/user/${userId}`,
    EMPLOYMENT_TRANSFER: '/structure/employments/transfer',
    EMPLOYMENT_BULK: '/structure/employments/bulk',
    MY_EMPLOYMENT: '/structure/me',
    
    // Reporting Lines
    REPORTING_LINES: '/structure/reporting-lines',
    REPORTING_LINE_DETAIL: (id = ':id') => `/structure/reporting-lines/${id}`,
    REPORTING_LINE_CREATE: '/structure/reporting-lines/create',
    REPORTING_LINE_EDIT: (id = ':id') => `/structure/reporting-lines/${id}/edit`,
    REPORTING_CHAIN: (userId = ':userId') => `/structure/reporting-lines/chain/${userId}`,
    SPAN_OF_CONTROL: (managerId = ':managerId') => `/structure/reporting-lines/span/${managerId}`,
    ORGANIZATION_SPAN: '/structure/reporting-lines/organization-span',
    MY_CHAIN: '/structure/my-chain',
    MY_TEAM: '/structure/my-team',
    
    // Interim Assignments
    INTERIM_ASSIGNMENTS: '/structure/interim-assignments',
    INTERIM_ASSIGNMENT_DETAIL: (id = ':id') => `/structure/interim-assignments/${id}`,
    INTERIM_ASSIGNMENT_CREATE: '/structure/interim-assignments/create',
    INTERIM_ASSIGNMENT_EDIT: (id = ':id') => `/structure/interim-assignments/${id}/edit`,
    INTERIM_ASSIGNMENT_ACTIVE: '/structure/interim-assignments/active',
    INTERIM_ASSIGNMENT_EXPIRING: '/structure/interim-assignments/expiring',
    
    // Cost Centers
    COST_CENTERS: '/structure/cost-centers',
    COST_CENTER_DETAIL: (id = ':id') => `/structure/cost-centers/${id}`,
    COST_CENTER_CREATE: '/structure/cost-centers/create',
    COST_CENTER_EDIT: (id = ':id') => `/structure/cost-centers/${id}/edit`,
    COST_CENTER_STATS: '/structure/cost-centers/stats',
    COST_CENTER_UTILIZATION: (id = ':id') => `/structure/cost-centers/${id}/utilization`,
    
    // Locations
    LOCATIONS: '/structure/locations',
    LOCATION_DETAIL: (id = ':id') => `/structure/locations/${id}`,
    LOCATION_CREATE: '/structure/locations/create',
    LOCATION_EDIT: (id = ':id') => `/structure/locations/${id}/edit`,
    LOCATION_HEADQUARTERS: '/structure/locations/headquarters',
    LOCATION_STATS: '/structure/locations/stats',
    
    // Hierarchy
    HIERARCHY: '/structure/hierarchy',
    HIERARCHY_CURRENT: '/structure/hierarchy/current',
    HIERARCHY_HISTORY: '/structure/hierarchy/history',
    HIERARCHY_CAPTURE: '/structure/hierarchy/capture',
    HIERARCHY_DETAIL: (id = ':id') => `/structure/hierarchy/${id}`,
    HIERARCHY_RESTORE: (id = ':id') => `/structure/hierarchy/${id}/restore`,
    HIERARCHY_DIFF: (id = ':id', compareToId = ':compareToId') => 
        `/structure/hierarchy/${id}/diff/${compareToId}`,
    HIERARCHY_VALIDATE: '/structure/hierarchy/validate',
    
    // Bulk
    BULK_DEPARTMENTS: '/structure/bulk/departments',
    BULK_EMPLOYMENTS: '/structure/bulk/employments',
    BULK_REPORTING: '/structure/bulk/reporting',
    
    // Org Charts
    ORG_CHARTS: '/structure/org-charts',
    ORG_CHART_JSON: '/structure/org-charts/json',
    ORG_CHART_CSV: '/structure/org-charts/csv',
    ORG_CHART_TEXT: '/structure/org-charts/text',
    ORG_CHART_VISIO: '/structure/org-charts/visio',
    ORG_CHART_TREE: '/structure/org-charts/tree',
    ORG_CHART_PREVIEW: '/structure/org-charts/preview',
    ORG_CHART_EXPORT: '/structure/org-charts/export',
    
    // Dashboard
    DASHBOARD: '/structure/dashboard',
    DASHBOARD_OVERVIEW: '/structure/dashboard/overview',
    DASHBOARD_HEALTH: '/structure/dashboard/health',
    DASHBOARD_TRENDS: '/structure/dashboard/trends',
    
    // System Settings
    SYSTEM_SETTINGS: '/structure/system-settings',
    SYSTEM_SETTINGS_RESET: '/structure/system-settings/reset',
    
    // Reference Data
    REFERENCE_DATA: '/structure/reference-data',
    
    // Search
    SEARCH: '/structure/search',
    
    // Health
    HEALTH: '/structure/health',
    HEALTH_DATABASE: '/structure/health/database',
    HEALTH_CACHE: '/structure/health/cache',
    HEALTH_SERVICES: '/structure/health/services',
    HEALTH_METRICS: '/structure/health/metrics',
};

// Routes that should have minimal header/footer
export const STRUCTURE_MINIMAL_CHROME_PATHS = [
    STRUCTURE_ROUTES.ORG_CHART_JSON,
    STRUCTURE_ROUTES.ORG_CHART_CSV,
    STRUCTURE_ROUTES.ORG_CHART_TEXT,
    STRUCTURE_ROUTES.ORG_CHART_VISIO,
    STRUCTURE_ROUTES.ORG_CHART_TREE,
    STRUCTURE_ROUTES.SEARCH,
];

// Legacy redirects
export const LEGACY_STRUCTURE_REDIRECTS = [
    ['/app/structure/organization', STRUCTURE_ROUTES.ORG_UNITS],
    ['/app/structure/organization/units', STRUCTURE_ROUTES.ORG_UNITS],
    ['/app/structure/org-tree', STRUCTURE_ROUTES.ORG_UNIT_TREE],
    ['/app/structure/departments', STRUCTURE_ROUTES.DEPARTMENTS],
    ['/app/structure/positions', STRUCTURE_ROUTES.POSITIONS],
    ['/app/structure/employees', STRUCTURE_ROUTES.EMPLOYMENTS],
    ['/app/structure/reporting', STRUCTURE_ROUTES.REPORTING_LINES],
    ['/app/structure/cost-centers', STRUCTURE_ROUTES.COST_CENTERS],
    ['/app/structure/locations', STRUCTURE_ROUTES.LOCATIONS],
    ['/app/structure/hierarchy', STRUCTURE_ROUTES.HIERARCHY],
    ['/app/structure/chart', STRUCTURE_ROUTES.ORG_CHARTS],
    ['/app/structure/dashboard', STRUCTURE_ROUTES.DASHBOARD],
];

// Helper function
export const buildStructurePath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};

// Admin structure routes
export const STRUCTURE_ADMIN_ROUTES = {
    OVERVIEW: '/structure/admin/overview',
    ORG_UNITS: '/structure/admin/org-units',
    DIVISIONS: '/structure/admin/divisions',
    DEPARTMENTS: '/structure/admin/departments',
    SECTIONS: '/structure/admin/sections',
    UNITS: '/structure/admin/units',
    POSITIONS: '/structure/admin/positions',
    EMPLOYMENTS: '/structure/admin/employments',
    REPORTING_LINES: '/structure/admin/reporting-lines',
    COST_CENTERS: '/structure/admin/cost-centers',
    LOCATIONS: '/structure/admin/locations',
    HIERARCHY: '/structure/admin/hierarchy',
    SETTINGS: '/structure/admin/settings',
};

// Navigation structure
export const STRUCTURE_NAV_ITEMS = {
    ORGANIZATION: {
        label: 'Organization',
        icon: 'Building2',
        children: [
            { label: 'Organizational Units', path: STRUCTURE_ROUTES.ORG_UNITS },
            { label: 'Divisions', path: STRUCTURE_ROUTES.DIVISIONS },
            { label: 'Departments', path: STRUCTURE_ROUTES.DEPARTMENTS },
            { label: 'Sections', path: STRUCTURE_ROUTES.SECTIONS },
            { label: 'Units', path: STRUCTURE_ROUTES.UNITS },
        ],
    },
    PERSONNEL: {
        label: 'Personnel',
        icon: 'Users',
        children: [
            { label: 'Positions', path: STRUCTURE_ROUTES.POSITIONS },
            { label: 'Employments', path: STRUCTURE_ROUTES.EMPLOYMENTS },
            { label: 'My Employment', path: STRUCTURE_ROUTES.MY_EMPLOYMENT },
        ],
    },
    REPORTING: {
        label: 'Reporting',
        icon: 'GitBranch',
        children: [
            { label: 'Reporting Lines', path: STRUCTURE_ROUTES.REPORTING_LINES },
            { label: 'My Chain', path: STRUCTURE_ROUTES.MY_CHAIN },
            { label: 'My Team', path: STRUCTURE_ROUTES.MY_TEAM },
            { label: 'Span of Control', path: STRUCTURE_ROUTES.ORGANIZATION_SPAN },
            { label: 'Interim Assignments', path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS },
        ],
    },
    RESOURCES: {
        label: 'Resources',
        icon: 'DollarSign',
        children: [
            { label: 'Cost Centers', path: STRUCTURE_ROUTES.COST_CENTERS },
            { label: 'Locations', path: STRUCTURE_ROUTES.LOCATIONS },
        ],
    },
    HIERARCHY: {
        label: 'Hierarchy',
        icon: 'Layers',
        children: [
            { label: 'Current Version', path: STRUCTURE_ROUTES.HIERARCHY_CURRENT },
            { label: 'History', path: STRUCTURE_ROUTES.HIERARCHY_HISTORY },
            { label: 'Capture Snapshot', path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE },
            { label: 'Validate', path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE },
        ],
    },
    VISUALIZATION: {
        label: 'Visualization',
        icon: 'BarChart',
        children: [
            { label: 'Org Chart', path: STRUCTURE_ROUTES.ORG_CHARTS },
            { label: 'Org Tree', path: STRUCTURE_ROUTES.ORG_CHART_TREE },
            { label: 'Dashboard', path: STRUCTURE_ROUTES.DASHBOARD },
        ],
    },
};

export default {
    STRUCTURE_ROUTES,
    STRUCTURE_MINIMAL_CHROME_PATHS,
    STRUCTURE_ADMIN_ROUTES,
    STRUCTURE_NAV_ITEMS,
    LEGACY_STRUCTURE_REDIRECTS,
    buildStructurePath,
};