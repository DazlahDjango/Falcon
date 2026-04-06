// Default pages
export { default as Home } from './Home';
export { default as NotFound } from './NotFound';
export { default as Unauthorized } from './Unauthorized';
export { default as ServerError } from './ServerError';
export { default as Help } from './Help';
export { default as About } from './About';

// Auth pages
export { default as Login } from '../../components/accounts/auth/Login';
export { default as Register } from '../../components/accounts/auth/Register';
export { default as MFAVerify } from '../../components/accounts/auth/MFAVerify';
export { default as MFASetup } from '../../components/accounts/auth/MFASetup';
export { default as ForgotPassword } from '../../components/accounts/auth/ForgotPassword';
export { default as ResetPassword } from '../../components/accounts/auth/ResetPassword';
export { default as VerifyEmail } from '../../components/accounts/auth/VerifyEmail';
export { default as AcceptInvitation } from '../../components/accounts/auth/AcceptInvitation';

// Dashboard Pages
export { default as Dashboard } from '../../components/accounts/dashboard/Dashboard';
export { default as UserDashboard } from '../../components/accounts/dashboard/UserDashboard';
export { default as TeamDashboard } from '../../components/accounts/dashboard/TeamDashboard';
export { default as ExecutiveDashboard } from '../../components/accounts/dashboard/ExecutiveDashboard';

// User Pages
export { default as UserList } from '../../components/accounts/users/UserList';
export { default as UserDetail } from '../../components/accounts/users/UserDetail';
export { default as UserCreate } from '../../components/accounts/users/UserCreate';
export { default as UserEdit } from '../../components/accounts/users/UserEdit';
export { default as UserProfile } from '../../components/accounts/users/UserProfile';

// Team Pages
export { default as TeamView } from '../../components/accounts/team/TeamView';

// Role Pages
export { default as RoleList } from '../../components/accounts/roles/RoleList';
export { default as RoleDetail } from '../../components/accounts/roles/RoleDetail';
export { default as RoleCreate } from '../../components/accounts/roles/RoleCreate';
export { default as RoleEdit } from '../../components/accounts/roles/RoleEdit';

// Session Pages
export { default as SessionList } from '../../components/accounts/sessions/SessionList';

// Settings Pages
export { default as Settings } from '../../components/accounts/settings/Settings';
export { default as ProfileSettings } from '../../components/accounts/settings/ProfileSettings';
export { default as SecuritySettings } from '../../components/accounts/settings/SecuritySettings';
export { default as NotificationSettings } from '../../components/accounts/settings/NotificationSettings';
export { default as TenantSettings } from '../../components/accounts/settings/TenantSettings';

// Audit Pages
export { default as AuditLogs } from '../../components/accounts/audit/AuditLogs';
export { default as AuditDetail } from '../../components/accounts/audit/AuditDetail';

// Admin Pages
export { default as AdminDashboard } from '../../components/accounts/admin/AdminDashboard';
export { default as AdminUsers } from '../../components/accounts/admin/AdminUsers';
export { default as AdminTenants } from '../../components/accounts/admin/AdminTenants';
export { default as AdminSystem } from '../../components/accounts/admin/AdminSystem';
