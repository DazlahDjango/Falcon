import React from 'react';
import { ACCOUNTS_ROUTES } from '../config/constants/accountsRouteConstants';

// ============ Auth Pages ============
const LoginPage = React.lazy(() => import('../pages/accounts/LoginPage'));
const MFAChallengePage = React.lazy(() => import('../pages/accounts/MFAChallengePage'));
const MFASetupPage = React.lazy(() => import('../pages/accounts/MFASetupPage'));
const PasswordResetPage = React.lazy(() => import('../pages/accounts/PasswordResetPage'));
const PasswordResetConfirmPage = React.lazy(() => import('../pages/accounts/PasswordResetConfirmPage'));
const RegisterPage = React.lazy(() => import('../pages/accounts/RegisterPage'));
const TenantRegisterPage = React.lazy(() => import('../pages/accounts/TenantRegisterPage'));
const VerifyEmailPage = React.lazy(() => import('../pages/accounts/VerifyEmailPage'));
const ChangePasswordPage = React.lazy(() => import('../pages/accounts/ChangePasswordPage'));

// ============ Dashboard ============
const DashboardPage = React.lazy(() => import('../pages/accounts/DashboardPage'));

// ============ User Pages ============
const UsersPage = React.lazy(() => import('../pages/accounts/UsersPage'));
const UserDetailPage = React.lazy(() => import('../pages/accounts/UserDetailPage'));
const UserCreatePage = React.lazy(() => import('../pages/accounts/UserCreatePage'));
const UserEditPage = React.lazy(() => import('../pages/accounts/UserEditPage'));

// ============ Profile Pages ============
const ProfilePage = React.lazy(() => import('../pages/accounts/ProfilePage'));
const ProfileEditPage = React.lazy(() => import('../pages/accounts/ProfileEditPage'));

// ============ MFA Pages ============
const MFADevicesPage = React.lazy(() => import('../pages/accounts/MFADevicesPage'));
const MFABackupCodesPage = React.lazy(() => import('../pages/accounts/MFABackupCodesPage'));

// ============ Role Pages ============
const RolesPage = React.lazy(() => import('../pages/accounts/RolesPage'));
const RoleDetailPage = React.lazy(() => import('../pages/accounts/RoleDetailPage'));
const RoleCreatePage = React.lazy(() => import('../pages/accounts/RoleCreatePage'));
const RoleEditPage = React.lazy(() => import('../pages/accounts/RoleEditPage'));

// ============ Permission Pages ============
const PermissionsPage = React.lazy(() => import('../pages/accounts/PermissionsPage'));

// ============ Session Pages ============
const SessionsPage = React.lazy(() => import('../pages/accounts/SessionsPage'));

// ============ Audit Pages ============
const AuditLogsPage = React.lazy(() => import('../pages/accounts/AuditLogsPage'));
const AuditLogDetailPage = React.lazy(() => import('../pages/accounts/AuditLogDetailPage'));
const SecurityEventsPage = React.lazy(() => import('../pages/accounts/SecurityEventsPage'));
const ComplianceReportPage = React.lazy(() => import('../pages/accounts/ComplianceReportPage'));

// ============ Preference Pages ============
const UserPreferencesPage = React.lazy(() => import('../pages/accounts/UserPreferencesPage'));
const TenantPreferencesPage = React.lazy(() => import('../pages/accounts/TenantPreferencesPage'));
const BrandingSettingsPage = React.lazy(() => import('../pages/accounts/BrandingSettingsPage'));
const NotificationSettingsPage = React.lazy(() => import('../pages/accounts/NotificationSettingsPage'));

