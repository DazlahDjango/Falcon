// config/navigation/reviewsNav.js
/**
 * Navigation Configuration - Reviews Subsystem Scoped
 * Organizes all role-specific navigation items into clean, phase-ordered sections.
 * Supporting Super Admin, Client Admin, Executive, Manager/Supervisor, Staff Employee, Champion, and Read-Only.
 */
import {
  FiStar,
  FiCalendar,
  FiUserCheck,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiUpload,
  FiSettings,
  FiLayers,
  FiBarChart2,
  FiGrid,
  FiUser,
  FiPlus,
  FiClock,
  FiShield,
  FiEye,
  FiTrendingUp,
  FiAward,
  FiRotateCcw,
  FiShare2,
  FiSliders,
  FiBell,
} from 'react-icons/fi';

import { DASHBOARD_ROUTES } from '../constants/dashboardRouteConstants';
import { REVIEW_ROUTES } from '../constants/reviewRouteConstants';

// ============================================
// 1. SUPER ADMIN REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_SUPER_ADMIN_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, name: 'Reviews Overview', icon: FiStar, end: true },
  ],
  reviews_phase1_foundation: [
    { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
    { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiAward },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiLayers },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, name: 'Review Templates', icon: FiFileText },
    { path: REVIEW_ROUTES.COEFFICIENTS_LIST, name: 'Score Coefficients', icon: FiSliders },
  ],
  reviews_phase2_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_CREATE, name: 'Create Review Cycle', icon: FiPlus },
  ],
  reviews_phase3_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_TEAM, name: 'Team Self-Assessments', icon: FiUsers },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, name: 'Self-Assessment Records', icon: FiFileText },
  ],
  reviews_phase4_supervisor: [
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Appraisal Review Queue', icon: FiCheckCircle },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST, name: 'Submitted Appraisals', icon: FiFileText },
  ],
  reviews_phase5_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
    { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, name: 'Outlier Detector', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Requests', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY, name: 'Feedback Summaries', icon: FiFileText },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Performance Plans (PIP)', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotions & Mobility', icon: FiTrendingUp },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_EXPORT, name: 'Export Reports', icon: FiUpload },
    { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'Subsystem Settings', icon: FiSettings },
    { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notification Rules', icon: FiClock },
    { path: REVIEW_ROUTES.AUDIT_LOGS, name: 'Audit History', icon: FiShield },
  ],
};

export const REVIEWS_SUPER_ADMIN_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase1_foundation: 'Setup & Rubric',
  reviews_phase2_cycles: 'Cycle Management',
  reviews_phase3_self: 'Self-Assessments',
  reviews_phase4_supervisor: 'Manager Appraisals',
  reviews_phase5_calibration: '360 Feedback & Calibration',
  reviews_phase6_outcomes: 'Final Ratings & PIPs',
  reviews_reports_admin: 'Analytics & Settings',
};

export const REVIEWS_SUPER_ADMIN_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase1_foundation: true,
  reviews_phase2_cycles: true,
  reviews_phase3_self: false,
  reviews_phase4_supervisor: false,
  reviews_phase5_calibration: false,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 2. CLIENT ADMIN REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_CLIENT_ADMIN_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, name: 'Reviews Overview', icon: FiStar, end: true },
  ],
  reviews_phase1_foundation: [
    { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
    { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiAward },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiLayers },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, name: 'Review Templates', icon: FiFileText },
    { path: REVIEW_ROUTES.COEFFICIENTS_LIST, name: 'Score Coefficients', icon: FiSliders },
  ],
  reviews_phase2_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_CREATE, name: 'Create Review Cycle', icon: FiPlus },
  ],
  reviews_phase3_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_TEAM, name: 'Team Self-Assessments', icon: FiUsers },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, name: 'Self-Assessment Records', icon: FiFileText },
  ],
  reviews_phase4_supervisor: [
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Appraisal Review Queue', icon: FiCheckCircle },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST, name: 'Submitted Appraisals', icon: FiFileText },
  ],
  reviews_phase5_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
    { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, name: 'Outlier Detector', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Requests', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY, name: 'Feedback Summaries', icon: FiFileText },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Performance Plans (PIP)', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotions & Mobility', icon: FiTrendingUp },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_EXPORT, name: 'Export Data', icon: FiUpload },
    { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'Subsystem Settings', icon: FiSettings },
    { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notification Rules', icon: FiClock },
  ],
};

