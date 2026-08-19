// src/config/constants/reviewRouteConstants.js

// Frontend Routes
export const REVIEW_ROUTES = {
  // Root
  REVIEW_ROOT: '/reviews',
  
  // Dashboard
  REVIEW_DASHBOARD: '/reviews/dashboard',
  REVIEW_DASHBOARD_STAFF: '/reviews/dashboard/staff',
  REVIEW_DASHBOARD_SUPERVISOR: '/reviews/dashboard/supervisor',
  REVIEW_DASHBOARD_EXECUTIVE: '/reviews/dashboard/executive',
  REVIEW_DASHBOARD_ADMIN: '/reviews/dashboard/admin',
  
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
  COMPETENCIES_DETAIL: (id) => `/reviews/competencies/${id}`,
  COMPETENCY_CATEGORIES: '/reviews/competency-categories',
  COMPETENCY_CATEGORIES_CREATE: '/reviews/competency-categories/create',
  COMPETENCY_CATEGORIES_EDIT: (id) => `/reviews/competency-categories/${id}/edit`,
  COMPETENCY_CATEGORIES_DETAIL: (id) => `/reviews/competency-categories/${id}`,
  
  // Review Cycles
  REVIEW_CYCLES: '/reviews/cycles',
  REVIEW_CYCLES_LIST: '/reviews/cycles',
  REVIEW_CYCLES_CREATE: '/reviews/cycles/create',
  REVIEW_CYCLES_EDIT: (id) => `/reviews/cycles/${id}/edit`,
  REVIEW_CYCLES_DETAIL: (id) => `/reviews/cycles/${id}`,
  REVIEW_CYCLES_PROGRESS: (id) => `/reviews/cycles/${id}/progress`,
  REVIEW_CYCLES_PARTICIPANTS: (id) => `/reviews/cycles/${id}/participants`,
  REVIEW_CYCLES_SUMMARY: (id) => `/reviews/cycles/${id}/summary`,
  
  // Self Assessments
  SELF_ASSESSMENT: '/reviews/self-assessment',
  SELF_ASSESSMENT_FORM: '/reviews/self-assessment/form',
  SELF_ASSESSMENT_VIEW: (id) => `/reviews/self-assessment/${id}`,
  SELF_ASSESSMENT_TEAM: '/reviews/self-assessment/team',
  SELF_ASSESSMENT_PENDING: '/reviews/self-assessment/pending',
  SELF_ASSESSMENT_SUBMITTED: '/reviews/self-assessment/submitted',
  
  // Supervisor Reviews
  SUPERVISOR_REVIEW: '/reviews/supervisor-review',
  SUPERVISOR_REVIEW_FORM: (employeeId) => `/reviews/supervisor-review/${employeeId}/form`,
  SUPERVISOR_REVIEW_VIEW: (id) => `/reviews/supervisor-review/${id}`,
  SUPERVISOR_REVIEW_QUEUE: '/reviews/supervisor-review/queue',
  SUPERVISOR_REVIEW_PENDING_APPROVALS: '/reviews/supervisor-review/pending-approvals',
  SUPERVISOR_REVIEW_COMPARE: (id) => `/reviews/supervisor-review/${id}/compare`,
  
  // Final Ratings
  FINAL_RATINGS: '/reviews/final-ratings',
  FINAL_RATINGS_LIST: '/reviews/final-ratings',
  FINAL_RATINGS_DETAIL: (id) => `/reviews/final-ratings/${id}`,
  FINAL_RATINGS_TEAM: '/reviews/final-ratings/team',
  FINAL_RATINGS_MY: '/reviews/final-ratings/my',
  RATING_DISTRIBUTION: '/reviews/rating-distribution',
  
  // PIPs
  PIPS: '/reviews/pips',
  PIPS_LIST: '/reviews/pips',
  PIPS_CREATE: '/reviews/pips/create',
  PIPS_EDIT: (id) => `/reviews/pips/${id}/edit`,
  PIPS_DETAIL: (id) => `/reviews/pips/${id}`,
  PIPS_MY: '/reviews/pips/my',
  PIPS_TEAM: '/reviews/pips/team',
  PIPS_MANAGING: '/reviews/pips/managing',
  PIPS_ACTIVE: '/reviews/pips/active',
  PIPS_OVERDUE: '/reviews/pips/overdue',
  PIPS_REPORT: '/reviews/pips/report',
  PIPS_TRENDS: '/reviews/pips/trends',
  
  // PIP Actions
  PIP_ACTIONS: (pipId) => `/reviews/pips/${pipId}/actions`,
  PIP_ACTION_DETAIL: (pipId, actionId) => `/reviews/pips/${pipId}/actions/${actionId}`,
  
  // 360 Feedback
  FEEDBACK: '/reviews/feedback',
  FEEDBACK_REQUESTS: '/reviews/feedback/requests',
  FEEDBACK_REQUEST_CREATE: '/reviews/feedback/requests/create',
  FEEDBACK_RESPOND: (requestId) => `/reviews/feedback/respond/${requestId}`,
  FEEDBACK_SUMMARY: '/reviews/feedback/summary',
  FEEDBACK_SUMMARY_MY: '/reviews/feedback/summary/my',
  FEEDBACK_SUMMARY_FOR_CYCLE: (cycleId) => `/reviews/feedback/summary/cycle/${cycleId}`,
  
  // Calibration
  CALIBRATION: '/reviews/calibration',
  CALIBRATION_SESSIONS: '/reviews/calibration/sessions',
  CALIBRATION_SESSION_DETAIL: (id) => `/reviews/calibration/sessions/${id}`,
  CALIBRATION_SESSION_CREATE: '/reviews/calibration/sessions/create',
  CALIBRATION_SESSION_EDIT: (id) => `/reviews/calibration/sessions/${id}/edit`,
  CALIBRATION_OUTLIERS: '/reviews/calibration/outliers',
  CALIBRATION_RECOMMENDATIONS: '/reviews/calibration/recommendations',
  CALIBRATION_RATINGS: (sessionId) => `/reviews/calibration/sessions/${sessionId}/ratings`,
  
  // Coefficients
  COEFFICIENTS: '/reviews/coefficients',
  COEFFICIENTS_LIST: '/reviews/coefficients',
  COEFFICIENTS_CREATE: '/reviews/coefficients/create',
  COEFFICIENTS_EDIT: (id) => `/reviews/coefficients/${id}/edit`,
  
  // Promotions
  PROMOTIONS: '/reviews/promotions',
  PROMOTIONS_LIST: '/reviews/promotions',
  PROMOTIONS_CREATE: '/reviews/promotions/create',
  PROMOTIONS_DETAIL: (id) => `/reviews/promotions/${id}`,
  PROMOTIONS_PENDING: '/reviews/promotions/pending',
  PROMOTIONS_APPROVED: '/reviews/promotions/approved',
  PROMOTIONS_COMPLETED: '/reviews/promotions/completed',
  PROMOTIONS_STATS: '/reviews/promotions/stats',
  PROMOTIONS_FOR_EMPLOYEE: (employeeId) => `/reviews/promotions/employee/${employeeId}`,
  
  // Templates
  REVIEW_TEMPLATES: '/reviews/templates',
  REVIEW_TEMPLATES_LIST: '/reviews/templates',
  REVIEW_TEMPLATES_CREATE: '/reviews/templates/create',
  REVIEW_TEMPLATES_EDIT: (id) => `/reviews/templates/${id}/edit`,
  REVIEW_TEMPLATES_DETAIL: (id) => `/reviews/templates/${id}`,
  
  // Reports
  REPORTS: '/reviews/reports',
  REPORTS_EMPLOYEE: '/reviews/reports/employee',
  REPORTS_TEAM: '/reviews/reports/team',
  REPORTS_CYCLE: '/reviews/reports/cycle',
  REPORTS_PIP: '/reviews/reports/pip',
  REPORTS_CALIBRATION: '/reviews/reports/calibration',
  REPORTS_EXPORT: '/reviews/reports/export',
  
  // Comments
  COMMENTS: '/reviews/comments',
  
  // Settings
  SETTINGS: '/reviews/settings',
  SYSTEM_SETTINGS: '/reviews/system-settings',
  NOTIFICATION_PREFERENCES: '/reviews/settings/notifications',
  AUDIT_SETTINGS: '/reviews/settings/audit',
  AUDIT_LOGS: '/reviews/audit',
  NOTIFICATIONS: '/reviews/notifications',
};

