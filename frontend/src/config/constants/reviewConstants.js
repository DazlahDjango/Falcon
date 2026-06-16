// src/config/constants/reviewConstants.js

// API Base URL
export const REVIEW_API_BASE = '/api/v1/reviews';

// Scoring Thresholds
export const REVIEW_SCORE_THRESHOLDS = {
  GREEN_MIN: 80,
  YELLOW_MIN: 60,
  RED_MAX: 59,
};

// Traffic Light Colors
export const REVIEW_TRAFFIC_LIGHT_COLORS = {
  GREEN: '#4caf50',
  YELLOW: '#ff9800',
  RED: '#f44336',
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
  DEACTIVATE_SUCCESS: (entity) => `${entity} deactivated successfully`,
  CLOSE_SUCCESS: (entity) => `${entity} closed successfully`,
  EXTEND_SUCCESS: (entity) => `${entity} extended successfully`,
  COMPLETE_SUCCESS: (entity) => `${entity} completed successfully`,
  LOCK_SUCCESS: (entity) => `${entity} locked successfully`,
  CALIBRATE_SUCCESS: (entity) => `${entity} calibrated successfully`,
  SHARE_SUCCESS: (entity) => `${entity} shared successfully`,
  REMIND_SUCCESS: 'Reminder sent successfully',
  
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
  DEACTIVATE: (entity) => `Are you sure you want to deactivate this ${entity}?`,
  CLOSE: (entity) => `Are you sure you want to close this ${entity}?`,
  ARCHIVE: (entity) => `Are you sure you want to archive this ${entity}?`,
  EXTEND: (entity) => `Are you sure you want to extend this ${entity}?`,
  COMPLETE: (entity) => `Are you sure you want to mark this ${entity} as complete?`,
  LOCK: (entity) => `Are you sure you want to lock this ${entity}? This action cannot be undone.`,
  CALIBRATE: (entity) => `Are you sure you want to calibrate this ${entity}?`,
  SHARE: (entity) => `Are you sure you want to share this ${entity} with the employee?`,
  CANCEL: (entity) => `Are you sure you want to cancel this ${entity}?`,
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

// Cycle Types
export const REVIEW_CYCLE_TYPES = {
  MID_YEAR: 'mid_year',
  END_YEAR: 'end_year',
  QUARTERLY: 'quarterly',
  PROBATION: 'probation',
  SPECIAL: 'special',
  PIP: 'pip',
};

export const REVIEW_CYCLE_TYPE_LABELS = {
  [REVIEW_CYCLE_TYPES.MID_YEAR]: 'Mid-Year Review',
  [REVIEW_CYCLE_TYPES.END_YEAR]: 'End-Year Review',
  [REVIEW_CYCLE_TYPES.QUARTERLY]: 'Quarterly Review',
  [REVIEW_CYCLE_TYPES.PROBATION]: 'Probation Review',
  [REVIEW_CYCLE_TYPES.SPECIAL]: 'Special Review',
  [REVIEW_CYCLE_TYPES.PIP]: 'PIP Review',
};

// Cycle Statuses
export const REVIEW_CYCLE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
};

export const REVIEW_CYCLE_STATUS_LABELS = {
  [REVIEW_CYCLE_STATUS.DRAFT]: 'Draft',
  [REVIEW_CYCLE_STATUS.SUBMITTED]: 'Active',
  [REVIEW_CYCLE_STATUS.UNDER_REVIEW]: 'Under Review',
  [REVIEW_CYCLE_STATUS.APPROVED]: 'Approved',
  [REVIEW_CYCLE_STATUS.REJECTED]: 'Rejected',
  [REVIEW_CYCLE_STATUS.COMPLETED]: 'Completed',
  [REVIEW_CYCLE_STATUS.CANCELLED]: 'Cancelled',
  [REVIEW_CYCLE_STATUS.ARCHIVED]: 'Archived',
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

// Calibration Session Outcomes
export const REVIEW_CALIBRATION_SESSION_OUTCOMES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled',
};

export const REVIEW_CALIBRATION_SESSION_OUTCOME_LABELS = {
  [REVIEW_CALIBRATION_SESSION_OUTCOMES.PENDING]: 'Pending',
  [REVIEW_CALIBRATION_SESSION_OUTCOMES.COMPLETED]: 'Completed',
  [REVIEW_CALIBRATION_SESSION_OUTCOMES.PARTIAL]: 'Partially Completed',
  [REVIEW_CALIBRATION_SESSION_OUTCOMES.CANCELLED]: 'Cancelled',
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

// PIP Severity
export const REVIEW_PIP_SEVERITY = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  CRITICAL: 'critical',
};

export const REVIEW_PIP_SEVERITY_LABELS = {
  [REVIEW_PIP_SEVERITY.MINOR]: 'Minor - Coaching Required',
  [REVIEW_PIP_SEVERITY.MODERATE]: 'Moderate - Formal PIP',
  [REVIEW_PIP_SEVERITY.SEVERE]: 'Severe - Final Warning',
  [REVIEW_PIP_SEVERITY.CRITICAL]: 'Critical - Possible Termination',
};

// PIP Outcomes
export const REVIEW_PIP_OUTCOMES = {
  SUCCESSFUL: 'successful',
  EXTENDED: 'extended',
  FAILED: 'failed',
  TERMINATED: 'terminated',
  RESIGNED: 'resigned',
};