export const REVIEWS_CLIENT_ADMIN_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase1_foundation: 'Setup & Rubric',
  reviews_phase2_cycles: 'Cycle Management',
  reviews_phase3_self: 'Self-Assessments',
  reviews_phase4_supervisor: 'Manager Appraisals',
  reviews_phase5_calibration: '360 Feedback & Calibration',
  reviews_phase6_outcomes: 'Final Ratings & PIPs',
  reviews_reports_admin: 'Reports & Settings',
};

export const REVIEWS_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase1_foundation: true,
  reviews_phase2_cycles: true,
  reviews_phase3_self: false,
  reviews_phase4_supervisor: false,
  reviews_phase5_calibration: false,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 3. EXECUTIVE REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_EXECUTIVE_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE, name: 'Executive Overview', icon: FiStar, end: true },
  ],
  reviews_phase2_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REPORTS_CYCLE, name: 'Cycle Performance Report', icon: FiBarChart2 },
  ],
  reviews_phase3_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_TEAM, name: 'Department Self-Assessments', icon: FiUsers },
  ],
  reviews_phase5_calibration: [
    { path: REVIEW_ROUTES.REPORTS_CALIBRATION, name: 'Calibration Summary Report', icon: FiCheckCircle },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Score Distribution', icon: FiBarChart2 },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotion Recommendations', icon: FiTrendingUp },
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Department PIPs', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.REPORTS_PIP, name: 'PIP Analytics Report', icon: FiFileText },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Executive Analytics Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_TEAM, name: 'Team Summary Report', icon: FiUsers },
  ],
};

export const REVIEWS_EXECUTIVE_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase2_cycles: 'Performance Cycles',
  reviews_phase3_self: 'Self-Assessments',
  reviews_phase5_calibration: 'Calibration & Oversight',
  reviews_phase6_outcomes: 'Final Ratings & Mobility',
  reviews_reports_admin: 'Executive Analytics',
};

export const REVIEWS_EXECUTIVE_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase2_cycles: true,
  reviews_phase3_self: false,
  reviews_phase5_calibration: false,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 4. MANAGER / SUPERVISOR REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_MANAGER_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR, name: 'Manager Overview', icon: FiStar, end: true },
  ],
  reviews_phase3_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_TEAM, name: 'Team Self-Assessments', icon: FiUsers },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, name: 'Self-Assessment Records', icon: FiFileText },
  ],
  reviews_phase4_supervisor: [
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Review Queue', icon: FiCheckCircle },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST, name: 'Submitted Reviews', icon: FiFileText },
  ],
  reviews_phase5_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Queue', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_REQUEST_CREATE, name: 'Request 360 Feedback', icon: FiPlus },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_TEAM, name: 'Team Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.PIPS_TEAM, name: 'Direct Reports PIPs', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PIPS_CREATE, name: 'Initiate PIP', icon: FiPlus },
    { path: REVIEW_ROUTES.PROMOTIONS_CREATE, name: 'Recommend Promotion', icon: FiPlus },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotion History', icon: FiTrendingUp },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS_TEAM, name: 'Team Performance Report', icon: FiFileText },
  ],
};

export const REVIEWS_MANAGER_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase3_self: 'Team Self-Assessments',
  reviews_phase4_supervisor: 'Appraisal Queue',
  reviews_phase5_calibration: '360 Feedback & Calibration',
  reviews_phase6_outcomes: 'Team Ratings & Mobility',
  reviews_reports_admin: 'Team Analytics',
};

