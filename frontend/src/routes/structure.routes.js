// src/routes/structure.routes.js

import { lazy } from 'react';

// Lazy load pages for code splitting
const DepartmentList = lazy(() => import('../pages/structure/DepartmentList'));
const DepartmentDetail = lazy(() => import('../pages/structure/DepartmentDetail'));
const DepartmentForm = lazy(() => import('../pages/structure/DepartmentForm'));
const DepartmentTree = lazy(() => import('../pages/structure/DepartmentTree'));

const TeamList = lazy(() => import('../pages/structure/TeamList'));
const TeamDetail = lazy(() => import('../pages/structure/TeamDetail'));
const TeamForm = lazy(() => import('../pages/structure/TeamForm'));
const TeamHierarchy = lazy(() => import('../pages/structure/TeamHierarchy'));

const PositionList = lazy(() => import('../pages/structure/PositionList'));
const PositionDetail = lazy(() => import('../pages/structure/PositionDetail'));
const PositionForm = lazy(() => import('../pages/structure/PositionForm'));

const EmploymentList = lazy(() => import('../pages/structure/EmploymentList'));
const EmploymentDetail = lazy(() => import('../pages/structure/EmploymentDetail'));
const EmploymentForm = lazy(() => import('../pages/structure/EmploymentForm'));
const EmploymentTransfer = lazy(() => import('../pages/structure/EmploymentTransfer'));

const ReportingLineList = lazy(() => import('../pages/structure/ReportingLineList'));
const ReportingLineForm = lazy(() => import('../pages/structure/ReportingLineForm'));

const OrganizationChart = lazy(() => import('../pages/structure/OrganizationChart'));
const CostCenterList = lazy(() => import('../pages/structure/CostCenterList'));
const CostCenterForm = lazy(() => import('../pages/structure/CostCenterForm'));
const LocationList = lazy(() => import('../pages/structure/LocationList'));
const LocationForm = lazy(() => import('../pages/structure/LocationForm'));

const HierarchyVersionList = lazy(() => import('../pages/structure/HierarchyVersionList'));
const HierarchyCompare = lazy(() => import('../pages/structure/HierarchyCompare'));
const StructureDashboard = lazy(() => import('../pages/structure/StructureDashboard'));

// Role-based permission checks
const hasStructureAccess = (userRole) => {
  const allowedRoles = ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor', 'staff'];
  return allowedRoles.includes(userRole);
};

const hasAdminAccess = (userRole) => {
  const allowedRoles = ['super_admin', 'client_admin', 'executive'];
  return allowedRoles.includes(userRole);
};

const hasWriteAccess = (userRole) => {
  const allowedRoles = ['super_admin', 'client_admin', 'executive'];
  return allowedRoles.includes(userRole);
};

const hasDeleteAccess = (userRole) => {
  const allowedRoles = ['super_admin', 'client_admin'];
  return allowedRoles.includes(userRole);
};

// Department routes
export const departmentRoutes = [
  {
    path: 'departments',
    element: DepartmentList,
    permissions: hasStructureAccess,
    title: 'Departments',
    breadcrumb: 'Departments',
  },
  {
    path: 'departments/tree',
    element: DepartmentTree,
    permissions: hasStructureAccess,
    title: 'Department Tree',
    breadcrumb: 'Department Tree',
  },
  {
    path: 'departments/create',
    element: DepartmentForm,
    permissions: hasWriteAccess,
    title: 'Create Department',
    breadcrumb: 'Create',
  },
  {
    path: 'departments/:id',
    element: DepartmentDetail,
    permissions: hasStructureAccess,
    title: 'Department Details',
    breadcrumb: 'Details',
  },
  {
    path: 'departments/:id/edit',
    element: DepartmentForm,
    permissions: hasWriteAccess,
    title: 'Edit Department',
    breadcrumb: 'Edit',
  },
];

// Team routes
export const teamRoutes = [
  {
    path: 'teams',
    element: TeamList,
    permissions: hasStructureAccess,
    title: 'Teams',
    breadcrumb: 'Teams',
  },
  {
    path: 'teams/hierarchy',
    element: TeamHierarchy,
    permissions: hasStructureAccess,
    title: 'Team Hierarchy',
    breadcrumb: 'Team Hierarchy',
  },
  {
    path: 'teams/create',
    element: TeamForm,
    permissions: hasWriteAccess,
    title: 'Create Team',
    breadcrumb: 'Create',
  },
  {
    path: 'teams/:id',
    element: TeamDetail,
    permissions: hasStructureAccess,
    title: 'Team Details',
    breadcrumb: 'Details',
  },
  {
    path: 'teams/:id/edit',
    element: TeamForm,
    permissions: hasWriteAccess,
    title: 'Edit Team',
    breadcrumb: 'Edit',
  },
];

