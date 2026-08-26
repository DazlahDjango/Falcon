// config/navigation/structureNav.js
/**
 * Navigation Configuration - Structure Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the Structure app.
 * Supporting Super Admin, Client Admin, Structure Champion, Executive, Manager/Supervisor, Staff, and Read-Only.
 */
import {
  FiHome,
  FiGrid,
  FiLayers,
  FiUsers,
  FiBriefcase,
  FiGitBranch,
  FiDollarSign,
  FiMapPin,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiUpload,
  FiSettings,
  FiShield,
  FiEye,
  FiSliders,
  FiUser,
  FiCheckCircle,
  FiPlus,
  FiFolder,
  FiClock,
  FiDatabase,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge } from 'react-icons/bs';

import { STRUCTURE_ROUTES } from '../constants/structureRouteConstants';

// ============================================
// 1. SUPER ADMIN STRUCTURE NAV GROUPS (Platform Scope)
// ============================================
export const STRUCTURE_SUPER_ADMIN_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Platform Structure Overview', icon: FiHome },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiFolder },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Units', icon: FiGrid },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: BsBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment', icon: FiUser },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control', icon: FiUsers },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree', icon: FiLayers },
  ],
  structure_admin: [
    { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, name: 'Structure Policy & Operations', icon: FiSliders },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Standards', icon: FiLayers },
    { path: STRUCTURE_ROUTES.HEALTH, name: 'System Health Grid', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, name: 'Current Hierarchy', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Version History', icon: FiClock },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Validate Hierarchy', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, name: 'Bulk Departments', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.BULK_EMPLOYMENTS, name: 'Bulk Employments', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.BULK_REPORTING, name: 'Bulk Reporting', icon: FiDatabase },
  ],
};

export const STRUCTURE_SUPER_ADMIN_GROUP_LABELS = {
  structure_main: 'Main',
  structure_admin: '🏢 Structure Platform Admin',
};

export const STRUCTURE_SUPER_ADMIN_DEFAULT_EXPANDED = {
  structure_main: true,
  structure_admin: true,
};

// ============================================
// 2. CLIENT ADMIN STRUCTURE NAV GROUPS (Tenant Admin Scope)
// ============================================
export const STRUCTURE_CLIENT_ADMIN_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiGrid },
  ],
  structure_units: [
    { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: FiFolder },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiGrid },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Operational Units', icon: FiLayers },
  ],
  structure_personnel: [
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions Directory', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: FiUsers },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, name: 'Transfer Employee', icon: FiPlus },
  ],
  structure_reporting: [
    { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control', icon: FiBarChart2 },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
  ],
  structure_resources: [
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
  ],
  structure_hierarchy: [
    { path: STRUCTURE_ROUTES.HIERARCHY, name: 'Hierarchy Versions', icon: FiClock },
    { path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE, name: 'Capture Snapshot', icon: FiPlus },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Validate Structure', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart Visualizer', icon: FiPieChart },
  ],
  structure_bulk: [
    { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, name: 'Bulk Import Tools', icon: FiUpload },
  ],
};

export const STRUCTURE_CLIENT_ADMIN_GROUP_LABELS = {
  structure_main: 'Main',
  structure_units: '🏢 Organizational Architecture',
  structure_personnel: '👥 Positions & Employments',
  structure_reporting: '🌿 Reporting & Supervision',
  structure_resources: '💼 Financial & Locations',
  structure_hierarchy: '📜 Hierarchy & Versioning',
  structure_bulk: '⚡ Bulk Operations',
};

export const STRUCTURE_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  structure_main: true,
  structure_units: true,
  structure_personnel: true,
  structure_reporting: false,
  structure_resources: false,
  structure_hierarchy: false,
  structure_bulk: false,
};

// ============================================
// 3. EXECUTIVE STRUCTURE NAV GROUPS (Strategic Oversight Scope)
// ============================================
export const STRUCTURE_EXECUTIVE_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Executive Structure View', icon: FiGrid },
  ],
  structure_analytics: [
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Organization Chart', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Org Span of Control', icon: FiBarChart2 },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Hierarchy History', icon: FiClock },
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Center Allocations', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Global Locations', icon: FiMapPin },
  ],
};

export const STRUCTURE_EXECUTIVE_GROUP_LABELS = {
  structure_main: 'Main',
  structure_analytics: '📈 Strategic Architecture View',
};

export const STRUCTURE_EXECUTIVE_DEFAULT_EXPANDED = {
  structure_main: true,
  structure_analytics: true,
};

