// Route paths for consistent navigation
export const ROUTES = {
    // Auth routes
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    // KPI routes
    KPI: {
        ROOT: '/kpi',
        DASHBOARD: '/kpi/dashboard',
        MANAGEMENT: '/kpi/management',
        CREATE: '/kpi/create',
        DETAIL: (id) => `/kpi/detail/${id}`,
        EDIT: (id) => `/kpi/edit/${id}`,
        WEIGHTS: (id) => `/kpi/weights/${id}`,
        TARGETS: '/kpi/targets',
        TRACKING: '/kpi/tracking',
        VALIDATION: '/kpi/validation',
        ADJUSTMENTS: '/kpi/adjustments',
        REPORTS: '/kpi/reports',
    },
    // Error routes
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '*',
};
// Role-based route access
export const ROLE_ROUTES = {
    ADMIN: [
        ROUTES.KPI.MANAGEMENT,
        ROUTES.KPI.CREATE,
        ROUTES.KPI.EDIT(),
        ROUTES.KPI.WEIGHTS(),
        ROUTES.KPI.TARGETS,
        ROUTES.KPI.VALIDATION,
        ROUTES.KPI.ADJUSTMENTS,
        ROUTES.KPI.REPORTS,
    ],
    DASHBOARD_CHAMPION: [
        ROUTES.KPI.MANAGEMENT,
        ROUTES.KPI.CREATE,
        ROUTES.KPI.EDIT(),
        ROUTES.KPI.WEIGHTS(),
        ROUTES.KPI.TARGETS,
        ROUTES.KPI.VALIDATION,
        ROUTES.KPI.ADJUSTMENTS,
        ROUTES.KPI.REPORTS,
    ],
    MANAGER: [
        ROUTES.KPI.DASHBOARD,
        ROUTES.KPI.TRACKING,
        ROUTES.KPI.VALIDATION,
        ROUTES.KPI.ADJUSTMENTS,
        ROUTES.KPI.REPORTS,
    ],
    EMPLOYEE: [
        ROUTES.KPI.DASHBOARD,
        ROUTES.KPI.TRACKING,
        ROUTES.KPI.ADJUSTMENTS,
    ],
    AUDITOR: [
        ROUTES.KPI.REPORTS,
    ],
};
// Navigation menu items
export const NAVIGATION_ITEMS = [
    {
        path: ROUTES.KPI.DASHBOARD,
        label: 'Dashboard',
        icon: '📊',
        roles: ['EMPLOYEE', 'MANAGER', 'EXECUTIVE', 'DASHBOARD_CHAMPION', 'ADMIN', 'AUDITOR'],
    },
    {
        path: ROUTES.KPI.MANAGEMENT,
        label: 'KPI Management',
        icon: '📈',
        roles: ['ADMIN', 'DASHBOARD_CHAMPION'],
    },
    {
        path: ROUTES.KPI.TARGETS,
        label: 'Targets',
        icon: '🎯',
        roles: ['ADMIN', 'DASHBOARD_CHAMPION'],
    },
    {
        path: ROUTES.KPI.TRACKING,
        label: 'Performance Tracking',
        icon: '✏️',
        roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'DASHBOARD_CHAMPION'],
    },
    {
        path: ROUTES.KPI.VALIDATION,
        label: 'Validation',
        icon: '✓',
        roles: ['MANAGER', 'ADMIN', 'DASHBOARD_CHAMPION'],
    },
    {
        path: ROUTES.KPI.ADJUSTMENTS,
        label: 'Adjustments',
        icon: '↻',
        roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'DASHBOARD_CHAMPION'],
    },
    {
        path: ROUTES.KPI.REPORTS,
        label: 'Reports',
        icon: '📄',
        roles: ['MANAGER', 'EXECUTIVE', 'DASHBOARD_CHAMPION', 'ADMIN', 'AUDITOR'],
    },
];

// Breadcrumb mapping
export const BREADCRUMBS = {
    [ROUTES.KPI.DASHBOARD]: [{ label: 'Dashboard', path: ROUTES.KPI.DASHBOARD }],
    [ROUTES.KPI.MANAGEMENT]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Management', path: ROUTES.KPI.MANAGEMENT },
    ],
    [ROUTES.KPI.CREATE]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Management', path: ROUTES.KPI.MANAGEMENT },
        { label: 'Create', path: ROUTES.KPI.CREATE },
    ],
    [ROUTES.KPI.DETAIL()]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Management', path: ROUTES.KPI.MANAGEMENT },
        { label: 'Detail', path: '' },
    ],
    [ROUTES.KPI.TARGETS]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Targets', path: ROUTES.KPI.TARGETS },
    ],
    [ROUTES.KPI.TRACKING]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Performance Tracking', path: ROUTES.KPI.TRACKING },
    ],
    [ROUTES.KPI.VALIDATION]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Validation', path: ROUTES.KPI.VALIDATION },
    ],
    [ROUTES.KPI.REPORTS]: [
        { label: 'KPI', path: ROUTES.KPI.DASHBOARD },
        { label: 'Reports', path: ROUTES.KPI.REPORTS },
    ],
};

export default {
    ROUTES,
    ROLE_ROUTES,
    NAVIGATION_ITEMS,
    BREADCRUMBS,
};