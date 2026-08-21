// config/navigation/tenantNav.js
/**
 * Navigation Configuration - Tenant Subsystem Scoped
 * Defines all role-specific navigation groups and items for the Multi-Tenant Subsystem.
 * Tailored for Super Admin (Platform) and Client Admin (Organization).
 */
import {
  FiGrid,
  FiGlobe,
  FiLayers,
  FiLink,
  FiArrowDownRight,
  FiActivity,
  FiBarChart2,
  FiSettings,
  FiZap,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase,
  FiTrendingUp,
} from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';
import { Boxes } from 'lucide-react';
import { TENANT_ROUTES } from '../constants/tenantRouteConstants';

// ============================================
// 1. SUPER ADMIN TENANT NAV GROUPS (Platform Scope)
// ============================================
export const TENANT_SUPER_ADMIN_NAV_GROUPS = {
  tenant_main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Tenant Overview', icon: FiGrid },
    { path: TENANT_ROUTES.HEALTH, name: 'System Health', icon: FiActivity },
  ],
  tenant_organizations: [
    { path: TENANT_ROUTES.ORGANIZATIONS, name: 'All Organizations', icon: MdBusiness },
    { path: TENANT_ROUTES.ORGANIZATION_CREATE, name: 'Onboard Organization', icon: FiPlus },
    { path: TENANT_ROUTES.PROVISIONING, name: 'Provisioning Monitor', icon: Boxes },
    { path: TENANT_ROUTES.PROVISIONING_FAILED, name: 'Failed Pipelines', icon: FiAlertCircle },
  ],
  tenant_infrastructure: [
    { path: TENANT_ROUTES.DOMAINS, name: 'Custom Domains & SSL', icon: FiGlobe },
    { path: TENANT_ROUTES.SCHEMAS, name: 'Database Schemas', icon: FiLayers },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Connection Pools', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Schema Migrations', icon: FiArrowDownRight },
  ],
  tenant_resources: [
    { path: TENANT_ROUTES.RESOURCE_DASHBOARD, name: 'Resource Dashboard', icon: FiBarChart2 },
    { path: TENANT_ROUTES.RESOURCES, name: 'Quota Limits', icon: FiZap },
    { path: TENANT_ROUTES.RESOURCE_ANALYTICS, name: 'Usage Analytics', icon: FiTrendingUp },
  ],
  tenant_system: [
    { path: TENANT_ROUTES.SECTORS, name: 'Business Sectors', icon: FiBriefcase },
    { path: TENANT_ROUTES.SYSTEM_SETTINGS, name: 'Platform Settings', icon: FiSettings },
    { path: TENANT_ROUTES.HEALTH_ORGANIZATIONS, name: 'Tenant Health Grid', icon: FiCheckCircle },
  ],
};

export const TENANT_SUPER_ADMIN_GROUP_LABELS = {
  tenant_main: 'Main',
  tenant_organizations: '🏢 Organizations & Provisioning',
  tenant_infrastructure: '🏗️ Infrastructure & Isolation',
  tenant_resources: '⚡ Resource Quotas & Analytics',
  tenant_system: '⚙️ Platform & System Config',
};

export const TENANT_SUPER_ADMIN_DEFAULT_EXPANDED = {
  tenant_main: true,
  tenant_organizations: true,
  tenant_infrastructure: true,
  tenant_resources: false,
  tenant_system: false,
};

// ============================================
// 2. CLIENT ADMIN TENANT NAV GROUPS (Organization Scope)
// ============================================
export const TENANT_CLIENT_ADMIN_NAV_GROUPS = {
  tenant_main: [
    { path: TENANT_ROUTES.DASHBOARD, name: 'Dashboard', icon: FiGrid },
    { path: TENANT_ROUTES.ORGANIZATIONS, name: 'Organization Profile', icon: MdBusiness },
  ],
  tenant_domains: [
    { path: TENANT_ROUTES.DOMAINS, name: 'Custom Domains', icon: FiGlobe },
    { path: TENANT_ROUTES.DOMAIN_CREATE, name: 'Add Domain', icon: FiPlus },
  ],
  tenant_resources: [
    { path: TENANT_ROUTES.RESOURCE_DASHBOARD, name: 'Usage Dashboard', icon: FiBarChart2 },
    { path: TENANT_ROUTES.RESOURCES, name: 'Resource Quotas', icon: FiZap },
  ],
  tenant_database: [
    { path: TENANT_ROUTES.SCHEMAS, name: 'Schema Info', icon: FiLayers },
    { path: TENANT_ROUTES.CONNECTIONS, name: 'Database Connections', icon: FiLink },
    { path: TENANT_ROUTES.MIGRATIONS, name: 'Schema Migrations', icon: FiArrowDownRight },
    { path: TENANT_ROUTES.HEALTH, name: 'Health Status', icon: FiActivity },
  ],
  tenant_settings: [
    { path: TENANT_ROUTES.SETTINGS, name: 'Organization Settings', icon: FiSettings },
  ],
};

export const TENANT_CLIENT_ADMIN_GROUP_LABELS = {
  tenant_main: 'Main',
  tenant_domains: '🌐 Domains & SSL',
  tenant_resources: '⚡ Resource Usage',
  tenant_database: '🗄️ Database & Health',
  tenant_settings: '⚙️ Organization Settings',
};

export const TENANT_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  tenant_main: true,
  tenant_domains: true,
  tenant_resources: true,
  tenant_database: false,
  tenant_settings: false,
};

// ============================================
// HELPER FUNCTION TO CHECK IF TENANT ROUTE IS ACTIVE
// ============================================
export const isTenantRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && path !== '/tenant' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  TENANT_SUPER_ADMIN_NAV_GROUPS,
  TENANT_SUPER_ADMIN_GROUP_LABELS,
  TENANT_SUPER_ADMIN_DEFAULT_EXPANDED,
  TENANT_CLIENT_ADMIN_NAV_GROUPS,
  TENANT_CLIENT_ADMIN_GROUP_LABELS,
  TENANT_CLIENT_ADMIN_DEFAULT_EXPANDED,
  isTenantRouteActive,
};
