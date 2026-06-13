/**
 * Accounts Module Routes
 * Pure route configuration - no layout or guard wrappers
 * Layout and protection are handled by the parent router (index.jsx)
 */

import React from 'react';
import { ROUTES } from '../config/constants/routeConstants';

// ============================================================
// LAZY LOAD COMPONENTS
// ============================================================

// ============ Auth Components ============
// Note: Login, Register, ForgotPassword, ResetPassword are handled in main router
// Only MFA verification remains here as it's part of accounts flow
const MFAVerify = React.lazy(() => import('../components/accounts/auth/MFAVerify'));
const VerifyEmail = React.lazy(() => import('../components/accounts/auth/VerifyEmail'));
const AcceptInvitation = React.lazy(() => import('../components/accounts/auth/AcceptInvitation'));

// ============ Dashboard Components ============
const Dashboard = React.lazy(() => import('../components/accounts/dashboard/Dashboard'));

// ============ User Management Components ============
const UserList = React.lazy(() => import('../components/accounts/users/UserList'));
const UserDetail = React.lazy(() => import('../components/accounts/users/UserDetail'));
const UserCreate = React.lazy(() => import('../components/accounts/users/UserCreate'));
const UserEdit = React.lazy(() => import('../components/accounts/users/UserEdit'));

// ============ Profile Components ============
const ProfileView = React.lazy(() => import('../components/accounts/profile/ProfileView'));

// ============ Team Components ============
const TeamView = React.lazy(() => import('../components/accounts/team/TeamView'));

// ============ Role Components ============
const RoleList = React.lazy(() => import('../components/accounts/roles/RoleList'));
const RoleDetail = React.lazy(() => import('../components/accounts/roles/RoleDetail'));
const RoleCreate = React.lazy(() => import('../components/accounts/roles/RoleCreate'));
const RoleEdit = React.lazy(() => import('../components/accounts/roles/RoleEdit'));

// ============ Session Components ============
const SessionList = React.lazy(() => import('../components/accounts/sessions/SessionList'));

// ============ Settings Components ============
const Settings = React.lazy(() => import('../components/accounts/settings/Settings'));

// ============ Security Components ============
const SecurityConsole = React.lazy(() => import('../components/accounts/security/SecurityConsole'));

// ============ Notification Components ============
const NotificationSettings = React.lazy(() => import('../components/accounts/settings/NotificationSettings'));

// ============ Audit Components ============
const AuditLogs = React.lazy(() => import('../components/accounts/audit/AuditLogs'));

// ============ Invitation Components ============
const InvitationTracker = React.lazy(() => import('../components/accounts/users/components/InvitationTracker'));

// ============ Report Components ============
const ReportGenerator = React.lazy(() => import('../components/accounts/reports/ReportGenerator'));

// ============ MFA Components - User ============
const MFADashboard = React.lazy(() => import('../components/accounts/mfa/MFADashboard'));
const MFADeviceManager = React.lazy(() => import('../components/accounts/mfa/MFADeviceManager'));
const MFATotpSetup = React.lazy(() => import('../components/accounts/mfa/MFATotpSetup'));
const MFABackupCodes = React.lazy(() => import('../components/accounts/mfa/MFABackupCodes'));
const MFAActivityLog = React.lazy(() => import('../components/accounts/mfa/MFAActivityLog'));

// ============ MFA Policy Components (Admin) ============
const TenantMFAPolicy = React.lazy(() => import('../components/accounts/policy/TenantMFAPolicy'));
const UserMFAPolicy = React.lazy(() => import('../components/accounts/policy/UserMFAPolicy'));
const UserMFAStatus = React.lazy(() => import('../components/accounts/policy/UserMFAStatus'));

// ============ MFA Admin Components ============
const AdminMfaResetView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMfaResetView'));
const AdminMfaDeviceClearView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMfaDeviceClearView'));
const AdminMFAStatusView = React.lazy(() => import('../components/accounts/mfa-admin/AdminMFAStatus'));

// ============ System Settings Components ============
const SystemSettings = React.lazy(() => import('../components/accounts/system/SystemSettings'));

