import {
  FiPieChart,
  FiBriefcase,
  FiPackage,
  FiFolder,
  FiFileText,
  FiBarChart2,
  FiTrendingUp,
  FiSettings,
  FiShield,
  FiActivity,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiDatabase,
  FiServer,
  FiGrid,
  FiList,
  FiCalendar,
  FiBell,
  FiEye,
} from 'react-icons/fi';
import { MdOutlineDashboard } from 'react-icons/md';

import { KPI_ADMIN_ROUTES, KPI_ROUTES } from '../constants/kpiRouteConstants';
import { ROUTES } from '../constants';

// ============================================
// KPI ADMIN NAVIGATION ITEMS (Super Admin & Client Admin)
// ============================================
export const KPI_ADMIN_NAV_ITEMS = [
  { 
    path: KPI_ADMIN_ROUTES.OVERVIEW, 
    name: 'Admin Overview', 
    icon: FiPieChart,
    description: 'System-wide KPI statistics'
  },
  { 
    path: KPI_ADMIN_ROUTES.SECTORS, 
    name: 'Sectors', 
    icon: FiBriefcase,
    description: 'Manage business sectors'
  },
  { 
    path: KPI_ADMIN_ROUTES.FRAMEWORKS, 
    name: 'Frameworks', 
    icon: FiPackage,
    description: 'Manage KPI frameworks'
  },
  { 
    path: KPI_ADMIN_ROUTES.CATEGORIES, 
    name: 'Categories', 
    icon: FiFolder,
    description: 'Organize KPIs by category'
  },
  { 
    path: KPI_ADMIN_ROUTES.TEMPLATES, 
    name: 'Templates', 
    icon: FiFileText,
    description: 'Pre-built KPI templates'
  },
];


// ============================================
// KPI MANAGEMENT NAVIGATION
// ============================================
export const KPI_MANAGEMENT_NAV_ITEMS = [
  { 
    path: ROUTES.KPI_DASHBOARD, 
    name: 'My Dashboard', 
    icon: MdOutlineDashboard,
    description: 'Personal KPI overview'
  },
  { 
    path: ROUTES.KPI_MANAGEMENT, 
    name: 'All KPIs', 
    icon: FiTarget,
    description: 'Manage all KPIs'
  },
  { 
    path: ROUTES.KPI_MY_KPIS, 
    name: 'My KPIs', 
    icon: FiUsers,
    description: 'Your assigned KPIs'
  },
  { 
    path: ROUTES.KPI_VALIDATION, 
    name: 'Validations', 
    icon: FiCheckCircle,
    description: 'Pending validations'
  },
  { 
    path: ROUTES.TARGETS, 
    name: 'Targets', 
    icon: FiCalendar,
    description: 'Annual target management'
  },
  { 
    path: ROUTES.ACTUALS, 
    name: 'Actuals', 
    icon: FiActivity,
    description: 'Submit actual values'
  },
];

// ============================================
// KPI ANALYTICS NAVIGATION
// ============================================
export const KPI_ANALYTICS_NAV_ITEMS = [
  { 
    path: ROUTES.KPI_ANALYTICS, 
    name: 'Analytics Insights', 
    icon: FiTrendingUp,
    description: 'AI-powered insights'
  },
  { 
    path: ROUTES.KPI_REPORTS, 
    name: 'Reports', 
    icon: FiDownload,
    description: 'Generate custom reports'
  },
  { 
    path: ROUTES.KPI_HEATMAP, 
    name: 'Heatmap', 
    icon: FiGrid,
    description: 'Performance heatmap'
  },
  { 
    path: KPI_ROUTES.ORGANIZATION_HEALTH, 
    name: 'Organization Health', 
    icon: FiActivity,
    description: 'Overall health metrics'
  },
  { 
    path: KPI_ROUTES.SCORES, 
    name: 'Score Dashboard', 
    icon: FiBarChart2,
    description: 'View all scores'
  },
];

// ============================================
// KPI OPERATIONS NAVIGATION
// ============================================
export const KPI_OPERATIONS_NAV_ITEMS = [
  { 
    path: KPI_ROUTES.BULK_UPLOAD, 
    name: 'Bulk Upload', 
    icon: FiDatabase,
    description: 'Mass import data'
  },
  { 
    path: KPI_ROUTES.CALCULATIONS, 
    name: 'Calculations', 
    icon: FiServer,
    description: 'Trigger score calculations'
  },
  { 
    path: KPI_ROUTES.AUDIT_LOGS, 
    name: 'Audit Logs', 
    icon: FiList,
    description: 'View change history'
  },
  { 
    path: ROUTES.KPI_SETTINGS, 
    name: 'KPI Settings', 
    icon: FiSettings,
    description: 'System configuration'
  },
  { 
    path: KPI_ROUTES.REFERENCE_DATA, 
    name: 'Reference Data', 
    icon: FiDatabase,
    description: 'Users & departments'
  },
  { 
    path: KPI_ROUTES.NOTIFICATION_PREFERENCES, 
    name: 'Notifications', 
    icon: FiBell,
    description: 'Alert preferences'
  },
];

