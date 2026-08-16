import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiBarChart2, FiTarget, FiTrendingUp, FiFileText,
  FiCheckCircle, FiClock, FiAlertCircle, FiBriefcase,
  FiGitBranch, FiAward, FiCalendar, FiSettings, FiBell
} from 'react-icons/fi';
import { BsPersonBadge } from 'react-icons/bs';

const StaffSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    performance: true,
    tasks: true,
    structure: false,
    history: false,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
      { path: KPI_ROUTES.DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2 },
    ],
    performance: [
      { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiTarget },
      { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Scores', icon: FiTrendingUp },
      { path: KPI_ROUTES.SCORE_STATISTICS, name: 'Performance Stats', icon: FiBarChart2 },
      { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'Mission Status', icon: FiFileText },
    ],
    tasks: [
      { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Actuals', icon: FiCheckCircle },
      { path: KPI_ROUTES.ACTUALS, name: 'My Submissions', icon: FiClock },
      { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alerts', icon: FiAlertCircle },
    ],
    structure: [
      { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, name: 'My Employment', icon: BsPersonBadge },
      { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
      { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
      { path: STRUCTURE_ROUTES.MY_CHAIN, name: 'My Reporting Chain', icon: FiGitBranch },
    ],
    history: [
      { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'Performance History', icon: FiAward },
      { path: KPI_ROUTES.ACTUAL_HISTORY, name: 'Past Submissions', icon: FiCalendar },
    ],
    settings: [
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Preferences', icon: FiSettings },
      { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference', icon: FiBell },
      { path: ACCOUNTS_ROUTES.MY_SETTINGS, name: 'My Settings', icon: FiSettings },
    ]
  };

  const groupLabels = {
    main: 'Main',
    performance: 'My Performance',
    tasks: 'Tasks & Submissions',
    structure: 'Organization',
    history: 'History',
    settings: 'Settings'
  };

  return (
    <CollapsibleSidebar
      className="staff-sidebar"
      homePath={DASHBOARD_ROUTES.STAFF.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="Staff View"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    />
  );
};

export default StaffSidebar;