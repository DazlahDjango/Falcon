import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { REVIEW_ROUTES } from '../../../config/constants/reviewRouteConstants';
import CollapsibleSidebar from './CollapsibleSidebar';
import {
  FiHome, FiShield, FiClock, FiAlertCircle, FiActivity, FiCheckCircle,
  FiPieChart, FiGrid, FiDatabase, FiFileText, FiTarget, FiBarChart2,
  FiDownload, FiSettings, FiBell, FiGitBranch, FiBriefcase, FiDollarSign,
  FiMapPin, FiLayers, FiTrendingUp, FiUsers, FiSliders, FiCalendar, FiFolder,
  FiStar, FiAward, FiFlag, FiMessageSquare
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3, BsPersonBadge } from 'react-icons/bs';

const ChampionSidebar = ({ currentTenant, ...props }) => {
  const expandedMenus = {
    main: true,
    oversight: true,
    kpiAdmin: false,
    kpiManagement: false,
    reviewGovernance: true,
    reviewExecution: false,
    structure: false,
    reports: false,
    settings: false
  };

  const navigation = {
    main: [
      { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
      { path: KPI_ROUTES.CHAMPION_DASHBOARD, name: 'KPI Overview', icon: FiPieChart },
      { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, name: 'Reviews Overview', icon: FiShield },
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
    reviewGovernance: [
      { path: REVIEW_ROUTES.RATING_SCALES, name: 'Rating Scales', icon: FiSliders },
      { path: REVIEW_ROUTES.COMPETENCIES, name: 'Competencies', icon: FiTarget },
      { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiFolder },
      { path: REVIEW_ROUTES.COEFFICIENTS, name: 'Rating Coefficients', icon: FiActivity },
      { path: REVIEW_ROUTES.REVIEW_TEMPLATES, name: 'Review Templates', icon: FiFileText },
    ],
    reviewExecution: [
      { path: REVIEW_ROUTES.REVIEW_CYCLES, name: 'Review Cycles', icon: FiCalendar },
      { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Review Queue', icon: FiCheckCircle },
      { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback', icon: FiMessageSquare },
      { path: REVIEW_ROUTES.CALIBRATION, name: 'Calibration Sessions', icon: MdGavel },
      { path: REVIEW_ROUTES.FINAL_RATINGS, name: 'Final Ratings', icon: FiStar },
      { path: REVIEW_ROUTES.PIPS, name: 'PIPs', icon: FiFlag },
      { path: REVIEW_ROUTES.PROMOTIONS, name: 'Promotions', icon: FiAward },
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
      { path: KPI_ROUTES.KPI_REPORTS, name: 'KPI Reports', icon: FiFileText },
      { path: REVIEW_ROUTES.REPORTS, name: 'Review Reports', icon: FiDownload },
      { path: KPI_ROUTES.ORGANIZATION_HEALTH, name: 'Organization Health', icon: FiActivity },
    ],
    settings: [
      { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
      { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiDatabase },
      { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
      { path: REVIEW_ROUTES.AUDIT_LOGS, name: 'Review Audit Logs', icon: FiShield },
    ]
  };

  const groupLabels = {
    main: 'Main',
    oversight: 'Oversight',
    kpiAdmin: 'KPI System Admin',
    kpiManagement: 'KPI Management',
    reviewGovernance: 'HR Review Governance',
    reviewExecution: 'Review Cycles & Calibration',
    structure: 'Organization Structure',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };

  return (
    <CollapsibleSidebar
      className="champion-sidebar"
      homePath={DASHBOARD_ROUTES.CHAMPION.OVERVIEW}
      badgeTitle={currentTenant?.name || 'Organization'}
      badgeSubtitle="HR Admin / Champion View"
      navigationGroups={navigation}
      groupLabels={groupLabels}
      defaultExpanded={expandedMenus}
      currentTenant={currentTenant}
      {...props}
    />
  );
};

export default ChampionSidebar;