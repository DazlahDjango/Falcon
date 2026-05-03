import React from "react";
import { ROUTES } from "../config/constants";
import { Routes } from "react-router-dom";
// Lazy load components (adjust paths to match your actual file locations)
const UserList = React.lazy(() => import('../components/accounts/users/UserList'));
const UserDetail = React.lazy(() => import('../components/accounts/users/UserDetail'));
const UserCreate = React.lazy(() => import('../components/accounts/users/UserCreate'));
const UserEdit = React.lazy(() => import('../components/accounts/users/UserEdit'));
const UserProfile = React.lazy(() => import('../components/accounts/users/UserProfile'));
const TeamView = React.lazy(() => import('../components/accounts/team/TeamView'));
const RoleList = React.lazy(() => import('../components/accounts/roles/RoleList'));
const RoleDetail = React.lazy(() => import('../components/accounts/roles/RoleDetail'));
const RoleCreate = React.lazy(() => import('../components/accounts/roles/RoleCreate'));
const RoleEdit = React.lazy(() => import('../components/accounts/roles/RoleEdit'));
const SessionList = React.lazy(() => import('../components/accounts/sessions/SessionList'));
const Settings = React.lazy(() => import('../components/accounts/settings/Settings'));
const AuditLogs = React.lazy(() => import('../components/accounts/audit/AuditLogs'));
const Security = React.lazy(() => import('../components/accounts/settings/SecuritySettings'));
const Notifications = React.lazy(() => import('../components/accounts/settings/NotificationSettings'));
// Admin components (if implemented)
const Dashboard = React.lazy(() => import('../components/accounts/dashboard/Dashboard'))
const AdminDashboard = React.lazy(() => import('../components/accounts/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('../components/accounts/admin/AdminUsers'));
const AdminTenants = React.lazy(() => import('../components/accounts/admin/AdminTenants'));
const AdminSystem = React.lazy(() => import('../components/accounts/admin/AdminSystem'));
const accountsRoutes = [
    // Dashboards
    { path: ROUTES.DASHBOARD, element: <Dashboard />},
    // User Management
    { path: ROUTES.USERS, element: <UserList /> },
    { path: ROUTES.USER_DETAIL, element: <UserDetail /> },
    { path: ROUTES.USER_CREATE, element: <UserCreate /> },
    { path: ROUTES.USER_EDIT, element: <UserEdit /> },
    { path: ROUTES.USER_PROFILE, element: <UserProfile /> },
    // Team
    { path: ROUTES.TEAM, element: <TeamView /> },
    // Roles & Permissions
    { path: ROUTES.ROLES, element: <RoleList /> },
    { path: ROUTES.ROLE_DETAIL, element: <RoleDetail /> },
    { path: ROUTES.ROLE_CREATE, element: <RoleCreate /> },
    { path: ROUTES.ROLE_EDIT, element: <RoleEdit /> },
    // Sessions
    { path: ROUTES.SESSIONS, element: <SessionList /> },
    // Settings
    { path: ROUTES.SETTINGS, element: <Settings /> },
    { path: ROUTES.SECURITY, element: <Security />},
    { path: ROUTES.NOTIFICATIONS, element: <Notifications />},
    // Audit
    { path: ROUTES.AUDIT, element: <AuditLogs /> },
    // Admin (if implemented)
    { path: ROUTES.ADMIN, element: <AdminDashboard /> },
    { path: ROUTES.ADMIN_USERS, element: <AdminUsers /> },
    { path: ROUTES.ADMIN_USER_CREATE, element: <UserCreate /> },
    { path: ROUTES.ADMIN_USER_EDIT, element: <UserEdit /> },
    { path: ROUTES.ADMIN_TENANTS, element: <AdminTenants /> },
    { path: ROUTES.ADMIN_SYSTEM, element: <AdminSystem /> },
];
export default accountsRoutes;