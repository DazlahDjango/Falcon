// src/config/constants/reviewConstants.js

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