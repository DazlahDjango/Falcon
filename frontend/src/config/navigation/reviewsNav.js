// config/navigation/reviewsNav.js
/**
 * Navigation Configuration - Reviews Subsystem Scoped
 * Dedicated module defining all role-specific navigation items for the Performance Reviews app.
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
  reviews_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_CREATE, name: 'Create Review Cycle', icon: FiPlus },
  ],
  reviews_templates: [
    { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
    { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiAward },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiLayers },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, name: 'Review Templates', icon: FiFileText },
  ],
  reviews_evaluations: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.COEFFICIENTS_LIST, name: 'Scaling Coefficients', icon: FiSliders },
  ],
  reviews_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
    { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, name: 'Outlier Detector', icon: FiAlertTriangle },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Performance Plans (PIP)', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotions', icon: FiTrendingUp },
  ],
  reviews_feedback: [
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Requests', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY, name: 'Feedback Summaries', icon: FiFileText },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_EXPORT, name: 'Export Reports', icon: FiUpload },
  ],
  reviews_settings: [
    { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'Reviews Subsystem Settings', icon: FiSettings },
    { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notification Rules', icon: FiClock },
    { path: REVIEW_ROUTES.AUDIT_LOGS, name: 'Audit History', icon: FiShield },
  ],
};

export const REVIEWS_SUPER_ADMIN_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_cycles: '🔄 Cycle Management',
  reviews_templates: '📋 Templates & Competencies',
  reviews_evaluations: '⭐ Evaluation & Scoring',
  reviews_calibration: '⚖️ Calibration & Outliers',
  reviews_pips: '📈 PIP & Talent Mobility',
  reviews_feedback: '🔄 360-Degree Feedback',
  reviews_reports: '📊 Analytics & Export',
  reviews_settings: '⚙️ Settings & Audit',
};

export const REVIEWS_SUPER_ADMIN_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_cycles: true,
  reviews_templates: false,
  reviews_evaluations: false,
  reviews_calibration: false,
  reviews_pips: false,
  reviews_feedback: false,
  reviews_reports: false,
  reviews_settings: false,
};

// ============================================
// 2. CLIENT ADMIN REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_CLIENT_ADMIN_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, name: 'Reviews Overview', icon: FiStar, end: true },
  ],
  reviews_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_CREATE, name: 'Create Cycle', icon: FiPlus },
  ],
  reviews_templates: [
    { path: REVIEW_ROUTES.RATING_SCALES_LIST, name: 'Rating Scales', icon: FiSliders },
    { path: REVIEW_ROUTES.COMPETENCIES_LIST, name: 'Competencies', icon: FiAward },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, name: 'Competency Categories', icon: FiLayers },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, name: 'Review Templates', icon: FiFileText },
  ],
  reviews_evaluations: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.COEFFICIENTS_LIST, name: 'Scaling Coefficients', icon: FiSliders },
  ],
  reviews_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
    { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, name: 'Outlier Detector', icon: FiAlertTriangle },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Performance Plans (PIP)', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotions', icon: FiTrendingUp },
  ],
  reviews_feedback: [
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Requests', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY, name: 'Feedback Summaries', icon: FiFileText },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_EXPORT, name: 'Export Data', icon: FiUpload },
  ],
  reviews_settings: [
    { path: REVIEW_ROUTES.SYSTEM_SETTINGS, name: 'Subsystem Settings', icon: FiSettings },
    { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notification Rules', icon: FiClock },
  ],
};

export const REVIEWS_CLIENT_ADMIN_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_cycles: '🔄 Review Cycles',
  reviews_templates: '📋 Templates & Taxonomy',
  reviews_evaluations: '⭐ Ratings & Scoring',
  reviews_calibration: '⚖️ Calibration',
  reviews_pips: '📈 PIP & Mobility',
  reviews_feedback: '🔄 360 Feedback',
  reviews_reports: '📊 Reports & Analytics',
  reviews_settings: '⚙️ Settings',
};

export const REVIEWS_CLIENT_ADMIN_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_cycles: true,
  reviews_templates: false,
  reviews_evaluations: false,
  reviews_calibration: false,
  reviews_pips: false,
  reviews_feedback: false,
  reviews_reports: false,
  reviews_settings: false,
};

// ============================================
// 3. EXECUTIVE REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_EXECUTIVE_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE, name: 'Executive Overview', icon: FiStar, end: true },
  ],
  reviews_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
    { path: REVIEW_ROUTES.REPORTS_CYCLE, name: 'Cycle Performance Report', icon: FiBarChart2 },
  ],
  reviews_evaluations: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Score Distribution', icon: FiBarChart2 },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotion Recommendations', icon: FiTrendingUp },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Department PIPs', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.REPORTS_PIP, name: 'PIP Analytics Report', icon: FiFileText },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Executive Analytics Center', icon: FiFileText },
    { path: REVIEW_ROUTES.REPORTS_TEAM, name: 'Team Summary Report', icon: FiUsers },
    { path: REVIEW_ROUTES.REPORTS_CALIBRATION, name: 'Calibration Summary', icon: FiCheckCircle },
  ],
};

export const REVIEWS_EXECUTIVE_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_cycles: '🔄 Performance Cycles',
  reviews_evaluations: '⭐ Organizational Scoring',
  reviews_pips: '📈 PIP & Risk Oversight',
  reviews_reports: '📊 Executive Analytics',
};

export const REVIEWS_EXECUTIVE_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_cycles: true,
  reviews_evaluations: false,
  reviews_pips: false,
  reviews_reports: false,
};

// ============================================
// 4. MANAGER / SUPERVISOR REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_MANAGER_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR, name: 'Manager Overview', icon: FiStar, end: true },
  ],
  reviews_queue: [
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, name: 'Review Queue', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, name: 'Pending Approvals', icon: FiClock },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST, name: 'Submitted Reviews', icon: FiFileText },
  ],
  reviews_team: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_TEAM, name: 'Team Self-Assessments', icon: FiUsers },
    { path: REVIEW_ROUTES.FINAL_RATINGS_TEAM, name: 'Team Final Ratings', icon: FiStar },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_TEAM, name: 'Direct Reports PIPs', icon: FiAlertTriangle },
    { path: REVIEW_ROUTES.PIPS_CREATE, name: 'Initiate PIP', icon: FiPlus },
  ],
  reviews_feedback: [
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: '360 Feedback Queue', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_REQUEST_CREATE, name: 'Request 360 Feedback', icon: FiPlus },
  ],
  reviews_calibration: [
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, name: 'Calibration Sessions', icon: FiUsers },
  ],
  reviews_promotions: [
    { path: REVIEW_ROUTES.PROMOTIONS_CREATE, name: 'Recommend Promotion', icon: FiPlus },
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, name: 'Promotion History', icon: FiTrendingUp },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS_TEAM, name: 'Team Performance Report', icon: FiFileText },
  ],
};

export const REVIEWS_MANAGER_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_queue: '📝 Review Evaluations',
  reviews_team: '👥 Team Reviews',
  reviews_pips: '⚠️ Improvement Plans',
  reviews_feedback: '🔄 360 Feedback',
  reviews_calibration: '⚖️ Calibration',
  reviews_promotions: '📈 Talent Mobility',
  reviews_reports: '📊 Team Analytics',
};

export const REVIEWS_MANAGER_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_queue: true,
  reviews_team: true,
  reviews_pips: false,
  reviews_feedback: false,
  reviews_calibration: false,
  reviews_promotions: false,
  reviews_reports: false,
};

// ============================================
// 5. STAFF EMPLOYEE REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_STAFF_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF, name: 'My Reviews Dashboard', icon: FiStar, end: true },
  ],
  reviews_self: [
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, name: 'My Self-Assessment', icon: FiUserCheck },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, name: 'Self-Assessment History', icon: FiFileText },
  ],
  reviews_ratings: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_MY, name: 'My Final Ratings', icon: FiStar },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_MY, name: 'My Improvement Plan', icon: FiAlertTriangle },
  ],
  reviews_feedback: [
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, name: 'Assigned 360 Feedback', icon: FiShare2 },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY_MY, name: 'My Feedback Summary', icon: FiFileText },
  ],
  reviews_notifications: [
    { path: REVIEW_ROUTES.NOTIFICATIONS, name: 'Notifications', icon: FiClock },
  ],
};

export const REVIEWS_STAFF_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_self: '✍️ Self-Assessment',
  reviews_ratings: '⭐ Ratings & Reviews',
  reviews_pips: '🎯 Growth Plans',
  reviews_feedback: '🔄 360 Feedback',
  reviews_notifications: '🔔 Alerts',
};

export const REVIEWS_STAFF_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_self: true,
  reviews_ratings: false,
  reviews_pips: false,
  reviews_feedback: false,
  reviews_notifications: false,
};

// ============================================
// 6. CHAMPION REVIEWS NAV GROUPS (Operational Oversight)
// ============================================
export const REVIEWS_CHAMPION_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD, name: 'Reviews Champion Summary', icon: FiStar, end: true },
  ],
  reviews_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  ],
  reviews_evaluations: [
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, name: 'Final Ratings Overview', icon: FiStar },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, name: 'Rating Distribution', icon: FiBarChart2 },
  ],
  reviews_pips: [
    { path: REVIEW_ROUTES.PIPS_LIST, name: 'Active PIPs', icon: FiAlertTriangle },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reporting Center', icon: FiFileText },
  ],
};

export const REVIEWS_CHAMPION_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_cycles: '🔄 Review Cycles',
  reviews_evaluations: '⭐ Evaluation Oversight',
  reviews_pips: '⚠️ Improvement Plans',
  reviews_reports: '📊 Reports Center',
};

export const REVIEWS_CHAMPION_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_cycles: true,
  reviews_evaluations: false,
  reviews_pips: false,
  reviews_reports: false,
};

// ============================================
// 7. READ-ONLY REVIEWS NAV GROUPS
// ============================================
export const REVIEWS_READ_ONLY_NAV_GROUPS = {
  reviews_main: [
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD, name: 'Reviews Overview', icon: FiStar, end: true },
  ],
  reviews_cycles: [
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, name: 'Review Cycles', icon: FiCalendar },
  ],
  reviews_reports: [
    { path: REVIEW_ROUTES.REPORTS, name: 'Reports Summary', icon: FiFileText },
  ],
};

export const REVIEWS_READ_ONLY_GROUP_LABELS = {
  reviews_main: 'Main',
  reviews_cycles: '🔄 Review Cycles',
  reviews_reports: '📊 Reports',
};

export const REVIEWS_READ_ONLY_DEFAULT_EXPANDED = {
  reviews_main: true,
  reviews_cycles: true,
  reviews_reports: false,
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