// ============================================
// 4. CHAMPION STRUCTURE NAV GROUPS (Structure Champion Scope)
// ============================================
export const STRUCTURE_CHAMPION_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Overview', icon: FiGrid },
  ],
  structure_health: [
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health Score', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Integrity Validator', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control Monitor', icon: FiBarChart2 },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart Visualizer', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Standards', icon: FiLayers },
  ],
};

export const STRUCTURE_CHAMPION_GROUP_LABELS = {
  structure_main: 'Main',
  structure_health: '✅ Health & Audit Oversight',
};

export const STRUCTURE_CHAMPION_DEFAULT_EXPANDED = {
  structure_main: true,
  structure_health: true,
};

// ============================================
// 5. MANAGER / SUPERVISOR STRUCTURE NAV GROUPS (Team Leader Scope)
// ============================================
export const STRUCTURE_MANAGER_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Manager Overview', icon: FiHome },
  ],
  my_structure: [
    { path: STRUCTURE_ROUTES.MY_TEAM, name: 'My Team Members', icon: FiUsers },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Unit Positions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree View', icon: FiPieChart },
  ],
};

export const STRUCTURE_MANAGER_GROUP_LABELS = {
  structure_main: 'Main',
  my_structure: '👥 Team & Reporting Structure',
};

export const STRUCTURE_MANAGER_DEFAULT_EXPANDED = {
  structure_main: true,
  my_structure: true,
};

// ============================================
// 6. STAFF STRUCTURE NAV GROUPS (Individual Contributor Scope)
// ============================================
export const STRUCTURE_STAFF_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure View', icon: FiHome },
  ],
  my_structure: [
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment Detail', icon: FiUser },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Company Org Tree', icon: FiPieChart },
  ],
};

export const STRUCTURE_STAFF_GROUP_LABELS = {
  structure_main: 'Main',
  my_structure: '👤 My Employment & Hierarchy',
};

export const STRUCTURE_STAFF_DEFAULT_EXPANDED = {
  structure_main: true,
  my_structure: true,
};

// ============================================
// 7. READ-ONLY STRUCTURE NAV GROUPS (Audit Scope)
// ============================================
export const STRUCTURE_READ_ONLY_NAV_GROUPS = {
  structure_main: [
    { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Overview', icon: FiHome },
  ],
  structure_views: [
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments (View)', icon: FiEye },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions Catalog (View)', icon: FiEye },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart (View)', icon: FiEye },
  ],
};

export const STRUCTURE_READ_ONLY_GROUP_LABELS = {
  structure_main: 'Main',
  structure_views: '👁️ Read-Only Views',
};

export const STRUCTURE_READ_ONLY_DEFAULT_EXPANDED = {
  structure_main: true,
  structure_views: true,
};

// ============================================
// HELPER FUNCTION
// ============================================
export const isStructureRouteActive = (path, currentPath) => {
  if (path === currentPath) return true;
  if (path !== '/' && path !== '/structure' && currentPath.startsWith(path)) return true;
  return false;
};

export default {
  STRUCTURE_SUPER_ADMIN_NAV_GROUPS,
  STRUCTURE_SUPER_ADMIN_GROUP_LABELS,
  STRUCTURE_SUPER_ADMIN_DEFAULT_EXPANDED,
  STRUCTURE_CLIENT_ADMIN_NAV_GROUPS,
  STRUCTURE_CLIENT_ADMIN_GROUP_LABELS,
  STRUCTURE_CLIENT_ADMIN_DEFAULT_EXPANDED,
  STRUCTURE_EXECUTIVE_NAV_GROUPS,
  STRUCTURE_EXECUTIVE_GROUP_LABELS,
  STRUCTURE_EXECUTIVE_DEFAULT_EXPANDED,
  STRUCTURE_CHAMPION_NAV_GROUPS,
  STRUCTURE_CHAMPION_GROUP_LABELS,
  STRUCTURE_CHAMPION_DEFAULT_EXPANDED,
  STRUCTURE_MANAGER_NAV_GROUPS,
  STRUCTURE_MANAGER_GROUP_LABELS,
  STRUCTURE_MANAGER_DEFAULT_EXPANDED,
  STRUCTURE_STAFF_NAV_GROUPS,
  STRUCTURE_STAFF_GROUP_LABELS,
  STRUCTURE_STAFF_DEFAULT_EXPANDED,
  STRUCTURE_READ_ONLY_NAV_GROUPS,
  STRUCTURE_READ_ONLY_GROUP_LABELS,
  STRUCTURE_READ_ONLY_DEFAULT_EXPANDED,
  isStructureRouteActive,
};