// Position routes
export const positionRoutes = [
  {
    path: 'positions',
    element: PositionList,
    permissions: hasStructureAccess,
    title: 'Positions',
    breadcrumb: 'Positions',
  },
  {
    path: 'positions/create',
    element: PositionForm,
    permissions: hasWriteAccess,
    title: 'Create Position',
    breadcrumb: 'Create',
  },
  {
    path: 'positions/:id',
    element: PositionDetail,
    permissions: hasStructureAccess,
    title: 'Position Details',
    breadcrumb: 'Details',
  },
  {
    path: 'positions/:id/edit',
    element: PositionForm,
    permissions: hasWriteAccess,
    title: 'Edit Position',
    breadcrumb: 'Edit',
  },
];

// Employment routes
export const employmentRoutes = [
  {
    path: 'employments',
    element: EmploymentList,
    permissions: hasStructureAccess,
    title: 'Employments',
    breadcrumb: 'Employments',
  },
  {
    path: 'employments/create',
    element: EmploymentForm,
    permissions: hasWriteAccess,
    title: 'Create Employment',
    breadcrumb: 'Create',
  },
  {
    path: 'employments/:id',
    element: EmploymentDetail,
    permissions: hasStructureAccess,
    title: 'Employment Details',
    breadcrumb: 'Details',
  },
  {
    path: 'employments/:id/edit',
    element: EmploymentForm,
    permissions: hasWriteAccess,
    title: 'Edit Employment',
    breadcrumb: 'Edit',
  },
  {
    path: 'employments/transfer/:userId?',
    element: EmploymentTransfer,
    permissions: hasWriteAccess,
    title: 'Transfer Employee',
    breadcrumb: 'Transfer',
  },
];

// Reporting Line routes
export const reportingRoutes = [
  {
    path: 'reporting-lines',
    element: ReportingLineList,
    permissions: hasStructureAccess,
    title: 'Reporting Lines',
    breadcrumb: 'Reporting Lines',
  },
  {
    path: 'reporting-lines/create',
    element: ReportingLineForm,
    permissions: hasWriteAccess,
    title: 'Create Reporting Line',
    breadcrumb: 'Create',
  },
  {
    path: 'reporting-lines/:id/edit',
    element: ReportingLineForm,
    permissions: hasWriteAccess,
    title: 'Edit Reporting Line',
    breadcrumb: 'Edit',
  },
];

// Cost Center routes
export const costCenterRoutes = [
  {
    path: 'cost-centers',
    element: CostCenterList,
    permissions: hasStructureAccess,
    title: 'Cost Centers',
    breadcrumb: 'Cost Centers',
  },
  {
    path: 'cost-centers/create',
    element: CostCenterForm,
    permissions: hasWriteAccess,
    title: 'Create Cost Center',
    breadcrumb: 'Create',
  },
  {
    path: 'cost-centers/:id/edit',
    element: CostCenterForm,
    permissions: hasWriteAccess,
    title: 'Edit Cost Center',
    breadcrumb: 'Edit',
  },
];

// Location routes
export const locationRoutes = [
  {
    path: 'locations',
    element: LocationList,
    permissions: hasStructureAccess,
    title: 'Locations',
    breadcrumb: 'Locations',
  },
  {
    path: 'locations/create',
    element: LocationForm,
    permissions: hasWriteAccess,
    title: 'Create Location',
    breadcrumb: 'Create',
  },
  {
    path: 'locations/:id/edit',
    element: LocationForm,
    permissions: hasWriteAccess,
    title: 'Edit Location',
    breadcrumb: 'Edit',
  },
];

// Hierarchy routes
export const hierarchyRoutes = [
  {
    path: 'hierarchy/versions',
    element: HierarchyVersionList,
    permissions: hasStructureAccess,
    title: 'Hierarchy Versions',
    breadcrumb: 'Versions',
  },
  {
    path: 'hierarchy/compare/:versionA/:versionB',
    element: HierarchyCompare,
    permissions: hasStructureAccess,
    title: 'Compare Versions',
    breadcrumb: 'Compare',
  },
];

// Visualization routes
export const visualizationRoutes = [
  {
    path: 'org-chart',
    element: OrganizationChart,
    permissions: hasStructureAccess,
    title: 'Organization Chart',
    breadcrumb: 'Org Chart',
  },
  {
    path: 'dashboard',
    element: StructureDashboard,
    permissions: hasStructureAccess,
    title: 'Structure Dashboard',
    breadcrumb: 'Dashboard',
  },
];

// All structure routes combined
export const structureRoutes = [
  {
    path: 'structure',
    element: null, // Layout wrapper
    children: [
      // Dashboard
      { path: 'dashboard', element: StructureDashboard, permissions: hasStructureAccess, title: 'Dashboard' },
      
      // Departments
      ...departmentRoutes,
      
      // Teams
      ...teamRoutes,
      
      // Positions
      ...positionRoutes,
      
      // Employments
      ...employmentRoutes,
      
      // Reporting Lines
      ...reportingRoutes,
      
      // Cost Centers
      ...costCenterRoutes,
      
      // Locations
      ...locationRoutes,
      
      // Hierarchy
      ...hierarchyRoutes,
      
      // Visualizations
      ...visualizationRoutes,
      
      // Default redirect
      { path: '', redirect: 'dashboard' },
    ],
  },
];

