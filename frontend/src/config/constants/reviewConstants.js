// src/config/constants/reviewConstants.js

// Analytics Periods
export const ANALYTICS_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom',
};

// Analytics Period Labels
export const ANALYTICS_PERIOD_LABELS = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  custom: 'Custom Range',
};

// Scoring Thresholds
export const REVIEW_SCORE_THRESHOLDS = {
  GREEN_MIN: 80,
  YELLOW_MIN: 60,
  RED_MAX: 59,
};

// Default Weights
export const REVIEW_DEFAULT_WEIGHTS = {
  KPI: 70,
  COMPETENCY: 30,
  MISSION: 0,
  TASK: 0,
  FEEDBACK: 0,
};

// Rating Scale Defaults
export const REVIEW_RATING_SCALE_DEFAULTS = {
  MIN_VALUE: 1,
  MAX_VALUE: 5,
  ALLOW_DECIMAL: false,
  REVERSE_SCORING: false,
};

// PIP Defaults
export const REVIEW_PIP_DEFAULTS = {
  DEFAULT_DURATION_DAYS: 90,
  REMINDER_DAYS: [14, 7, 3],
  ESCALATION_DAYS: 30,
  DEFAULT_REVIEW_FREQUENCY_DAYS: 30,
};

// Pagination
export const REVIEW_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// Date Formats
export const REVIEW_DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  SHORT: 'MM/dd/yyyy',
  TIME: 'HH:mm',
};

