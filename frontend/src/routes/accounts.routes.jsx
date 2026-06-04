import React from "react";
import { ROUTES } from "../config/constants";
import { Routes } from "react-router-dom";

// Lazy load components (adjust paths to match your actual file locations)
const UserList = React.lazy(() => import('../components/accounts/users/UserList'));
const UserDetail = React.lazy(() => import('../components/accounts/users/UserDetail'));
const UserCreate = React.lazy(() => import('../components/accounts/users/UserCreate'));
const UserEdit = React.lazy(() => import('../components/accounts/users/UserEdit'));
const UserProfile = React.lazy(() => import('../components/accounts/users/UserProfile'));
// const TeamView = React.lazy(() => import('../components/accounts/team/TeamView'));
const RoleList = React.lazy(() => import('../components/accounts/roles/RoleList'));
const RoleDetail = React.lazy(() => import('../components/accounts/roles/RoleDetail'));
const RoleCreate = React.lazy(() => import('../components/accounts/roles/RoleCreate'));
const RoleEdit = React.lazy(() => import('../components/accounts/roles/RoleEdit'));
const SessionList = React.lazy(() => import('../components/accounts/sessions/SessionList'));
const Settings = React.lazy(() => import('../components/accounts/settings/Settings'));
const AuditLogs = React.lazy(() => import('../components/accounts/audit/AuditLogs'));
const Security = React.lazy(() => import('../components/accounts/security/SecurityConsole'));
const PersonalSecurity = React.lazy(() => import('../components/accounts/settings/SecuritySettings'));
const Notifications = React.lazy(() => import('../components/accounts/settings/NotificationSettings'));

// ============ Profile Components ============
const ProfileView = React.lazy(() => import('../components/accounts/profile/ProfileView'));

// ============ Invitation Components ============
const InvitationTracker = React.lazy(() => import('../components/accounts/users/components/InvitationTracker'));

// ============ Report Components ============
const ReportGenerator = React.lazy(() => import('../components/accounts/ReportGenerator'));

// ============ MFA Components ============
// User MFA Components
const MFADashboard = React.lazy(() => import('../components/accounts/mfa/MFADashboard'));
const MFADeviceManager = React.lazy(() => import('../components/accounts/mfa/MFADeviceManager'));
const MFATotpSetup = React.lazy(() => import('../components/accounts/mfa/MFATotpSetup'));
const MFABackupCodes = React.lazy(() => import('../components/accounts/mfa/MFABackupCodes'));
const MFAActivityLog = React.lazy(() => import('../components/accounts/mfa/MFAActivityLog'));
const MFAStatusBadge = React.lazy(() => import('../components/accounts/mfa/MFAStatusBadge'));

// System Settings Components
const SystemSettings = React.lazy(() => import('../components/accounts/system/SystemSettings'));

// Policy Components
const TenantMFAPolicy = React.lazy(() => import('../components/accounts/policy/TenantMFAPolicy'));
const UserMFAPolicy = React.lazy(() => import('../components/accounts/policy/UserMFAPolicy'));
const UserMFAStatus = React.lazy(() => import('../components/accounts/policy/UserMFAStatus'));

// MFA Admin Components
const AdminMfaResetView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMfaResetView'));
const AdminMfaDeviceClearView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMfaDeviceClearView'));
const AdminMFAStatusView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMFAStatus'));
const StepUpVerifyView = React.lazy(() => import('../components/accounts/mfa-admin/StepUpVerifyView'));

// Admin components
const Dashboard = React.lazy(() => import('../components/accounts/dashboard/Dashboard'));
const AdminDashboard = React.lazy(() => import('../components/accounts/admin/AdminDashboard'));
const SuperAdminDashboardCustom = React.lazy(() => import('../pages/dashboard/SuperAdminDashboard/SuperAdminDashboardCustom'));
const AdminUsers = React.lazy(() => import('../components/accounts/admin/AdminUsers'));
const AdminTenants = React.lazy(() => import('../components/accounts/admin/AdminTenants'));
const AdminSystem = React.lazy(() => import('../components/accounts/admin/AdminSystem'));

