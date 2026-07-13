import {
  FiUsers,
  FiShield,
  FiClock,
  FiFileText,
  FiActivity,
  FiLayers,
  FiLock,
  FiKey,
  FiSmartphone,
  FiCode,
  FiUser,
  FiSettings,
  FiHome,
  FiBarChart2,
  FiAlertCircle,
  FiDownload,
  FiServer,
  FiGrid,
  FiList,
  FiUserCheck,
  FiUserX,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi';

import { ACCOUNTS_ROUTES } from '../constants/accountsRouteConstants';
import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';

// ============================================
// ACCOUNTS NAVIGATION ITEMS - SUPER ADMIN
// ============================================

export const ACCOUNTS_ADMIN_NAV_ITEMS = [
  {
    path: ACCOUNTS_ROUTES.USERS,
    name: 'All Users',
    icon: FiUsers,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_USERS,
    name: 'Manage Users',
    icon: FiUserCheck,
  },
  {
    path: ACCOUNTS_ROUTES.ROLES,
    name: 'Roles',
    icon: FiShield,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_ROLES,
    name: 'Manage Roles',
    icon: FiKey,
  },
  {
    path: ACCOUNTS_ROUTES.PERMISSIONS,
    name: 'Permissions',
    icon: FiLock,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS,
    name: 'Manage Permissions',
    icon: FiGrid,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_TENANTS,
    name: 'Manage Tenants',
    icon: FiBriefcase,
  },
  {
    path: ACCOUNTS_ROUTES.SESSIONS,
    name: 'Sessions',
    icon: FiClock,
  },
  {
    path: ACCOUNTS_ROUTES.ACTIVE_SESSIONS,
    name: 'Active Sessions',
    icon: FiActivity,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_LOGS,
    name: 'Audit Logs',
    icon: FiFileText,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS,
    name: 'Security Events',
    icon: FiAlertCircle,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE,
    name: 'Compliance Report',
    icon: FiDownload,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS,
    name: 'Login Attempts',
    icon: FiUserX,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY,
    name: 'Lockout Summary',
    icon: FiLock,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY,
    name: 'MFA Policy',
    icon: FiShield,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_MFA,
    name: 'MFA Management',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    name: 'My MFA Devices',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
    name: 'Backup Codes',
    icon: FiCode,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_SYSTEM,
    name: 'System Settings',
    icon: FiServer,
  },
  {
    path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS,
    name: 'System Policy',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.TENANT_SETTINGS,
    name: 'Tenant Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    name: 'My Profile',
    icon: FiUser,
  },
  {
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    name: 'My Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    name: 'Change Password',
    icon: FiLock,
  },
];

// ============================================
// ACCOUNTS NAVIGATION ITEMS - CLIENT ADMIN
// ============================================

export const ACCOUNTS_CLIENT_ADMIN_NAV_ITEMS = [
  {
    path: ACCOUNTS_ROUTES.USERS,
    name: 'Users',
    icon: FiUsers,
  },
  {
    path: ACCOUNTS_ROUTES.ROLES,
    name: 'Roles',
    icon: FiShield,
  },
  {
    path: ACCOUNTS_ROUTES.SESSIONS,
    name: 'Sessions',
    icon: FiClock,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_LOGS,
    name: 'Audit Logs',
    icon: FiFileText,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS,
    name: 'Security Events',
    icon: FiAlertCircle,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE,
    name: 'Compliance Report',
    icon: FiDownload,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS,
    name: 'Login Attempts',
    icon: FiUserX,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY,
    name: 'Lockout Summary',
    icon: FiLock,
  },
  {
    path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY,
    name: 'MFA Policy',
    icon: FiShield,
  },
  {
    path: ACCOUNTS_ROUTES.ADMIN_MFA,
    name: 'MFA Management',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    name: 'My MFA Devices',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
    name: 'Backup Codes',
    icon: FiCode,
  },
  {
    path: ACCOUNTS_ROUTES.TENANT_SETTINGS,
    name: 'Tenant Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    name: 'My Profile',
    icon: FiUser,
  },
  {
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    name: 'My Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    name: 'Change Password',
    icon: FiLock,
  },
];

// ============================================
// ACCOUNTS NAVIGATION ITEMS - EXECUTIVE
// ============================================

export const ACCOUNTS_EXECUTIVE_NAV_ITEMS = [
  {
    path: ACCOUNTS_ROUTES.USERS,
    name: 'Users',
    icon: FiUsers,
  },
  {
    path: ACCOUNTS_ROUTES.SESSIONS,
    name: 'Sessions',
    icon: FiClock,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_LOGS,
    name: 'Audit Logs',
    icon: FiFileText,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS,
    name: 'Security Events',
    icon: FiAlertCircle,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    name: 'My MFA Devices',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
    name: 'Backup Codes',
    icon: FiCode,
  },
  {
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    name: 'My Profile',
    icon: FiUser,
  },
  {
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    name: 'My Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    name: 'Change Password',
    icon: FiLock,
  },
];

// ============================================
// ACCOUNTS NAVIGATION ITEMS - SUPERVISOR
// ============================================

export const ACCOUNTS_SUPERVISOR_NAV_ITEMS = [
  {
    path: ACCOUNTS_ROUTES.USERS,
    name: 'Users',
    icon: FiUsers,
  },
  {
    path: ACCOUNTS_ROUTES.SESSIONS,
    name: 'Sessions',
    icon: FiClock,
  },
  {
    path: ACCOUNTS_ROUTES.AUDIT_LOGS,
    name: 'Audit Logs',
    icon: FiFileText,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    name: 'My MFA Devices',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
    name: 'Backup Codes',
    icon: FiCode,
  },
  {
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    name: 'My Profile',
    icon: FiUser,
  },
  {
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    name: 'My Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    name: 'Change Password',
    icon: FiLock,
  },
];

// ============================================
// ACCOUNTS NAVIGATION ITEMS - STAFF
// ============================================

export const ACCOUNTS_STAFF_NAV_ITEMS = [
  {
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    name: 'My MFA Devices',
    icon: FiSmartphone,
  },
  {
    path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
    name: 'Backup Codes',
    icon: FiCode,
  },
  {
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    name: 'My Profile',
    icon: FiUser,
  },
  {
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    name: 'My Settings',
    icon: FiSettings,
  },
  {
    path: ACCOUNTS_ROUTES.CHANGE_PASSWORD,
    name: 'Change Password',
    icon: FiLock,
  },
];

// ============================================
// ACCOUNTS NAVIGATION GROUPS - SUPER ADMIN
// ============================================

export const ACCOUNTS_SUPER_ADMIN_NAV_GROUPS = {
  accountsManagement: {
    label: '👥 Accounts Management',
    items: [
      { path: ACCOUNTS_ROUTES.USERS, name: 'All Users', icon: FiUsers },
      { path: ACCOUNTS_ROUTES.ADMIN_USERS, name: 'Manage Users', icon: FiUserCheck },
      { path: ACCOUNTS_ROUTES.ROLES, name: 'Roles', icon: FiShield },
      { path: ACCOUNTS_ROUTES.ADMIN_ROLES, name: 'Manage Roles', icon: FiKey },
      { path: ACCOUNTS_ROUTES.PERMISSIONS, name: 'Permissions', icon: FiLock },
      { path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS, name: 'Manage Permissions', icon: FiGrid },
      { path: ACCOUNTS_ROUTES.ADMIN_TENANTS, name: 'Manage Tenants', icon: FiBriefcase },
    ],
  },
  sessionSecurity: {
    label: '🔐 Sessions & Security',
    items: [
      { path: ACCOUNTS_ROUTES.SESSIONS, name: 'All Sessions', icon: FiClock },
      { path: ACCOUNTS_ROUTES.ACTIVE_SESSIONS, name: 'Active Sessions', icon: FiActivity },
      { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
      { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
      { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
      { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'MFA Management', icon: FiSmartphone },
    ],
  },
  auditCompliance: {
    label: '📊 Audit & Compliance',
    items: [
      { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
      { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
      { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
      { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reporting Center', icon: FiBarChart2 },
    ],
  },
  mfaUser: {
    label: '📱 My MFA',
    items: [
      { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
      { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
    ],
  },
  userProfile: {
    label: '👤 Profile & Settings',
    items: [
      { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
      { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
      { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
    ],
  },
  systemAdmin: {
    label: '⚙️ System Administration',
    items: [
      { path: ACCOUNTS_ROUTES.ADMIN_SYSTEM, name: 'System Settings', icon: FiServer },
      { path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS, name: 'System Policy', icon: FiSettings },
      { path: ACCOUNTS_ROUTES.TENANT_SETTINGS, name: 'Tenant Settings', icon: FiSettings },
    ],
  },
};

// ============================================
// ACCOUNTS NAVIGATION GROUPS - CLIENT ADMIN
// ============================================

export const ACCOUNTS_CLIENT_ADMIN_NAV_GROUPS = {
  userManagement: {
    label: '👥 User Management',
    items: [
      { path: ACCOUNTS_ROUTES.USERS, name: 'Users', icon: FiUsers },
      { path: ACCOUNTS_ROUTES.ROLES, name: 'Roles', icon: FiShield },
    ],
  },
  sessionSecurity: {
    label: '🔐 Sessions & Security',
    items: [
      { path: ACCOUNTS_ROUTES.SESSIONS, name: 'Sessions', icon: FiClock },
      { path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS, name: 'Login Attempts', icon: FiUserX },
      { path: ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY, name: 'Lockout Summary', icon: FiLock },
      { path: ACCOUNTS_ROUTES.SECURITY_MFA_POLICY, name: 'MFA Policy', icon: FiShield },
      { path: ACCOUNTS_ROUTES.ADMIN_MFA, name: 'MFA Management', icon: FiSmartphone },
    ],
  },
  auditCompliance: {
    label: '📊 Audit & Compliance',
    items: [
      { path: ACCOUNTS_ROUTES.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
      { path: ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS, name: 'Security Events', icon: FiAlertCircle },
      { path: ACCOUNTS_ROUTES.AUDIT_COMPLIANCE, name: 'Compliance Report', icon: FiDownload },
      { path: ACCOUNTS_ROUTES.REPORTS, name: 'Reporting Center', icon: FiBarChart2 },
    ],
  },
  mfaUser: {
    label: '📱 My MFA',
    items: [
      { path: ACCOUNTS_ROUTES.MFA_DEVICES, name: 'My MFA Devices', icon: FiSmartphone },
      { path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES, name: 'Backup Codes', icon: FiCode },
    ],
  },
  userProfile: {
    label: '👤 Profile & Settings',
    items: [
      { path: ACCOUNTS_ROUTES.MY_PROFILE, name: 'My Profile', icon: FiUser },
      { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
      { path: ACCOUNTS_ROUTES.CHANGE_PASSWORD, name: 'Change Password', icon: FiLock },
      { path: ACCOUNTS_ROUTES.TENANT_SETTINGS, name: 'Tenant Settings', icon: FiSettings },
    ],
  },
};

// ============================================
// DEFAULT EXPANDED STATES
// ============================================

export const ACCOUNTS_SUPER_ADMIN_DEFAULT_EXPANDED = {
  accountsManagement: true,
  sessionSecurity: false,
  auditCompliance: false,
  mfaUser: false,
  userProfile: false,
  systemAdmin: false,
};

export const ACCOUNTS_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  userManagement: true,
  sessionSecurity: false,
  auditCompliance: false,
  mfaUser: false,
  userProfile: false,
};

// ============================================
// GROUP LABELS
// ============================================

export const ACCOUNTS_SUPER_ADMIN_GROUP_LABELS = {
  accountsManagement: '👥 Accounts Management',
  sessionSecurity: '🔐 Sessions & Security',
  auditCompliance: '📊 Audit & Compliance',
  mfaUser: '📱 My MFA',
  userProfile: '👤 Profile & Settings',
  systemAdmin: '⚙️ System Administration',
};

export const ACCOUNTS_CLIENT_ADMIN_GROUP_LABELS = {
  userManagement: '👥 User Management',
  sessionSecurity: '🔐 Sessions & Security',
  auditCompliance: '📊 Audit & Compliance',
  mfaUser: '📱 My MFA',
  userProfile: '👤 Profile & Settings',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAccountsNavItemsByRole = (role) => {
  const roleMap = {
    super_admin: ACCOUNTS_ADMIN_NAV_ITEMS,
    client_admin: ACCOUNTS_CLIENT_ADMIN_NAV_ITEMS,
    executive: ACCOUNTS_EXECUTIVE_NAV_ITEMS,
    supervisor: ACCOUNTS_SUPERVISOR_NAV_ITEMS,
    staff: ACCOUNTS_STAFF_NAV_ITEMS,
    read_only: ACCOUNTS_STAFF_NAV_ITEMS,
  };
  return roleMap[role] || ACCOUNTS_STAFF_NAV_ITEMS;
};

export const getAccountsNavGroupsByRole = (role) => {
  const groupMap = {
    super_admin: ACCOUNTS_SUPER_ADMIN_NAV_GROUPS,
    client_admin: ACCOUNTS_CLIENT_ADMIN_NAV_GROUPS,
    executive: null,
    supervisor: null,
    staff: null,
    read_only: null,
  };
  return groupMap[role] || null;
};

export const getAccountsDefaultExpandedByRole = (role) => {
  const expandedMap = {
    super_admin: ACCOUNTS_SUPER_ADMIN_DEFAULT_EXPANDED,
    client_admin: ACCOUNTS_CLIENT_ADMIN_DEFAULT_EXPANDED,
  };
  return expandedMap[role] || {};
};

export const getAccountsGroupLabelsByRole = (role) => {
  const labelMap = {
    super_admin: ACCOUNTS_SUPER_ADMIN_GROUP_LABELS,
    client_admin: ACCOUNTS_CLIENT_ADMIN_GROUP_LABELS,
  };
  return labelMap[role] || {};
};

export const isAccountsRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;

  const patterns = [
    /^\/users\/[\w-]+$/,
    /^\/users\/[\w-]+\/edit$/,
    /^\/roles\/[\w-]+$/,
    /^\/roles\/[\w-]+\/edit$/,
    /^\/permissions\/[\w-]+$/,
    /^\/sessions\/[\w-]+$/,
    /^\/audit-logs\/[\w-]+$/,
    /^\/admin\/users\/[\w-]+$/,
    /^\/admin\/tenants\/[\w-]+$/,
    /^\/admin\/mfa\/users\/[\w-]+$/,
    /^\/profiles\/[\w-]+$/,
    /^\/profiles\/[\w-]+\/edit$/,
  ];

  return patterns.some((pattern) => pattern.test(currentPath));
};

// ============================================
// EXPORT DEFAULTS
// ============================================

export default {
  ACCOUNTS_ADMIN_NAV_ITEMS,
  ACCOUNTS_CLIENT_ADMIN_NAV_ITEMS,
  ACCOUNTS_EXECUTIVE_NAV_ITEMS,
  ACCOUNTS_SUPERVISOR_NAV_ITEMS,
  ACCOUNTS_STAFF_NAV_ITEMS,
  ACCOUNTS_SUPER_ADMIN_NAV_GROUPS,
  ACCOUNTS_CLIENT_ADMIN_NAV_GROUPS,
  ACCOUNTS_SUPER_ADMIN_DEFAULT_EXPANDED,
  ACCOUNTS_CLIENT_ADMIN_DEFAULT_EXPANDED,
  ACCOUNTS_SUPER_ADMIN_GROUP_LABELS,
  ACCOUNTS_CLIENT_ADMIN_GROUP_LABELS,
  getAccountsNavItemsByRole,
  getAccountsNavGroupsByRole,
  getAccountsDefaultExpandedByRole,
  getAccountsGroupLabelsByRole,
  isAccountsRouteActive,
};