// Generate flat routes for React Router
export const getStructureFlatRoutes = () => {
  const flattenRoutes = (routes, parentPath = '') => {
    let flat = [];
    for (const route of routes) {
      const fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');
      
      if (route.element) {
        flat.push({
          path: fullPath,
          element: route.element,
          permissions: route.permissions,
          title: route.title,
          breadcrumb: route.breadcrumb,
          requiresAuth: true,
        });
      }
      
      if (route.children) {
        flat = [...flat, ...flattenRoutes(route.children, fullPath)];
      }
    }
    return flat;
  };
  
  return flattenRoutes(structureRoutes, '/app');
};

// Export named routes for navigation
export const STRUCTURE_ROUTES = {
  // Dashboard
  DASHBOARD: '/app/structure/dashboard',
  
  // Departments
  DEPARTMENTS: '/app/structure/departments',
  DEPARTMENT_TREE: '/app/structure/departments/tree',
  DEPARTMENT_CREATE: '/app/structure/departments/create',
  DEPARTMENT_DETAIL: (id) => `/app/structure/departments/${id}`,
  DEPARTMENT_EDIT: (id) => `/app/structure/departments/${id}/edit`,
  
  // Teams
  TEAMS: '/app/structure/teams',
  TEAM_HIERARCHY: '/app/structure/teams/hierarchy',
  TEAM_CREATE: '/app/structure/teams/create',
  TEAM_DETAIL: (id) => `/app/structure/teams/${id}`,
  TEAM_EDIT: (id) => `/app/structure/teams/${id}/edit`,
  
  // Positions
  POSITIONS: '/app/structure/positions',
  POSITION_CREATE: '/app/structure/positions/create',
  POSITION_DETAIL: (id) => `/app/structure/positions/${id}`,
  POSITION_EDIT: (id) => `/app/structure/positions/${id}/edit`,
  
  // Employments
  EMPLOYMENTS: '/app/structure/employments',
  EMPLOYMENT_CREATE: '/app/structure/employments/create',
  EMPLOYMENT_DETAIL: (id) => `/app/structure/employments/${id}`,
  EMPLOYMENT_EDIT: (id) => `/app/structure/employments/${id}/edit`,
  EMPLOYMENT_TRANSFER: (userId) => `/app/structure/employments/transfer/${userId || ''}`,
  
  // Reporting Lines
  REPORTING_LINES: '/app/structure/reporting-lines',
  REPORTING_LINE_CREATE: '/app/structure/reporting-lines/create',
  REPORTING_LINE_EDIT: (id) => `/app/structure/reporting-lines/${id}/edit`,
  
  // Cost Centers
  COST_CENTERS: '/app/structure/cost-centers',
  COST_CENTER_CREATE: '/app/structure/cost-centers/create',
  COST_CENTER_EDIT: (id) => `/app/structure/cost-centers/${id}/edit`,
  
  // Locations
  LOCATIONS: '/app/structure/locations',
  LOCATION_CREATE: '/app/structure/locations/create',
  LOCATION_EDIT: (id) => `/app/structure/locations/${id}/edit`,
  
  // Hierarchy
  HIERARCHY_VERSIONS: '/app/structure/hierarchy/versions',
  HIERARCHY_COMPARE: (versionA, versionB) => `/app/structure/hierarchy/compare/${versionA}/${versionB}`,
  
  // Visualizations
  ORG_CHART: '/app/structure/org-chart',
  
  // My Information (dynamic)
  MY_EMPLOYMENT: '/app/structure/me',
  MY_TEAM: '/app/structure/my-team',
  MY_CHAIN: '/app/structure/my-chain',
};

// Breadcrumb mapping for structure pages
export const STRUCTURE_BREADCRUMBS = {
  [STRUCTURE_ROUTES.DASHBOARD]: [{ title: 'Home', path: '/app' }, { title: 'Structure Dashboard' }],
  [STRUCTURE_ROUTES.DEPARTMENTS]: [{ title: 'Home', path: '/app' }, { title: 'Departments' }],
  [STRUCTURE_ROUTES.DEPARTMENT_TREE]: [{ title: 'Home', path: '/app' }, { title: 'Departments', path: STRUCTURE_ROUTES.DEPARTMENTS }, { title: 'Tree View' }],
  [STRUCTURE_ROUTES.DEPARTMENT_CREATE]: [{ title: 'Home', path: '/app' }, { title: 'Departments', path: STRUCTURE_ROUTES.DEPARTMENTS }, { title: 'Create' }],
  [STRUCTURE_ROUTES.TEAMS]: [{ title: 'Home', path: '/app' }, { title: 'Teams' }],
  [STRUCTURE_ROUTES.POSITIONS]: [{ title: 'Home', path: '/app' }, { title: 'Positions' }],
  [STRUCTURE_ROUTES.EMPLOYMENTS]: [{ title: 'Home', path: '/app' }, { title: 'Employments' }],
  [STRUCTURE_ROUTES.ORG_CHART]: [{ title: 'Home', path: '/app' }, { title: 'Organization Chart' }],
};

export default structureRoutes;