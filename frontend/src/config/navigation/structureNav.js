// config/navigation/structureNav.js
/**
 * Navigation Configuration - Structure Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the Structure app.
 * Supporting Super Admin, Client Admin, Structure Champion, Executive, Manager/Supervisor, Staff, and Read-Only.
 * Note: Main dashboard link is excluded as it is handled by the root dashboard navigation.
 */
import {
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
  FiTrendingUp,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge } from 'react-icons/bs';

import { STRUCTURE_ROUTES } from '../constants/structureRouteConstants';

// ============================================
// 1. SUPER ADMIN STRUCTURE NAV GROUPS (Platform Scope - Everything)
// ============================================
export const STRUCTURE_SUPER_ADMIN_NAV_GROUPS = {
  structure_units: [
    { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiFolder },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Units', icon: FiGrid },
  ],
  structure_workforce: [
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: BsBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, name: 'Transfer Employee', icon: FiPlus },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment', icon: FiUser },
  ],
  structure_reporting: [
    { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control', icon: FiUsers },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.MY_TEAM, name: 'My Team', icon: FiUsers },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree', icon: FiLayers },
  ],
  structure_admin: [
    { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, name: 'Structure Policy & Operations', icon: FiSliders },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Standards', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health Score', icon: FiActivity },
    { path: STRUCTURE_ROUTES.DASHBOARD_TRENDS, name: 'Structure Trends', icon: FiTrendingUp },
    { path: STRUCTURE_ROUTES.HEALTH, name: 'System Health Grid', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, name: 'Current Hierarchy', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Version History', icon: FiClock },
    { path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE, name: 'Capture Snapshot', icon: FiPlus },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Validate Hierarchy', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, name: 'Bulk Departments', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.BULK_EMPLOYMENTS, name: 'Bulk Employments', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.BULK_REPORTING, name: 'Bulk Reporting', icon: FiDatabase },
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
  ],
};

export const STRUCTURE_SUPER_ADMIN_GROUP_LABELS = {
  structure_units: '🏛️ Architecture Hierarchy',
  structure_workforce: '👥 Positions & Employments',
  structure_reporting: '🌿 Reporting & Charts',
  structure_admin: '🏢 Platform Administration',
};

export const STRUCTURE_SUPER_ADMIN_DEFAULT_EXPANDED = {
  structure_units: true,
  structure_workforce: true,
  structure_reporting: true,
  structure_admin: false,
};

// ============================================
// 2. CLIENT ADMIN STRUCTURE NAV GROUPS (IT / Tenant Admin Scope)
// ============================================
export const STRUCTURE_CLIENT_ADMIN_NAV_GROUPS = {
  structure_units: [
    { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiFolder },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Operational Units', icon: FiGrid },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart Visualizer', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree View', icon: FiLayers },
  ],
  structure_personnel: [
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions Directory', icon: BsBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments Directory', icon: BsPersonBadge },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, name: 'Transfer Employee', icon: FiPlus },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
  ],
  structure_resources: [
    { path: STRUCTURE_ROUTES.BULK_EMPLOYMENTS, name: 'Bulk Employee Onboarding', icon: FiUpload },
    { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, name: 'Bulk Department Setup', icon: FiUpload },
    { path: STRUCTURE_ROUTES.BULK_REPORTING, name: 'Bulk Reporting Import', icon: FiUpload },
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations & Offices', icon: FiMapPin },
  ],
  structure_reporting: [
    { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines Registry', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control Monitor', icon: FiBarChart2 },
  ],
  structure_governance: [
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health Score', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY, name: 'Hierarchy Versions', icon: FiClock },
    { path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE, name: 'Capture Snapshot', icon: FiPlus },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Validate Structure', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, name: 'Policy & System Settings', icon: FiSliders },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Standards', icon: FiLayers },
  ],
};

export const STRUCTURE_CLIENT_ADMIN_GROUP_LABELS = {
  structure_units: '🏢 Organizational Architecture',
  structure_personnel: '👥 Workforce & Onboarding',
  structure_resources: '💼 Resources & Bulk Provisioning',
  structure_reporting: '🌿 Reporting & Supervision',
  structure_governance: '⚙️ IT Governance & Settings',
};

export const STRUCTURE_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  structure_units: true,
  structure_personnel: true,
  structure_resources: true,
  structure_reporting: true,
  structure_governance: true,
};

// ============================================
// 3. EXECUTIVE / CEO STRUCTURE NAV GROUPS (Strategic Oversight Scope)
// ============================================
export const STRUCTURE_EXECUTIVE_NAV_GROUPS = {
  structure_analytics: [
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart Visualizer', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree View', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Business Divisions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Enterprise Departments', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Operational Sections', icon: FiFolder },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Operational Units', icon: FiGrid },
    { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
  ],
  structure_personnel: [
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Leadership Span of Control', icon: FiBarChart2 },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions & Headcount', icon: BsBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Workforce Directory', icon: BsPersonBadge },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Leadership Roles', icon: FiClock },
  ],
  structure_governance: [
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Center Allocations', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Global Locations', icon: FiMapPin },
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health Score', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Hierarchy Audit History', icon: FiClock },
  ],
};