// ============ Admin Components ============
const AdminDashboard = React.lazy(() => import('../components/accounts/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('../components/accounts/admin/AdminUsers'));
const AdminTenants = React.lazy(() => import('../components/accounts/admin/AdminTenants'));
const AdminSystem = React.lazy(() => import('../components/accounts/admin/AdminSystem'));

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

const accountsRoutes = [
    // ============ Auth Routes (remaining) ============
    {
        path: ROUTES.MFA_VERIFY,
        element: <MFAVerify />,
    },
    {
        path: ROUTES.VERIFY_EMAIL,
        element: <VerifyEmail />,
    },
    {
        path: ROUTES.ACCEPT_INVITATION,
        element: <AcceptInvitation />,
    },

    // ============ Dashboard ============
    {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
    },

    // ============ User Management ============
    {
        path: ROUTES.USERS,
        element: <UserList />,
    },
    {
        path: ROUTES.USER_DETAIL,
        element: <UserDetail />,
    },
    {
        path: ROUTES.USER_CREATE,
        element: <UserCreate />,
    },
    {
        path: ROUTES.USER_EDIT,
        element: <UserEdit />,
    },

    // ============ Profile ============
    {
        path: ROUTES.PROFILE,
        element: <ProfileView />,
    },
    {
        path: '/profile/settings',
        element: <ProfileView />,
    },
    {
        path: '/me',
        element: <ProfileView />,
    },

    // ============ Team ============
    {
        path: ROUTES.TEAM,
        element: <TeamView />,
    },

    // ============ Roles & Permissions ============
    {
        path: ROUTES.ROLES,
        element: <RoleList />,
    },
    {
        path: ROUTES.ROLE_DETAIL,
        element: <RoleDetail />,
    },
    {
        path: ROUTES.ROLE_CREATE,
        element: <RoleCreate />,
    },
    {
        path: ROUTES.ROLE_EDIT,
        element: <RoleEdit />,
    },

    // ============ Sessions ============
    {
        path: ROUTES.SESSIONS,
        element: <SessionList />,
    },

    // ============ Settings ============
    {
        path: ROUTES.SETTINGS,
        element: <Settings />,
    },

    // ============ Security ============
    {
        path: ROUTES.SECURITY,
        element: <SecurityConsole />,
    },

    // ============ Notifications ============
    {
        path: ROUTES.NOTIFICATIONS,
        element: <NotificationSettings />,
    },

    // ============ Audit Logs ============
    {
        path: ROUTES.AUDIT,
        element: <AuditLogs />,
    },
    {
        path: '/audit/logs',
        element: <AuditLogs />,
    },

    // ============ Invitations ============
    {
        path: ROUTES.INVITATIONS,
        element: <InvitationTracker />,
    },
    {
        path: '/invitations/tracker',
        element: <InvitationTracker />,
    },

    // ============ Reports ============
    {
        path: ROUTES.REPORTS,
        element: <ReportGenerator />,
    },
    {
        path: '/reports/generate',
        element: <ReportGenerator />,
    },

    // ============ MFA - User Routes ============
    // MFA Dashboard
    {
        path: ROUTES.MFA_DASHBOARD,
        element: <MFADashboard />,
    },
    {
        path: '/mfa/dashboard',
        element: <MFADashboard />,
    },

    // MFA Device Management
    {
        path: ROUTES.MFA_DEVICES,
        element: <MFADeviceManager />,
    },
    {
        path: '/security/mfa',
        element: <MFADeviceManager />,
    },
    {
        path: '/settings/mfa',
        element: <MFADeviceManager />,
    },
    {
        path: '/mfa/devices',
        element: <MFADeviceManager />,
    },

    // MFA Setup (TOTP)
    {
        path: ROUTES.MFA_SETUP,
        element: <MFATotpSetup />,
    },
    {
        path: '/mfa/setup',
        element: <MFATotpSetup />,
    },

    // MFA Backup Codes
    {
        path: ROUTES.MFA_BACKUP_CODES,
        element: <MFABackupCodes />,
    },
    {
        path: '/security/backup-codes',
        element: <MFABackupCodes />,
    },
    {
        path: '/mfa/backup-codes',
        element: <MFABackupCodes />,
    },

    // MFA Activity Log
    {
        path: ROUTES.MFA_ACTIVITY,
        element: <MFAActivityLog />,
    },
    {
        path: '/security/mfa-activity',
        element: <MFAActivityLog />,
    },
    {
        path: '/mfa/activity',
        element: <MFAActivityLog />,
    },

    // ============ MFA Policy Routes (Admin) ============
    // Tenant Level Policy
    {
        path: ROUTES.MFA_POLICY_TENANT,
        element: <TenantMFAPolicy />,
    },
    {
        path: '/admin/mfa/policy',
        element: <TenantMFAPolicy />,
    },
    {
        path: '/settings/mfa/policy',
        element: <TenantMFAPolicy />,
    },

    // User Level Policy
    {
        path: ROUTES.MFA_POLICY_USERS,
        element: <UserMFAPolicy />,
    },
    {
        path: '/admin/mfa/users',
        element: <UserMFAPolicy />,
    },
    {
        path: '/settings/mfa/users',
        element: <UserMFAPolicy />,
    },

    // User MFA Status
    {
        path: ROUTES.MFA_USER_STATUS,
        element: <UserMFAStatus />,
    },
    {
        path: '/admin/mfa/users/:userId/status',
        element: <UserMFAStatus />,
    },

    // ============ MFA Admin Routes ============
    // Reset User MFA
    {
        path: ROUTES.ADMIN_MFA_RESET,
        element: <AdminMfaResetView />,
    },
    {
        path: '/admin/mfa/users',
        element: <AdminMfaResetView />,
    },
    {
        path: '/security/admin/mfa',
        element: <AdminMfaResetView />,
    },

    // Clear User Devices
    {
        path: ROUTES.ADMIN_MFA_DEVICES_CLEAR,
        element: <AdminMfaDeviceClearView />,
    },
    {
        path: '/admin/mfa/devices/:userId/clear',
        element: <AdminMfaDeviceClearView />,
    },

    // Admin MFA Status
    {
        path: ROUTES.ADMIN_MFA_STATUS,
        element: <AdminMFAStatusView />,
    },
    {
        path: '/security/admin/mfa/status/:userId',
        element: <AdminMFAStatusView />,
    },

    // ============ System Settings ============
    {
        path: ROUTES.SYSTEM_SETTINGS,
        element: <SystemSettings />,
    },
    {
        path: '/admin/system/settings',
        element: <SystemSettings />,
    },
    {
        path: '/settings/system',
        element: <SystemSettings />,
    },

    // ============ Admin Routes ============
    {
        path: ROUTES.ADMIN,
        element: <AdminDashboard />,
    },
    {
        path: '/admin/dashboard',
        element: <AdminDashboard />,
    },
    {
        path: '/admin/overview',
        element: <AdminDashboard />,
    },
    {
        path: ROUTES.ADMIN_USERS,
        element: <AdminUsers />,
    },
    {
        path: ROUTES.ADMIN_TENANTS,
        element: <AdminTenants />,
    },
    {
        path: ROUTES.ADMIN_SYSTEM,
        element: <AdminSystem />,
    },
];

export default accountsRoutes;