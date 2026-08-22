// config/navigation/configNav.js
/**
 * Navigation Configuration - Configuration Subsystem Scoped
 * Dedicated module defining role-specific navigation groups and items for System Administration, Backups, DR & Maintenance.
 * Supporting Super Admin (Full Platform Control) and Client Admin (Organization Backups & Maintenance).
 */
import {
  FiGrid,
  FiHardDrive,
  FiShield,
  FiClock,
  FiBarChart2,
  FiKey,
  FiList,
  FiSettings,
  FiActivity,
  FiPieChart,
} from 'react-icons/fi';
import { MdBackup } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';

import { CONFIG_ROUTES } from '../../routes/config.routes';

// ============================================
// 1. SUPER ADMIN CONFIG NAV GROUPS (Platform Scope)
// ============================================
export const CONFIG_SUPER_ADMIN_NAV_GROUPS = {
  config_main: [
    { path: CONFIG_ROUTES.DASHBOARD, name: 'Config Overview', icon: FiGrid },
    { path: CONFIG_ROUTES.REGISTRY, name: 'App Registry', icon: FiGrid },
  ],
  config_disaster_recovery: [
    { path: CONFIG_ROUTES.DISASTER_RECOVERY, name: 'Disaster Recovery', icon: FiShield },
    { path: CONFIG_ROUTES.HEALTH, name: 'System Health Grid', icon: HiOutlineStatusOnline },
    { path: CONFIG_ROUTES.ENCRYPTION, name: 'Encryption Keys', icon: FiKey },
  ],
  config_operations: [
    { path: CONFIG_ROUTES.BACKUPS, name: 'Backup Jobs', icon: MdBackup },
    { path: CONFIG_ROUTES.MAINTENANCE, name: 'Maintenance Windows', icon: FiHardDrive },
    { path: CONFIG_ROUTES.SCHEDULES, name: 'Automated Schedules', icon: FiClock },
    { path: CONFIG_ROUTES.QUOTAS, name: 'Storage Quotas', icon: FiPieChart },
  ],
  config_audit_settings: [
    { path: CONFIG_ROUTES.AUDIT_LOGS, name: 'Config Audit Logs', icon: FiList },
    { path: CONFIG_ROUTES.SETTINGS, name: 'Platform Config Settings', icon: FiSettings },
  ],
};

export const CONFIG_SUPER_ADMIN_GROUP_LABELS = {
  config_main: '⚙️ Configuration & Registry',
  config_disaster_recovery: '🛡️ Resiliency & Health',
  config_operations: '💾 Backups & Maintenance',
  config_audit_settings: '📜 Audits & Settings',
};

export const CONFIG_SUPER_ADMIN_DEFAULT_EXPANDED = {
  config_main: true,
  config_disaster_recovery: true,
  config_operations: true,
  config_audit_settings: false,
};

// ============================================
// 2. CLIENT ADMIN CONFIG NAV GROUPS (Organization Scope)
// ============================================
export const CONFIG_CLIENT_ADMIN_NAV_GROUPS = {
  config_client_main: [
    { path: CONFIG_ROUTES.DASHBOARD, name: 'Config Summary', icon: FiGrid },
    { path: CONFIG_ROUTES.BACKUPS, name: 'Organization Backups', icon: MdBackup },
    { path: CONFIG_ROUTES.MAINTENANCE, name: 'Maintenance Schedules', icon: FiHardDrive },
  ],
};

export const CONFIG_CLIENT_ADMIN_GROUP_LABELS = {
  config_client_main: '⚙️ Backups & Maintenance',
};

export const CONFIG_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  config_client_main: true,
};

// ============================================
// HELPER FUNCTION TO CHECK IF CONFIG ROUTE IS ACTIVE
// ============================================
export const isConfigRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && path !== '/config' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  CONFIG_SUPER_ADMIN_NAV_GROUPS,
  CONFIG_SUPER_ADMIN_GROUP_LABELS,
  CONFIG_SUPER_ADMIN_DEFAULT_EXPANDED,
  CONFIG_CLIENT_ADMIN_NAV_GROUPS,
  CONFIG_CLIENT_ADMIN_GROUP_LABELS,
  CONFIG_CLIENT_ADMIN_DEFAULT_EXPANDED,
  isConfigRouteActive,
};
