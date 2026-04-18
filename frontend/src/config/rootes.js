import { ROUTES as ROUTE_PATHS } from './constants';

// Route Configuration with metadata
export const routes = [
    // Public Routes
    {
        path: ROUTE_PATHS.HOME,
        name: 'Home',
        component: 'Home',
        layout: 'public',
        exact: true,
        meta: {
            title: 'Home',
            description: 'Welcome to Falcon PMS',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.ABOUT,
        name: 'About',
        component: 'About',
        layout: 'public',
        exact: true,
        meta: {
            title: 'About',
            description: 'About Falcon PMS',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.HELP,
        name: 'Help',
        component: 'Help',
        layout: 'public',
        exact: true,
        meta: {
            title: 'Help & Support',
            description: 'Get help with Falcon PMS',
            requiresAuth: false
        }
    },

    // Auth Routes
    {
        path: ROUTE_PATHS.LOGIN,
        name: 'Login',
        component: 'Login',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Login',
            description: 'Sign in to your account',
            requiresAuth: false,
            guestOnly: true
        }
    },
    {
        path: ROUTE_PATHS.REGISTER,
        name: 'Register',
        component: 'Register',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Register',
            description: 'Create a new account',
            requiresAuth: false,
            guestOnly: true
        }
    },
    {
        path: ROUTE_PATHS.MFA_VERIFY,
        name: 'MFA Verify',
        component: 'MFAVerify',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Two-Factor Authentication',
            description: 'Verify your identity',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.MFA_SETUP,
        name: 'MFA Setup',
        component: 'MFASetup',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Setup Two-Factor Authentication',
            description: 'Secure your account',
            requiresAuth: true
        }
    },
    {
        path: ROUTE_PATHS.FORGOT_PASSWORD,
        name: 'Forgot Password',
        component: 'ForgotPassword',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Reset Password',
            description: 'Reset your password',
            requiresAuth: false,
            guestOnly: true
        }
    },
    {
        path: ROUTE_PATHS.RESET_PASSWORD,
        name: 'Reset Password',
        component: 'ResetPassword',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Reset Password',
            description: 'Create a new password',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.VERIFY_EMAIL,
        name: 'Verify Email',
        component: 'VerifyEmail',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Verify Email',
            description: 'Verify your email address',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.ACCEPT_INVITATION,
        name: 'Accept Invitation',
        component: 'AcceptInvitation',
        layout: 'auth',
        exact: true,
        meta: {
            title: 'Accept Invitation',
            description: 'Join your organization',
            requiresAuth: false
        }
    },

    // Protected Routes
    {
        path: ROUTE_PATHS.DASHBOARD,
        name: 'Dashboard',
        component: 'Dashboard',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Dashboard',
            description: 'Your performance dashboard',
            requiresAuth: true,
            roles: ['all']
        }
    },
    {
        path: ROUTE_PATHS.USERS,
        name: 'Users',
        component: 'UserList',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Users',
            description: 'Manage users',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.USER_DETAIL,
        name: 'User Details',
        component: 'UserDetail',
        layout: 'main',
        exact: true,
        meta: {
            title: 'User Details',
            description: 'View user profile',
            requiresAuth: true
        }
    },
    {
        path: ROUTE_PATHS.USER_CREATE,
        name: 'Create User',
        component: 'UserCreate',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Create User',
            description: 'Add new user',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.USER_EDIT,
        name: 'Edit User',
        component: 'UserEdit',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Edit User',
            description: 'Update user profile',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.USER_PROFILE,
        name: 'My Profile',
        component: 'UserProfile',
        layout: 'main',
        exact: true,
        meta: {
            title: 'My Profile',
            description: 'View and edit your profile',
            requiresAuth: true
        }
    },
    {
        path: ROUTE_PATHS.TEAM,
        name: 'Team',
        component: 'TeamView',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Team',
            description: 'Manage your team',
            requiresAuth: true,
            roles: ['super_admin', 'client_admin', 'executive', 'supervisor']
        }
    },
    {
        path: ROUTE_PATHS.ROLES,
        name: 'Roles',
        component: 'RoleList',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Roles',
            description: 'Manage roles and permissions',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ROLE_DETAIL,
        name: 'Role Details',
        component: 'RoleDetail',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Role Details',
            description: 'View role details',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ROLE_CREATE,
        name: 'Create Role',
        component: 'RoleCreate',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Create Role',
            description: 'Add new role',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ROLE_EDIT,
        name: 'Edit Role',
        component: 'RoleEdit',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Edit Role',
            description: 'Update role permissions',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.SESSIONS,
        name: 'Sessions',
        component: 'SessionList',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Active Sessions',
            description: 'Manage your active sessions',
            requiresAuth: true
        }
    },
    {
        path: ROUTE_PATHS.SETTINGS,
        name: 'Settings',
        component: 'Settings',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Settings',
            description: 'Configure your preferences',
            requiresAuth: true
        }
    },
    {
        path: ROUTE_PATHS.AUDIT,
        name: 'Audit Logs',
        component: 'AuditLogs',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Audit Logs',
            description: 'View system audit logs',
            requiresAuth: true,
            roles: ['executive', 'client_admin', 'super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ADMIN,
        name: 'Admin',
        component: 'AdminDashboard',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Admin Dashboard',
            description: 'System administration',
            requiresAuth: true,
            roles: ['super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ADMIN_USERS,
        name: 'Admin Users',
        component: 'AdminUsers',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Manage Users',
            description: 'System-wide user management',
            requiresAuth: true,
            roles: ['super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ADMIN_TENANTS,
        name: 'Admin Tenants',
        component: 'AdminTenants',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Manage Tenants',
            description: 'System-wide tenant management',
            requiresAuth: true,
            roles: ['super_admin']
        }
    },
    {
        path: ROUTE_PATHS.ADMIN_SYSTEM,
        name: 'System Settings',
        component: 'AdminSystem',
        layout: 'main',
        exact: true,
        meta: {
            title: 'System Settings',
            description: 'Configure system settings',
            requiresAuth: true,
            roles: ['super_admin']
        }
    },

    // Organisation Routes
    {
        // path: ROUTE_PATHS.ORGANISATION_DASHBOARD,
        name: 'Organisation Dashboard',
        component: 'OrganisationDashboard',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Organisation Dashboard',
            description: 'Main landing page for organisation users',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin', 'executive', 'supervisor']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_SETTINGS,
        name: 'Organisation Settings',
        component: 'OrganisationSettings',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Organisation Settings',
            description: 'Configure organisation settings',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_DEPARTMENTS,
        name: 'Departments',
        component: 'OrganisationDepartments',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Departments',
            description: 'Manage organisation departments',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin', 'executive']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_TEAMS,
        name: 'Teams',
        component: 'OrganisationTeams',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Teams',
            description: 'Manage organisation teams',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin', 'executive', 'supervisor']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_USERS,
        name: 'Organisation Users',
        component: 'OrganisationUsers',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Organisation Users',
            description: 'Manage organisation users',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_BRANDING,
        name: 'Branding',
        component: 'OrganisationBranding',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Branding',
            description: 'Configure organisation branding',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_AUDIT,
        name: 'Organisation Audit',
        component: 'OrganisationAudit',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Audit Logs',
            description: 'Organisation activity and security logs',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin', 'executive']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_SUBSCRIPTION,
        name: 'Subscription',
        component: 'OrganisationSubscription',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Subscription',
            description: 'Manage organisation subscription and billing',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_POSITIONS,
        name: 'Positions',
        component: 'OrganisationPositions',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Positions',
            description: 'Manage organisation job positions',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_CONTACTS,
        name: 'Contacts',
        component: 'OrganisationContacts',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Contacts',
            description: 'Manage organisation contacts',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_DOMAINS,
        name: 'Domains',
        component: 'OrganisationDomains',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Domains',
            description: 'Manage organisation domains',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_IMPORT,
        name: 'Import Data',
        component: 'OrganisationImport',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Import Data',
            description: 'Import data to organisation',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_EXPORT,
        name: 'Export Data',
        component: 'OrganisationExport',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Export Data',
            description: 'Export organisation data',
            requiresAuth: true,
            roles: ['client_admin', 'super_admin']
        }
    },
    {
        // path: ROUTE_PATHS.ORGANISATION_PROFILE,
        name: 'Organisation Profile',
        component: 'OrganisationProfile',
        layout: 'main',
        exact: true,
        meta: {
            title: 'Organisation Profile',
            description: 'View organisation profile',
            requiresAuth: true,
            roles: ['all']
        }
    },

    // Error Routes
    {
        path: ROUTE_PATHS.UNAUTHORIZED,
        name: 'Unauthorized',
        component: 'Unauthorized',
        layout: 'public',
        exact: true,
        meta: {
            title: 'Access Denied',
            description: 'You don\'t have permission to access this page',
            requiresAuth: false
        }
    },
    {
        path: ROUTE_PATHS.SERVER_ERROR,
        name: 'Server Error',
        component: 'ServerError',
        layout: 'public',
        exact: true,
        meta: {
            title: 'Server Error',
            description: 'Something went wrong',
            requiresAuth: false
        }
    },
    {
        path: '*',
        name: 'Not Found',
        component: 'NotFound',
        layout: 'public',
        meta: {
            title: 'Page Not Found',
            description: 'The page you\'re looking for doesn\'t exist',
            requiresAuth: false
        }
    }
];

