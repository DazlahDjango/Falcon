import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiGrid, FiUsers, FiTrendingUp, FiPieChart, FiAlertCircle,
  FiTarget, FiActivity, FiAward, FiFileText, FiDownload, FiSettings,
  FiBell, FiBriefcase, FiDollarSign, FiMapPin, FiGitBranch, FiLayers
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3 } from 'react-icons/bs';

const ExecutiveSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    performance: true,
    organization: true,
    structure: false,
    reports: true,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
      { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, name: 'Departments', icon: FiGrid },
      { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, name: 'Organization', icon: FiUsers },
    ],
    performance: [
      { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, name: 'KPIs & Trends', icon: FiTrendingUp },
      { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, name: 'Comparisons', icon: FiPieChart },
      { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, name: 'Alerts', icon: FiAlertCircle },
      { path: KPI_ROUTES.KPI_ANALYTICS, name: 'Analytics Insights', icon: FiActivity },
      { path: '/organization-health', name: 'Organization Health', icon: FiAward },
    ],
    organization: [
      { path: KPI_ROUTES.TARGETS, name: 'Targets Overview', icon: FiTarget },
      { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiBarChart2 },
      { path: KPI_ROUTES.AGGREGATED_SCORES_DEPARTMENTS, name: 'Department Scores', icon: FiGrid },
      { path: KPI_ROUTES.AGGREGATED_SCORES_RANKING, name: 'Department Ranking', icon: FiAward },
    ],
    structure: [
      { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
      { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
      { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
      { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: FiUsers },
      { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
      { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
      { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
      { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, name: 'Hierarchy', icon: FiLayers },
    ],
    reports: [
      { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, name: 'Reports', icon: FiFileText },
      { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, name: 'Exports', icon: FiDownload },
      { path: KPI_ROUTES.KPI_REPORTS, name: 'Custom Reports', icon: FiFileText },
    ],
    settings: [
      { path: DASHBOARD_ROUTES.EXECUTIVE.SETTINGS, name: 'Settings', icon: FiSettings },
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
    ]
  };

  const groupLabels = {
    main: 'Main',
    performance: 'Performance Analytics',
    organization: 'Organization Performance',
    structure: 'Organization Structure',
    reports: 'Reports & Exports',
    settings: 'Settings'
  };

  return (
    <CollapsibleSidebar
      className="executive-sidebar"
      homePath={DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="Executive View"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    />
  );
};

export default ExecutiveSidebar;