// Breadcrumb mapping
export const REVIEW_BREADCRUMBS = {
  [REVIEW_ROUTES.REVIEW_ROOT]: 'Reviews',
  [REVIEW_ROUTES.REVIEW_DASHBOARD]: 'Dashboard',
  [REVIEW_ROUTES.RATING_SCALES]: 'Rating Scales',
  [REVIEW_ROUTES.COMPETENCIES]: 'Competencies',
  [REVIEW_ROUTES.REVIEW_CYCLES]: 'Review Cycles',
  [REVIEW_ROUTES.SELF_ASSESSMENT]: 'Self Assessment',
  [REVIEW_ROUTES.SUPERVISOR_REVIEW]: 'Supervisor Review',
  [REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE]: 'Review Queue',
  [REVIEW_ROUTES.FINAL_RATINGS]: 'Final Ratings',
  [REVIEW_ROUTES.PIPS]: 'Performance Improvement Plans',
  [REVIEW_ROUTES.FEEDBACK]: '360 Feedback',
  [REVIEW_ROUTES.CALIBRATION]: 'Calibration',
  [REVIEW_ROUTES.COEFFICIENTS]: 'Coefficients',
  [REVIEW_ROUTES.PROMOTIONS]: 'Promotions',
  [REVIEW_ROUTES.REVIEW_TEMPLATES]: 'Templates',
  [REVIEW_ROUTES.REPORTS]: 'Reports',
  [REVIEW_ROUTES.SETTINGS]: 'Settings',
};

