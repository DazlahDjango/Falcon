// src/config/constants/reviewRouteConstants.js

// Frontend Routes
export const REVIEW_ROUTES = {
  // Dashboard
  REVIEW_DASHBOARD: '/reviews/dashboard',
  
  // Rating Scales
  RATING_SCALES: '/reviews/rating-scales',
  RATING_SCALES_LIST: '/reviews/rating-scales',
  RATING_SCALES_CREATE: '/reviews/rating-scales/create',
  RATING_SCALES_EDIT: (id) => `/reviews/rating-scales/${id}/edit`,
  RATING_SCALES_DETAIL: (id) => `/reviews/rating-scales/${id}`,
  
  // Competencies
  COMPETENCIES: '/reviews/competencies',
  COMPETENCIES_LIST: '/reviews/competencies',
  COMPETENCIES_CREATE: '/reviews/competencies/create',
  COMPETENCIES_EDIT: (id) => `/reviews/competencies/${id}/edit`,
  COMPETENCY_CATEGORIES: '/reviews/competency-categories',
  COMPETENCY_CATEGORIES_CREATE: '/reviews/competency-categories/create',
  
  // Review Cycles
  REVIEW_CYCLES: '/reviews/cycles',
  REVIEW_CYCLES_LIST: '/reviews/cycles',
  REVIEW_CYCLES_CREATE: '/reviews/cycles/create',
  REVIEW_CYCLES_EDIT: (id) => `/reviews/cycles/${id}/edit`,
  REVIEW_CYCLES_DETAIL: (id) => `/reviews/cycles/${id}`,
  REVIEW_CYCLES_PROGRESS: (id) => `/reviews/cycles/${id}/progress`,
  
  // Self Assessments
  REVIEW_SELF_ASSESSMENT: '/reviews/self-assessment',
  REVIEW_SELF_ASSESSMENT_FORM: '/reviews/self-assessment/form',
  REVIEW_SELF_ASSESSMENT_VIEW: (id) => `/reviews/self-assessment/${id}`,
  REVIEW_SELF_ASSESSMENT_TEAM: '/reviews/self-assessment/team',
  
  // Supervisor Reviews
  REVIEW_SUPERVISOR_REVIEW: '/reviews/supervisor-review',
  REVIEW_SUPERVISOR_REVIEW_FORM: (employeeId) => `/reviews/supervisor-review/${employeeId}/form`,
  REVIEW_SUPERVISOR_REVIEW_VIEW: (id) => `/reviews/supervisor-review/${id}`,
  REVIEW_QUEUE: '/reviews/review-queue',
  
  // Final Ratings
  REVIEW_FINAL_RATINGS: '/reviews/final-ratings',
  REVIEW_FINAL_RATINGS_LIST: '/reviews/final-ratings',
  REVIEW_FINAL_RATINGS_DETAIL: (id) => `/reviews/final-ratings/${id}`,
  REVIEW_FINAL_RATINGS_TEAM: '/reviews/final-ratings/team',
  REVIEW_RATING_DISTRIBUTION: '/reviews/rating-distribution',
  
  // PIPs
  REVIEW_PIPS: '/reviews/pips',
  REVIEW_PIPS_LIST: '/reviews/pips',
  REVIEW_PIPS_CREATE: '/reviews/pips/create',
  REVIEW_PIPS_EDIT: (id) => `/reviews/pips/${id}/edit`,
  REVIEW_PIPS_DETAIL: (id) => `/reviews/pips/${id}`,
  REVIEW_PIPS_MY: '/reviews/pips/my',
  REVIEW_PIPS_TEAM: '/reviews/pips/team',
  
  // Feedback
  REVIEW_FEEDBACK: '/reviews/feedback',
  REVIEW_FEEDBACK_REQUESTS: '/reviews/feedback/requests',
  REVIEW_FEEDBACK_RESPOND: (requestId) => `/reviews/feedback/respond/${requestId}`,
  REVIEW_FEEDBACK_SUMMARY: '/reviews/feedback/summary',
  
  // Calibration
  REVIEW_CALIBRATION: '/reviews/calibration',
  REVIEW_CALIBRATION_SESSIONS: '/reviews/calibration/sessions',
  REVIEW_CALIBRATION_SESSION_DETAIL: (id) => `/reviews/calibration/sessions/${id}`,
  REVIEW_CALIBRATION_SESSION_CREATE: '/reviews/calibration/sessions/create',
  REVIEW_CALIBRATION_OUTLIERS: '/reviews/calibration/outliers',
  
  // Reports
  REVIEW_REPORTS: '/reviews/reports',
  REVIEW_EMPLOYEE_REPORT: '/reviews/reports/employee',
  REVIEW_TEAM_REPORT: '/reviews/reports/team',
  REVIEW_CYCLE_REPORT: '/reviews/reports/cycle',
  REVIEW_PIP_REPORT: '/reviews/reports/pip',
  REVIEW_CALIBRATION_REPORT: '/reviews/reports/calibration',
  
  // Settings
  REVIEW_SETTINGS: '/reviews/settings',
};

// Breadcrumb mapping
export const REVIEW_BREADCRUMBS = {
  [REVIEW_ROUTES.REVIEW_DASHBOARD]: 'Dashboard',
  [REVIEW_ROUTES.RATING_SCALES]: 'Rating Scales',
  [REVIEW_ROUTES.COMPETENCIES]: 'Competencies',
  [REVIEW_ROUTES.REVIEW_CYCLES]: 'Review Cycles',
  [REVIEW_ROUTES.REVIEW_SELF_ASSESSMENT]: 'Self Assessment',
  [REVIEW_ROUTES.REVIEW_SUPERVISOR_REVIEW]: 'Supervisor Review',
  [REVIEW_ROUTES.REVIEW_QUEUE]: 'Review Queue',
  [REVIEW_ROUTES.REVIEW_FINAL_RATINGS]: 'Final Ratings',
  [REVIEW_ROUTES.REVIEW_PIPS]: 'Performance Improvement Plans',
  [REVIEW_ROUTES.REVIEW_FEEDBACK]: '360 Feedback',
  [REVIEW_ROUTES.REVIEW_CALIBRATION]: 'Calibration',
  [REVIEW_ROUTES.REVIEW_REPORTS]: 'Reports',
  [REVIEW_ROUTES.REVIEW_SETTINGS]: 'Settings',
};