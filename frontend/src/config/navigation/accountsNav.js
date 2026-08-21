// config/navigation/accountsNav.js
/**
 * Navigation Configuration - Accounts Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the Accounts app.
 */
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiShield,
  FiKey,
  FiLock,
  FiClock,
  FiActivity,
  FiFileText,
  FiAlertCircle,
  FiDownload,
  FiBarChart2,
  FiSmartphone,
  FiCode,
  FiServer,
  FiSettings,
  FiBriefcase,
  FiGrid,
  FiPlus,
  FiGlobe,
  FiLink,
  FiGitBranch,
  FiLayers,
  FiEye,
  FiTrendingUp,
} from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { ACCOUNTS_ROUTES } from '../constants/accountsRouteConstants';

// ============================================
// 1. SUPER ADMIN ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_SUPER_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Accounts Overview', icon: FiGrid },
  ],
  user_management: [
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.ADMIN_USERS, name: 'Manage Users', icon: FiUserCheck },
    { path: ACCOUNTS_ROUTES.USER_BULK_IMPORT, name: 'Import Users', icon: FiPlus },
  ],
  access_control: [
    { path: ACCOUNTS_ROUTES.ROLES, name: 'Roles', icon: FiShield },
    { path: ACCOUNTS_ROUTES.ADMIN_ROLES, name: 'Manage Roles', icon: FiKey },
    { path: ACCOUNTS_ROUTES.PERMISSIONS, name: 'Permissions', icon: FiLock },
    { path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS, name: 'Manage Permissions', icon: FiGrid },
  ],
  tenant_management: [
    { path: ACCOUNTS_ROUTES.ADMIN_TENANTS, name: 'Manage Tenants', icon: MdBusiness },
  ],
  sessions_audit: [
    { path: ACCOUNTS_ROUTES.SESSIONS, name: 'User Sessions', icon: FiClock },
    { path: ACCOUNTS_ROUTES.ACTIVE_SESSIONS, name: 'Active Sessions', icon: FiActivity },
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Trail', icon: FiFileText },
    { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
    { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
    { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reporting Center', icon: FiBarChart2 },
  ],
  security_mfa: [
    { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
    { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
    { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
    { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'MFA Management', icon: FiSmartphone },
    { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
    { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  ],
  system_policy: [
    { path: ACCOUNTS_ROUTES.ADMIN_SYSTEM, name: 'Admin System', icon: FiServer },
    { path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS, name: 'Platform Policy', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.ORGANIZATION_SETTINGS, name: 'Organization Settings', icon: FiSettings },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_SUPER_ADMIN_GROUP_LABELS = {
  main: 'Main',
  user_management: '👥 User Management',
  access_control: '🔐 Roles & Permissions',
  tenant_management: '🏢 Organization & Tenants',
  sessions_audit: '📜 Sessions & Audits',
  security_mfa: '🛡️ Security & MFA Policy',
  system_policy: '⚙️ Platform & System Policy',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_SUPER_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  user_management: true,
  access_control: true,
  tenant_management: false,
  sessions_audit: true,
  security_mfa: true,
  system_policy: false,
  profile_settings: false,
};

// ============================================
// 2. CLIENT ADMIN ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_CLIENT_ADMIN_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Accounts Summary', icon: FiGrid },
  ],
  user_management: [
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.USER_BULK_IMPORT, name: 'Import Users', icon: FiPlus },
  ],
  access_control: [
    { path: ACCOUNTS_ROUTES.ROLES, name: 'Tenant Roles', icon: FiShield },
  ],
  sessions_audit: [
    { path: ACCOUNTS_ROUTES.SESSIONS, name: 'Active Sessions', icon: FiClock },
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
    { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
    { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
    { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reports Center', icon: FiBarChart2 },
  ],
  security_mfa: [
    { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
    { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
    { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
    { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'Admin MFA Resets', icon: FiSmartphone },
    { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
    { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  ],
  organization_settings: [
    { path: ACCOUNTS_ROUTES.ORGANIZATION_SETTINGS, name: 'Organization Settings', icon: FiSettings },
    { path: '/settings/branding', name: 'Branding Settings', icon: FiSettings },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_CLIENT_ADMIN_GROUP_LABELS = {
  main: 'Main',
  user_management: '👥 User Management',
  access_control: '🔐 Tenant Roles',
  sessions_audit: '📜 Sessions & Audits',
  security_mfa: '🛡️ Security & MFA',
  organization_settings: '🏢 Organization Settings',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  main: true,
  user_management: true,
  access_control: true,
  sessions_audit: true,
  security_mfa: true,
  organization_settings: false,
  profile_settings: false,
};

// ============================================
// 3. EXECUTIVE ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_EXECUTIVE_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, name: 'Executive Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Accounts Overview', icon: FiGrid },
  ],
  user_hierarchy: [
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.MY_TEAM, name: 'Team Tree', icon: FiGitBranch },
    { path: ACCOUNTS_ROUTES.MY_REPORTING_CHAIN, name: 'Reporting Chain', icon: FiLayers },
  ],
  audit_reports: [
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Trail', icon: FiFileText },
    { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Summary', icon: FiShield },
    { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reporting Center', icon: FiBarChart2 },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_EXECUTIVE_GROUP_LABELS = {
  main: 'Main',
  user_hierarchy: '👥 People & Hierarchy',
  audit_reports: '📑 Compliance & Reports',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_EXECUTIVE_DEFAULT_EXPANDED = {
  main: true,
  user_hierarchy: true,
  audit_reports: true,
  profile_settings: false,
};

// ============================================
// 4. MANAGER / SUPERVISOR ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_MANAGER_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Accounts Overview', icon: FiGrid },
  ],
  team_management: [
    { path: ACCOUNTS_ROUTES.MY_TEAM, name: 'My Team', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.MY_REPORTING_CHAIN, name: 'Reporting Chain', icon: FiGitBranch },
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
  ],
  reports: [
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Activity Log', icon: FiFileText },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_MANAGER_GROUP_LABELS = {
  main: 'Main',
  team_management: '👥 Team Management',
  reports: '📜 Activity Reports',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_MANAGER_DEFAULT_EXPANDED = {
  main: true,
  team_management: true,
  reports: false,
  profile_settings: false,
};

// ============================================
// 5. STAFF ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_STAFF_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiGrid },
  ],
  self_service: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_TEAM, name: 'My Team', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.MY_REPORTING_CHAIN, name: 'Reporting Chain', icon: FiGitBranch },
    { path: ACCOUNTS_ROUTES.SESSIONS, name: 'Active Sessions', icon: FiClock },
    { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'MFA Devices', icon: FiSmartphone },
    { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
  ],
  settings: [
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_STAFF_GROUP_LABELS = {
  main: 'Main',
  self_service: '👤 Self-Service & Security',
  settings: '⚙️ My Settings',
};

export const ACCOUNTS_STAFF_DEFAULT_EXPANDED = {
  main: true,
  self_service: true,
  settings: false,
};

// ============================================
// 6. CHAMPION ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_CHAMPION_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiGrid },
  ],
  directory_reports: [
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory', icon: FiUsers },
    { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reporting Center', icon: FiBarChart2 },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
  ],
};

export const ACCOUNTS_CHAMPION_GROUP_LABELS = {
  main: 'Main',
  directory_reports: '📑 Directory & Reports',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_CHAMPION_DEFAULT_EXPANDED = {
  main: true,
  directory_reports: true,
  profile_settings: false,
};

// ============================================
// 7. READ-ONLY ACCOUNTS NAV GROUPS
// ============================================
export const ACCOUNTS_READ_ONLY_NAV_GROUPS = {
  main: [
    { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    { path: ACCOUNTS_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiGrid },
  ],
  views: [
    { path: ACCOUNTS_ROUTES.USERS, name: 'User Directory (Read Only)', icon: FiEye },
    { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Trail (Read Only)', icon: FiFileText },
  ],
  profile_settings: [
    { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
    { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
  ],
};

export const ACCOUNTS_READ_ONLY_GROUP_LABELS = {
  main: 'Main',
  views: '👁️ Read-Only Views',
  profile_settings: '👤 Profile & Settings',
};

export const ACCOUNTS_READ_ONLY_DEFAULT_EXPANDED = {
  main: true,
  views: true,
  profile_settings: false,
};

// ============================================
// HELPER FUNCTION
// ============================================
export const isAccountsRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  ACCOUNTS_SUPER_ADMIN_NAV_GROUPS,
  ACCOUNTS_SUPER_ADMIN_GROUP_LABELS,
  ACCOUNTS_SUPER_ADMIN_DEFAULT_EXPANDED,
  ACCOUNTS_CLIENT_ADMIN_NAV_GROUPS,
  ACCOUNTS_CLIENT_ADMIN_GROUP_LABELS,
  ACCOUNTS_CLIENT_ADMIN_DEFAULT_EXPANDED,
  ACCOUNTS_EXECUTIVE_NAV_GROUPS,
  ACCOUNTS_EXECUTIVE_GROUP_LABELS,
  ACCOUNTS_EXECUTIVE_DEFAULT_EXPANDED,
  ACCOUNTS_MANAGER_NAV_GROUPS,
  ACCOUNTS_MANAGER_GROUP_LABELS,
  ACCOUNTS_MANAGER_DEFAULT_EXPANDED,
  ACCOUNTS_STAFF_NAV_GROUPS,
  ACCOUNTS_STAFF_GROUP_LABELS,
  ACCOUNTS_STAFF_DEFAULT_EXPANDED,
  ACCOUNTS_CHAMPION_NAV_GROUPS,
  ACCOUNTS_CHAMPION_GROUP_LABELS,
  ACCOUNTS_CHAMPION_DEFAULT_EXPANDED,
  ACCOUNTS_READ_ONLY_NAV_GROUPS,
  ACCOUNTS_READ_ONLY_GROUP_LABELS,
  ACCOUNTS_READ_ONLY_DEFAULT_EXPANDED,
  isAccountsRouteActive,
};