export const STRUCTURE_EXECUTIVE_GROUP_LABELS = {
  structure_analytics: '🏛️ Organizational Architecture',
  structure_personnel: '👥 Workforce & Leadership Span',
  structure_governance: '🌍 Resources & Governance',
};

export const STRUCTURE_EXECUTIVE_DEFAULT_EXPANDED = {
  structure_analytics: true,
  structure_personnel: true,
  structure_governance: true,
};

// ============================================
// 4. CHAMPION / HR ADMIN STRUCTURE NAV GROUPS (Structure Champion & HR Scope)
// ============================================
export const STRUCTURE_CHAMPION_NAV_GROUPS = {
  structure_units: [
    { path: STRUCTURE_ROUTES.ORG_UNITS, name: 'Organizational Units', icon: FiLayers },
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiFolder },
    { path: STRUCTURE_ROUTES.UNITS, name: 'Operational Units', icon: FiGrid },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart Visualizer', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Org Tree View', icon: FiLayers },
  ],
  structure_personnel: [
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions Audit', icon: BsBriefcase },
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments Directory', icon: BsPersonBadge },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, name: 'Transfer Employee', icon: FiPlus },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Roles Audit', icon: FiClock },
  ],
  structure_resources: [
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations & Offices', icon: FiMapPin },
  ],
  structure_reporting: [
    { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control Monitor', icon: FiBarChart2 },
  ],
  structure_health: [
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, name: 'Structure Health Score', icon: FiActivity },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, name: 'Integrity Validator', icon: FiCheckCircle },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Hierarchy History', icon: FiClock },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, name: 'Reference Standards', icon: FiLayers },
  ],
};

export const STRUCTURE_CHAMPION_GROUP_LABELS = {
  structure_units: '🏛️ Organizational Architecture',
  structure_personnel: '👥 Workforce & Positions Audit',
  structure_resources: '💼 Cost Centers & Locations',
  structure_reporting: '🌿 Reporting & Span of Control',
  structure_health: '✅ Health & Governance',
};

export const STRUCTURE_CHAMPION_DEFAULT_EXPANDED = {
  structure_units: true,
  structure_personnel: true,
  structure_resources: true,
  structure_reporting: true,
  structure_health: true,
};

// ============================================
// 5. MANAGER / SUPERVISOR STRUCTURE NAV GROUPS (Team Leader Scope)
// ============================================
export const STRUCTURE_MANAGER_NAV_GROUPS = {
  my_structure: [
    { path: STRUCTURE_ROUTES.MY_TEAM, name: 'My Team Members', icon: FiUsers },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment Detail', icon: FiUser },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Team Span of Control', icon: FiBarChart2 },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, name: 'Interim Assignments', icon: FiClock },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Unit Positions', icon: FiBriefcase },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Department Org Tree', icon: FiPieChart },
  ],
};

export const STRUCTURE_MANAGER_GROUP_LABELS = {
  my_structure: '👥 Team & Reporting Structure',
};

export const STRUCTURE_MANAGER_DEFAULT_EXPANDED = {
  my_structure: true,
};

// ============================================
// 6. STAFF STRUCTURE NAV GROUPS (Individual Contributor Scope)
// ============================================
export const STRUCTURE_STAFF_NAV_GROUPS = {
  my_structure: [
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment Detail', icon: FiUser },
    { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.MY_TEAM, name: 'My Team & Peers', icon: FiUsers },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, name: 'Company Org Tree', icon: FiPieChart },
  ],
};

export const STRUCTURE_STAFF_GROUP_LABELS = {
  my_structure: '👤 My Employment & Hierarchy',
};

export const STRUCTURE_STAFF_DEFAULT_EXPANDED = {
  my_structure: true,
};

// ============================================
// 7. READ-ONLY STRUCTURE NAV GROUPS (Audit Scope)
// ============================================
export const STRUCTURE_READ_ONLY_NAV_GROUPS = {
  structure_views: [
    { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions (View)', icon: FiGitBranch },
    { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments (View)', icon: HiOutlineBuildingOffice },
    { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions Catalog (View)', icon: FiEye },
    { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers (View)', icon: FiDollarSign },
    { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations (View)', icon: FiMapPin },
    { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart (View)', icon: FiPieChart },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, name: 'Hierarchy History (View)', icon: FiClock },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, name: 'Span of Control (View)', icon: FiBarChart2 },
  ],
};

export const STRUCTURE_READ_ONLY_GROUP_LABELS = {
  structure_views: '👁️ Read-Only Views',
};

export const STRUCTURE_READ_ONLY_DEFAULT_EXPANDED = {
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
