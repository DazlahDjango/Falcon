import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiGrid, FiUsers, FiTrendingUp, FiPieChart, FiAlertCircle,
  FiTarget, FiActivity, FiAward, FiFileText, FiDownload, FiSettings,
  FiBell, FiBriefcase, FiDollarSign, FiMapPin, FiGitBranch, FiLayers, FiBarChart2
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3 } from 'react-icons/bs';

const ExecutiveSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    strategicTargets: true,
    performanceBI: true,
    structure: false,
    reports: true,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, name: 'Executive Overview', icon: FiHome, end: true },
      { path: KPI_ROUTES.EXECUTIVE_DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2 },
      { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiAward },
    ],
    kpiLibrary: [
      { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'KPI Library', icon: FiTarget },
      { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiTarget },
    ],
    strategicTargets: [
      { path: KPI_ROUTES.TARGETS, name: 'Annual Targets', icon: FiTarget },
      { path: KPI_ROUTES.TARGET_CASCADE, name: 'Target Cascade Map', icon: FiGitBranch },
    ],
    performanceBI: [
      { path: KPI_ROUTES.AGGREGATED_SCORES_RANKING, name: 'Department Rankings', icon: FiAward },
      { path: KPI_ROUTES.AGGREGATED_SCORES_DEPARTMENTS, name: 'Department Scores', icon: FiGrid },
      { path: KPI_ROUTES.KPI_ANALYTICS, name: 'Analytics Insights', icon: FiActivity },
      { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alerts Oversight', icon: FiAlertCircle },
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
      { path: KPI_ROUTES.KPI_REPORTS, name: 'Performance Reports', icon: FiFileText },
    ],
    settings: [
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
      { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    ]
  };

  const groupLabels = {
    main: 'Main',
    kpiLibrary: '📚 KPI Library',
    strategicTargets: '🎯 Strategic Targets',
    performanceBI: '📈 Performance BI & Heatmaps',
    structure: '🏛️ Organization Structure',
    reports: '📑 Executive Reports',
    settings: '⚙️ Settings'
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