const accountsRoutes = [
    // ============ Dashboards ============
    { path: ROUTES.DASHBOARD, element: <Dashboard /> },

    // ============ User Management ============
    { path: ROUTES.USERS, element: <UserList /> },
    { path: ROUTES.USER_DETAIL, element: <UserDetail /> },
    { path: ROUTES.USER_CREATE, element: <UserCreate /> },
    { path: ROUTES.USER_EDIT, element: <UserEdit /> },
    { path: ROUTES.USER_PROFILE, element: <UserProfile /> },

    // ============ Profile ============
    { path: '/profile', element: <ProfileView /> },
    { path: '/settings/profile', element: <ProfileView /> },
    { path: '/me', element: <ProfileView /> },

    // ============ Team ============
    // { path: ROUTES.TEAM, element: <TeamView /> },

    // ============ Roles & Permissions ============
    { path: ROUTES.ROLES, element: <RoleList /> },
    { path: ROUTES.ROLE_DETAIL, element: <RoleDetail /> },
    { path: ROUTES.ROLE_CREATE, element: <RoleCreate /> },
    { path: ROUTES.ROLE_EDIT, element: <RoleEdit /> },

    // ============ Sessions ============
    { path: ROUTES.SESSIONS, element: <SessionList /> },

    // ============ Settings ============
    { path: ROUTES.SETTINGS, element: <Settings /> },
    { path: ROUTES.SECURITY, element: <Security /> },
    { path: '/settings/security', element: <PersonalSecurity /> },
    { path: ROUTES.NOTIFICATIONS, element: <Notifications /> },

    // ============ Invitation Routes ============
    { path: '/invitations', element: <InvitationTracker /> },
    { path: '/invitations/tracker', element: <InvitationTracker /> },
    { path: '/admin/invitations', element: <InvitationTracker /> },

    // ============ Report Routes ============
    { path: '/reports', element: <ReportGenerator /> },
    { path: '/reports/generate', element: <ReportGenerator /> },
    { path: '/admin/reports', element: <ReportGenerator /> },
    { path: '/security/reports', element: <ReportGenerator /> },

    // ============ MFA Routes ============
    // Main MFA Dashboard
    { path: '/security/mfa/dashboard', element: <MFADashboard /> },
    { path: '/mfa/dashboard', element: <MFADashboard /> },

    // MFA Device Management
    { path: '/security/mfa', element: <MFADeviceManager /> },
    { path: '/security/mfa/devices', element: <MFADeviceManager /> },
    { path: '/settings/mfa', element: <MFADeviceManager /> },
    { path: '/mfa/devices', element: <MFADeviceManager /> },

    // MFA Setup
    { path: '/security/mfa/setup', element: <MFATotpSetup /> },
    { path: '/mfa/setup', element: <MFATotpSetup /> },

    // Backup Codes Management
    { path: '/security/mfa/backup-codes', element: <MFABackupCodes /> },
    { path: '/security/backup-codes', element: <MFABackupCodes /> },
    { path: '/mfa/backup-codes', element: <MFABackupCodes /> },

    // MFA Activity Log
    { path: '/security/mfa/activity', element: <MFAActivityLog /> },
    { path: '/security/mfa-activity', element: <MFAActivityLog /> },
    { path: '/mfa/activity', element: <MFAActivityLog /> },

    // ============ System Settings ============
    { path: '/admin/system/settings', element: <SystemSettings /> },
    { path: '/system-settings', element: <SystemSettings /> },
    { path: '/settings/system', element: <SystemSettings /> },

    // ============ MFA Policy Routes (Admin) ============
    // Tenant Policy
    { path: '/security/mfa/policy', element: <TenantMFAPolicy /> },
    { path: '/admin/mfa/policy', element: <TenantMFAPolicy /> },
    { path: '/settings/mfa/policy', element: <TenantMFAPolicy /> },

    // User Policy Management
    { path: '/security/mfa/users', element: <UserMFAPolicy /> },
    { path: '/admin/mfa/users', element: <UserMFAPolicy /> },
    { path: '/settings/mfa/users', element: <UserMFAPolicy /> },
    { path: '/security/mfa/users/:userId/status', element: <UserMFAStatus /> },
    { path: '/admin/mfa/users/:userId/status', element: <UserMFAStatus /> },

    // ============ MFA Admin Routes ============
    // Admin MFA Reset
    { path: '/admin/mfa/reset', element: <AdminMfaResetView /> },
    { path: '/admin/mfa/users', element: <AdminMfaResetView /> },
    { path: '/security/admin/mfa', element: <AdminMfaResetView /> },

    // Admin Device Management
    { path: '/admin/mfa/devices/:userId', element: <AdminMfaDeviceClearView /> },
    { path: '/admin/mfa/devices/:userId/clear', element: <AdminMfaDeviceClearView /> },

    // Admin MFA Status
    { path: '/admin/mfa/status/:userId', element: <AdminMFAStatusView /> },
    { path: '/security/admin/mfa/status/:userId', element: <AdminMFAStatusView /> },

    // ============ Audit Routes ============
    { path: ROUTES.AUDIT, element: <AuditLogs /> },
    { path: '/audit/logs', element: <AuditLogs /> },
    { path: '/security/audit', element: <AuditLogs /> },
    { path: '/admin/audit', element: <AuditLogs /> },

    // ============ Admin Routes ============
    { path: ROUTES.ADMIN, element: <AdminDashboard /> },
    { path: '/admin/custom', element: <SuperAdminDashboardCustom /> },
    { path: ROUTES.ADMIN_USERS, element: <AdminUsers /> },
    { path: ROUTES.ADMIN_USER_CREATE, element: <UserCreate /> },
    { path: ROUTES.ADMIN_USER_EDIT, element: <UserEdit /> },
    { path: ROUTES.ADMIN_TENANTS, element: <AdminTenants /> },
    { path: ROUTES.ADMIN_SYSTEM, element: <AdminSystem /> },

    // Additional Admin Routes
    { path: '/admin/dashboard', element: <AdminDashboard /> },
    { path: '/admin/overview', element: <AdminDashboard /> },
];

export default accountsRoutes;