// Toast Messages
export const REVIEW_TOAST_MESSAGES = {
  // Success
  CREATE_SUCCESS: (entity) => `${entity} created successfully`,
  UPDATE_SUCCESS: (entity) => `${entity} updated successfully`,
  DELETE_SUCCESS: (entity) => `${entity} deleted successfully`,
  SUBMIT_SUCCESS: (entity) => `${entity} submitted successfully`,
  APPROVE_SUCCESS: (entity) => `${entity} approved successfully`,
  REJECT_SUCCESS: (entity) => `${entity} rejected successfully`,
  ACTIVATE_SUCCESS: (entity) => `${entity} activated successfully`,
  CLOSE_SUCCESS: (entity) => `${entity} closed successfully`,
  EXTEND_SUCCESS: (entity) => `${entity} extended successfully`,
  COMPLETE_SUCCESS: (entity) => `${entity} completed successfully`,
  
  // Error
  FETCH_ERROR: (entity) => `Failed to fetch ${entity}`,
  CREATE_ERROR: (entity) => `Failed to create ${entity}`,
  UPDATE_ERROR: (entity) => `Failed to update ${entity}`,
  DELETE_ERROR: (entity) => `Failed to delete ${entity}`,
  SUBMIT_ERROR: (entity) => `Failed to submit ${entity}`,
  APPROVE_ERROR: (entity) => `Failed to approve ${entity}`,
  
  // Generic
  LOADING: 'Loading...',
  NO_DATA: 'No data found',
  SAVE_SUCCESS: 'Saved successfully',
  SAVE_ERROR: 'Failed to save',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Confirmation Messages
export const REVIEW_CONFIRM_MESSAGES = {
  DELETE: (entity) => `Are you sure you want to delete this ${entity}?`,
  DELETE_PLURAL: (entity) => `Are you sure you want to delete selected ${entity}?`,
  SUBMIT: (entity) => `Are you sure you want to submit this ${entity}?`,
  APPROVE: (entity) => `Are you sure you want to approve this ${entity}?`,
  REJECT: (entity) => `Are you sure you want to reject this ${entity}?`,
  ACTIVATE: (entity) => `Are you sure you want to activate this ${entity}?`,
  CLOSE: (entity) => `Are you sure you want to close this ${entity}?`,
  ARCHIVE: (entity) => `Are you sure you want to archive this ${entity}?`,
  EXTEND: (entity) => `Are you sure you want to extend this ${entity}?`,
  COMPLETE: (entity) => `Are you sure you want to mark this ${entity} as complete?`,
  LOCK: (entity) => `Are you sure you want to lock this ${entity}? This action cannot be undone.`,
};

// Competency Types
export const REVIEW_COMPETENCY_TYPES = {
  LEADERSHIP: 'leadership',
  MANAGEMENT: 'management',
  TECHNICAL: 'technical',
  SOFT_SKILL: 'soft_skill',
  CULTURAL: 'cultural',
  STRATEGIC: 'strategic',
  OPERATIONAL: 'operational',
  CUSTOMER: 'customer',
  INNOVATION: 'innovation',
  TEAMWORK: 'teamwork',
};

export const REVIEW_COMPETENCY_TYPE_LABELS = {
  [REVIEW_COMPETENCY_TYPES.LEADERSHIP]: 'Leadership',
  [REVIEW_COMPETENCY_TYPES.MANAGEMENT]: 'Management',
  [REVIEW_COMPETENCY_TYPES.TECHNICAL]: 'Technical Skills',
  [REVIEW_COMPETENCY_TYPES.SOFT_SKILL]: 'Soft Skills',
  [REVIEW_COMPETENCY_TYPES.CULTURAL]: 'Cultural Fit',
  [REVIEW_COMPETENCY_TYPES.STRATEGIC]: 'Strategic Thinking',
  [REVIEW_COMPETENCY_TYPES.OPERATIONAL]: 'Operational Excellence',
  [REVIEW_COMPETENCY_TYPES.CUSTOMER]: 'Customer Focus',
  [REVIEW_COMPETENCY_TYPES.INNOVATION]: 'Innovation',
  [REVIEW_COMPETENCY_TYPES.TEAMWORK]: 'Teamwork & Collaboration',
};

// Reviewer Types for Feedback
export const REVIEW_REVIEWER_TYPES = {
  MANAGER: 'manager',
  PEER: 'peer',
  SUBORDINATE: 'subordinate',
  CROSS_DEPT: 'cross_dept',
  EXTERNAL: 'external',
  SELF: 'self',
};

export const REVIEW_REVIEWER_TYPE_LABELS = {
  [REVIEW_REVIEWER_TYPES.MANAGER]: 'Direct Manager',
  [REVIEW_REVIEWER_TYPES.PEER]: 'Peer',
  [REVIEW_REVIEWER_TYPES.SUBORDINATE]: 'Subordinate',
  [REVIEW_REVIEWER_TYPES.CROSS_DEPT]: 'Cross-Department',
  [REVIEW_REVIEWER_TYPES.EXTERNAL]: 'External (Client/Partner)',
  [REVIEW_REVIEWER_TYPES.SELF]: 'Self Assessment',
};

// Calibration Session Types
export const REVIEW_CALIBRATION_SESSION_TYPES = {
  INITIAL: 'initial',
  MID_CYCLE: 'mid_cycle',
  FINAL: 'final',
  AD_HOC: 'adhoc',
};

export const REVIEW_CALIBRATION_SESSION_TYPE_LABELS = {
  [REVIEW_CALIBRATION_SESSION_TYPES.INITIAL]: 'Initial Calibration',
  [REVIEW_CALIBRATION_SESSION_TYPES.MID_CYCLE]: 'Mid-Cycle Review',
  [REVIEW_CALIBRATION_SESSION_TYPES.FINAL]: 'Final Calibration',
  [REVIEW_CALIBRATION_SESSION_TYPES.AD_HOC]: 'Ad-Hoc Session',
};

// Action Outcomes
export const REVIEW_ACTION_OUTCOMES = {
  PROMOTE: 'promote',
  BONUS: 'bonus',
  PIP: 'pip',
  DEMOTE: 'demote',
  TERMINATE: 'terminate',
  NO_ACTION: 'no_action',
};

export const REVIEW_ACTION_OUTCOME_LABELS = {
  [REVIEW_ACTION_OUTCOMES.PROMOTE]: 'Promote',
  [REVIEW_ACTION_OUTCOMES.BONUS]: 'Bonus Awarded',
  [REVIEW_ACTION_OUTCOMES.PIP]: 'Place on PIP',
  [REVIEW_ACTION_OUTCOMES.DEMOTE]: 'Demote',
  [REVIEW_ACTION_OUTCOMES.TERMINATE]: 'Terminate',
  [REVIEW_ACTION_OUTCOMES.NO_ACTION]: 'No Action',
};

// Cache Keys
export const REVIEW_CACHE_KEYS = {
  RATING_SCALES: 'review_rating_scales',
  COMPETENCIES: 'review_competencies',
  CYCLES: 'review_cycles',
  ACTIVE_CYCLE: 'review_active_cycle',
  SELF_ASSESSMENT: 'review_self_assessment',
  SUPERVISOR_REVIEW_QUEUE: 'review_supervisor_queue',
  FINAL_RATINGS: 'review_final_ratings',
  PIPS: 'review_pips',
  FEEDBACK_SUMMARY: 'review_feedback_summary',
  CALIBRATION_SESSIONS: 'review_calibration_sessions',
};

// WebSocket Events
export const REVIEW_WS_EVENTS = {
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  CYCLE_PROGRESS: 'cycle_progress',
  PIP_UPDATED: 'pip_updated',
  CALIBRATION_ADJUSTMENT: 'calibration_adjustment',
  CALIBRATION_CHAT: 'calibration_chat',
  NOTIFICATION: 'notification',
};

// Insight Types
export const INSIGHT_TYPES = {
  POSITIVE: 'positive',
  WARNING: 'warning',
  NEGATIVE: 'negative',
  INFO: 'info',
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Risk Level Labels
export const RISK_LEVEL_LABELS = {
  [RISK_LEVELS.LOW]: 'Low',
  [RISK_LEVELS.MEDIUM]: 'Medium',
  [RISK_LEVELS.HIGH]: 'High',
  [RISK_LEVELS.CRITICAL]: 'Critical',
};

// Risk Level Colors
export const RISK_LEVEL_COLORS = {
  [RISK_LEVELS.LOW]: '#10b981',   // green
  [RISK_LEVELS.MEDIUM]: '#f59e0b', // amber
  [RISK_LEVELS.HIGH]: '#ef4444',   // red
  [RISK_LEVELS.CRITICAL]: '#dc2626', // dark red
};

// Widget Types
export const WIDGET_TYPES = {
  SCORE_TREND: 'score_trend',
  RATING_DISTRIBUTION: 'rating_distribution',
  HIGH_RISK_EMPLOYEES: 'high_risk_employees',
  INSIGHTS: 'insights',
  COMPLETION_RATE: 'completion_rate',
  DEPARTMENT_RANKING: 'department_ranking',
};

// Widget Type Labels
export const WIDGET_TYPE_LABELS = {
  [WIDGET_TYPES.SCORE_TREND]: 'Score Trend',
  [WIDGET_TYPES.RATING_DISTRIBUTION]: 'Rating Distribution',
  [WIDGET_TYPES.HIGH_RISK_EMPLOYEES]: 'High Risk Employees',
  [WIDGET_TYPES.INSIGHTS]: 'AI Insights',
  [WIDGET_TYPES.COMPLETION_RATE]: 'Cycle Completion Rate',
  [WIDGET_TYPES.DEPARTMENT_RANKING]: 'Department Ranking',
};

// Widget Sizes
export const WIDGET_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Report Formats
export const REPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
};

// Report Format Labels
export const REPORT_FORMAT_LABELS = {
  [REPORT_FORMATS.CSV]: 'CSV',
  [REPORT_FORMATS.EXCEL]: 'Excel',
  [REPORT_FORMATS.PDF]: 'PDF',
};

// Report Types
export const REPORT_TYPES = {
  COMPANY: 'company',
  CYCLE: 'cycle',
  DEPARTMENT: 'department',
  TEAM: 'team',
  EMPLOYEE: 'employee',
  PIP: 'pip',
  CALIBRATION: 'calibration',
};

// Report Type Labels
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.COMPANY]: 'Organization Report',
  [REPORT_TYPES.CYCLE]: 'Cycle Summary',
  [REPORT_TYPES.DEPARTMENT]: 'Department Report',
  [REPORT_TYPES.TEAM]: 'Team Report',
  [REPORT_TYPES.EMPLOYEE]: 'Employee Report',
  [REPORT_TYPES.PIP]: 'PIP Summary',
  [REPORT_TYPES.CALIBRATION]: 'Calibration Report',
};
