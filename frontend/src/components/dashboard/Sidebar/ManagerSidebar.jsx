import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiUsers, FiUserCheck, FiBarChart2, FiTrendingUp, FiTarget,
  FiClock, FiCheckCircle, FiFileText, FiAlertCircle, FiBriefcase,
  FiDollarSign, FiMapPin, FiSettings, FiBell, FiGitBranch
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsPersonBadge, BsDiagram3 } from 'react-icons/bs';

const ManagerSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    team: true,
    approvals: true,
    structure: false,
    reports: false,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
      { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'Team Dashboard', icon: FiUsers },
    ],
    team: [
      { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'My Team', icon: FiUserCheck },
      { path: DASHBOARD_ROUTES.MANAGER.TEAM_PERFORMANCE, name: 'Team Performance', icon: FiBarChart2 },
      { path: KPI_ROUTES.SCORE_TEAM_SCORES, name: 'Team Scores', icon: FiTrendingUp },
      { path: KPI_ROUTES.USER_TARGETS(':userId'), name: 'Team Targets', icon: FiTarget },
    ],
    approvals: [
      { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, name: 'Pending Approvals', icon: FiClock },
      { path: KPI_ROUTES.VALIDATIONS_PENDING, name: 'Pending Validations', icon: FiCheckCircle },
      { path: KPI_ROUTES.VALIDATIONS_HISTORY, name: 'Validation History', icon: FiFileText },
      { path: KPI_ROUTES.ESCALATIONS, name: 'Escalations', icon: FiAlertCircle },
    ],
    structure: [
      { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
      { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
      { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
      { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
      { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
      { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
    ],
    reports: [
      { path: DASHBOARD_ROUTES.MANAGER.REPORTS, name: 'Team Reports', icon: FiFileText },
      { path: DASHBOARD_ROUTES.MANAGER.EXPORTS, name: 'Exports', icon: FiFileText },
      { path: KPI_ROUTES.KPI_REPORTS, name: 'Performance Reports', icon: FiBarChart2 },
    ],
    settings: [
      { path: DASHBOARD_ROUTES.MANAGER.SETTINGS, name: 'Settings', icon: FiSettings },
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
    ]
  };

  const groupLabels = {
    main: 'Main',
    team: 'Team Management',
    approvals: 'Approvals & Validations',
    structure: 'Organization Structure',
    reports: 'Reports & Exports',
    settings: 'Settings'
  };

  return (
    <CollapsibleSidebar
      className="manager-sidebar"
      homePath={DASHBOARD_ROUTES.MANAGER.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="Manager View"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    />
  );
};

export default ManagerSidebar;