// src/config/constants/reviewApiConstants.js

// API Base URL
export const REVIEW_API_BASE_URL = '/api/v1/reviews';

// API Endpoints
export const REVIEW_API_ENDPOINTS = {
  // ========== Health & System ==========
  HEALTH: '/health/',
  DASHBOARD_METRICS: '/dashboard/metrics/',
  REFERENCE_DATA: '/reference-data/',
  SYSTEM_SETTINGS: '/system-settings/',
  SYSTEM_SETTINGS_RESET: '/system-settings/reset/',
  
  // ========== Dashboards ==========
  DASHBOARD_STAFF: '/dashboard/staff/',
  DASHBOARD_SUPERVISOR: '/dashboard/supervisor/',
  DASHBOARD_EXECUTIVE: '/dashboard/executive/',
  DASHBOARD_ADMIN: '/dashboard/admin/',
  
  // ========== Rating Scales ==========
  RATING_SCALES: '/rating-scales/',
  RATING_SCALE_DETAIL: (id) => `/rating-scales/${id}/`,
  RATING_SCALE_SET_DEFAULT: (id) => `/rating-scales/${id}/set_default/`,
  RATING_SCALE_ACTIVATE: (id) => `/rating-scales/${id}/activate/`,
  RATING_SCALE_DEACTIVATE: (id) => `/rating-scales/${id}/deactivate/`,
  RATING_SCALE_CONVERT: '/rating-scales/convert/',
  RATING_SCALE_DEFAULT: '/rating-scales/default/',
  RATING_SCALE_ACTIVE_SCALES: '/rating-scales/active_scales/',
  
  // ========== Competencies ==========
  COMPETENCIES: '/competencies/',
  COMPETENCY_DETAIL: (id) => `/competencies/${id}/`,
  COMPETENCY_ACTIVATE: (id) => `/competencies/${id}/activate/`,
  COMPETENCY_DEACTIVATE: (id) => `/competencies/${id}/deactivate/`,
  COMPETENCY_USAGE_STATS: (id) => `/competencies/${id}/usage_stats/`,
  COMPETENCY_ACTIVE: '/competencies/active/',
  COMPETENCY_REQUIRED: '/competencies/required/',
  COMPETENCY_BY_TYPE: (type) => `/competencies/by-type/${type}/`,
  
  // ========== Competency Categories ==========
  COMPETENCY_CATEGORIES: '/competency-categories/',
  COMPETENCY_CATEGORY_DETAIL: (id) => `/competency-categories/${id}/`,
  COMPETENCY_CATEGORY_ACTIVATE: (id) => `/competency-categories/${id}/activate/`,
  COMPETENCY_CATEGORY_DEACTIVATE: (id) => `/competency-categories/${id}/deactivate/`,
  COMPETENCY_CATEGORY_COMPETENCIES: (id) => `/competency-categories/${id}/competencies/`,
  
  // ========== Competency Ratings ==========
  COMPETENCY_RATINGS: '/competency-ratings/',
  COMPETENCY_RATING_DETAIL: (id) => `/competency-ratings/${id}/`,
  COMPETENCY_RATINGS_BY_ASSESSMENT: (assessmentId) => `/competency-ratings/by-assessment/${assessmentId}/`,
  COMPETENCY_RATINGS_BY_REVIEW: (reviewId) => `/competency-ratings/by-review/${reviewId}/`,
  COMPETENCY_RATINGS_BULK_CREATE: '/competency-ratings/bulk_create/',
  
  // ========== Review Cycles ==========
  CYCLES: '/cycles/',
  CYCLE_DETAIL: (id) => `/cycles/${id}/`,
  CYCLE_ACTIVATE: (id) => `/cycles/${id}/activate/`,
  CYCLE_FREEZE: (id) => `/cycles/${id}/freeze/`,
  CYCLE_COMPLETE: (id) => `/cycles/${id}/complete/`,
  CYCLE_FORCE_COMPLETE: (id) => `/cycles/${id}/force_complete/`,
  CYCLE_ARCHIVE: (id) => `/cycles/${id}/archive/`,
  CYCLE_UNARCHIVE: (id) => `/cycles/${id}/unarchive/`,
  CYCLE_EXTEND: (id) => `/cycles/${id}/extend/`,
  CYCLE_PROGRESS: (id) => `/cycles/${id}/progress/`,
  CYCLE_PARTICIPANTS: (id) => `/cycles/${id}/participants/`,
  CYCLE_SUMMARY: (id) => `/cycles/${id}/summary/`,
  CYCLE_ACTIVE: '/cycles/active/',
  CYCLE_UPCOMING: '/cycles/upcoming/',
  CYCLE_COMPLETED: '/cycles/completed/',
  CYCLE_ARCHIVED: '/cycles/archived/',
  CYCLE_MY_CYCLES: '/cycles/my_cycles/',
  CYCLE_BY_YEAR: (year) => `/cycles/by-year/${year}/`,
  CYCLE_DATE_RANGE: '/cycles/date_range/',
  
  // ========== Self Assessments ==========
  SELF_ASSESSMENTS: '/self-assessments/',
  SELF_ASSESSMENT_DETAIL: (id) => `/self-assessments/${id}/`,
  SELF_ASSESSMENT_SUBMIT: (id) => `/self-assessments/${id}/submit/`,
  SELF_ASSESSMENT_SAVE_DRAFT: (id) => `/self-assessments/${id}/save_draft/`,
  SELF_ASSESSMENT_RESET_TO_DRAFT: (id) => `/self-assessments/${id}/reset_to_draft/`,
  SELF_ASSESSMENT_RESTORE: (id) => `/self-assessments/${id}/restore/`,
  SELF_ASSESSMENT_SOFT_DELETE: (id) => `/self-assessments/${id}/soft_delete/`,
  SELF_ASSESSMENT_MY: '/self-assessments/my/',
  SELF_ASSESSMENT_TEAM: '/self-assessments/team/',
  SELF_ASSESSMENT_PENDING: '/self-assessments/pending/',
  SELF_ASSESSMENT_SUBMITTED: '/self-assessments/submitted/',
  SELF_ASSESSMENT_STATS: '/self-assessments/stats/',
  
  // ========== Supervisor Reviews ==========
  SUPERVISOR_REVIEWS: '/supervisor-reviews/',
  SUPERVISOR_REVIEW_DETAIL: (id) => `/supervisor-reviews/${id}/`,
  SUPERVISOR_REVIEW_SUBMIT: (id) => `/supervisor-reviews/${id}/submit/`,
  SUPERVISOR_REVIEW_SAVE_DRAFT: (id) => `/supervisor-reviews/${id}/save_draft/`,
  SUPERVISOR_REVIEW_APPROVE: (id) => `/supervisor-reviews/${id}/approve/`,
  SUPERVISOR_REVIEW_REJECT: (id) => `/supervisor-reviews/${id}/reject/`,
  SUPERVISOR_REVIEW_REQUEST_CHANGES: (id) => `/supervisor-reviews/${id}/request_changes/`,
  SUPERVISOR_REVIEW_RESET_TO_DRAFT: (id) => `/supervisor-reviews/${id}/reset_to_draft/`,
  SUPERVISOR_REVIEW_COMPARE: (id) => `/supervisor-reviews/${id}/compare/`,
  SUPERVISOR_REVIEW_MY_QUEUE: '/supervisor-reviews/my-queue/',
  SUPERVISOR_REVIEW_PENDING_APPROVALS: '/supervisor-reviews/pending_approvals/',
  SUPERVISOR_REVIEW_STATS: '/supervisor-reviews/stats/',
  SUPERVISOR_REVIEW_FOR_CYCLE: (cycleId) => `/supervisor-reviews/for-cycle/${cycleId}/`,
  SUPERVISOR_REVIEW_FOR_EMPLOYEE: (employeeId) => `/supervisor-reviews/for-employee/${employeeId}/`,
  
  // ========== Final Ratings ==========
  FINAL_RATINGS: '/final-ratings/',
  FINAL_RATING_DETAIL: (id) => `/final-ratings/${id}/`,
  FINAL_RATING_APPROVE: (id) => `/final-ratings/${id}/approve/`,
  FINAL_RATING_LOCK: (id) => `/final-ratings/${id}/lock/`,
  FINAL_RATING_FORCE_LOCK: (id) => `/final-ratings/${id}/force_lock/`,
  FINAL_RATING_CALIBRATE: (id) => `/final-ratings/${id}/calibrate/`,
  FINAL_RATING_RECALIBRATE: (id) => `/final-ratings/${id}/recalibrate/`,
  FINAL_RATING_RECALCULATE: (id) => `/final-ratings/${id}/recalculate/`,
  FINAL_RATING_GENERATE_PIP: (id) => `/final-ratings/${id}/generate_pip/`,
  FINAL_RATING_GENERATE_PROMOTION: (id) => `/final-ratings/${id}/generate_promotion/`,
  FINAL_RATING_MY: '/final-ratings/my/',
  FINAL_RATING_TEAM: '/final-ratings/team/',
  FINAL_RATING_DISTRIBUTION: '/final-ratings/distribution/',
  FINAL_RATING_STATS: '/final-ratings/stats/',
  FINAL_RATING_EXPORT: '/final-ratings/export/',
  FINAL_RATING_FOR_CYCLE: (cycleId) => `/final-ratings/for-cycle/${cycleId}/`,
  
  // ========== PIPS ==========
  PIPS: '/pips/',
  PIP_DETAIL: (id) => `/pips/${id}/`,
  PIP_APPROVE: (id) => `/pips/${id}/approve/`,
  PIP_START: (id) => `/pips/${id}/start/`,
  PIP_EXTEND: (id) => `/pips/${id}/extend/`,
  PIP_COMPLETE: (id) => `/pips/${id}/complete/`,
  PIP_CANCEL: (id) => `/pips/${id}/cancel/`,
  PIP_PROGRESS: (id) => `/pips/${id}/progress/`,
  PIP_ADD_ACTION: (id) => `/pips/${id}/add_action/`,
  PIP_ADD_REVIEW: (id) => `/pips/${id}/add_review/`,
  PIP_FULL_REPORT: (id) => `/pips/${id}/full_report/`,
  PIP_MY: '/pips/my/',
  PIP_MANAGING: '/pips/managing/',
  PIP_TEAM: '/pips/team/',
  PIP_ACTIVE: '/pips/active/',
  PIP_OVERDUE: '/pips/overdue/',
  PIP_REPORT: '/pips/report/',
  PIP_TRENDS: '/pips/trends/',
  PIP_FOR_EMPLOYEE: (employeeId) => `/pips/for-employee/${employeeId}/`,
  PIP_GENERATE_FROM_RATING: (ratingId) => `/pips/generate-from-rating/${ratingId}/`,
  
  // ========== PIP Actions ==========
  PIP_ACTIONS: '/pip-actions/',
  PIP_ACTION_DETAIL: (id) => `/pip-actions/${id}/`,
  PIP_ACTION_COMPLETE: (id) => `/pip-actions/${id}/complete/`,
  PIP_ACTION_VERIFY: (id) => `/pip-actions/${id}/verify/`,
  PIP_ACTION_REOPEN: (id) => `/pip-actions/${id}/reopen/`,
  PIP_ACTIONS_FOR_PIP: (pipId) => `/pip-actions/for-pip/${pipId}/`,
  
  // ========== PIP Reviews ==========
  PIP_REVIEWS: '/pip-reviews/',
  PIP_REVIEW_DETAIL: (id) => `/pip-reviews/${id}/`,
  PIP_REVIEWS_FOR_PIP: (pipId) => `/pip-reviews/for-pip/${pipId}/`,
  
  // ========== 360 Feedback ==========
  FEEDBACK_REQUESTS: '/feedback-requests/',
  FEEDBACK_REQUEST_DETAIL: (id) => `/feedback-requests/${id}/`,
  FEEDBACK_REQUEST_CANCEL: (id) => `/feedback-requests/${id}/cancel/`,
  FEEDBACK_REQUEST_REMIND: (id) => `/feedback-requests/${id}/remind/`,
  FEEDBACK_REQUEST_BULK_CREATE: '/feedback-requests/bulk_create/',
  FEEDBACK_REQUEST_PENDING: '/feedback-requests/pending/',
  FEEDBACK_REQUEST_OVERDUE: '/feedback-requests/overdue/',
  FEEDBACK_REQUEST_FOR_CYCLE: (cycleId) => `/feedback-requests/for-cycle/${cycleId}/`,
  FEEDBACK_REQUEST_FOR_SUBJECT: (subjectId) => `/feedback-requests/for-subject/${subjectId}/`,
  
  FEEDBACK_RESPONSES: '/feedback-responses/',
  FEEDBACK_RESPONSE_DETAIL: (id) => `/feedback-responses/${id}/`,
  FEEDBACK_RESPONSE_SUBMIT: (requestId) => `/feedback-responses/submit/${requestId}/`,
  FEEDBACK_RESPONSE_FOR_REQUEST: (requestId) => `/feedback-responses/for-request/${requestId}/`,
  FEEDBACK_RESPONSE_FOR_SUBJECT: (subjectId) => `/feedback-responses/for-subject/${subjectId}/`,
  
  FEEDBACK_SUMMARIES: '/feedback-summaries/',
  FEEDBACK_SUMMARY_DETAIL: (id) => `/feedback-summaries/${id}/`,
  FEEDBACK_SUMMARY_SHARE: (id) => `/feedback-summaries/${id}/share/`,
  FEEDBACK_SUMMARY_REGENERATE: (id) => `/feedback-summaries/${id}/regenerate/`,
  FEEDBACK_SUMMARY_MY: '/feedback-summaries/my/',
  FEEDBACK_SUMMARY_FOR_CYCLE: (cycleId) => `/feedback-summaries/for-cycle/${cycleId}/`,
  
  // ========== Calibration ==========
  CALIBRATION_SESSIONS: '/calibration-sessions/',
  CALIBRATION_SESSION_DETAIL: (id) => `/calibration-sessions/${id}/`,
  CALIBRATION_SESSION_START: (id) => `/calibration-sessions/${id}/start/`,
  CALIBRATION_SESSION_COMPLETE: (id) => `/calibration-sessions/${id}/complete/`,
  CALIBRATION_SESSION_CANCEL: (id) => `/calibration-sessions/${id}/cancel/`,
  CALIBRATION_SESSION_ADD_RATING: (id) => `/calibration-sessions/${id}/add-rating/`,
  CALIBRATION_SESSION_ADD_COMMENT: (id) => `/calibration-sessions/${id}/add-comment/`,
  CALIBRATION_SESSION_REPORT: (id) => `/calibration-sessions/${id}/report/`,
  CALIBRATION_SESSION_MY: '/calibration-sessions/my/',
  CALIBRATION_SESSION_OUTLIERS: '/calibration-sessions/outliers/',
  CALIBRATION_SESSION_CALIBRATION_RECOMMENDATIONS: '/calibration-sessions/calibration_recommendations/',
  CALIBRATION_SESSION_FOR_CYCLE: (cycleId) => `/calibration-sessions/for-cycle/${cycleId}/`,
  
  CALIBRATION_RATINGS: '/calibration-ratings/',
  CALIBRATION_RATING_DETAIL: (id) => `/calibration-ratings/${id}/`,
  CALIBRATION_RATINGS_FOR_SESSION: (sessionId) => `/calibration-ratings/for-session/${sessionId}/`,
  
  // ========== Coefficients ==========
  COEFFICIENTS: '/coefficients/',
  COEFFICIENT_DETAIL: (id) => `/coefficients/${id}/`,
  COEFFICIENT_ACTIVATE: (id) => `/coefficients/${id}/activate/`,
  COEFFICIENT_DEACTIVATE: (id) => `/coefficients/${id}/deactivate/`,
  COEFFICIENT_ACTIVE: '/coefficients/active/',
  COEFFICIENT_APPLY: '/coefficients/apply/',
  COEFFICIENT_BY_DEPARTMENT: (deptId) => `/coefficients/by-department/${deptId}/`,
  COEFFICIENT_BY_POSITION: (positionId) => `/coefficients/by-position/${positionId}/`,
  COEFFICIENT_BY_USER: (userId) => `/coefficients/by-user/${userId}/`,
  
  // ========== Review Comments ==========
  REVIEW_COMMENTS: '/comments/',
  REVIEW_COMMENT_DETAIL: (id) => `/comments/${id}/`,
  REVIEW_COMMENT_EDIT: (id) => `/comments/${id}/edit/`,
  REVIEW_COMMENT_RESOLVE: (id) => `/comments/${id}/resolve/`,
  REVIEW_COMMENT_UNRESOLVE: (id) => `/comments/${id}/unresolve/`,
  REVIEW_COMMENT_FOR_OBJECT: '/comments/for-object/',
  REVIEW_COMMENT_REPLIES: (parentId) => `/comments/replies/${parentId}/`,
  
  // ========== Promotions ==========
  PROMOTIONS: '/promotions/',
  PROMOTION_DETAIL: (id) => `/promotions/${id}/`,
  PROMOTION_APPROVE: (id) => `/promotions/${id}/approve/`,
  PROMOTION_REJECT: (id) => `/promotions/${id}/reject/`,
  PROMOTION_COMPLETE: (id) => `/promotions/${id}/complete/`,
  PROMOTION_HOLD: (id) => `/promotions/${id}/hold/`,
  PROMOTION_PENDING: '/promotions/pending/',
  PROMOTION_APPROVED: '/promotions/approved/',
  PROMOTION_COMPLETED: '/promotions/completed/',
  PROMOTION_STATS: '/promotions/stats/',
  PROMOTION_FOR_EMPLOYEE: (employeeId) => `/promotions/for-employee/${employeeId}/`,
  PROMOTION_GENERATE_FROM_RATING: (ratingId) => `/promotions/generate-from-rating/${ratingId}/`,
  
  // ========== Review Templates ==========
  REVIEW_TEMPLATES: '/templates/',
  REVIEW_TEMPLATE_DETAIL: (id) => `/templates/${id}/`,
  REVIEW_TEMPLATE_ACTIVATE: (id) => `/templates/${id}/activate/`,
  REVIEW_TEMPLATE_DEACTIVATE: (id) => `/templates/${id}/deactivate/`,
  REVIEW_TEMPLATE_SET_DEFAULT: (id) => `/templates/${id}/set_default/`,
  REVIEW_TEMPLATE_DUPLICATE: (id) => `/templates/${id}/duplicate/`,
  REVIEW_TEMPLATE_ACTIVE: '/templates/active/',
  REVIEW_TEMPLATE_DEFAULT: '/templates/default/',
  
  // ========== Reports ==========
  REPORTS_EMPLOYEE_SUMMARY: '/reports/employee-summary/',
  REPORTS_TEAM_SUMMARY: '/reports/team-summary/',
  REPORTS_CYCLE_STATS: '/reports/cycle-stats/',
  REPORTS_PIP_SUMMARY: '/reports/pip-summary/',
  REPORTS_CALIBRATION_SUMMARY: '/reports/calibration-summary/',
  REPORTS_RATING_DISTRIBUTION: '/reports/rating-distribution/',
  REPORTS_EXPORT: '/reports/export/',
  
  // ========== Nested Endpoints (via cycles) ==========
  CYCLE_SELF_ASSESSMENTS: (cycleId) => `/cycles/${cycleId}/self-assessments/`,
  CYCLE_SUPERVISOR_REVIEWS: (cycleId) => `/cycles/${cycleId}/supervisor-reviews/`,
  CYCLE_FINAL_RATINGS: (cycleId) => `/cycles/${cycleId}/final-ratings/`,
  CYCLE_PIPS: (cycleId) => `/cycles/${cycleId}/pips/`,
  CYCLE_FEEDBACK_REQUESTS: (cycleId) => `/cycles/${cycleId}/feedback-requests/`,
  CYCLE_CALIBRATION_SESSIONS: (cycleId) => `/cycles/${cycleId}/calibration-sessions/`,
  
  // ========== Nested Endpoints (via pips) ==========
  PIP_ACTIONS_NESTED: (pipId) => `/pips/${pipId}/actions/`,
  PIP_REVIEWS_NESTED: (pipId) => `/pips/${pipId}/reviews/`,
  
  // ========== Nested Endpoints (via calibration sessions) ==========
  SESSION_RATINGS: (sessionId) => `/calibration-sessions/${sessionId}/ratings/`,
  SESSION_COMMENTS: (sessionId) => `/calibration-sessions/${sessionId}/comments/`,
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

// Query Parameter Keys
export const REVIEW_QUERY_PARAMS = {
  CYCLE_ID: 'cycle_id',
  EMPLOYEE_ID: 'employee_id',
  DEPARTMENT_ID: 'department_id',
  STATUS: 'status',
  YEAR: 'year',
  MONTH: 'month',
  PAGE: 'page',
  PAGE_SIZE: 'page_size',
  SEARCH: 'search',
  IS_ACTIVE: 'is_active',
  IS_REQUIRED: 'is_required',
  COMPETENCY_TYPE: 'competency_type',
  SESSION_TYPE: 'session_type',
  REVIEWER_TYPE: 'reviewer_type',
  SEVERITY: 'severity',
  PRIORITY: 'priority',
};