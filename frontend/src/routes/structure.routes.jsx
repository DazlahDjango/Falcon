import React from "react";

// Lazy load pages for code splitting
const StructureDashboard = React.lazy(() => import('../pages/structure/StructureDashboard'));
const DepartmentList = React.lazy(() => import('../pages/structure/DepartmentList'));
const DepartmentDetail = React.lazy(() => import('../pages/structure/DepartmentDetail'));
const DepartmentForm = React.lazy(() => import('../pages/structure/DepartmentForm'));
const DepartmentTree = React.lazy(() => import('../pages/structure/DepartmentTree'));

const TeamList = React.lazy(() => import('../pages/structure/TeamList'));
const TeamDetail = React.lazy(() => import('../pages/structure/TeamDetail'));
const TeamForm = React.lazy(() => import('../pages/structure/TeamForm'));
const TeamHierarchy = React.lazy(() => import('../pages/structure/TeamHierarchy'));

const PositionList = React.lazy(() => import('../pages/structure/PositionList'));
const PositionDetail = React.lazy(() => import('../pages/structure/PositionDetail'));
const PositionForm = React.lazy(() => import('../pages/structure/PositionForm'));

const EmploymentList = React.lazy(() => import('../pages/structure/EmploymentList'));
const EmploymentDetail = React.lazy(() => import('../pages/structure/EmploymentDetail'));
const EmploymentForm = React.lazy(() => import('../pages/structure/EmploymentForm'));
const EmploymentTransfer = React.lazy(() => import('../pages/structure/EmploymentTransfer'));

const ReportingLineList = React.lazy(() => import('../pages/structure/ReportingLineList'));
const ReportingLineForm = React.lazy(() => import('../pages/structure/ReportingLineForm'));

const OrganizationChart = React.lazy(() => import('../pages/structure/OrganizationChart'));
const CostCenterList = React.lazy(() => import('../pages/structure/CostCenterList'));
const CostCenterForm = React.lazy(() => import('../pages/structure/CostCenterForm'));
const LocationList = React.lazy(() => import('../pages/structure/LocationList'));
const LocationForm = React.lazy(() => import('../pages/structure/LocationForm'));

const HierarchyVersionList = React.lazy(() => import('../pages/structure/HierarchyVersionList'));
const HierarchyCompare = React.lazy(() => import('../pages/structure/HierarchyCompare'));

// ============================================
// EXPORT STRUCTURE_ROUTES CONSTANTS
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

// Simple flat routes array
const structureRoutes = [
    // Dashboard
    { path: STRUCTURE_ROUTES.DASHBOARD, element: <StructureDashboard /> },
    
    // Departments
    { path: STRUCTURE_ROUTES.DEPARTMENTS, element: <DepartmentList /> },
    { path: STRUCTURE_ROUTES.DEPARTMENT_TREE, element: <DepartmentTree /> },
    { path: STRUCTURE_ROUTES.DEPARTMENT_CREATE, element: <DepartmentForm /> },
    { path: STRUCTURE_ROUTES.DEPARTMENT_DETAIL(), element: <DepartmentDetail /> },
    { path: STRUCTURE_ROUTES.DEPARTMENT_EDIT(), element: <DepartmentForm /> },
    
    // Teams
    { path: STRUCTURE_ROUTES.TEAMS, element: <TeamList /> },
    { path: STRUCTURE_ROUTES.TEAM_HIERARCHY, element: <TeamHierarchy /> },
    { path: STRUCTURE_ROUTES.TEAM_CREATE, element: <TeamForm /> },
    { path: STRUCTURE_ROUTES.TEAM_DETAIL(), element: <TeamDetail /> },
    { path: STRUCTURE_ROUTES.TEAM_EDIT(), element: <TeamForm /> },
    
    // Positions
    { path: STRUCTURE_ROUTES.POSITIONS, element: <PositionList /> },
    { path: STRUCTURE_ROUTES.POSITION_CREATE, element: <PositionForm /> },
    { path: STRUCTURE_ROUTES.POSITION_DETAIL(), element: <PositionDetail /> },
    { path: STRUCTURE_ROUTES.POSITION_EDIT(), element: <PositionForm /> },
    
    // Employments
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, element: <EmploymentList /> },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_CREATE, element: <EmploymentForm /> },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(), element: <EmploymentDetail /> },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_EDIT(), element: <EmploymentForm /> },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER(), element: <EmploymentTransfer /> },
    
    // Reporting Lines
    { path: STRUCTURE_ROUTES.REPORTING_LINES, element: <ReportingLineList /> },
    { path: STRUCTURE_ROUTES.REPORTING_LINE_CREATE, element: <ReportingLineForm /> },
    { path: STRUCTURE_ROUTES.REPORTING_LINE_EDIT(), element: <ReportingLineForm /> },
    
    // Cost Centers
    { path: STRUCTURE_ROUTES.COST_CENTERS, element: <CostCenterList /> },
    { path: STRUCTURE_ROUTES.COST_CENTER_CREATE, element: <CostCenterForm /> },
    { path: STRUCTURE_ROUTES.COST_CENTER_EDIT(), element: <CostCenterForm /> },
    
    // Locations
    { path: STRUCTURE_ROUTES.LOCATIONS, element: <LocationList /> },
    { path: STRUCTURE_ROUTES.LOCATION_CREATE, element: <LocationForm /> },
    { path: STRUCTURE_ROUTES.LOCATION_EDIT(), element: <LocationForm /> },
    
    // Hierarchy
    { path: STRUCTURE_ROUTES.HIERARCHY_VERSIONS, element: <HierarchyVersionList /> },
    { path: STRUCTURE_ROUTES.HIERARCHY_COMPARE(), element: <HierarchyCompare /> },
    
    // Visualizations
    { path: STRUCTURE_ROUTES.ORG_CHART, element: <OrganizationChart /> },
    
    // My Information
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, element: <EmploymentDetail /> },
    { path: STRUCTURE_ROUTES.MY_TEAM, element: <TeamList /> },
    { path: STRUCTURE_ROUTES.MY_CHAIN, element: <ReportingLineList /> },
];

// Helper function to build dynamic paths (for use in components)
export const buildStructurePath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

export default structureRoutes;