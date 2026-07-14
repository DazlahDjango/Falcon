import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiBriefcase, FiUsers, FiUser, FiBarChart2, FiSettings,
  FiFileText, FiDownload, FiActivity, FiTrendingUp, FiPieChart,
  FiEye, FiMapPin, FiDollarSign, FiGitBranch
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3, BsPersonBadge } from 'react-icons/bs';

const ReadOnlySidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    views: true,
    structure: true,
    analytics: true,
    exports: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
    ],
    views: [
      { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Executive View', icon: FiBriefcase },
      { path: DASHBOARD_ROUTES.READ_ONLY.MANAGER_VIEW, name: 'Manager View', icon: FiUsers },
      { path: DASHBOARD_ROUTES.READ_ONLY.STAFF_VIEW, name: 'Staff View', icon: FiUser },
    ],
    structure: [
      { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
      { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
      { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
      { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
      { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
      { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
      { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
    ],
    analytics: [
      { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'KPIs & Metrics', icon: FiActivity },
      { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Trends', icon: FiTrendingUp },
      { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Comparisons', icon: FiPieChart },
    ],
    exports: [
      { path: DASHBOARD_ROUTES.READ_ONLY.EXPORTS, name: 'Export Data', icon: FiDownload },
      { path: DASHBOARD_ROUTES.READ_ONLY.EXPORTS, name: 'Reports', icon: FiFileText },
    ]
  };

  const groupLabels = {
    main: 'Main',
    views: 'Dashboard Views',
    structure: 'Organization Structure',
    analytics: 'Analytics',
    exports: 'Exports'
  };

  return (
    <CollapsibleSidebar
      className="read-only-sidebar"
      homePath={DASHBOARD_ROUTES.READ_ONLY.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="Read-Only Access"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    >
      {!props.isCollapsed && (
        <div className="readonly-badge">
          <FiEye size={14} />
          <span>Read-Only Mode</span>
        </div>
      )}
    </CollapsibleSidebar>
  );
};

export default ReadOnlySidebar;