// Navigation menu items
export const REVIEW_NAVIGATION = [
  { name: 'Dashboard', path: REVIEW_ROUTES.REVIEW_DASHBOARD, icon: 'DashboardIcon' },
  { name: 'Rating Scales', path: REVIEW_ROUTES.RATING_SCALES, icon: 'ScaleIcon' },
  { name: 'Competencies', path: REVIEW_ROUTES.COMPETENCIES, icon: 'SchoolIcon' },
  { name: 'Review Cycles', path: REVIEW_ROUTES.REVIEW_CYCLES, icon: 'CycleIcon' },
  { name: 'Self Assessment', path: REVIEW_ROUTES.SELF_ASSESSMENT, icon: 'AssignmentIndIcon' },
  { name: 'Supervisor Review', path: REVIEW_ROUTES.SUPERVISOR_REVIEW, icon: 'SupervisorAccountIcon' },
  { name: 'Final Ratings', path: REVIEW_ROUTES.FINAL_RATINGS, icon: 'StarIcon' },
  { name: 'PIPs', path: REVIEW_ROUTES.PIPS, icon: 'WarningIcon' },
  { name: '360 Feedback', path: REVIEW_ROUTES.FEEDBACK, icon: 'FeedbackIcon' },
  { name: 'Calibration', path: REVIEW_ROUTES.CALIBRATION, icon: 'GavelIcon' },
  { name: 'Promotions', path: REVIEW_ROUTES.PROMOTIONS, icon: 'TrendingUpIcon' },
  { name: 'Reports', path: REVIEW_ROUTES.REPORTS, icon: 'BarChartIcon' },
  { name: 'Settings', path: REVIEW_ROUTES.SETTINGS, icon: 'SettingsIcon' },
];

// Role-based navigation visibility
export const REVIEW_ROLE_NAVIGATION = {
  staff: ['Dashboard', 'Self Assessment', 'Final Ratings', 'PIPs', '360 Feedback'],
  supervisor: ['Dashboard', 'Self Assessment', 'Supervisor Review', 'Final Ratings', 'PIPs', '360 Feedback', 'Calibration'],
  executive: ['Dashboard', 'Review Cycles', 'Final Ratings', 'PIPs', 'Promotions', 'Reports'],
  admin: ['Dashboard', 'Rating Scales', 'Competencies', 'Review Cycles', 'Final Ratings', 'PIPs', 'Calibration', 'Coefficients', 'Promotions', 'Templates', 'Settings'],
  super_admin: ['All'],
};