// Helper function to get route by name
export const getRouteByName = (name) => {
    return routes.find(route => route.name === name);
};

// Helper function to get route by path
export const getRouteByPath = (path) => {
    return routes.find(route => route.path === path);
};

// Helper function to check if route requires authentication
export const routeRequiresAuth = (path) => {
    const route = getRouteByPath(path);
    return route?.meta?.requiresAuth || false;
};

// Helper function to get route roles
export const getRouteRoles = (path) => {
    const route = getRouteByPath(path);
    return route?.meta?.roles || [];
};

// Helper function to generate breadcrumbs
export const generateBreadcrumbs = (pathname) => {
    const paths = pathname.split('/').filter(p => p);
    const breadcrumbs = [{ name: 'Home', path: '/', isActive: paths.length === 0 }];
    
    let currentPath = '';
    for (let i = 0; i < paths.length; i++) {
        currentPath += `/${paths[i]}`;
        const route = getRouteByPath(currentPath);
        if (route) {
            breadcrumbs.push({
                name: route.name,
                path: currentPath,
                isActive: i === paths.length - 1
            });
        }
    }
    
    return breadcrumbs;
};

// Navigation Helpers
// ===================
export const isRouteActive = (currentPath, routePath) => {
    if (routePath === ROUTES.HOME) {
        return currentPath === routePath;
    }
    return currentPath.startsWith(routePath);
};
export const getPageTitle = (pathname) => {
    const route = getRouteByPath(pathname);
    if (route?.meta?.title) {
        return `${route.meta.title} | Falcon PMS`;
    }
    return 'Falcon PMS';
};
export const getPageDescription = (pathname) => {
    const route = getRouteByPath(pathname);
    return route?.meta?.description || 'Performance Management System';
};
export const getNavigationItems = (userRole) => {
    const allItems = [
        {
            name: 'Dashboard',
            path: ROUTE_PATHS.DASHBOARD,
            icon: 'dashboard',
            roles: ['all']
        },
        {
            name: 'Users',
            path: ROUTE_PATHS.USERS,
            icon: 'users',
            roles: ['client_admin', 'super_admin']
        },
        {
            name: 'Team',
            path: ROUTE_PATHS.TEAM,
            icon: 'team',
            roles: ['super_admin', 'client_admin', 'executive', 'supervisor']
        },
        {
            name: 'Roles',
            path: ROUTE_PATHS.ROLES,
            icon: 'roles',
            roles: ['client_admin', 'super_admin']
        },
        {
            name: 'Sessions',
            path: ROUTE_PATHS.SESSIONS,
            icon: 'sessions',
            roles: ['all']
        },
        {
            name: 'Settings',
            path: ROUTE_PATHS.SETTINGS,
            icon: 'settings',
            roles: ['all']
        },
        {
            name: 'Audit Logs',
            path: ROUTE_PATHS.AUDIT,
            icon: 'audit',
            roles: ['executive', 'client_admin', 'super_admin']
        },
        {
            name: 'Admin',
            path: ROUTE_PATHS.ADMIN,
            icon: 'admin',
            roles: ['super_admin']
        },
        // Organisation Navigation Group
        {
            name: 'Organisation',
            icon: 'organisation',
            roles: ['client_admin', 'super_admin', 'executive', 'supervisor'],
            children: [
                {
                    name: 'Dashboard',
                    path: ROUTE_PATHS.ORGANISATION_DASHBOARD,
                    roles: ['all']
                },
                {
                    name: 'Departments',
                    path: ROUTE_PATHS.ORGANISATION_DEPARTMENTS,
                    roles: ['client_admin', 'super_admin', 'executive']
                },
                {
                    name: 'Teams',
                    path: ROUTE_PATHS.ORGANISATION_TEAMS,
                    roles: ['all']
                },
                {
                    name: 'Users',
                    path: ROUTE_PATHS.ORGANISATION_USERS,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Positions',
                    path: ROUTE_PATHS.ORGANISATION_POSITIONS,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Settings',
                    path: ROUTE_PATHS.ORGANISATION_SETTINGS,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Branding',
                    path: ROUTE_PATHS.ORGANISATION_BRANDING,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Audit Logs',
                    path: ROUTE_PATHS.ORGANISATION_AUDIT,
                    roles: ['client_admin', 'super_admin', 'executive']
                },
                {
                    name: 'Subscription',
                    path: ROUTE_PATHS.ORGANISATION_SUBSCRIPTION,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Contacts',
                    path: ROUTE_PATHS.ORGANISATION_CONTACTS,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Domains',
                    path: ROUTE_PATHS.ORGANISATION_DOMAINS,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Import Data',
                    path: ROUTE_PATHS.ORGANISATION_IMPORT,
                    roles: ['client_admin', 'super_admin']
                },
                {
                    name: 'Export Data',
                    path: ROUTE_PATHS.ORGANISATION_EXPORT,
                    roles: ['client_admin', 'super_admin']
                }
            ]
        }
    ];

    return allItems.filter(item => {
        if (item.roles.includes('all')) return true;
        return item.roles.includes(userRole);
    });
};

// Route Params Helpers
// =======================
export const buildPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

/**
 * Extract route params from URL
 * @param {string} path - Route pattern
 * @param {string} url - Actual URL
 * @returns {Object}
 */
export const extractParams = (path, url) => {
    const pathParts = path.split('/');
    const urlParts = url.split('/');
    const params = {};
    
    pathParts.forEach((part, index) => {
        if (part.startsWith(':')) {
            params[part.slice(1)] = urlParts[index];
        }
    });
    
    return params;
};

/**
 * Check if route matches current path
 * @param {string} routePath - Route pattern
 * @param {string} currentPath - Current pathname
 * @returns {boolean}
 */
export const routeMatches = (routePath, currentPath) => {
    const routeParts = routePath.split('/');
    const currentParts = currentPath.split('/');
    
    if (routeParts.length !== currentParts.length) return false;
    
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) continue;
        if (routeParts[i] !== currentParts[i]) return false;
    }
    
    return true;
};