export const REVIEWS_MANAGER_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase3_self: true,
  reviews_phase4_supervisor: true,
  reviews_phase5_calibration: false,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 5. STAFF EMPLOYEE REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_STAFF_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF, name: 'My Reviews Dashboard', icon: FiStar, end: true },
  ],
  reviews_phase3_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, name: 'Self-Assessment History', icon: FiFileText },
  ],
  reviews_phase5_calibration: [
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: 'Assigned 360 Feedback', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY_MY, name: 'My Feedback Summary', icon: FiFileText },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_MY, name: 'My Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.PIPS_MY, name: 'My Improvement Plan', icon: FiAlertTriangle },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.NOTIFICATIONS, name: 'Notifications & Alerts', icon: FiBell },
  ],
};

export const REVIEWS_STAFF_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase3_self: 'My Self-Assessment',
  reviews_phase5_calibration: '360 Peer Feedback',
  reviews_phase6_outcomes: 'Final Ratings & Growth',
  reviews_reports_admin: 'Alerts & Updates',
};

export const REVIEWS_STAFF_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase3_self: true,
  reviews_phase5_calibration: false,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 6. CHAMPION REVIEWS NAV GROUPS (Operational Oversight)
// ============================================
export const REVIEWS_CHAMPION_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD, name: 'Reviews Champion Summary', icon: FiStar, end: true },
  ],
  reviews_phase2_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  ],
  reviews_phase6_outcomes: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings Overview', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Active PIPs', icon: FiAlertTriangle },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reporting Center', icon: FiFileText },
  ],
};

export const REVIEWS_CHAMPION_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase2_cycles: 'Review Cycles',
  reviews_phase6_outcomes: 'Evaluations & PIPs',
  reviews_reports_admin: 'Reports Center',
};

export const REVIEWS_CHAMPION_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase2_cycles: true,
  reviews_phase6_outcomes: false,
  reviews_reports_admin: false,
};

// ============================================
// 7. READ-ONLY REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_READ_ONLY_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD, name: 'Reviews Overview', icon: FiStar, end: true },
  ],
  reviews_phase2_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  ],
  reviews_reports_admin: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Summary', icon: FiFileText },
  ],
};

export const REVIEWS_READ_ONLY_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_phase2_cycles: 'Review Cycles',
  reviews_reports_admin: 'Reports',
};

export const REVIEWS_READ_ONLY_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_phase2_cycles: true,
  reviews_reports_admin: false,
};

// ============================================
// HELPER FUNCTION: Check if route is in Reviews subsystem
// ============================================
export const isReviewsRouteActive = (pathname) => {
  if (!pathname) return false;
  return pathname.startsWith('/reviews');
};

export default {
  REVIEWS_SUPER_ADMIN_NAV_GROUPS,
  REVIEWS_SUPER_ADMIN_GROUP_LABELS,
  REVIEWS_SUPER_ADMIN_DEFAULT_EXPANDED,
  REVIEWS_CLIENT_ADMIN_NAV_GROUPS,
  REVIEWS_CLIENT_ADMIN_GROUP_LABELS,
  REVIEWS_CLIENT_ADMIN_DEFAULT_EXPANDED,
  REVIEWS_EXECUTIVE_NAV_GROUPS,
  REVIEWS_EXECUTIVE_GROUP_LABELS,
  REVIEWS_EXECUTIVE_DEFAULT_EXPANDED,
  REVIEWS_MANAGER_NAV_GROUPS,
  REVIEWS_MANAGER_GROUP_LABELS,
  REVIEWS_MANAGER_DEFAULT_EXPANDED,
  REVIEWS_STAFF_NAV_GROUPS,
  REVIEWS_STAFF_GROUP_LABELS,
  REVIEWS_STAFF_DEFAULT_EXPANDED,
  REVIEWS_CHAMPION_NAV_GROUPS,
  REVIEWS_CHAMPION_GROUP_LABELS,
  REVIEWS_CHAMPION_DEFAULT_EXPANDED,
  REVIEWS_READ_ONLY_NAV_GROUPS,
  REVIEWS_READ_ONLY_GROUP_LABELS,
  REVIEWS_READ_ONLY_DEFAULT_EXPANDED,
  isReviewsRouteActive,
};
