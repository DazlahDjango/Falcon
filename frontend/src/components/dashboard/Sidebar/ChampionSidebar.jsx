import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiShield, FiClock, FiAlertCircle, FiActivity, FiCheckCircle,
  FiPieChart, FiGrid, FiDatabase, FiFileText, FiTarget, FiBarChart2,
  FiDownload, FiSettings, FiBell, FiGitBranch, FiBriefcase, FiDollarSign,
  FiMapPin, FiLayers, FiTrendingUp, FiUsers
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3, BsPersonBadge } from 'react-icons/bs';

const ChampionSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    oversight: true,
    kpiAdmin: false,
    kpiManagement: false,
    structure: false,
    reports: false,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
      { path: KPI_ROUTES.CHAMPION_DASHBOARD, name: 'KPI Overview', icon: FiPieChart },
    ],
    oversight: [
      { path: KPI_ROUTES.VALIDATIONS, name: 'Validations Queue', icon: FiCheckCircle },
      { path: KPI_ROUTES.ESCALATIONS, name: 'Escalations', icon: FiAlertCircle },
    ],
    kpiAdmin: [
      { path: KPI_ADMIN_ROUTES.OVERVIEW, name: 'KPI Admin Overview', icon: FiPieChart },
      { path: KPI_ADMIN_ROUTES.CATEGORIES, name: 'Categories', icon: FiFileText },
    ],
    kpiManagement: [
      { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'All KPIs', icon: FiTarget },
      { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiUsers },
      { path: KPI_ROUTES.TARGETS, name: 'Targets', icon: FiBarChart2 },
      { path: KPI_ROUTES.ACTUALS, name: 'Actuals', icon: FiCheckCircle },
      { path: KPI_ROUTES.BULK_UPLOAD, name: 'Bulk Upload', icon: FiDownload },
    ],
    structure: [
      { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
      { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
      { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiLayers },
      { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
      { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
      { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
      { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
      { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
    ],
    reports: [
      { path: KPI_ROUTES.KPI_ANALYTICS, name: 'Analytics Insights', icon: FiTrendingUp },
      { path: KPI_ROUTES.KPI_REPORTS, name: 'Reports', icon: FiFileText },
      { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
    ],
    settings: [
      { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
      { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiDatabase },
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
    ]
  };

  const groupLabels = {
    main: 'Main',
    oversight: 'Oversight',
    kpiAdmin: 'KPI System Admin',
    kpiManagement: 'KPI Management',
    structure: 'Organization Structure',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };

  return (
    <CollapsibleSidebar
      className="champion-sidebar"
      homePath={DASHBOARD_ROUTES.CHAMPION.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="Champion View"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    />
  );
};

export default ChampionSidebar;