// ============ Admin Pages ============
const AdminDashboardPage = React.lazy(() => import('../pages/accounts/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('../pages/accounts/AdminUsersPage'));
const AdminRolesPage = React.lazy(() => import('../pages/accounts/AdminRolesPage'));
const AdminPermissionsPage = React.lazy(() => import('../pages/accounts/AdminPermissionsPage'));
const AdminTenantsPage = React.lazy(() => import('../pages/accounts/AdminTenantsPage'));
const AdminSystemSettingsPage = React.lazy(() => import('../pages/accounts/AdminSystemSettingsPage'));
const AdminMFAManagementPage = React.lazy(() => import('../pages/accounts/AdminMFAManagementPage'));

// ============ Security Pages ============
const LoginAttemptsPage = React.lazy(() => import('../pages/accounts/LoginAttemptsPage'));
const LockoutSummaryPage = React.lazy(() => import('../pages/accounts/LockoutSummaryPage'));
const TenantPolicyPage = React.lazy(() => import('../pages/accounts/TenantPolicyPage'));

// ============ Settings ============
const SettingsPage = React.lazy(() => import('../pages/accounts/SettingsPage'));

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

const accountsRoutes = [
    // ============ Auth Routes ============
    {
        path: ACCOUNTS_ROUTES.MFA_VERIFY,
        element: <MFAChallengePage />,
    },
    {
        path: ACCOUNTS_ROUTES.MFA_SETUP,
        element: <MFASetupPage />,
    },
    {
        path: ACCOUNTS_ROUTES.VERIFY_EMAIL,
        element: <VerifyEmailPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ACCEPT_INVITATION,
        element: <VerifyEmailPage />, // Or create a dedicated AcceptInvitationPage
    },

    // ============ Dashboard ============
    {
        path: ACCOUNTS_ROUTES.DASHBOARD,
        element: <DashboardPage />,
    },
    {
        path: '/',
        element: <DashboardPage />,
    },

    // ============ User Management ============
    {
        path: ACCOUNTS_ROUTES.USERS,
        element: <UsersPage />,
    },
    {
        path: '/users/:id',
        element: <UserDetailPage />,
    },
    {
        path: ACCOUNTS_ROUTES.USER_CREATE,
        element: <UserCreatePage />,
    },
    {
        path: '/users/:id/edit',
        element: <UserEditPage />,
    },

    // ============ Profile ============
    {
        path: ACCOUNTS_ROUTES.MY_PROFILE,
        element: <ProfilePage />,
    },
    {
        path: ACCOUNTS_ROUTES.PROFILE_EDIT,
        element: <ProfileEditPage />,
    },
    {
        path: '/me',
        element: <ProfilePage />,
    },

    // ============ MFA ============
    {
        path: ACCOUNTS_ROUTES.MFA_DEVICES,
        element: <MFADevicesPage />,
    },
    {
        path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
        element: <MFABackupCodesPage />,
    },
    {
        path: '/security/mfa',
        element: <MFADevicesPage />,
    },

    // ============ Roles ============
    {
        path: ACCOUNTS_ROUTES.ROLES,
        element: <RolesPage />,
    },
    {
        path: '/roles/:id',
        element: <RoleDetailPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ROLE_CREATE,
        element: <RoleCreatePage />,
    },
    {
        path: '/roles/:id/edit',
        element: <RoleEditPage />,
    },

    // ============ Permissions ============
    {
        path: ACCOUNTS_ROUTES.PERMISSIONS,
        element: <PermissionsPage />,
    },

    // ============ Sessions ============
    {
        path: ACCOUNTS_ROUTES.SESSIONS,
        element: <SessionsPage />,
    },

    // ============ Audit ============
    {
        path: ACCOUNTS_ROUTES.AUDIT_LOGS,
        element: <AuditLogsPage />,
    },
    {
        path: '/audit-logs/:id',
        element: <AuditLogDetailPage />,
    },
    {
        path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS,
        element: <SecurityEventsPage />,
    },
    {
        path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE,
        element: <ComplianceReportPage />,
    },

    // ============ Preferences ============
    {
        path: ACCOUNTS_ROUTES.MY_SETTINGS,
        element: <UserPreferencesPage />,
    },
    {
        path: ACCOUNTS_ROUTES.TENANT_SETTINGS,
        element: <TenantPreferencesPage />,
    },
    {
        path: '/settings/branding',
        element: <BrandingSettingsPage />,
    },
    {
        path: '/settings/notifications',
        element: <NotificationSettingsPage />,
    },

    // ============ Admin ============
    {
        path: ACCOUNTS_ROUTES.ADMIN_DASHBOARD,
        element: <AdminDashboardPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_USERS,
        element: <AdminUsersPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_ROLES,
        element: <AdminRolesPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS,
        element: <AdminPermissionsPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_TENANTS,
        element: <AdminTenantsPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_SYSTEM,
        element: <AdminSystemSettingsPage />,
    },
    {
        path: ACCOUNTS_ROUTES.ADMIN_MFA,
        element: <AdminMFAManagementPage />,
    },

    // ============ Security ============
    {
        path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS,
        element: <LoginAttemptsPage />,
    },
    {
        path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY,
        element: <LockoutSummaryPage />,
    },
    {
        path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY,
        element: <TenantPolicyPage />,
    },
    {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    element: <ChangePasswordPage />,
    },

    // ============ Settings (General) ============
    {
        path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS,
        element: <AdminSystemSettingsPage />,
    },
    {
        path: '/settings',
        element: <SettingsPage />,
    },
];

export default accountsRoutes;