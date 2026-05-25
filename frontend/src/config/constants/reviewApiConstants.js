// src/config/constants/reviewApiConstants.js

// API Base URL
export const REVIEW_API_BASE_URL = '/api/v1/reviews';

// API Endpoints
export const REVIEW_API_ENDPOINTS = {
  // Rating Scales
  RATING_SCALES: '/rating-scales/',
  RATING_SCALE_DETAIL: (id) => `/rating-scales/${id}/`,
  RATING_SCALE_SET_DEFAULT: (id) => `/rating-scales/${id}/set-default/`,
  RATING_SCALE_CONVERT: '/rating-scales/convert-score/',
  RATING_SCALE_DEFAULT: '/rating-scales/default/',
  
  // Competencies
  COMPETENCIES: '/competencies/',
  COMPETENCY_DETAIL: (id) => `/competencies/${id}/`,
  COMPETENCY_ACTIVE: '/competencies/active/',
  COMPETENCY_REQUIRED: '/competencies/required/',
  COMPETENCY_CATEGORIES: '/competency-categories/',
  COMPETENCY_CATEGORY_DETAIL: (id) => `/competency-categories/${id}/`,
  
  // ⭐ NEW: Competency Ratings
  COMPETENCY_RATINGS_BY_ASSESSMENT: (assessmentId) => `/competency-ratings/by-assessment/${assessmentId}/`,
  COMPETENCY_RATINGS_BY_REVIEW: (reviewId) => `/competency-ratings/by-review/${reviewId}/`,
  COMPETENCY_RATINGS_BULK: '/competency-ratings/bulk/',
  
  // ⭐ NEW: Coefficients
  COEFFICIENTS: '/coefficients/',
  COEFFICIENT_DETAIL: (id) => `/coefficients/${id}/`,
  
  // ⭐ NEW: Promotions
  PROMOTIONS: '/promotions/',
  PROMOTION_DETAIL: (id) => `/promotions/${id}/`,
  
  // ⭐ NEW: Review Templates
  REVIEW_TEMPLATES: '/review-templates/',
  REVIEW_TEMPLATE_DETAIL: (id) => `/review-templates/${id}/`,
  REVIEW_TEMPLATES_SELF_ASSESSMENT: '/review-templates/self-assessment/',
  REVIEW_TEMPLATES_SUPERVISOR_REVIEW: '/review-templates/supervisor-review/',
  REVIEW_TEMPLATES_360_FEEDBACK: '/review-templates/360-feedback/',
  
  // ⭐ NEW: Review Comments (generic)
  REVIEW_COMMENTS: '/review-comments/',
  REVIEW_COMMENT_DETAIL: (id) => `/review-comments/${id}/`,
  
  // Cycles
  CYCLES: '/cycles/',
  CYCLE_DETAIL: (id) => `/cycles/${id}/`,
  CYCLE_ACTIVATE: (id) => `/cycles/${id}/activate/`,
  CYCLE_CLOSE: (id) => `/cycles/${id}/close/`,
  CYCLE_ARCHIVE: (id) => `/cycles/${id}/archive/`,
  CYCLE_PROGRESS: (id) => `/cycles/${id}/progress/`,
  CYCLES_ACTIVE: '/cycles/active/',
  CYCLES_UPCOMING: '/cycles/upcoming/',
  CYCLES_MY: '/cycles/my/',
  
  // Self Assessments
  SELF_ASSESSMENTS: '/self-assessments/',
  SELF_ASSESSMENT_DETAIL: (id) => `/self-assessments/${id}/`,
  SELF_ASSESSMENT_SUBMIT: (id) => `/self-assessments/${id}/submit/`,
  SELF_ASSESSMENT_MY: '/self-assessments/my/',
  SELF_ASSESSMENT_TEAM: '/self-assessments/team/',
  SELF_ASSESSMENT_PENDING: '/self-assessments/pending/',
  
  // Supervisor Reviews
  SUPERVISOR_REVIEWS: '/supervisor-reviews/',
  SUPERVISOR_REVIEW_DETAIL: (id) => `/supervisor-reviews/${id}/`,
  SUPERVISOR_REVIEW_SUBMIT: (id) => `/supervisor-reviews/${id}/submit/`,
  SUPERVISOR_REVIEW_APPROVE: (id) => `/supervisor-reviews/${id}/approve/`,
  SUPERVISOR_REVIEW_REJECT: (id) => `/supervisor-reviews/${id}/reject/`,
  SUPERVISOR_REVIEW_QUEUE: '/supervisor-reviews/my-queue/',
  
  // Final Ratings
  FINAL_RATINGS: '/final-ratings/',
  FINAL_RATING_DETAIL: (id) => `/final-ratings/${id}/`,
  FINAL_RATING_APPROVE: (id) => `/final-ratings/${id}/approve/`,
  FINAL_RATING_LOCK: (id) => `/final-ratings/${id}/lock/`,
  FINAL_RATING_CALIBRATE: (id) => `/final-ratings/${id}/calibrate/`,
  FINAL_RATING_MY: '/final-ratings/my/',
  FINAL_RATING_TEAM: '/final-ratings/team/',
  FINAL_RATING_DISTRIBUTION: '/final-ratings/distribution/',
  FINAL_RATING_EXPORT: '/final-ratings/export/',
  
  // PIPs
  PIPS: '/pips/',
  PIP_DETAIL: (id) => `/pips/${id}/`,
  PIP_APPROVE: (id) => `/pips/${id}/approve/`,
  PIP_EXTEND: (id) => `/pips/${id}/extend/`,
  PIP_COMPLETE: (id) => `/pips/${id}/complete/`,
  PIP_PROGRESS: (id) => `/pips/${id}/progress/`,
  PIP_MY: '/pips/my/',
  PIP_TEAM: '/pips/team/',
  PIP_ACTIVE: '/pips/active/',
  PIP_OVERDUE: '/pips/overdue/',
  PIP_REPORT: '/pips/report/',
  PIP_GENERATE_FROM_RATING: (ratingId) => `/pips/generate-from-rating/${ratingId}/`,
  
  // PIP Actions
  PIP_ACTIONS: '/pip-actions/',
  PIP_ACTION_DETAIL: (id) => `/pip-actions/${id}/`,
  PIP_ACTION_COMPLETE: (id) => `/pip-actions/${id}/complete/`,
  PIP_ACTION_VERIFY: (id) => `/pip-actions/${id}/verify/`,
  PIP_ACTIONS_FOR_PIP: (pipId) => `/pip-actions/for-pip/${pipId}/`,
  
  // PIP Reviews
  PIP_REVIEWS: '/pip-reviews/',
  PIP_REVIEW_DETAIL: (id) => `/pip-reviews/${id}/`,
  PIP_REVIEWS_FOR_PIP: (pipId) => `/pip-reviews/for-pip/${pipId}/`,
  
  // Feedback
  FEEDBACK_REQUESTS: '/feedback-requests/',
  FEEDBACK_REQUEST_DETAIL: (id) => `/feedback-requests/${id}/`,
  FEEDBACK_REQUEST_PENDING: '/feedback-requests/pending/',
  FEEDBACK_REQUEST_REMIND: (id) => `/feedback-requests/${id}/remind/`,
  FEEDBACK_RESPONSE_FOR_REQUEST: (requestId) => `/feedback-responses/by-request/${requestId}/`,
  FEEDBACK_RESPONSE_SUBMIT: (requestId) => `/feedback-responses/submit/${requestId}/`,
  FEEDBACK_SUMMARIES: '/feedback-summaries/',
  FEEDBACK_SUMMARY_DETAIL: (id) => `/feedback-summaries/${id}/`,
  FEEDBACK_SUMMARY_MY: '/feedback-summaries/my/',
  FEEDBACK_SUMMARY_SHARE: (id) => `/feedback-summaries/${id}/share/`,
  
  // Calibration
  CALIBRATION_SESSIONS: '/calibration-sessions/',
  CALIBRATION_SESSION_DETAIL: (id) => `/calibration-sessions/${id}/`,
  CALIBRATION_SESSION_START: (id) => `/calibration-sessions/${id}/start/`,
  CALIBRATION_SESSION_COMPLETE: (id) => `/calibration-sessions/${id}/complete/`,
  CALIBRATION_SESSION_ADJUST_RATING: (id) => `/calibration-sessions/${id}/adjust-rating/`,
  CALIBRATION_SESSION_ADD_COMMENT: (id) => `/calibration-sessions/${id}/add-comment/`,
  CALIBRATION_SESSION_REPORT: (id) => `/calibration-sessions/${id}/report/`,
  CALIBRATION_SESSION_MY: '/calibration-sessions/my/',
  CALIBRATION_OUTLIER_REPORT: '/calibration-sessions/outlier-report/',
  CALIBRATION_RATINGS_FOR_SESSION: (sessionId) => `/calibration-sessions/${sessionId}/ratings/`,
  CALIBRATION_COMMENTS_FOR_SESSION: (sessionId) => `/calibration-sessions/${sessionId}/comments/`,
  
  // Reports
  REPORTS_EMPLOYEE_SUMMARY: '/reports/employee-summary/',
  REPORTS_TEAM_SUMMARY: '/reports/team-summary/',
  REPORTS_CYCLE_SUMMARY: '/reports/cycle-summary/',
  REPORTS_PIP_SUMMARY: '/reports/pip-summary/',
  REPORTS_CALIBRATION_SUMMARY: '/reports/calibration-summary/',
  REPORTS_RATING_DISTRIBUTION: '/reports/rating-distribution/',
  REPORTS_EXPORT: '/reports/export/',
};

// HTTP Methods
export const REVIEW_HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Request Headers
export const REVIEW_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  TENANT_ID: 'X-Tenant-ID',
  CYCLE_ID: 'X-Review-Cycle-ID',
};

export const REVIEW_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
};