// ============================================
// KPI ADMIN NAVIGATION GROUP (For Super Admin & Client Admin)
// ============================================
export const KPI_ADMIN_NAV_GROUP = {
  name: 'KPI System Admin',
  icon: FiShield,
  items: KPI_ADMIN_NAV_ITEMS,
  defaultExpanded: false,
};

// ============================================
// KPI MANAGEMENT NAVIGATION GROUP
// ============================================
export const KPI_MANAGEMENT_NAV_GROUP = {
  name: 'KPI Management',
  icon: FiTarget,
  items: KPI_MANAGEMENT_NAV_ITEMS,
  defaultExpanded: true,
};

// ============================================
// KPI ANALYTICS NAVIGATION GROUP
// ============================================
export const KPI_ANALYTICS_NAV_GROUP = {
  name: 'Analytics & Reports',
  icon: FiTrendingUp,
  items: KPI_ANALYTICS_NAV_ITEMS,
  defaultExpanded: false,
};

// ============================================
// KPI OPERATIONS NAVIGATION GROUP
// ============================================
export const KPI_OPERATIONS_NAV_GROUP = {
  name: 'Operations',
  icon: FiSettings,
  items: KPI_OPERATIONS_NAV_ITEMS,
  defaultExpanded: false,
};

// ============================================
// COMPLETE KPI NAVIGATION GROUPS
// ============================================
export const KPI_NAV_GROUPS = {
  management: KPI_MANAGEMENT_NAV_GROUP,
  analytics: KPI_ANALYTICS_NAV_GROUP,
  operations: KPI_OPERATIONS_NAV_GROUP,
};

// ============================================
// FOR SUPER ADMIN - ADD KPI ADMIN GROUP
// ============================================
export const SUPER_ADMIN_KPI_GROUPS = {
  kpiAdmin: KPI_ADMIN_NAV_GROUP,
  kpiManagement: KPI_MANAGEMENT_NAV_GROUP,
  kpiAnalytics: KPI_ANALYTICS_NAV_GROUP,
  kpiOperations: KPI_OPERATIONS_NAV_GROUP,
};

// ============================================
// FOR CLIENT ADMIN - ADD KPI ADMIN GROUP
// ============================================
export const CLIENT_ADMIN_KPI_GROUPS = {
  kpiAdmin: KPI_ADMIN_NAV_GROUP,
  kpiManagement: KPI_MANAGEMENT_NAV_GROUP,
  kpiAnalytics: KPI_ANALYTICS_NAV_GROUP,
  kpiOperations: KPI_OPERATIONS_NAV_GROUP,
};

// ============================================
// EXPANDED STATES FOR KPI GROUPS
// ============================================
export const KPI_DEFAULT_EXPANDED = {
  management: true,
  analytics: false,
  operations: false,
};

export const SUPER_ADMIN_KPI_DEFAULT_EXPANDED = {
  kpiAdmin: false,
  kpiManagement: true,
  kpiAnalytics: false,
  kpiOperations: false,
};

export const CLIENT_ADMIN_KPI_DEFAULT_EXPANDED = {
  kpiAdmin: false,
  kpiManagement: true,
  kpiAnalytics: false,
  kpiOperations: false,
};

// ============================================
// GROUP LABELS
// ============================================
export const KPI_GROUP_LABELS = {
  kpiAdmin: 'KPI System Admin',
  kpiManagement: 'KPI Management',
  kpiAnalytics: 'Analytics & Reports',
  kpiOperations: 'Operations',
};

// ============================================
// HELPER FUNCTION TO CHECK IF ROUTE IS ACTIVE
// ============================================
export const isKpiRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  
  // Handle dynamic routes
  const patterns = [
    /^\/kpi\/detail\/[\w-]+$/,
    /^\/kpi\/edit\/[\w-]+$/,
    /^\/targets\/[\w-]+\/phasing$/,
    /^\/users\/[\w-]+\/kpis$/,
    /^\/users\/[\w-]+\/targets$/,
    /^\/users\/[\w-]+\/scores$/,
    /^\/users\/[\w-]+\/actuals$/,
  ];
  
  return patterns.some(pattern => pattern.test(currentPath));
};

// ============================================
// EXPORT ALL
// ============================================
export default {
  KPI_ADMIN_NAV_ITEMS,
  KPI_MANAGEMENT_NAV_ITEMS,
  KPI_ANALYTICS_NAV_ITEMS,
  KPI_OPERATIONS_NAV_ITEMS,
  KPI_ADMIN_NAV_GROUP,
  KPI_MANAGEMENT_NAV_GROUP,
  KPI_ANALYTICS_NAV_GROUP,
  KPI_OPERATIONS_NAV_GROUP,
  KPI_NAV_GROUPS,
  SUPER_ADMIN_KPI_GROUPS,
  CLIENT_ADMIN_KPI_GROUPS,
  KPI_DEFAULT_EXPANDED,
  SUPER_ADMIN_KPI_DEFAULT_EXPANDED,
  CLIENT_ADMIN_KPI_DEFAULT_EXPANDED,
  KPI_GROUP_LABELS,
  isKpiRouteActive,
};