export const REVIEW_PIP_OUTCOME_LABELS = {
  [REVIEW_PIP_OUTCOMES.SUCCESSFUL]: 'Successful',
  [REVIEW_PIP_OUTCOMES.EXTENDED]: 'Extended',
  [REVIEW_PIP_OUTCOMES.FAILED]: 'Failed',
  [REVIEW_PIP_OUTCOMES.TERMINATED]: 'Terminated',
  [REVIEW_PIP_OUTCOMES.RESIGNED]: 'Resigned',
};

// PIP Action Priorities
export const REVIEW_PIP_ACTION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const REVIEW_PIP_ACTION_PRIORITY_LABELS = {
  [REVIEW_PIP_ACTION_PRIORITIES.HIGH]: 'High',
  [REVIEW_PIP_ACTION_PRIORITIES.MEDIUM]: 'Medium',
  [REVIEW_PIP_ACTION_PRIORITIES.LOW]: 'Low',
};

// PIP Action Statuses
export const REVIEW_PIP_ACTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
  WAIVED: 'waived',
};

export const REVIEW_PIP_ACTION_STATUS_LABELS = {
  [REVIEW_PIP_ACTION_STATUS.PENDING]: 'Pending',
  [REVIEW_PIP_ACTION_STATUS.IN_PROGRESS]: 'In Progress',
  [REVIEW_PIP_ACTION_STATUS.COMPLETED]: 'Completed',
  [REVIEW_PIP_ACTION_STATUS.MISSED]: 'Missed',
  [REVIEW_PIP_ACTION_STATUS.WAIVED]: 'Waived',
};

// Promotion Priority
export const REVIEW_PROMOTION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const REVIEW_PROMOTION_PRIORITY_LABELS = {
  [REVIEW_PROMOTION_PRIORITIES.LOW]: 'Low',
  [REVIEW_PROMOTION_PRIORITIES.MEDIUM]: 'Medium',
  [REVIEW_PROMOTION_PRIORITIES.HIGH]: 'High',
  [REVIEW_PROMOTION_PRIORITIES.URGENT]: 'Urgent',
};

// Promotion Statuses
export const REVIEW_PROMOTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
};

export const REVIEW_PROMOTION_STATUS_LABELS = {
  [REVIEW_PROMOTION_STATUS.PENDING]: 'Pending Review',
  [REVIEW_PROMOTION_STATUS.APPROVED]: 'Approved',
  [REVIEW_PROMOTION_STATUS.REJECTED]: 'Rejected',
  [REVIEW_PROMOTION_STATUS.ON_HOLD]: 'On Hold',
  [REVIEW_PROMOTION_STATUS.COMPLETED]: 'Completed',
};

// Comment Types
export const REVIEW_COMMENT_TYPES = {
  GENERAL: 'general',
  QUESTION: 'question',
  CLARIFICATION: 'clarification',
  FEEDBACK: 'feedback',
  APPROVAL: 'approval',
  DISPUTE: 'dispute',
  RESOLUTION: 'resolution',
};

export const REVIEW_COMMENT_TYPE_LABELS = {
  [REVIEW_COMMENT_TYPES.GENERAL]: 'General Comment',
  [REVIEW_COMMENT_TYPES.QUESTION]: 'Question',
  [REVIEW_COMMENT_TYPES.CLARIFICATION]: 'Request for Clarification',
  [REVIEW_COMMENT_TYPES.FEEDBACK]: 'Feedback',
  [REVIEW_COMMENT_TYPES.APPROVAL]: 'Approval Note',
  [REVIEW_COMMENT_TYPES.DISPUTE]: 'Dispute',
  [REVIEW_COMMENT_TYPES.RESOLUTION]: 'Resolution',
};

// Coefficient Types
export const REVIEW_COEFFICIENT_TYPES = {
  DEPARTMENT: 'department',
  POSITION: 'position',
  INDIVIDUAL: 'individual',
};

export const REVIEW_COEFFICIENT_TYPE_LABELS = {
  [REVIEW_COEFFICIENT_TYPES.DEPARTMENT]: 'Department Level',
  [REVIEW_COEFFICIENT_TYPES.POSITION]: 'Position Level',
  [REVIEW_COEFFICIENT_TYPES.INDIVIDUAL]: 'Individual Level',
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
  PROMOTIONS: 'review_promotions',
  TEMPLATES: 'review_templates',
  COEFFICIENTS: 'review_coefficients',
};

// WebSocket Events
export const REVIEW_WS_EVENTS = {
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_APPROVED: 'review_approved',
  REVIEW_COMPLETED: 'review_completed',
  REVIEW_REJECTED: 'review_rejected',
  CYCLE_PROGRESS: 'cycle_progress',
  PIP_UPDATED: 'pip_updated',
  CALIBRATION_ADJUSTMENT: 'calibration_adjustment',
  CALIBRATION_CHAT: 'calibration_chat',
  NOTIFICATION: 'notification',
  DASHBOARD_METRICS: 'dashboard_metrics',
  DEPENDENCY_SYNC: 'dependency_sync',
};

// Local Storage Keys
export const REVIEW_STORAGE_KEYS = {
  LAST_VISITED_CYCLE: 'review_last_visited_cycle',
  DASHBOARD_PREFERENCES: 'review_dashboard_preferences',
  FILTER_PREFERENCES: 'review_filter_preferences',
  SORT_PREFERENCES: 'review_sort_preferences',
};

// Export Formats
export const REVIEW_EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
};

export const REVIEW_EXPORT_FORMAT_LABELS = {
  [REVIEW_EXPORT_FORMATS.CSV]: 'CSV',
  [REVIEW_EXPORT_FORMATS.EXCEL]: 'Excel',
  [REVIEW_EXPORT_FORMATS.PDF]: 'PDF',
};